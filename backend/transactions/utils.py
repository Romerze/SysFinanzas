from django.db.models import Sum
from .models import Income, Expense

def get_financial_summary(user):
    """
    Calculates the total income, total expenses, and balance for a given user.
    """
    total_income = Income.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or 0
    total_expense = Expense.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or 0
    balance = total_income - total_expense
    
    return {
        'incomes': total_income,
        'expenses': total_expense,
        'balance': balance
    }
