from django.urls import path
from .views import (
    CategoryListCreateView,
    CategoryDetailView,
    IncomeListCreateView,
    IncomeDetailView
)

urlpatterns = [
    path('categories/', CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='category-detail'),
    path('incomes/', IncomeListCreateView.as_view(), name='income-list-create'),
    path('incomes/<int:pk>/', IncomeDetailView.as_view(), name='income-detail'),
]
