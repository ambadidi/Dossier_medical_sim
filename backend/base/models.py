from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.conf import settings
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

class MedicalFileEntry(models.Model):
    patient = models.ForeignKey('Patient', to_field='_id', on_delete=models.CASCADE, related_name='medical_entries')
    category = models.CharField(max_length=50)  # e.g. 'reasons', 'history', 'allergies'
    label = models.CharField(max_length=200)
    code = models.CharField(max_length=50, blank=True, null=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient.name} - {self.category}: {self.label}"

class Section(models.Model):
    name = models.CharField(max_length=100)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name

class Category(models.Model):
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=100)
    # excel_file = models.CharField(max_length=200)  # filename under EXCEL_ROOT
    excel_file = models.FileField(upload_to='excel_sheets/', max_length=200)
    code_column = models.CharField(max_length=100, blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['section__order', 'order']

    def __str__(self):
        return f"{self.section.name} - {self.name}"

#
# ─── EXAMEN CLINIQUE CONFIGURATION ────────────────────────────────────────────────
#

class SubCategory(models.Model):
    """
    A sub‑category of a Category, e.g. “inspection” under “examen abdominal.”
    """
    category = models.ForeignKey(
        Category,
        related_name="subcategories",
        on_delete=models.CASCADE
    )
    name = models.CharField(max_length=200)

    def __str__(self):
        return f"{self.category.name} → {self.name}"


FIELD_TYPE_CHOICES = [
    ("number", "Number"),
    ("text",   "Text"),
    ("multi",  "Multiple choice"),
]

class Field(models.Model):
    """
    A single field either directly under a Category (like GCS)
    or under a SubCategory (like abdominal inspection).
    """
    # one of these will be non‑null
    category    = models.ForeignKey(
        Category,
        related_name="fields",
        null=True,
        blank=True,
        on_delete=models.CASCADE
    )
    subcategory = models.ForeignKey(
        SubCategory,
        related_name="fields",
        null=True,
        blank=True,
        on_delete=models.CASCADE
    )
    name       = models.CharField(max_length=200)
    field_type = models.CharField(max_length=10, choices=FIELD_TYPE_CHOICES)
    order      = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        loc = self.subcategory or self.category
        return f"{loc} → {self.name}"


class Option(models.Model):
    """
    For multi‑choice fields only: e.g. “splénomégalie” or “autre.”
    """
    field    = models.ForeignKey(Field, related_name="options", on_delete=models.CASCADE)
    label    = models.CharField(max_length=200)
    # mark whether this option is the special “Autre” that triggers a text input
    is_other = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.field.name}: {self.label}"