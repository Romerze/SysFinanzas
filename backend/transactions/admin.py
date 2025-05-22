from django.contrib import admin
from .models import Category, Income

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'user') # Campos que se mostrarán en la lista
    list_filter = ('user',) # Filtros que aparecerán en el panel lateral
    search_fields = ('name', 'user__username') # Campos por los que se podrá buscar

@admin.register(Income)
class IncomeAdmin(admin.ModelAdmin):
    list_display = ('description', 'amount', 'date', 'category', 'user', 'recurrence', 'created_at')
    list_filter = ('user', 'category', 'date', 'recurrence')
    search_fields = ('description', 'user__username', 'category__name')
    date_hierarchy = 'date' # Para navegar por fechas

# O una forma más simple si no necesitas personalización:
# admin.site.register(Category)
# admin.site.register(Income)
