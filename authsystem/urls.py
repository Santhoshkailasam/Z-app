from django.urls import path
from .views import WorkerLoginView

urlpatterns = [
    path('auth/login/', WorkerLoginView.as_view(), name='worker-login'),
]
