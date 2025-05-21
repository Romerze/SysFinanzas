from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# Create your models here.

class Category(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, help_text="Usuario si la categoría es personalizada, o nulo si es global.")
    name = models.CharField(max_length=100, help_text="Nombre de la categoría (ej: Sueldo, Comida, Transporte)")
    # Podríamos añadir un tipo (ingreso/gasto) si queremos usar el mismo modelo Category para ambos
    # TIPO_CHOICES = [('ingreso', 'Ingreso'), ('gasto', 'Gasto')]
    # type = models.CharField(max_length=7, choices=TIPO_CHOICES, default='gasto')

    class Meta:
        verbose_name_plural = "Categories"
        unique_together = ('user', 'name') # Un usuario no puede tener dos categorías con el mismo nombre

    def __str__(self):
        return f"{self.name}{' (Global)' if not self.user else ''}"

class Income(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='incomes')
    amount = models.DecimalField(max_digits=10, decimal_places=2, help_text="Monto del ingreso")
    date = models.DateField(default=timezone.now, help_text="Fecha en que se recibió el ingreso")
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, help_text="Categoría del ingreso")
    source = models.CharField(max_length=100, blank=True, help_text="Fuente del ingreso (ej: Empleo X, Cliente Y)")
    
    RECURRENCE_CHOICES = [
        ('none', 'No Recurrente'),
        ('daily', 'Diario'),
        ('weekly', 'Semanal'),
        ('biweekly', 'Quincenal'),
        ('monthly', 'Mensual'),
        ('annually', 'Anual'),
    ]
    recurrence = models.CharField(
        max_length=10,
        choices=RECURRENCE_CHOICES,
        default='none',
        help_text="Frecuencia de recurrencia del ingreso"
    )
    description = models.TextField(blank=True, help_text="Descripción o notas adicionales sobre el ingreso")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Ingreso de {self.amount} para {self.user.username} el {self.date}"

    class Meta:
        ordering = ['-date', '-created_at']
