from django.urls import path
from .views import (
    CategoryListCreateView,
    CategoryDetailView,
    IncomeListCreateView,
    IncomeDetailView,
    # IncomeFilterView, 
    ExpenseListCreateView,
    ExpenseDetailView,
    # ExpenseFilterView, 
    FinancialSummaryView,
    ExpenseCategorySummaryView,
    IncomeCategorySummaryView
)

urlpatterns = [
    path('categories/', CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='category-detail'),
    path('incomes/', IncomeListCreateView.as_view(), name='income-list-create'),
    path('incomes/<int:pk>/', IncomeDetailView.as_view(), name='income-detail'),
    # path('incomes/filtered/', IncomeFilterView.as_view(), name='income-filtered-list'), 
    path('expenses/', ExpenseListCreateView.as_view(), name='expense-list-create'),
    path('expenses/<int:pk>/', ExpenseDetailView.as_view(), name='expense-detail'),
    # path('expenses/filtered/', ExpenseFilterView.as_view(), name='expense-filtered-list'), 
    path('summary/financial/', FinancialSummaryView.as_view(), name='financial-summary'),
    path('summary/expenses-by-category/', ExpenseCategorySummaryView.as_view(), name='expense-category-summary'),
    path('summary/incomes-by-category/', IncomeCategorySummaryView.as_view(), name='income-category-summary'),
]
