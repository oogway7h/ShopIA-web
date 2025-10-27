from rest_framework import serializers
from .models import Categoria, Producto, ImagenProducto
import cloudinary.uploader

class CategoriaSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Categoria
        fields = ['id', 'nombre', 'descripcion']

class ImagenProductoSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = ImagenProducto
        fields = ['id', 'url', 'public_id', 'descripcion']

class ProductoSerializer(serializers.ModelSerializer):
    categoria = CategoriaSerializer(read_only=True)
    categoria_id = serializers.PrimaryKeyRelatedField(
        queryset=Categoria.objects.all(), source='categoria', write_only=True
    )
    imagenes = ImagenProductoSerializer(many=True, required=False)

    class Meta:
        model = Producto
        fields = [
            'id','marca', 'nombre', 'descripcion', 'precio', 'stock',
            'url_imagen_principal', 'categoria', 'categoria_id',
            'imagenes', 'descuento','fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = ['fecha_creacion', 'fecha_actualizacion']

    def create(self, validated_data):
        imagenes_data = validated_data.pop('imagenes', [])
        producto = Producto.objects.create(**validated_data)
        for imagen_data in imagenes_data:
            ImagenProducto.objects.create(producto=producto, **imagen_data)
        producto.refresh_from_db()
        return producto

    def update(self, instance, validated_data):
        imagenes_data = validated_data.pop('imagenes', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if imagenes_data is not None:
            for imagen_anterior in instance.imagenes.all():
                if imagen_anterior.public_id:
                    try:
                        cloudinary.uploader.destroy(imagen_anterior.public_id)
                    except Exception:
                        pass
            instance.imagenes.all().delete()
            for imagen_data in imagenes_data:
                ImagenProducto.objects.create(producto=instance, **imagen_data)
        return instance

