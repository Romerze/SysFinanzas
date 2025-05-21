from django.urls import path
from .views import UserRegistrationView # Importamos la vista

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user-register'), # Ruta para el registro
]
