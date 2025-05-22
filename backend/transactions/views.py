from django.shortcuts import render
from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from .models import Category, Income, Expense
from .serializers import CategorySerializer, IncomeSerializer, ExpenseSerializer
from django.db.models import Q # Para consultas OR
from django_filters.rest_framework import DjangoFilterBackend 
from rest_framework import filters 
from .filters import IncomeFilter 
from django.db.models import Sum # Importar Sum para la suma de montos
from .utils import get_financial_summary # Importar función para el resumen financiero

# Create your views here.

class CategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # El usuario solo puede ver sus categorías o las categorías globales (user=None)
        return Category.objects.filter(Q(user=self.request.user) | Q(user__isnull=True))

    def perform_create(self, serializer):
        # Asigna el usuario actual a la categoría si se crea una nueva
        # Permite que 'user' sea None si se quiere crear una categoría global (admin feature)
        # Por ahora, forzamos que las categorías creadas por usuarios sean suyas.
        serializer.save(user=self.request.user)

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # El usuario solo puede ver/modificar/eliminar sus categorías
        # Las globales no deberían ser modificables/eliminables por usuarios normales aquí
        return Category.objects.filter(user=self.request.user)

    # Podríamos añadir lógica extra para no permitir eliminar si hay transacciones asociadas


class IncomeListCreateView(generics.ListCreateAPIView):
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter] 
    filterset_class = IncomeFilter 
    ordering_fields = ['date', 'amount'] 
    # ordering = ['-date'] # Opcional: orden por defecto

    def get_queryset(self):
        # El usuario solo ve sus propios ingresos
        return Income.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # El usuario se asigna explícitamente al guardar el serializador
        serializer.save(user=self.request.user) 

    # Opcional: validar que la categoría pertenezca al usuario o sea global
    # def create(self, request, *args, **kwargs):
    #     category_id = request.data.get('category')
    #     if category_id:
    #         try:
    #             category = Category.objects.get(id=category_id)
    #             if category.user is not None and category.user != request.user:
    #                 return Response(
    #                     {"category": ["Categoría no válida."]},
    #                     status=status.HTTP_400_BAD_REQUEST
    #                 )
    #         except Category.DoesNotExist:
    #             return Response(
    #                 {"category": ["Categoría no encontrada."]},
    #                 status=status.HTTP_400_BAD_REQUEST
    #             )
    #     return super().create(request, *args, **kwargs)


class IncomeDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # El usuario solo ve/modifica/elimina sus propios ingresos
        return Income.objects.filter(user=self.request.user)


# VISTAS PARA GASTOS (EXPENSES)

class ExpenseListCreateView(generics.ListCreateAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter] 
    # filterset_class = ExpenseFilter # Descomentar si tienes ExpenseFilter
    ordering_fields = ['date', 'amount'] 
    # ordering = ['-date']

    def get_queryset(self):
        # El usuario solo ve sus propios gastos
        return Expense.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # El usuario se asigna en el serializer a través del contexto de la petición
        # o directamente aquí si el serializer no lo maneja.
        # Si tu ExpenseSerializer ya maneja la asignación del usuario (ej. a través de validated_data o similar),
        # la llamada directa a serializer.save() podría ser suficiente.
        # Si no, necesitas pasar el usuario: serializer.save(user=self.request.user)
        serializer.save(user=self.request.user) 

class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # El usuario solo ve/modifica/elimina sus propios gastos
        return Expense.objects.filter(user=self.request.user)


# Vista para el resumen financiero del dashboard
class FinancialSummaryView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        summary = get_financial_summary(request.user)
        return Response(summary)


class ExpenseCategorySummaryView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        # Agrupar gastos por nombre de categoría y sumar los montos
        # Usamos values() para agrupar por el nombre de la categoría y annotate() para sumar los montos
        # Es importante filtrar por el usuario actual
        summary_data = (
            Expense.objects.filter(user=user)
            .values('category__name') # Agrupa por el nombre de la categoría
            .annotate(total_amount=Sum('amount')) # Suma los montos para cada categoría
            .order_by('-total_amount') # Opcional: ordenar por monto total descendente
        )

        # El resultado de 'summary_data' será algo como:
        # [{'category__name': 'Alimentación', 'total_amount': 500.00},
        #  {'category__name': 'Transporte', 'total_amount': 150.00}]
        # Renombramos 'category__name' a 'category_name' para que sea más limpio en el frontend
        formatted_summary = [
            {'category_name': item['category__name'], 'total_amount': item['total_amount']}
            for item in summary_data if item['category__name'] is not None
        ]
        
        return Response(formatted_summary)


class IncomeCategorySummaryView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        summary_data = (
            Income.objects.filter(user=user)
            .values('category__name')
            .annotate(total_amount=Sum('amount'))
            .order_by('-total_amount')
        )

        formatted_summary = [
            {'category_name': item['category__name'], 'total_amount': item['total_amount']}
            for item in summary_data if item['category__name'] is not None
        ]
        
        return Response(formatted_summary)
