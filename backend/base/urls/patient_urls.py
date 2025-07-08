from django.urls import path, include
from base.views import patient_views as views
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
# from rest_framework_simplejwt.views import (
#     TokenObtainPairView,
# )





urlpatterns = [
    path('', views.getPatients, name="patients"),
    path('add/', views.addPatient, name='patients-add'),  # Moved ABOVE dynamic path
    # path('<str:pk>/', views.getPatient, name="patient"),
    path('<int:pk>/', views.PatientDetailView.as_view()),
    path('lookup/category/<int:pk>/', views.CategoryLookupView.as_view()),
    path('lookup/reasons/', views.ReasonListView.as_view()),
    path('lookup/history/', views.HistoryListView.as_view()),
    path('lookup/allergies/', views.AllergyListView.as_view()),
    path('<int:pk>/medical-file/', views.PatientMedicalFileCreateView.as_view()),
    path('<int:pk>/medical-file/download/pdf/', views.PatientMedicalFileDownloadView.as_view()),
    path('<int:pk>/medical-file/clear/', views.PatientMedicalFileClearView.as_view()),
    
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
