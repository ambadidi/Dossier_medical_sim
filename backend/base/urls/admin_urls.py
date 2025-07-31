from django.urls import path, include
from rest_framework.routers import DefaultRouter

from base.views.patient_views import (
    SectionViewSet,
    CategoryViewSet,
    CategoryLookupView,
    SubCategoryViewSet,
    FieldViewSet,
    OptionViewSet,
)

router = DefaultRouter()
router.register(r'sections',    SectionViewSet,  basename='section')
router.register(r'categories',  CategoryViewSet, basename='category')
router.register(r'subcategories', SubCategoryViewSet, basename='subcategory')
router.register(r'fields',      FieldViewSet,    basename='field')
router.register(r'options',     OptionViewSet,   basename='option')

urlpatterns = [
    # Lookup any category by ID
    path('lookup/category/<int:pk>/',
         CategoryLookupView.as_view(),
         name='admin-category-lookup'),

    # CRUD for sections, categories, and examen‑clinique structures
    path('', include(router.urls)),
]
