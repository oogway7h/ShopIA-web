
from django.urls import path, include
from django.contrib import admin
from django.shortcuts import redirect
def redirect_to_admin(request):
    return redirect('/admin/')

urlpatterns = [
    path('', redirect_to_admin),
    path('admin/', admin.site.urls),
    path('api/', include([
        path('', include('apps.usuarios.urls')),
        path('',include('apps.productos.urls')),
        path('ventas/',include('apps.ventas.urls')),
    ])),
]
