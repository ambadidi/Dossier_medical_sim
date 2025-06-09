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