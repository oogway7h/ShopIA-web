from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'ventas', views.PrediccionVentaViewSet, basename='prediccion-venta')
router.register(r'productos-top', views.ProductoMasVendidoViewSet, basename='producto-top')

# ORDEN CORRECTO: URLs personalizadas ANTES del router
urlpatterns = [
    path('ventas/historico-predicciones/', views.ventas_historicas_y_predicciones, name='historico-predicciones'),
    path('crecimiento/', views.crecimiento_categorias, name='crecimiento-categorias'),
    
    path('', include(router.urls)),
]