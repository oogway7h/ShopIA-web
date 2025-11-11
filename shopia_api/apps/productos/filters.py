
from django_filters import rest_framework as filters
from .models import Producto

class ProductoFilter(filters.FilterSet):
    precio__gte = filters.NumberFilter(field_name='precio', lookup_expr='gte')
    precio__lte = filters.NumberFilter(field_name='precio', lookup_expr='lte')

    class Meta:
        model = Producto
        fields = {
            'categoria': ['exact'],
            'precio': ['gte', 'lte'], #permite filtrar por un rango de precios
        }
