from rest_framework import serializers
from .models import TipoPago, Carrito, ItemCarrito, Venta, DetalleVenta, Pago
from apps.productos.models import Producto  # Cambia esta línea
from apps.productos.serializers import ProductoSerializer  # Cambia esta línea

class ItemCarritoSerializer(serializers.ModelSerializer):
    producto = ProductoSerializer(read_only=True)
    producto_id = serializers.PrimaryKeyRelatedField(
        queryset=Producto.objects.all(),
        source='producto',
        write_only=True
    )
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = ItemCarrito
        fields = ['id', 'producto', 'producto_id', 'precio_unitario', 'cantidad', 'subtotal']

    def get_subtotal(self, obj):
        return obj.precio_unitario * obj.cantidad

class CarritoSerializer(serializers.ModelSerializer):
    items = ItemCarritoSerializer(many=True, read_only=True)
    total_items = serializers.SerializerMethodField()
    total_precio = serializers.SerializerMethodField()

    class Meta:
        model = Carrito
        fields = ['id', 'usuario', 'fecha_creacion', 'items', 'total_items', 'total_precio']

    def get_total_items(self, obj):
        return obj.total_items()

    def get_total_precio(self, obj):
        return obj.total_precio()

class TipoPagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoPago
        fields = '__all__'

class DetalleVentaSerializer(serializers.ModelSerializer):
    producto = ProductoSerializer(read_only=True)

    class Meta:
        model = DetalleVenta
        fields = ['id', 'producto', 'precio_unitario', 'cantidad']

class VentaSerializer(serializers.ModelSerializer):
    detalles = DetalleVentaSerializer(many=True, read_only=True)
    usuario = serializers.StringRelatedField(read_only=True)
    pagos = serializers.SerializerMethodField()

    class Meta:
        model = Venta
        fields = [
            'id', 'usuario', 'fecha', 'monto_total', 'direccion', 
            'numero_int', 'estado', 'detalles', 'pagos'
        ]

    def get_pagos(self, obj):
        return obj.pagos.count()

class CrearVentaSerializer(serializers.Serializer):
    direccion = serializers.CharField(max_length=255)
    numero_int = serializers.IntegerField(required=False, allow_null=True)
    tipo_pago_id = serializers.IntegerField()

    def validate_tipo_pago_id(self, value):
        if not TipoPago.objects.filter(id=value, activo=True).exists():
            raise serializers.ValidationError("Tipo de pago inválido o inactivo.")
        return value
