from django.urls import path
from base.views import doctor_views as views
from django.conf import settings
from django.conf.urls.static import static
# from rest_framework_simplejwt.views import (
#     TokenObtainPairView,
# )

urlpatterns = [
    
    path('', views.getDoctor, name="doctor"),
    # returns only the currently authenticated doctor
    path('profile/', views.getMyDoctorProfile, name="doctor-profile"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)