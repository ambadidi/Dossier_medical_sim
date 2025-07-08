"""
from django.urls import path, include
from base.views import patient_views as views
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
# from rest_framework_simplejwt.views import (
#     TokenObtainPairView,
# )

router = DefaultRouter()
router.register('sections', views.SectionViewSet, basename='section')
router.register('categories', views.CategoryViewSet, basename='category')


urlpatterns = [
    path('lookup/category/<int:pk>/', views.CategoryLookupView.as_view()),
    path('', include(router.urls)),
]
# urlpatterns += router.urls
"""
# base/urls/admin_urls.py
# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from base.views import patient_views as views
# from base.views.patient_views import SectionViewSet, CategoryViewSet, CategoryLookupView

# router = DefaultRouter()
# # these two lines register your viewsets under /sections/ and /categories/
# router.register(r'sections', SectionViewSet, basename='section')
# router.register(r'categories', CategoryViewSet, basename='category')

# urlpatterns = [
#     # Lookup endpoint for any category by its ID
#     path('lookup/category/<int:pk>/', views.CategoryLookupView.as_view(), name='admin-category-lookup'),

#     # This pulls in:
#     #   GET  /api/admin/sections/
#     #   POST /api/admin/sections/
#     #   GET  /api/admin/sections/<pk>/
#     #   PUT/PATCH/DELETE etc.
#     #
#     # and similarly for /categories/
#     path('', include(router.urls)),
# ]
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from base.views.patient_views import SectionViewSet, CategoryViewSet, CategoryLookupView

router = DefaultRouter()
router.register(r'sections', SectionViewSet, basename='section')
router.register(r'categories', CategoryViewSet, basename='category')

urlpatterns = [
    # Lookup any category by ID
    path('lookup/category/<int:pk>/', CategoryLookupView.as_view(), name='admin-category-lookup'),
    # CRUD for sections & categories
    path('', include(router.urls)),
]