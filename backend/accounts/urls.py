from django.urls import path
from .views import UserRegistrationView, UserProfileView, ChangePasswordView # Importamos las vistas

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user-register'), # Ruta para el registro
    path('me/', UserProfileView.as_view(), name='user-profile'), # Ruta para ver/editar perfil
    path('change-password/', ChangePasswordView.as_view(), name='change-password'), # Ruta para cambiar contraseña
]
