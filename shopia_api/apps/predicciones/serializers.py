from rest_framework import serializers
from .models import PrediccionVenta, CrecimientoCategoria, ProductoMasVendido
from apps.productos.serializers import CategoriaSerializer, ProductoSerializer

class PrediccionVentaSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(
        source='categoria.nombre', 
        read_only=True, 
        allow_null=True
    )
    nivel_ventas = serializers.SerializerMethodField()
    
    class Meta:
        model = PrediccionVenta
        fields = [
            'id', 'fecha_generacion', 'periodo', 'anio', 'mes',
            'categoria', 'categoria_nombre', 'monto_estimado', 
            'cantidad_estimada', 'activo', 'nivel_ventas'
        ]
        read_only_fields = ['fecha_generacion']
    
    def get_nivel_ventas(self, obj):
        """Devuelve nivel según el monto estimado"""
        monto = float(obj.monto_estimado)
        if monto > 1000000:
            return 'MUY_ALTO'
        elif monto > 500000:
            return 'ALTO'
        elif monto > 100000:
            return 'MEDIO'
        else:
            return 'BAJO'


class CrecimientoCategoriaSerializer(serializers.ModelSerializer):
    categoria_detalle = CategoriaSerializer(source='categoria', read_only=True)
    tendencia_display = serializers.CharField(
        source='get_tendencia_display', 
        read_only=True
    )
    cambio_formateado = serializers.SerializerMethodField()
    
    class Meta:
        model = CrecimientoCategoria
        fields = [
            'id', 'categoria', 'categoria_detalle', 'fecha_analisis', 
            'periodo', 'ventas_mes_actual', 'ventas_mes_anterior',
            'tendencia', 'tendencia_display', 'porcentaje_cambio', 
            'estimacion_proximo_mes', 'cambio_formateado'
        ]
        read_only_fields = ['fecha_analisis', 'tendencia', 'porcentaje_cambio']
    
    def get_cambio_formateado(self, obj):
        """Formatea el cambio porcentual con signo"""
        return f"{obj.porcentaje_cambio:+.2f}%"


class ProductoMasVendidoSerializer(serializers.ModelSerializer):
    producto_detalle = ProductoSerializer(source='producto', read_only=True)
    crecimiento_estimado_porcentaje = serializers.SerializerMethodField()
    posicion = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductoMasVendido
        fields = [
            'id', 'producto', 'producto_detalle', 'periodo',
            'cantidad_vendida', 'monto_total', 'ranking',
            'estimacion_siguiente_mes', 'fecha_actualizacion',
            'crecimiento_estimado_porcentaje', 'posicion'
        ]
        read_only_fields = ['fecha_actualizacion']
    
    def get_crecimiento_estimado_porcentaje(self, obj):
        """Devuelve el porcentaje de crecimiento estimado"""
        return f"{obj.crecimiento_estimado:+.2f}%"
    
    def get_posicion(self, obj):
        """Devuelve la posición formateada"""
        if obj.ranking <= 3:
            posiciones = {1: 'Primero', 2: 'Segundo', 3: 'Tercero'}
            return posiciones.get(obj.ranking, f"Posición {obj.ranking}")
        return f"Posición {obj.ranking}"