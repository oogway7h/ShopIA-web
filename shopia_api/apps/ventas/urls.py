from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'metodos', views.TipoPagoViewSet, basename='tipopago')
router.register(r'carrito', views.CarritoViewSet, basename='carrito')
router.register(r'ventas', views.VentaViewSet, basename='venta')

urlpatterns = [
    path('', include(router.urls)),
]

