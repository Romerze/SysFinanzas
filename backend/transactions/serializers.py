from rest_framework import serializers
from .models import Category, Income, Expense
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
    user = serializers.ReadOnlyField(source='user.username') # Para mostrar username en lugar de ID
    category_name = serializers.CharField(source='category.name', read_only=True, allow_null=True)
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), 
        allow_null=True, 
        required=False
    )

    class Meta:
        model = Income
        fields = [
            'id', 
            'user',
            'amount', 
            'date', 
            'category', 
            'category_name', 
            'source', 
            'recurrence',
            'description', 
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['user', 'created_at', 'updated_at', 'category_name']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("El monto del ingreso debe ser positivo.")
        return value

    def validate_category(self, value):
        """
        Verifica que la categoría pertenezca al usuario o sea una categoría global.
        """
        request = self.context.get('request')
        if value and request and hasattr(request, 'user') and request.user.is_authenticated:
            # Permitir categorías globales (user=None) o categorías del usuario actual
            if value.user is not None and value.user != request.user:
                raise serializers.ValidationError("Categoría no válida o no pertenece al usuario.")
        # Si value es None (categoría opcional), no hay nada que validar aquí.
        return value

    def create(self, validated_data):
        # El usuario se asigna en la vista (perform_create)
        # La categoría ya viene como una instancia debido a PrimaryKeyRelatedField
        # o es None si se permitió.
        
        # Manejo de 'recurrence' si el frontend no lo envía directamente
        # Si el frontend envía 'recurrence' como 'none', 'monthly', etc., no se necesita esto.
        # is_recurrent = validated_data.pop('is_recurrent_input', False) # Suponiendo que el frontend envía esto
        # if is_recurrent:
        #     validated_data['recurrence'] = 'monthly' 
        # else:
        #     validated_data['recurrence'] = 'none'
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # La categoría ya viene como una instancia o None.
        # El usuario no debería cambiar.
        # validated_data.pop('user', None) # Prevenir actualización del usuario
        return super().update(instance, validated_data)

class ExpenseSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    # category = CategorySerializer() # Si quieres el objeto categoría completo al leer
    category_name = serializers.CharField(source='category.name', read_only=True, allow_null=True) # Para mostrar el nombre, permitir null si no hay categoría
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), 
        source='category', 
        write_only=True, 
        allow_null=True, # Permitir que la categoría sea nula
        required=False   # Hacer que el campo no sea estrictamente requerido si se permite nulo
    )

    class Meta:
        model = Expense
        fields = [
            'id', 'user', 'description', 'amount', 'date', 
            'category_id', 'category_name', 
            'payment_method', 'recurrence', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at', 'category_name']

    def validate_category_id(self, value):
        """
        Verifica que la categoría pertenezca al usuario o sea una categoría global.
        """
        request = self.context.get('request')
        # Si 'value' es None (porque allow_null=True), no hay nada que validar aquí.
        if value and request and hasattr(request, 'user'):
            if value.user is not None and value.user != request.user:
                raise serializers.ValidationError("Categoría no válida o no pertenece al usuario.")
        return value

    # La asignación del usuario (user) se maneja en la vista (perform_create).
    # No es necesario sobreescribir el método create() aquí para eso.
