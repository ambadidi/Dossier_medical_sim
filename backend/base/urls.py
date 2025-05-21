from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', views.getRoutes, name="routes"),
    path('patients/', views.getPatients, name="patients"),
    path('patients/<str:pk>/', views.getPatient, name="patient"),
    path('doctor/', views.getDoctor, name="doctor")
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)