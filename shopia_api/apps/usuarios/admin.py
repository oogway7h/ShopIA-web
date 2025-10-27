from django.contrib import admin
from .models import Usuario, Rol

@admin.register(Rol)
class RolAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre')
    search_fields = ('nombre',)

@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('id', 'correo', 'nombre', 'apellido', 'estado', 'is_staff')
    search_fields = ('correo', 'nombre', 'apellido')
    filter_horizontal = ('roles',)
    list_filter = ('estado', 'roles')
