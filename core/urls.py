"""
Roots of VC
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('authsystem.urls')),
    path('api/worker/', include('worker.urls')),
    path('api/loan/', include('loan.urls')),

]
