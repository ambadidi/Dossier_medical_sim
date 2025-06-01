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
def getDoctor(request):
    doctor = Doctor.objects.all()
    serializer = DoctorSerializer(doctor, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getMyDoctorProfile(request):
    """
    Returns the Doctor object linked to request.user.
    """
    try:
        doctor = Doctor.objects.get(user=request.user)
        serializer = DoctorSerializer(doctor, many=False)
        return Response(serializer.data)
    except Doctor.DoesNotExist:
        return Response(
            {'detail': 'Doctor profile not found for this user'},
            status=status.HTTP_404_NOT_FOUND
        )
