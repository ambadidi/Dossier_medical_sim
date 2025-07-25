from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    # path('api/', include('base.urls')),
    path('api/admin/', include('base.urls.admin_urls')),
    path('api/patients/', include('base.urls.patient_urls')),
    path('api/users/', include('base.urls.user_urls')),
    path('api/doctors/', include('base.urls.doctor_urls')),
    # path('api/admin/', include('base.urls.admin_urls')),
]

# if settings.DEBUG:
#     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)