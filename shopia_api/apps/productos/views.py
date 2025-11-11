from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
import cloudinary.uploader
from .models import Categoria, Producto, ImagenProducto
from .serializers import CategoriaSerializer, ProductoSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from .filters import ProductoFilter

class CategoriaViewSet(viewsets.ModelViewSet):
    """
    API endpoint que permite ver y editar categorías.
    Proporciona automáticamente las acciones: list, create, retrieve, 
    update, partial_update, y destroy.
    """
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [permissions.AllowAny] # Requiere que el usuario esté autenticado

class ProductoViewSet(viewsets.ModelViewSet):
    """
    API endpoint que permite ver y editar productos.
    """
    queryset = Producto.objects.all().order_by('-fecha_creacion')
    serializer_class = ProductoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['categoria']
    search_fields = ['nombre', 'marca', 'descripcion']
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = ProductoFilter 
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Elimina un producto y sus imágenes de Cloudinary"""
        instance = self.get_object()
        # Eliminar imágenes de Cloudinary antes de eliminar el producto
        for imagen in instance.imagenes.all():
            if imagen.public_id:
                try:
                    cloudinary.uploader.destroy(imagen.public_id)
                except Exception as e:
                    print(f"Error al eliminar imagen {imagen.public_id}: {e}")
        
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=False, methods=['post'])
    def delete_image(self, request):
        """Elimina una imagen de Cloudinary"""
        public_id = request.data.get('public_id')
        if public_id:
            try:
                cloudinary.uploader.destroy(public_id)
                return Response({'success': True})
            except Exception as e:
                return Response({'error': str(e)}, status=400)
        return Response({'error': 'public_id requerido'}, status=400)

class CatalogoView(APIView):
    """
    Devuelve las categorías con sus primeros 5 productos destacados, optimizado.
    """
    def get(self, request):
        categorias = Categoria.objects.all()
        # Trae todos los productos con sus imágenes en una sola consulta
        productos_por_categoria = (
            Producto.objects
            .filter(estado=True)
            .select_related('categoria')
            .prefetch_related('imagenes')
            .order_by('categoria_id', '-fecha_creacion')
        )

        # Agrupa los productos por categoría (solo los primeros 5 de cada una)
        productos_dict = {}
        for prod in productos_por_categoria:
            cat_id = prod.categoria_id
            if cat_id not in productos_dict:
                productos_dict[cat_id] = []
            if len(productos_dict[cat_id]) < 5:
                productos_dict[cat_id].append(prod)

        data = []
        for cat in categorias:
            productos = productos_dict.get(cat.id, [])
            data.append({
                "id": cat.id,
                "nombre": cat.nombre,
                "descripcion": cat.descripcion,
                "productos": ProductoSerializer(productos, many=True).data
            })
        return Response(data)
