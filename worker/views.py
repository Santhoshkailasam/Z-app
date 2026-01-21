from rest_framework import generics, permissions
from .models import WorkerProfile
from .serializers import WorkerProfileSerializer

class WorkerProfileView(generics.RetrieveAPIView):
    serializer_class = WorkerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return WorkerProfile.objects.get(user=self.request.user)
