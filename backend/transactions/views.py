from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Category, Income
from .serializers import CategorySerializer, IncomeSerializer
from django.db.models import Q # Para consultas OR
from django_filters.rest_framework import DjangoFilterBackend 
from rest_framework import filters 
from .filters import IncomeFilter 


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
        # El usuario se asigna en el serializer a través del contexto de la petición
        # serializer.save(user=self.request.user) # Ya se maneja en el serializer
        serializer.save() 

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
