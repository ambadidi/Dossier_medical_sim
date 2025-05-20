from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
# Create your models here.


class Doctor(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    name = models.CharField(max_length=200, null=True, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    _id = models.AutoField(primary_key=True, editable=False)

    def __str__(self):
        return self.name


def validate_excel_file(value):
    import os
    ext = os.path.splitext(value.name)[1]  # Get file extension
    valid_extensions = ['.xls', '.xlsx']
    if ext.lower() not in valid_extensions:
        raise ValidationError('Unsupported file type. Please upload an Excel file.')

class Patient(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    name = models.CharField(max_length=200, null=True, blank=True)
    dossierMedical = models.FileField(
        upload_to='medical_dossiers/',
        null=True,
        blank=True,
        validators=[validate_excel_file]
    )
    createdAt = models.DateTimeField(auto_now_add=True)
    _id = models.AutoField(primary_key=True, editable=False)

    def __str__(self):
        return self.name
