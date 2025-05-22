# from django.urls import path
# from . import views
# from django.conf import settings
# from django.conf.urls.static import static
# # from rest_framework_simplejwt.views import (
# #     TokenObtainPairView,
# # )

# urlpatterns = [
#     path('users/login/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
#     path('users/register/', views.registerUser, name="register"),
#     path('users/profile/', views.getUserProfile, name="users-profile"),
#     path('users/', views.getUsers, name="users"),
#     path('patients/', views.getPatients, name="patients"),
#     path('patients/<str:pk>/', views.getPatient, name="patient"),
#     path('doctor/', views.getDoctor, name="doctor")
# ]

# if settings.DEBUG:
#     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)