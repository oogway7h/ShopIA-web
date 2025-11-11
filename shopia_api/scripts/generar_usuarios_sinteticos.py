import os
import django
import random
from faker import Faker

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.usuarios.models import Usuario, Rol

def generar_usuarios_clientes(cantidad=50):
    """
    Genera usuarios sintéticos con rol de Cliente.
    No modifica usuarios existentes.
    """
    fake = Faker('es_ES')
    
    # Obtener rol de Cliente
    try:
        rol_cliente = Rol.objects.get(nombre='cliente')
    except Rol.DoesNotExist:
        print("❌ Error: Rol 'cliente' no existe. Crea los roles primero.")
        return
    
    usuarios_creados = 0
    usuarios_duplicados = 0
    
    print(f"🚀 Generando {cantidad} usuarios sintéticos...")
    
    for i in range(cantidad):
        # Generar datos únicos
        nombre = fake.first_name()
        apellido = fake.last_name()
        correo = f"cliente_{i}_{random.randint(1000, 9999)}@example.com"
        
        # Verificar si el correo ya existe
        if Usuario.objects.filter(correo=correo).exists():
            usuarios_duplicados += 1
            continue
        
        try:
            # Crear usuario
            usuario = Usuario.objects.create_user(
                correo=correo,
                password='Cliente123!',  # Contraseña por defecto
                nombre=nombre,
                apellido=apellido,
                telefono=fake.phone_number()[:15],
                sexo=random.choice(['M', 'F']),
                estado=True
            )
            
            # Asignar rol de cliente
            usuario.roles.add(rol_cliente)
            usuarios_creados += 1
            
            if (usuarios_creados % 10) == 0:
                print(f"  ✅ {usuarios_creados} usuarios creados...")
                
        except Exception as e:
            print(f"  ⚠️  Error al crear usuario {i}: {str(e)}")
    
    print(f"\n✅ Proceso completado:")
    print(f"   - Usuarios creados: {usuarios_creados}")
    print(f"   - Duplicados evitados: {usuarios_duplicados}")

if __name__ == '__main__':
    generar_usuarios_clientes(cantidad=50)
    print("\n💾 Datos guardados en la BD!")