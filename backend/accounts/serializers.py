from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

class UserRegistrationSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all(), message="Este correo electrónico ya está en uso.")]
    )
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password], # Valida la fortaleza de la contraseña según la config de Django
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        label="Confirmar contraseña"
    )
    first_name = serializers.CharField(required=True, label="Nombre") # Para el nombre del usuario

    class Meta:
        model = User
        # Campos que se incluirán en la entrada y salida del serializer (solo lectura para username)
        fields = ('username', 'password', 'password2', 'email', 'first_name')
        extra_kwargs = {
            'username': {'read_only': True}, # El username se generará a partir del email o se puede omitir si no es necesario
            'first_name': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden."})
        # Usaremos el email como username por simplicidad o puedes pedir un username explícito
        attrs['username'] = attrs['email'] 
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'], # Usamos el email como username
            email=validated_data['email'],
            first_name=validated_data['first_name']
        )
        user.set_password(validated_data['password']) # Hashea la contraseña
        user.save()
        return user
