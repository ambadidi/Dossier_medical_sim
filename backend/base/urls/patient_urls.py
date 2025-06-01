from django.urls import path
from base.views import patient_views as views
from django.conf import settings
from django.conf.urls.static import static
# from rest_framework_simplejwt.views import (
#     TokenObtainPairView,
# )

urlpatterns = [
    
    path('', views.getPatients, name="patients"),
    # path('<str:pk>/', views.getPatient, name="patient"),
    path('<str:pk>/', views.getPatientById, name="patient"),
    path('add/', views.addPatient, name='patients-add'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)