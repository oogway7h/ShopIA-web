from django.db import models
from django.conf import settings



class TipoPago(models.Model):
    nombre = models.CharField(max_length=100, verbose_name="Nombre del método")
    activo = models.BooleanField(default=True, verbose_name="Activo")

    class Meta:
        verbose_name = "Tipo de Pago"
        verbose_name_plural = "Tipos de Pago"

    def __str__(self):
        return self.nombre

class Venta(models.Model):
    usuario = models.ForeignKey(
        'usuarios.Usuario', 
        on_delete=models.PROTECT,
        related_name="ventas",
        verbose_name="Usuario"
    )
    fecha = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de venta")
    
    monto_total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Monto Total"
    )
    direccion = models.CharField(max_length=255, verbose_name="Dirección de envío")
    numero_int = models.IntegerField(
        null=True,
        blank=True,
        verbose_name="Número Interior/Apto"
    )
    
    ESTADO_CHOICES = [
        ('PENDIENTE', 'Pendiente de Pago'),
        ('PAGADA', 'Pagada'),
        ('ENVIADA', 'Enviada'),
        ('CANCELADA', 'Cancelada'),
    ]
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default='PENDIENTE',
        verbose_name="Estado de la Venta"
    )

    class Meta:
        verbose_name = "Venta"
        verbose_name_plural = "Ventas"
        ordering = ['-fecha']

    def __str__(self):
        return f"Venta #{self.id} - {self.usuario.correo}"

class DetalleVenta(models.Model):
    
    venta = models.ForeignKey(
        Venta,
        on_delete=models.CASCADE, 
        related_name="detalles",
        verbose_name="Venta"
    )
    producto = models.ForeignKey(
        'productos.Producto', 
        on_delete=models.PROTECT, 
        verbose_name="Producto"
    )
    
    precio_unitario = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Precio Unitario"
    )
    cantidad = models.IntegerField(verbose_name="Cantidad")

    class Meta:
        verbose_name = "Detalle de Venta"
        verbose_name_plural = "Detalles de Venta"

    def __str__(self):
        try:
            return f"{self.cantidad} x {self.producto.nombre}"
        except Exception:
            return f"{self.cantidad} x [Producto no encontrado]"

class Pago(models.Model):
    
    venta = models.ForeignKey(
        Venta,
        on_delete=models.CASCADE, 
        related_name="pagos",
        verbose_name="Venta"
    )
    tipo_pago = models.ForeignKey(
        TipoPago,
        on_delete=models.PROTECT, 
        verbose_name="Tipo de Pago"
    )
    
    
    monto = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Monto pagado")
    
    
    ESTADO_CHOICES = [
        ('PENDIENTE', 'Pendiente'),
        ('COMPLETADO', 'Completado'),
        ('FALLIDO', 'Fallido'),
        ('REEMBOLSADO', 'Reembolsado'),
    ]
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default='PENDIENTE',
        verbose_name="Estado del Pago"
    )
    
    fecha = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Pago")
    
    transaccion_id = models.CharField(
        max_length=255, 
        blank=True, 
        null=True, 
        verbose_name="ID de Transacción Externa"
    )

    class Meta:
        verbose_name = "Pago"
        verbose_name_plural = "Pagos"
        ordering = ['-fecha']

    def __str__(self):
        return f"Pago de {self.monto} para Venta #{self.venta.id} ({self.get_estado_display()})"

class Carrito(models.Model):
    usuario = models.OneToOneField(
        'usuarios.Usuario',
        on_delete=models.CASCADE,
        related_name="carrito",
        verbose_name="Usuario"
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Creación")
    fecha_actualizacion = models.DateTimeField(auto_now=True, verbose_name="Última Actualización")

    class Meta:
        verbose_name = "Carrito"
        verbose_name_plural = "Carritos"

    def __str__(self):
        return f"Carrito de {self.usuario.correo}"

    def total_items(self):
        return sum(item.cantidad for item in self.items.all())

    def total_precio(self):
        return sum(item.subtotal() for item in self.items.all())

class ItemCarrito(models.Model):
    carrito = models.ForeignKey(
        Carrito,
        on_delete=models.CASCADE,
        related_name="items",
        verbose_name="Carrito"
    )
    producto = models.ForeignKey(
        'productos.Producto',
        on_delete=models.CASCADE,
        verbose_name="Producto"
    )
    precio_unitario = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Precio Unitario"
    )
    cantidad = models.PositiveIntegerField(verbose_name="Cantidad")

    class Meta:
        verbose_name = "Item del Carrito"
        verbose_name_plural = "Items del Carrito"
        unique_together = ('carrito', 'producto')

    def __str__(self):
        return f"{self.cantidad} x {self.producto.nombre}"

    def subtotal(self):
        return self.precio_unitario * self.cantidad

