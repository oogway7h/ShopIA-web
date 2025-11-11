import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

import random
from datetime import datetime, timedelta
from decimal import Decimal
from faker import Faker

from django.db import models
from django.utils import timezone
from apps.usuarios.models import Usuario
from apps.productos.models import Producto
from apps.ventas.models import Venta, DetalleVenta, TipoPago

def generar_ventas_sinteticas(cantidad, meses_atras):
    """
    Genera ventas REALISTAS para tienda online en Bolivia.
    
    CAMBIOS CLAVE:
    - Ventas más pequeñas (1-3 productos promedio)
    - Montos menores (Bs 200 - Bs 3,000 por venta)
    - Distribución realista por día (más ventas fin de semana)
    - Total mensual: Bs 50,000 - Bs 150,000 (realista para ecommerce)
    """
    fake = Faker('es_ES')
    
    # Validaciones
    usuarios = Usuario.objects.filter(id__gte=17, id__lte=66)
    if not usuarios.exists():
        print("❌ Error: No hay usuarios en el rango ID 17-66.")
        return
    
    productos = Producto.objects.filter(estado=True)
    if not productos.exists():
        print("❌ Error: No hay productos activos.")
        return
    
    # Ordenar productos por precio (para selección realista)
    productos_economicos = list(productos.filter(precio__lt=500))
    productos_medios = list(productos.filter(precio__gte=500, precio__lt=2000))
    productos_premium = list(productos.filter(precio__gte=2000))
    
    ventas_creadas = 0
    detalles_creados = 0
    
    fecha_fin = timezone.now()
    if meses_atras == 0:
        # Solo lo que va del mes actual
        fecha_inicio = fecha_fin.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    else:
        fecha_inicio = fecha_fin - timedelta(days=30 * meses_atras)
    
    print("=" * 70)
    print(f"🛒 GENERADOR DE VENTAS REALISTAS - TIENDA ONLINE")
    print("=" * 70)
    print(f"📊 Configuración:")
    print(f"   - Ventas objetivo: {cantidad}")
    print(f"   - Período: {fecha_inicio.date()} → {fecha_fin.date()}")
    print(f"   - Productos económicos: {len(productos_economicos)} (<Bs 500)")
    print(f"   - Productos medios: {len(productos_medios)} (Bs 500-2000)")
    print(f"   - Productos premium: {len(productos_premium)} (>Bs 2000)")
    print("=" * 70 + "\n")
    
    for i in range(1, cantidad + 1):
        try:
            usuario = random.choice(usuarios)
            
            # Fecha aleatoria con distribución realista
            dias_totales = (fecha_fin - fecha_inicio).days
            dia_aleatorio = random.randint(0, dias_totales)
            fecha_base = fecha_inicio + timedelta(days=dia_aleatorio)
            
            # Más ventas en fines de semana (viernes-domingo)
            dia_semana = fecha_base.weekday()
            if dia_semana in [4, 5, 6]:  # Viernes, Sábado, Domingo
                # 60% de las ventas en fin de semana
                if random.random() > 0.4:
                    hora = random.randint(10, 23)
                else:
                    hora = random.randint(8, 22)
            else:
                # Días laborales: menos ventas
                if random.random() > 0.6:
                    continue  # Saltar 40% de días laborales
                hora = random.randint(12, 21)
            
            fecha_aleatoria = fecha_base.replace(
                hour=hora,
                minute=random.randint(0, 59),
                second=random.randint(0, 59)
            )
            
            if timezone.is_naive(fecha_aleatoria):
                fecha_aleatoria = timezone.make_aware(fecha_aleatoria)
            
            # Estado según antigüedad
            dias_antiguedad = (fecha_fin - fecha_aleatoria).days
            if dias_antiguedad > 30:
                estado = random.choices(
                    ['PAGADA', 'ENVIADA', 'CANCELADA'],
                    weights=[0.50, 0.45, 0.05]
                )[0]
            elif dias_antiguedad > 7:
                estado = random.choices(
                    ['PAGADA', 'ENVIADA', 'PENDIENTE', 'CANCELADA'],
                    weights=[0.45, 0.35, 0.15, 0.05]
                )[0]
            else:
                estado = random.choices(
                    ['PAGADA', 'PENDIENTE', 'ENVIADA', 'CANCELADA'],
                    weights=[0.55, 0.25, 0.17, 0.03]
                )[0]
            
            # CLAVE: Cantidad realista de productos (1-3, raramente 4-5)
            peso_productos = [0.45, 0.35, 0.15, 0.04, 0.01]  # 1, 2, 3, 4, 5
            cantidad_items = random.choices([1, 2, 3, 4, 5], weights=peso_productos)[0]
            
            # Selección inteligente de productos por rango de precio
            tipo_compra = random.choices(
                ['economica', 'mixta', 'premium'],
                weights=[0.60, 0.30, 0.10]  # 60% económica, 30% mixta, 10% premium
            )[0]
            
            productos_seleccionados = []
            
            if tipo_compra == 'economica':
                # Compra económica: solo productos baratos
                productos_disponibles = productos_economicos if productos_economicos else list(productos)
                productos_seleccionados = random.sample(
                    productos_disponibles,
                    min(cantidad_items, len(productos_disponibles))
                )
            elif tipo_compra == 'mixta':
                # Compra mixta: mezcla de precios
                productos_disponibles = productos_economicos + productos_medios
                if productos_disponibles:
                    productos_seleccionados = random.sample(
                        productos_disponibles,
                        min(cantidad_items, len(productos_disponibles))
                    )
            else:
                # Compra premium: 1-2 productos caros
                cantidad_items = min(2, cantidad_items)
                productos_disponibles = productos_premium if productos_premium else productos_medios
                if productos_disponibles:
                    productos_seleccionados = random.sample(
                        productos_disponibles,
                        min(cantidad_items, len(productos_disponibles))
                    )
            
            if not productos_seleccionados:
                productos_seleccionados = random.sample(list(productos), min(cantidad_items, len(productos)))
            
            venta = Venta(
                usuario=usuario,
                fecha=fecha_aleatoria,
                direccion=fake.street_address(),
                numero_int=random.choice([None, random.randint(1, 50)]),
                estado=estado,
                monto_total=Decimal('0.00')
            )
            
            monto_total = Decimal('0.00')
            detalles = []
            
            for producto in productos_seleccionados:
                # Cantidad realista: mayoría compra 1 unidad
                cantidad_item = random.choices([1, 2, 3], weights=[0.75, 0.20, 0.05])[0]
                
                precio_base = Decimal(str(producto.precio))
                if producto.descuento > 0:
                    precio_unitario = precio_base * (Decimal('1') - Decimal(str(producto.descuento)))
                else:
                    precio_unitario = precio_base
                
                subtotal = Decimal(str(cantidad_item)) * precio_unitario
                monto_total += subtotal
                
                detalles.append(
                    DetalleVenta(
                        venta=venta,
                        producto=producto,
                        precio_unitario=precio_unitario,
                        cantidad=cantidad_item
                    )
                )
                detalles_creados += 1
            
            venta.monto_total = monto_total
            venta.save()
            DetalleVenta.objects.bulk_create(detalles)
            
            ventas_creadas += 1
            
            if (ventas_creadas % 50) == 0:
                porcentaje = (ventas_creadas / cantidad) * 100
                print(f"  ✅ {ventas_creadas}/{cantidad} ventas ({porcentaje:.1f}%)")
                
        except Exception as e:
            print(f"  ⚠️ Error en venta {i}: {str(e)}")
    
    # Resumen
    monto_total_db = Venta.objects.aggregate(total=models.Sum('monto_total'))['total'] or Decimal('0')
    promedio_venta = monto_total_db / ventas_creadas if ventas_creadas > 0 else Decimal('0')
    
    # Calcular promedio mensual
    meses_generados = meses_atras
    promedio_mensual = monto_total_db / meses_generados if meses_generados > 0 else Decimal('0')
    
    print("\n" + "=" * 70)
    print("✅ VENTAS REALISTAS GENERADAS")
    print("=" * 70)
    print(f"📊 Estadísticas:")
    print(f"   ✓ Ventas creadas: {ventas_creadas}")
    print(f"   ✓ Detalles creados: {detalles_creados}")
    print(f"   ✓ Promedio items/venta: {detalles_creados / ventas_creadas:.1f}")
    print(f"   ✓ Monto total: Bs {monto_total_db:,.2f}")
    print(f"   ✓ Promedio por venta: Bs {promedio_venta:,.2f}")
    print(f"   ✓ Estimado mensual: Bs {promedio_mensual:,.2f}")
    
    print(f"\n📈 Distribución por estado:")
    for estado_key, estado_label in Venta.ESTADO_CHOICES:
        count = Venta.objects.filter(estado=estado_key).count()
        porcentaje = (count / ventas_creadas) * 100 if ventas_creadas > 0 else 0
        print(f"   {estado_label}: {count} ({porcentaje:.1f}%)")
    
    print("=" * 70)

if __name__ == '__main__':
    generar_ventas_sinteticas(cantidad=5, meses_atras=0)
    print("\n💾 ¡Datos guardados!")