from django.db import models

# Create your models here.
class Categoria(models.Model):
    
    
    nombre = models.CharField(max_length=100, unique=True, help_text="Nombre de la categoría")
    descripcion = models.TextField(blank=True, null=True, help_text="Descripción de la categoría")

    class Meta:
        verbose_name = "Categoría"
        verbose_name_plural = "Categorías"

    def __str__(self):
        return self.nombre

#modelo para el Producto
class Producto(models.Model):
    """
    Almacena la información principal de los productos.
    Se relaciona con una Categoría.
    """
    nombre = models.CharField(max_length=200, help_text="Nombre del producto")
    marca= models.CharField(max_length=50,help_text="Marca del producto",default="Generico")
    descripcion = models.TextField(help_text="Descripción detallada del producto")
    precio = models.DecimalField(max_digits=10, decimal_places=2, help_text="Precio del producto")
    stock = models.PositiveIntegerField(default=0, help_text="Cantidad en inventario")
    #si se borra una categoría, se protegen los productos asociados para no borrarlos en cascada.
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.PROTECT,
        related_name="productos",
        help_text="Categoría a la que pertenece el producto"
    )
    #url de la imagen 
    url_imagen_principal = models.URLField(max_length=500, blank=True, null=True, help_text="URL de la imagen principal del producto")
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    descuento = models.FloatField(default=0.0, help_text="Descuento aplicado al producto")


    class Meta:
        verbose_name = "Producto"
        verbose_name_plural = "Productos"
        ordering = ['-fecha_creacion']

    def __str__(self):
        return self.nombre

#modelo para las imagenes de un Producto
class ImagenProducto(models.Model):
    """
    Almacena URLs de imágenes adicionales para un producto.
    """
    producto = models.ForeignKey(
        Producto,
        on_delete=models.CASCADE,
        related_name="imagenes",
        help_text="Producto al que pertenece la imagen"
    )
    url = models.URLField(max_length=500, help_text="URL de la imagen")
    public_id = models.CharField(max_length=255, blank=True, null=True, help_text="Public ID de Cloudinary para poder eliminar la imagen")
    descripcion = models.CharField(max_length=200, blank=True, null=True, help_text="Texto alternativo o descripción de la imagen")

    class Meta:
        verbose_name = "Imagen de Producto"
        verbose_name_plural = "Imágenes de Productos"

    def __str__(self):
        return f"Imagen para {self.producto.nombre}"