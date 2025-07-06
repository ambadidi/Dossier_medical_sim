from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from django.contrib.auth.models import User
from base.models import Doctor, Patient
from base.serializers import PatientSerializer

import os
import pandas as pd
from django.conf import settings
from rest_framework import viewsets, generics

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
def load_choices(filename, code_col=None):
    path = os.path.join(settings.EXCEL_ROOT, filename)
    df = pd.read_excel(path)
    if code_col:
        df = df.rename(columns={code_col: 'code'})
    items = df.to_dict(orient='records')
    primary = items[:10]
    others = items[10:]
    return primary, others


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