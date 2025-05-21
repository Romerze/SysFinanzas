import django_filters
from .models import Income, Category
from django.db.models import Q

class IncomeFilter(django_filters.FilterSet):
    # Filtro para el mes (número del 1 al 12)
    month = django_filters.NumberFilter(field_name='date', lookup_expr='month')
    # Filtro para el año (número de 4 dígitos)
    year = django_filters.NumberFilter(field_name='date', lookup_expr='year')
    # Filtro para categoría (ID de la categoría)
    category = django_filters.ModelChoiceFilter(
        queryset=Category.objects.none(), # Queryset inicial, se actualiza en __init__
        label="Categoría" 
    )
    # Campo para ordenación
    ordering = django_filters.OrderingFilter(
        fields=(
            ('date', 'date'), # Permite ordenar por 'date' (ascendente) y '-date' (descendente)
            ('amount', 'amount'), # Permite ordenar por 'amount' y '-amount'
        ),
        label="Ordenar por"
    )

    class Meta:
        model = Income
        fields = ['category', 'month', 'year'] # Campos base sobre los que se puede filtrar

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Modificar el queryset del filtro de categoría para que solo muestre
        # las categorías del usuario actual o las categorías globales.
        request = kwargs.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            self.filters['category'].queryset = Category.objects.filter(
                Q(user=request.user) | Q(user__isnull=True)
            )
        elif not request: # Para permitir usar el filtro en otros contextos, como tests sin request
            self.filters['category'].queryset = Category.objects.all()

