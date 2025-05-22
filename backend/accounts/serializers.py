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


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(read_only=True)
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all(), message="Este correo electrónico ya está en uso.")]
    )
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True) # Añadimos last_name

    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name')

    def validate_email(self, value):
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("Este correo electrónico ya está en uso por otro usuario.")
        return value

    def update(self, instance, validated_data):
        instance.email = validated_data.get('email', instance.email)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        
        # Si el email cambia, también actualizamos el username para mantenerlos sincronizados
        # (asumiendo que el username se basa en el email, como en UserRegistrationSerializer)
        # Si el username no debe cambiar o tiene otra lógica, ajustar esto.
        if 'email' in validated_data and instance.username != validated_data['email']:
            # Podríamos añadir una validación para el nuevo username si es necesario
            # instance.username = validated_data['email'] 
            # Por ahora, mantendremos el username original para evitar complicaciones
            # si el usuario no espera que su username cambie al cambiar el email.
            pass
            
        instance.save()
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, style={'input_type': 'password'})
    new_password1 = serializers.CharField(required=True, validators=[validate_password], style={'input_type': 'password'}, label="Nueva contraseña")
    new_password2 = serializers.CharField(required=True, style={'input_type': 'password'}, label="Confirmar nueva contraseña")

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Tu contraseña actual es incorrecta.")
        return value

    def validate(self, data):
        if data['new_password1'] != data['new_password2']:
            raise serializers.ValidationError({"new_password2": "Las nuevas contraseñas no coinciden."})
        if data['old_password'] == data['new_password1']:
            raise serializers.ValidationError({"new_password1": "La nueva contraseña no puede ser igual a la contraseña actual."})
        return data

    def save(self, **kwargs):
        password = self.validated_data['new_password1']
        user = self.context['request'].user
        user.set_password(password)
        user.save()
        return user
