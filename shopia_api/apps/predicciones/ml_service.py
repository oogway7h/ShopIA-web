import os
import sys
from pathlib import Path

# Detectar automáticamente la carpeta raíz del proyecto
current_file = Path(__file__).resolve()
project_root = current_file.parent.parent.parent

# Agregar al path
sys.path.insert(0, str(project_root))

# Cambiar al directorio del proyecto
os.chdir(str(project_root))

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import joblib
from datetime import datetime, timedelta
from decimal import Decimal
from django.db.models import Sum, F

from apps.ventas.models import DetalleVenta, Venta
from apps.productos.models import Categoria, Producto
from apps.predicciones.models import PrediccionVenta, CrecimientoCategoria, ProductoMasVendido


class PrediccionService:
    """Servicio para generar predicciones de ventas"""
    
    def __init__(self):
        self.modelo = None
        # Guardar el modelo en la raíz del proyecto
        self.modelo_path = str(project_root / 'modelo_prediccion_ventas.pkl')
    
    def preparar_datos(self):
        """Extrae y prepara datos históricos de ventas"""
        print("Extrayendo datos históricos...")
        
        detalles = DetalleVenta.objects.select_related(
            'venta', 'producto__categoria'
        ).all()
        
        if not detalles.exists():
            print("ADVERTENCIA: No hay datos históricos para entrenar")
            return None
        
        data = []
        for d in detalles:
            monto = float(d.precio_unitario) * d.cantidad
            data.append({
                'fecha': d.venta.fecha,
                'categoria_id': d.producto.categoria_id,
                'producto_id': d.producto.id,
                'cantidad': d.cantidad,
                'monto': monto
            })
        
        df = pd.DataFrame(data)
        df['anio'] = df['fecha'].dt.year
        df['mes'] = df['fecha'].dt.month
        
        print(f"Extraídos {len(df)} registros de ventas")
        return df
    
    def entrenar_modelo(self):
        """Entrena el modelo de predicción"""
        print("\nEntrenando modelo de predicción...")
        
        df = self.preparar_datos()
        if df is None or len(df) < 10:
            print("ERROR: Datos insuficientes para entrenar (mínimo 10 registros)")
            return False
        
        # Agrupar por año, mes, categoría
        df_group = df.groupby(['anio', 'mes', 'categoria_id']).agg({
            'cantidad': 'sum',
            'monto': 'sum'
        }).reset_index()
        
        if len(df_group) < 5:
            print("ERROR: Datos agrupados insuficientes")
            return False
        
        # Features y target
        X = df_group[['anio', 'mes', 'categoria_id', 'cantidad']]
        y = df_group['monto']
        
        # Entrenar modelo
        self.modelo = RandomForestRegressor(
            n_estimators=100,
            random_state=42,
            max_depth=10,
            min_samples_split=2,
            min_samples_leaf=1
        )
        
        self.modelo.fit(X, y)
        
        # Guardar modelo
        joblib.dump(self.modelo, self.modelo_path)
        print(f"Modelo entrenado y guardado en {self.modelo_path}")
        return True
    
    def cargar_modelo(self):
        """Carga el modelo entrenado"""
        if os.path.exists(self.modelo_path):
            self.modelo = joblib.load(self.modelo_path)
            print("Modelo cargado desde archivo")
            return True
        else:
            print("No existe modelo entrenado, entrenando nuevo...")
            return self.entrenar_modelo()
    
    def generar_predicciones_mes_siguiente(self):
        """Genera predicciones para el mes siguiente"""
        print("\nGenerando predicciones para el próximo mes...")
        
        # Cargar modelo
        if not self.cargar_modelo():
            return False
        
        # Calcular próximo mes
        hoy = datetime.now()
        proximo_mes = hoy.month + 1 if hoy.month < 12 else 1
        proximo_anio = hoy.year if hoy.month < 12 else hoy.year + 1
        periodo = f"{proximo_anio}-{proximo_mes:02d}"
        
        # CAMBIO: Obtener TODAS las categorías (sin filtro activo)
        categorias = Categoria.objects.all()
        
        # Calcular cantidad promedio por categoría (últimos 3 meses)
        fecha_inicio = hoy - timedelta(days=90)
        
        predicciones_creadas = 0
        
        for categoria in categorias:
            # Calcular cantidad y monto promedio histórico
            detalles = DetalleVenta.objects.filter(
                producto__categoria=categoria,
                venta__fecha__gte=fecha_inicio,
                venta__estado='PAGADA'
            )
            
            cantidad_promedio = sum(d.cantidad for d in detalles)
            monto_total = sum(float(d.precio_unitario) * d.cantidad for d in detalles)
            
            if cantidad_promedio == 0:
                print(f"  Saltando {categoria.nombre}: sin ventas recientes")
                continue
            
            # Preparar datos para predicción
            X_pred = pd.DataFrame({
                'anio': [proximo_anio],
                'mes': [proximo_mes],
                'categoria_id': [categoria.id],
                'cantidad': [int(cantidad_promedio)]
            })
            
            # Predecir monto
            try:
                monto_predicho = self.modelo.predict(X_pred)[0]
                monto_predicho = max(0, float(monto_predicho))
            except Exception as e:
                print(f"  Error al predecir {categoria.nombre}: {e}")
                # Fallback: usar promedio histórico
                monto_predicho = monto_total / 3 if monto_total > 0 else 0
            
            # Crear o actualizar predicción
            prediccion, created = PrediccionVenta.objects.update_or_create(
                periodo=periodo,
                categoria=categoria,
                defaults={
                    'anio': proximo_anio,
                    'mes': proximo_mes,
                    'monto_estimado': Decimal(str(round(monto_predicho, 2))),
                    'cantidad_estimada': int(cantidad_promedio / 3),
                    'activo': True
                }
            )
            
            if created:
                predicciones_creadas += 1
            
            print(f"  {categoria.nombre}: Bs {monto_predicho:,.0f}")
        
        # Predicción total (todas las categorías)
        predicciones_periodo = PrediccionVenta.objects.filter(
            periodo=periodo, 
            activo=True,
            categoria__isnull=False
        )
        
        monto_total = sum(float(p.monto_estimado) for p in predicciones_periodo)
        cantidad_total = sum(p.cantidad_estimada for p in predicciones_periodo)
        
        PrediccionVenta.objects.update_or_create(
            periodo=periodo,
            categoria=None,
            defaults={
                'anio': proximo_anio,
                'mes': proximo_mes,
                'monto_estimado': Decimal(str(round(monto_total, 2))),
                'cantidad_estimada': cantidad_total,
                'activo': True
            }
        )
        
        print(f"\n✅ {predicciones_creadas + 1} predicciones generadas para {periodo}")
        print(f"   Total estimado: Bs {monto_total:,.2f}")
        return True
    
    def analizar_crecimiento_categorias(self):
        """Analiza el crecimiento de cada categoría"""
        print("\nAnalizando crecimiento por categoría...")
        
        hoy = datetime.now()
        mes_actual = f"{hoy.year}-{hoy.month:02d}"
        
        # Calcular mes anterior
        mes_anterior_num = hoy.month - 1 if hoy.month > 1 else 12
        anio_anterior = hoy.year if hoy.month > 1 else hoy.year - 1
        
        # Obtener TODAS las categorías (sin filtro activo)
        categorias = Categoria.objects.all()  # ← CAMBIO AQUÍ
        
        analisis_creados = 0
        
        for categoria in categorias:
            # Ventas mes actual
            ventas_actual = DetalleVenta.objects.filter(
                producto__categoria=categoria,
                venta__fecha__year=hoy.year,
                venta__fecha__month=hoy.month
            ).aggregate(
                monto=Sum(F('cantidad') * F('precio_unitario'))
            )['monto'] or Decimal('0')
            
            # Ventas mes anterior
            ventas_anterior = DetalleVenta.objects.filter(
                producto__categoria=categoria,
                venta__fecha__year=anio_anterior,
                venta__fecha__month=mes_anterior_num
            ).aggregate(
                monto=Sum(F('cantidad') * F('precio_unitario'))
            )['monto'] or Decimal('0')
            
            if ventas_anterior == 0:
                print(f"  Saltando {categoria.nombre}: sin ventas anteriores")
                continue
            
            # Calcular estimación próximo mes (promedio + tendencia)
            ventas_actual_float = float(ventas_actual)
            ventas_anterior_float = float(ventas_anterior)
            
            if ventas_actual_float > ventas_anterior_float:
                estimacion = ventas_actual_float * 1.1  # 10% más
            else:
                estimacion = ventas_actual_float * 0.95  # 5% menos
            
            # Crear análisis
            CrecimientoCategoria.objects.update_or_create(
                categoria=categoria,
                periodo=mes_actual,
                defaults={
                    'ventas_mes_actual': ventas_actual,
                    'ventas_mes_anterior': ventas_anterior,
                    'estimacion_proximo_mes': Decimal(str(round(max(0, estimacion), 2)))
                }
            )
            
            analisis_creados += 1
            print(f"  {categoria.nombre}: analizado")
        
        print(f"{analisis_creados} análisis de crecimiento generados")
        return True
    
    def generar_ranking_productos(self):
        """Genera ranking de productos más vendidos"""
        print("\nGenerando ranking de productos...")
        
        hoy = datetime.now()
        periodo = f"{hoy.year}-{hoy.month:02d}"
        
        # Top 10 productos del mes
        productos_top = DetalleVenta.objects.filter(
            venta__fecha__year=hoy.year,
            venta__fecha__month=hoy.month
        ).values('producto').annotate(
            cantidad_total=Sum('cantidad'),
            monto_total=Sum(F('cantidad') * F('precio_unitario'))
        ).order_by('-cantidad_total')[:10]
        
        if not productos_top:
            print("  No hay productos vendidos este mes")
            return True
        
        # Eliminar rankings antiguos del período
        ProductoMasVendido.objects.filter(periodo=periodo).delete()
        
        ranking = 1
        for item in productos_top:
            try:
                producto = Producto.objects.get(id=item['producto'])
                
                # Estimar siguiente mes (5% más)
                estimacion = int(item['cantidad_total'] * 1.05)
                
                ProductoMasVendido.objects.create(
                    producto=producto,
                    periodo=periodo,
                    cantidad_vendida=item['cantidad_total'],
                    monto_total=Decimal(str(item['monto_total'])),
                    ranking=ranking,
                    estimacion_siguiente_mes=estimacion
                )
                
                print(f"  {ranking}. {producto.nombre}: {item['cantidad_total']} uds.")
                ranking += 1
            except Producto.DoesNotExist:
                print(f"  ERROR: Producto {item['producto']} no existe")
                continue
        
        print(f"Ranking generado con {ranking - 1} productos")
        return True
    
    def generar_todo(self):
        """Genera todas las predicciones y análisis"""
        print("=" * 60)
        print("GENERADOR AUTOMÁTICO DE PREDICCIONES")
        print("=" * 60)
        
        try:
            # 1. Entrenar modelo
            if not self.entrenar_modelo():
                print("ERROR: No se pudo entrenar el modelo")
                return False
            
            # 2. Generar predicciones
            if not self.generar_predicciones_mes_siguiente():
                print("ERROR: No se pudieron generar predicciones")
                return False
            
            # 3. Analizar crecimiento
            if not self.analizar_crecimiento_categorias():
                print("ERROR: No se pudo analizar crecimiento")
                return False
            
            # 4. Generar ranking
            if not self.generar_ranking_productos():
                print("ERROR: No se pudo generar ranking")
                return False
            
            print("\n" + "=" * 60)
            print("TODAS LAS PREDICCIONES GENERADAS EXITOSAMENTE")
            print("=" * 60)
            return True
        
        except Exception as e:
            print(f"\nERROR CRÍTICO: {str(e)}")
            import traceback
            traceback.print_exc()
            return False


# Para ejecutar desde terminal
if __name__ == '__main__':
    servicio = PrediccionService()
    servicio.generar_todo()