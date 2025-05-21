from rest_framework import serializers
from .models import Category, Income
from django.contrib.auth.models import User # Necesario si queremos mostrar info del usuario

class CategorySerializer(serializers.ModelSerializer):
    # Opcional: Si quieres que el usuario se asigne automáticamente en la vista y no sea un campo editable
    # user = serializers.HiddenField(default=serializers.CurrentUserDefault()) 
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'user'] # 'user' es opcional dependiendo de tu lógica
        read_only_fields = ['user'] # El usuario se asignará en la vista

    def validate_name(self, value):
        # Asegurar que el nombre de la categoría no esté vacío
        if not value.strip():
            raise serializers.ValidationError("El nombre de la categoría no puede estar vacío.")
        
        # Validación de unicidad (user, name) a nivel de serializer si es necesario, aunque unique_together en el modelo ya lo maneja
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            user = request.user
            if Category.objects.filter(user=user, name__iexact=value).exists():
                 # Si es una actualización, permitir el mismo nombre si es el mismo objeto
                if self.instance and self.instance.name.lower() == value.lower():
                    pass
                else:
                    raise serializers.ValidationError("Ya tienes una categoría con este nombre.")
        # Para categorías globales (user=None)
        elif not request or not hasattr(request, 'user') or not request.user.is_authenticated:
             if Category.objects.filter(user=None, name__iexact=value).exists():
                if self.instance and self.instance.name.lower() == value.lower():
                    pass
                else:
                    raise serializers.ValidationError("Ya existe una categoría global con este nombre.")
        return value

class IncomeSerializer(serializers.ModelSerializer):
    # Para mostrar el nombre de la categoría en lugar de solo el ID
    category_name = serializers.CharField(source='category.name', read_only=True, allow_null=True)
    # Para permitir enviar el ID de la categoría al crear/actualizar
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), # Podríamos filtrar esto más adelante
        allow_null=True,
        required=False
    )

    class Meta:
        model = Income
        fields = [
            'id', 'user', 'amount', 'date', 'category', 'category_name', 
            'source', 'recurrence', 'description', 'created_at'
        ]
        read_only_fields = ['user', 'created_at'] # El usuario se asignará automáticamente

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("El monto del ingreso debe ser positivo.")
        return value
    
    def validate_category(self, value):
        # Asegurar que la categoría pertenezca al usuario o sea global
        request = self.context.get('request')
        if value and request and hasattr(request, 'user') and request.user.is_authenticated:
            if value.user is not None and value.user != request.user:
                raise serializers.ValidationError("Categoría no válida.")
        # Si no hay request o usuario (ej. tests), no podemos validar esto
        return value

    def create(self, validated_data):
        # Asignar el usuario actual al crear el ingreso
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

