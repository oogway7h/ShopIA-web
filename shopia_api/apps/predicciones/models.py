from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator

class PrediccionVenta(models.Model):
    """
    Predicciones de ventas futuras por categoría y período.
    Simple y fácil de visualizar en gráficas.
    """
    
    # ===== PERÍODO =====
    fecha_generacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha de generación"
    )
    
    periodo = models.CharField(
        max_length=10,
        verbose_name="Período",
        help_text="Formato: 2025-12"
    )
    
    anio = models.IntegerField(
        verbose_name="Año",
        validators=[MinValueValidator(2020), MaxValueValidator(2100)]
    )
    
    mes = models.IntegerField(
        verbose_name="Mes",
        validators=[MinValueValidator(1), MaxValueValidator(12)]
    )
    
    # ===== SEGMENTACIÓN =====
    categoria = models.ForeignKey(
        'productos.Categoria',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name="Categoría",
        help_text="Si es null = predicción total",
        related_name='predicciones'
    )
    
    # ===== PREDICCIONES =====
    monto_estimado = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Ventas estimadas",
        help_text="Cuánto dinero se espera vender",
        validators=[MinValueValidator(0)]
    )
    
    cantidad_estimada = models.IntegerField(
        default=0,
        verbose_name="Productos estimados",
        help_text="Cuántos productos se venderán",
        validators=[MinValueValidator(0)]
    )
    
    # ===== ESTADO =====
    activo = models.BooleanField(
        default=True,
        verbose_name="Activo"
    )
    
    class Meta:
        verbose_name = "Predicción de Venta"
        verbose_name_plural = "Predicciones de Ventas"
        ordering = ['-anio', '-mes', 'categoria']
        indexes = [
            models.Index(fields=['anio', 'mes']),
            models.Index(fields=['categoria']),
            models.Index(fields=['activo']),
        ]
        unique_together = [('periodo', 'categoria')]
    
    def __str__(self):
        cat_nombre = self.categoria.nombre if self.categoria else "Total General"
        return f"{self.periodo} - {cat_nombre}: ${self.monto_estimado:,.0f}"


class CrecimientoCategoria(models.Model):
    """
    Análisis de crecimiento/caída de ventas por categoría.
    Para alertas y toma de decisiones.
    """
    
    categoria = models.ForeignKey(
        'productos.Categoria',
        on_delete=models.CASCADE,
        verbose_name="Categoría",
        related_name='crecimientos'
    )
    
    fecha_analisis = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha del análisis"
    )
    
    periodo = models.CharField(
        max_length=10,
        verbose_name="Período",
        help_text="Período analizado (YYYY-MM)"
    )
    
    # ===== COMPARACIÓN MENSUAL =====
    ventas_mes_actual = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Ventas mes actual",
        validators=[MinValueValidator(0)]
    )
    
    ventas_mes_anterior = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Ventas mes anterior",
        validators=[MinValueValidator(0)]
    )
    
    # ===== CRECIMIENTO =====
    TENDENCIA_CHOICES = [
        ('CRECIMIENTO_FUERTE', 'Crecimiento Fuerte'),
        ('CRECIMIENTO', 'Crecimiento'),
        ('ESTABLE', 'Estable'),
        ('DECRECIMIENTO', 'Decrecimiento'),
        ('DECRECIMIENTO_FUERTE', 'Decrecimiento Fuerte'),
    ]
    
    tendencia = models.CharField(
        max_length=25,
        choices=TENDENCIA_CHOICES,
        verbose_name="Tendencia"
    )
    
    porcentaje_cambio = models.FloatField(
        verbose_name="Porcentaje de cambio",
        help_text="Ej: +15.5 = creció 15.5%",
        default=0
    )
    
    # ===== PREDICCIÓN FUTURO =====
    estimacion_proximo_mes = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Estimación próximo mes",
        validators=[MinValueValidator(0)]
    )
    
    class Meta:
        verbose_name = "Crecimiento de Categoría"
        verbose_name_plural = "Crecimiento de Categorías"
        ordering = ['-fecha_analisis', '-porcentaje_cambio']
        unique_together = [('categoria', 'periodo')]
    
    def __str__(self):
        return f"{self.categoria.nombre} - {self.get_tendencia_display()} ({self.porcentaje_cambio:+.1f}%)"
    
    def save(self, *args, **kwargs):
        # Calcular automáticamente la tendencia
        if self.ventas_mes_anterior > 0:
            cambio = ((float(self.ventas_mes_actual) - float(self.ventas_mes_anterior)) 
                     / float(self.ventas_mes_anterior)) * 100
            self.porcentaje_cambio = round(cambio, 2)
            
            # Asignar tendencia según crecimiento
            if cambio >= 20:
                self.tendencia = 'CRECIMIENTO_FUERTE'
            elif cambio >= 5:
                self.tendencia = 'CRECIMIENTO'
            elif cambio >= -5:
                self.tendencia = 'ESTABLE'
            elif cambio >= -20:
                self.tendencia = 'DECRECIMIENTO'
            else:
                self.tendencia = 'DECRECIMIENTO_FUERTE'
        
        super().save(*args, **kwargs)


class ProductoMasVendido(models.Model):
    """
    Top productos vendidos por período.
    Para recomendaciones y stock.
    """
    
    producto = models.ForeignKey(
        'productos.Producto',
        on_delete=models.CASCADE,
        verbose_name="Producto",
        related_name='rankings'
    )
    
    periodo = models.CharField(
        max_length=10,
        verbose_name="Período",
        help_text="Formato YYYY-MM"
    )
    
    # ===== MÉTRICAS =====
    cantidad_vendida = models.IntegerField(
        verbose_name="Unidades vendidas",
        validators=[MinValueValidator(0)]
    )
    
    monto_total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Total vendido",
        validators=[MinValueValidator(0)]
    )
    
    ranking = models.IntegerField(
        verbose_name="Posición en el ranking",
        help_text="1 = más vendido",
        validators=[MinValueValidator(1)]
    )
    
    # ===== PREDICCIÓN =====
    estimacion_siguiente_mes = models.IntegerField(
        verbose_name="Estimación próximo mes (unidades)",
        validators=[MinValueValidator(0)]
    )
    
    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
        verbose_name="Última actualización"
    )
    
    class Meta:
        verbose_name = "Producto Más Vendido"
        verbose_name_plural = "Productos Más Vendidos"
        ordering = ['periodo', 'ranking']
        unique_together = [('producto', 'periodo')]
    
    def __str__(self):
        return f"#{self.ranking} {self.producto.nombre} - {self.periodo} ({self.cantidad_vendida} uds.)"
    
    @property
    def crecimiento_estimado(self):
        """Porcentaje de crecimiento estimado para el próximo mes"""
        if self.cantidad_vendida > 0:
            cambio = ((self.estimacion_siguiente_mes - self.cantidad_vendida) 
                     / self.cantidad_vendida) * 100
            return round(cambio, 2)
        return 0
