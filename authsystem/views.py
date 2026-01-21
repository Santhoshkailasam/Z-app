from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import WorkerLoginSerializer

class WorkerLoginView(APIView):
    permission_classes = []  # allow unauthenticated
    authentication_classes = []

    def post(self, request):
        serializer = WorkerLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)

