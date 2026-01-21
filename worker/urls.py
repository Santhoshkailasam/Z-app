from django.urls import path
from .views import WorkerProfileView

urlpatterns = [
    path('profile/', WorkerProfileView.as_view(), name='worker-profile'),
]
