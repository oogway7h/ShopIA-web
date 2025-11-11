import sys
import os

# Agrega el directorio raíz del proyecto al sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from scripts.generar_usuarios_sinteticos import generar_usuarios_clientes
from scripts.generar_ventas_sinteticas import generar_ventas_sinteticas

def main():
    print("=" * 60)
    print("🔧 GENERADOR DE DATOS SINTÉTICOS")
    print("=" * 60 + "\n")
    
    # Paso 1: Generar usuarios
    print("PASO 1: Generando usuarios clientes...")
    print("-" * 60)
    generar_usuarios_clientes(cantidad=50)
    
    print("\n" + "=" * 60)
    print("PASO 2: Generando ventas históricas...")
    print("-" * 60)
    generar_ventas_sinteticas(cantidad=250)
    
    print("\n" + "=" * 60)
    print("✅ ¡GENERACIÓN COMPLETADA!")
    print("=" * 60)
    print("\nDatos generados:")
    print("  📌 50 usuarios clientes")
    print("  📌 250 ventas históricas (6-12 meses)")
    print("  📌 500-1250 detalles de venta")
    print("\n¡Ahora puedes entrenar el modelo de IA! 🤖")

if __name__ == '__main__':
    main()