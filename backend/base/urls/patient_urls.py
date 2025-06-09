from django.urls import path
from base.views import patient_views as views
from django.conf import settings
from django.conf.urls.static import static
# from rest_framework_simplejwt.views import (
#     TokenObtainPairView,
# )

urlpatterns = [
    path('', views.getPatients, name="patients"),
    path('add/', views.addPatient, name='patients-add'),  # Moved ABOVE dynamic path
    path('<str:pk>/', views.getPatient, name="patient"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)