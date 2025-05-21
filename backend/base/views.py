from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import *
from .serializers import *

# Create your views here.

@api_view(['GET'])
def getRoutes(request):
    routes = [
        'api/admin/',
        '/api/doctor/',
        '/api/patients/',
        '/api/patients/create/',
        '/api/patients/upload/',
        '/api/patients/<id>/'
    ]
    return Response(routes)

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

@api_view(['GET'])
def getDoctor(request):
    doctor = Doctor.objects.all()
    serializer = DoctorSerializer(doctor, many=True)
    return Response(serializer.data)