from rest_framework import serializers
from .models import WorkerProfile

class WorkerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkerProfile
        fields = '__all__'
        read_only_fields = ['user']
