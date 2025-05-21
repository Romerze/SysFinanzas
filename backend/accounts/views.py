from django.shortcuts import render
from django.contrib.auth.models import User
from .serializers import UserRegistrationSerializer
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

# Create your views here.

class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny] # Permite a cualquier usuario (incluso no autenticado) acceder a esta vista

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            # Podrías personalizar la respuesta aquí si es necesario
            # Por ejemplo, no devolver la información del usuario o devolver un mensaje específico
            user_data = serializer.data
            # No queremos devolver las contraseñas en la respuesta
            user_data.pop('password', None) 
            user_data.pop('password2', None)
            return Response({"message": "Usuario registrado exitosamente.", "user": user_data}, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
