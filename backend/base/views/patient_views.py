"""
from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.contrib.auth.models import User
from base.models import *
from base.serializers import *

# Create your views here.
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from django.contrib.auth.hashers import make_password
from rest_framework import status

@api_view(['GET'])
def getPatients(request):
    patients = Patient.objects.all()
    serializer = PatientSerializer(patients, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def getPatient(request, pk):
    patient = Patient.objects.get(_id=pk)
    serializer = PatientSerializer(patient, many=False)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def addPatient(request):
    user = request.user
    data = request.data
    print(">>>>data", data)
    patientCreated = data['patientCreated']
    
    if patientCreated and len(patientCreated) == 0:
        return Response({'detail': 'No Patient Created'}, status=status.HTTP_400_BAD_REQUEST)
    else:
        # (1) Create patient
        patient = Patient.objects.create(
            user=user,
            doctor=data['doctor'],
        )
        serializer = PatientSerializer(patient, many=False)
        return Response(serializer.data)
"""
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from django.contrib.auth.models import User
from base.models import Doctor, Patient
from base.serializers import PatientSerializer

@api_view(['GET'])
def getPatients(request):
    """
    List all patients.
    """
    patients = Patient.objects.all()
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
    """
    1) Extract 'name' and 'doctor' from request.data.
    2) If either is missing, return 400.
    3) Look up the Doctor instance (by its primary key).
    4) Attempt to get_or_create a Patient with (name, doctor).
       - If it already exists, just serialize & return it.
       - If it doesn't exist, create it with `user=request.user`.
    """
    user = request.user
    data = request.data

    # Required fields: 'name' (patient's name) and 'doctor' (doctor's _id)
    name = data.get('name')
    doctor_id = data.get('doctor')

    if not name:
        return Response(
            {'detail': 'Patient name is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not doctor_id:
        return Response(
            {'detail': 'Doctor ID is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Look up the doctor instance. If not found, return 404.
    doctor = get_object_or_404(Doctor, _id=doctor_id)

    # Try to find an existing patient with the same name under this doctor.
    # If found, return it; otherwise, create a new one.
    patient, created = Patient.objects.get_or_create(
        name=name,
        doctor=doctor,
        defaults={'user': user}
    )

    # If it existed already (created == False), we still return it,
    # but you could choose to send a message saying "Already existed."
    serializer = PatientSerializer(patient, many=False)
    return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
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