from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    Doctor, Patient, MedicalFileEntry,
    Section, Category,  # existing
    SubCategory, Field, Option  # newly added
)

# ----- existing serializers -----
class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField(read_only=True)
    _id = serializers.SerializerMethodField(read_only=True)
    isAdmin = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ['id', '_id', 'username', 'email', 'name', 'isAdmin']

    def get__id(self, obj):
        return obj.id

    def get_isAdmin(self, obj):
        return obj.is_staff

    def get_name(self, obj):
        first = obj.first_name
        return first if first else obj.email


class UserSerializerWithToken(UserSerializer):
    token = serializers.SerializerMethodField(read_only=True)
    isDoctor = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', '_id', 'username', 'email', 'name', 'isAdmin', 'token', 'isDoctor']

    def get_token(self, obj):
        refresh = RefreshToken.for_user(obj)
        return str(refresh.access_token)
    
    def get_isDoctor(self, obj):
        return Doctor.objects.filter(user=obj).exists()


class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = '__all__'


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'


class MedicalFileEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalFileEntry
        fields = ['id', 'patient', 'category', 'label', 'code', 'created_at']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class SectionSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)

    class Meta:
        model = Section
        fields = ['id', 'name', 'order', 'categories']

# ----- new serializers for examen clinique -----
class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'label', 'is_other']

class FieldSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)

    class Meta:
        model = Field
        fields = ['id', 'name', 'field_type', 'order', 'options']

class SubCategorySerializer(serializers.ModelSerializer):
    fields = FieldSerializer(many=True, read_only=True)

    class Meta:
        model = SubCategory
        fields = ['id', 'name', 'fields']

# Expand CategorySerializer to nest fields & subcategories
class CategoryDetailSerializer(CategorySerializer):
    fields = FieldSerializer(many=True, read_only=True)
    subcategories = SubCategorySerializer(many=True, read_only=True)

    class Meta(CategorySerializer.Meta):
        fields = ['id', 'name', 'fields', 'subcategories']

# Expand SectionSerializer to use the detail version
class SectionDetailSerializer(SectionSerializer):
    categories = CategoryDetailSerializer(many=True, read_only=True)

    class Meta(SectionSerializer.Meta):
        fields = ['id', 'name', 'order', 'categories']
