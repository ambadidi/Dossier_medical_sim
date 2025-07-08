from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.contrib.auth.models import User
from base.models import Doctor, Patient, MedicalFileEntry, Section, Category
from base.serializers import PatientSerializer, MedicalFileEntrySerializer, SectionSerializer, CategorySerializer

import os
import pandas as pd
from django.conf import settings
from rest_framework import viewsets, generics, parsers

import io
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from django.http import HttpResponse

from pathlib import Path

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getPatients(request):
    """
    List only the patients belonging to the logged-in doctor.
    """
    # 1) Grab the current user’s Doctor profile
    try:
        doctor = Doctor.objects.get(user=request.user)
    except Doctor.DoesNotExist:
        return Response(
            {'detail': 'No Doctor profile found for this user.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # 2) Filter patients by that doctor
    patients = Patient.objects.filter(doctor=doctor)
    serializer = PatientSerializer(patients, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def getPatient(request, pk):
    """
    Retrieve a single patient by its primary key (_id).
    """
    patient = get_object_or_404(Patient, _id=pk)
    serializer = PatientSerializer(patient, many=False)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def addPatient(request):
    user = request.user

    # 1) Find the Doctor instance that was created for this user.
    try:
        doctor = Doctor.objects.get(user=user)
    except Doctor.DoesNotExist:
        return Response(
            {'detail': 'No Doctor profile found for this user.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    data = request.data
    name = data.get('name')
    if not name:
        return Response({'detail': 'Patient name is required.'}, status=status.HTTP_400_BAD_REQUEST)

    # 2) Now do get_or_create using that doctor:
    patient, created = Patient.objects.get_or_create(
        name=name,
        doctor=doctor,
        defaults={'user': user}
    )

    serializer = PatientSerializer(patient, many=False)
    return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def getPatientById(request, pk):
    user = request.user
    
    try:
        patient = Patient.objects.get(_id=pk)
        if user.is_staff or patient.user == user:
            serializer = PatientSerializer(patient, many=False)
            return Response(serializer.data)
        else:
            Response({'detail': 'Not authorized to view this patient'}, status=status.HTTP_400_BAD_REQUEST)
    except:
        return Response({'detail': 'Patient does not exist'}, status=status.HTTP_400_BAD_REQUEST)

class PatientDetailView(generics.RetrieveAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer

# Utility to load and slice Excel
# def load_choices(filename, code_col=None):
#     path = os.path.join(settings.EXCEL_ROOT, filename)
#     df = pd.read_excel(path)
#     if code_col:
#         df = df.rename(columns={code_col: 'code'})
#     items = df.to_dict(orient='records')
#     primary = items[:10]
#     others = items[10:]
#     return primary, others
def load_choices(filename_or_path, code_col=None):
    """
    Reads an Excel file and returns two lists of dicts: primary (first 10 rows)
    and others (remaining rows). Automatically picks the first non-code column
    as the 'label' field, and (if provided) renames the code column to 'code'.
    """
    # Resolve full filesystem path
    if Path(filename_or_path).is_absolute():
        path = filename_or_path
    else:
        path = os.path.join(settings.EXCEL_ROOT, filename_or_path)

    if not os.path.exists(path):
        raise FileNotFoundError(f"Excel file not found at {path}")

    # Load into DataFrame
    df = pd.read_excel(path)

    # Identify label column candidates (all except the code column)
    label_candidates = [col for col in df.columns if col != code_col]
    if not label_candidates:
        raise ValueError("No label column found in Excel file")

    # Choose the first candidate as our 'label'
    label_col = label_candidates[0]

    # Build rename mapping
    rename_map = {label_col: 'label'}
    if code_col and code_col in df.columns:
        rename_map[code_col] = 'code'

    # Rename and convert
    df = df.rename(columns=rename_map)
    records = df.to_dict(orient='records')

    # Split into primary (first 10) and others
    primary = records[:10]
    others  = records[10:]

    return primary, others

class CategoryLookupView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            cat = get_object_or_404(Category, pk=pk)
            if not cat.excel_file:
                return Response({'error': 'Excel file not uploaded'}, status=400)

            # This should now point to the correct directory
            filename = cat.excel_file.path if hasattr(cat.excel_file, 'path') else os.path.join(settings.EXCEL_ROOT, cat.excel_file)
        
            print(f"Looking for file at: {filename}")  # Debug line - remove after testing
            
            if not os.path.exists(filename):
                return Response({'error': f'File not found: {filename}'}, status=404)
            
            primary, others = load_choices(filename, code_col=cat.code_column)
            return Response({'name': cat.name, 'primary': primary, 'others': others})
        
        except Exception as e:
            return Response({'error': str(e)}, status=500)

class ReasonListView(generics.GenericAPIView):
    def get(self, request):
        primary, others = load_choices('MOTIFS DE CONSULTATION.xlsx')
        return Response({'primary': primary, 'others': others})

class HistoryListView(generics.GenericAPIView):
    def get(self, request):
        primary, others = load_choices('DC ANTEC MEDICAUX CHIR FAM.xlsx', code_col='CODE')
        return Response({'primary': primary, 'others': others})

class AllergyListView(generics.GenericAPIView):
    def get(self, request):
        primary, others = load_choices('liste_allergies.xlsx')
        return Response({'primary': primary, 'others': others})

class PatientMedicalFileCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        data = request.data.get('entries', [])
        category = request.data.get('category')
        created_by = request.user

        for item in data:
            item['patient'] = pk
            item['category'] = category

        serializer = MedicalFileEntrySerializer(data=data, many=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PatientMedicalFileDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        # Fetch all entries
        entries = MedicalFileEntry.objects.filter(patient_id=pk).order_by('created_at')
        # Fetch patient name
        from django.shortcuts import get_object_or_404
        from base.models import Patient
        patient = get_object_or_404(Patient, _id=pk)

        # Create PDF buffer
        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4
        y = height - 50

        # Header
        p.setFont('Helvetica-Bold', 16)
        p.drawString(50, y, f"Medical File for Patient {patient.name}")
        y -= 30

        # Table header
        p.setFont('Helvetica-Bold', 12)
        p.drawString(50, y, "Date")
        p.drawString(150, y, "Category")
        p.drawString(300, y, "Label")
        p.drawString(500, y, "Code")
        y -= 20

        # Table rows
        p.setFont('Helvetica', 10)
        for entry in entries:
            if y < 50:
                p.showPage()
                y = height - 50
            p.drawString(50, y, entry.created_at.strftime("%Y-%m-%d"))
            p.drawString(150, y, entry.category)
            p.drawString(300, y, entry.label)
            p.drawString(500, y, entry.code or "-")
            y -= 15

        p.showPage()
        p.save()

        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="medical_file_{pk}.pdf"'
        return response

class PatientMedicalFileClearView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        entries = MedicalFileEntry.objects.filter(patient_id=pk)
        count = entries.count()
        entries.delete()
        from rest_framework import status
        return Response({'deleted': count}, status=status.HTTP_200_OK)

# class SectionViewSet(viewsets.ModelViewSet):
#     permission_classes = [IsAdminUser]
#     queryset = Section.objects.all()
#     serializer_class = SectionSerializer
class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    # Allow authenticated users to read, only admins to modify
    def get_permissions(self):
        from rest_framework.permissions import IsAuthenticated, IsAdminUser
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAdminUser]
        return [perm() for perm in permission_classes]

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]

    # Allow file upload (storing only filename under EXCEL_ROOT)
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]
    def perform_create(self, serializer):
        file_obj = self.request.FILES.get('excel_file')
        filename = file_obj.name
        path = os.path.join(settings.EXCEL_ROOT, filename)
        with open(path, 'wb') as f:
            for chunk in file_obj.chunks():
                f.write(chunk)
        serializer.save(excel_file=filename)

