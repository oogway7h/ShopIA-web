from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum, F, Q
from datetime import datetime, timedelta
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated

from .models import PrediccionVenta, CrecimientoCategoria, ProductoMasVendido
from .serializers import (
    PrediccionVentaSerializer,
    CrecimientoCategoriaSerializer,
    ProductoMasVendidoSerializer
)
from .ml_service import PrediccionService
from apps.ventas.models import Venta, DetalleVenta


class PrediccionVentaViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para consultar predicciones de ventas.
    Solo admins pueden ver y generar predicciones.
    """
    queryset = PrediccionVenta.objects.filter(activo=True)
    serializer_class = PrediccionVentaSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtros opcionales
        anio = self.request.query_params.get('anio')
        mes = self.request.query_params.get('mes')
        categoria_id = self.request.query_params.get('categoria')
        
        if anio:
            queryset = queryset.filter(anio=anio)
        if mes:
            queryset = queryset.filter(mes=mes)
        if categoria_id:
            queryset = queryset.filter(categoria_id=categoria_id)
        
        return queryset.order_by('-anio', '-mes', 'categoria')
    
    @action(detail=False, methods=['post'], url_path='generar-nueva')
    def generar_nueva_prediccion(self, request):
        """
        🔄 REGENERA TODO EL SISTEMA DE PREDICCIONES
        - Entrena modelo con datos actualizados
        - Genera predicciones para el próximo mes
        - Actualiza crecimientos de categorías
        - Actualiza ranking de productos
        """
        try:
            print("\n" + "="*70)
            print("🚀 INICIANDO REGENERACIÓN COMPLETA DE PREDICCIONES")
            print("="*70)
            
            # Crear instancia del servicio
            servicio = PrediccionService()
            
            # 1. ENTRENAR MODELO CON DATOS ACTUALIZADOS
            print("\n📊 Paso 1/4: Entrenando modelo con datos actuales...")
            if not servicio.entrenar_modelo():
                return Response({
                    'error': 'No se pudo entrenar el modelo. Verifique que existan datos históricos suficientes (mínimo 10 ventas).'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # 2. GENERAR PREDICCIONES PARA EL PRÓXIMO MES
            print("\n🔮 Paso 2/4: Generando predicciones para el próximo mes...")
            if not servicio.generar_predicciones_mes_siguiente():
                return Response({
                    'error': 'No se pudieron generar predicciones para el próximo mes.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # 3. ANALIZAR CRECIMIENTO DE CATEGORÍAS
            print("\n📈 Paso 3/4: Analizando crecimiento de categorías...")
            if not servicio.analizar_crecimiento_categorias():
                return Response({
                    'error': 'No se pudo analizar el crecimiento de categorías.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # 4. GENERAR RANKING DE PRODUCTOS
            print("\n🏆 Paso 4/4: Generando ranking de productos más vendidos...")
            if not servicio.generar_ranking_productos():
                return Response({
                    'error': 'No se pudo generar el ranking de productos.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # 5. OBTENER RESUMEN DE LO GENERADO
            hoy = datetime.now()
            proximo_mes = hoy.month + 1 if hoy.month < 12 else 1
            proximo_anio = hoy.year if hoy.month < 12 else hoy.year + 1
            periodo = f"{proximo_anio}-{proximo_mes:02d}"
            
            # Contar predicciones generadas
            predicciones = PrediccionVenta.objects.filter(
                periodo=periodo,
                activo=True
            )
            
            prediccion_total = predicciones.filter(categoria__isnull=True).first()
            predicciones_categorias = predicciones.filter(categoria__isnull=False)
            
            # Crecimiento de categorías
            crecimientos = CrecimientoCategoria.objects.filter(
                periodo=f"{hoy.year}-{hoy.month:02d}"
            ).count()
            
            # Productos top
            productos_top = ProductoMasVendido.objects.filter(
                periodo=f"{hoy.year}-{hoy.month:02d}"
            ).count()
            
            print("\n" + "="*70)
            print("✅ REGENERACIÓN COMPLETADA EXITOSAMENTE")
            print("="*70)
            print(f"📅 Período predicho: {periodo}")
            print(f"💰 Predicción total: Bs {prediccion_total.monto_estimado if prediccion_total else 0:,.2f}")
            print(f"📊 Predicciones por categoría: {predicciones_categorias.count()}")
            print(f"📈 Análisis de crecimiento: {crecimientos}")
            print(f"🏆 Productos en ranking: {productos_top}")
            print("="*70 + "\n")
            
            # Serializar datos para respuesta
            predicciones_data = PrediccionVentaSerializer(predicciones, many=True).data
            
            return Response({
                'success': True,
                'mensaje': '¡Predicciones regeneradas exitosamente!',
                'periodo': periodo,
                'resumen': {
                    'monto_total_estimado': float(prediccion_total.monto_estimado) if prediccion_total else 0,
                    'cantidad_total_estimada': prediccion_total.cantidad_estimada if prediccion_total else 0,
                    'predicciones_categorias': predicciones_categorias.count(),
                    'analisis_crecimiento': crecimientos,
                    'productos_ranking': productos_top
                },
                'predicciones': predicciones_data
            }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            import traceback
            error_detalle = traceback.format_exc()
            print(f"\n❌ ERROR CRÍTICO:\n{error_detalle}")
            
            return Response({
                'error': f'Error al regenerar predicciones: {str(e)}',
                'detalle': error_detalle if request.user.is_superuser else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'], url_path='resumen')
    def resumen_predicciones(self, request):
        """Devuelve un resumen de todas las predicciones activas"""
        hoy = datetime.now()
        
        # Predicción total del próximo mes
        proximo_mes = hoy.month + 1 if hoy.month < 12 else 1
        proximo_anio = hoy.year if hoy.month < 12 else hoy.year + 1
        
        prediccion_total = PrediccionVenta.objects.filter(
            anio=proximo_anio,
            mes=proximo_mes,
            categoria__isnull=True,
            activo=True
        ).first()
        
        # Top 5 categorías con mayores ventas predichas
        top_categorias = PrediccionVenta.objects.filter(
            anio=proximo_anio,
            mes=proximo_mes,
            categoria__isnull=False,
            activo=True
        ).order_by('-monto_estimado')[:5]
        
        return Response({
            'periodo': f"{proximo_anio}-{proximo_mes:02d}",
            'prediccion_total': PrediccionVentaSerializer(prediccion_total).data if prediccion_total else None,
            'top_categorias': PrediccionVentaSerializer(top_categorias, many=True).data
        })


class CrecimientoCategoriaViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para consultar análisis de crecimiento por categoría"""
    queryset = CrecimientoCategoria.objects.all()
    serializer_class = CrecimientoCategoriaSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtrar por tendencia
        tendencia = self.request.query_params.get('tendencia')
        if tendencia:
            queryset = queryset.filter(tendencia=tendencia)
        
        return queryset.order_by('-porcentaje_cambio')
    
    @action(detail=False, methods=['get'], url_path='alertas')
    def alertas_criticas(self, request):
        """Devuelve categorías con caídas fuertes"""
        alertas = CrecimientoCategoria.objects.filter(
            tendencia__in=['DECRECIMIENTO_FUERTE', 'DECRECIMIENTO']
        ).order_by('porcentaje_cambio')[:5]
        
        serializer = self.get_serializer(alertas, many=True)
        
        return Response({
            'mensaje': 'Categorías que requieren atención',
            'total_alertas': alertas.count(),
            'alertas': serializer.data
        })


class ProductoMasVendidoViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para consultar ranking de productos más vendidos"""
    queryset = ProductoMasVendido.objects.all()
    serializer_class = ProductoMasVendidoSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtrar por período
        periodo = self.request.query_params.get('periodo')
        if periodo:
            queryset = queryset.filter(periodo=periodo)
        else:
            # Por defecto, mes actual
            hoy = datetime.now()
            periodo_actual = f"{hoy.year}-{hoy.month:02d}"
            queryset = queryset.filter(periodo=periodo_actual)
        
        return queryset.order_by('ranking')
    
    @action(detail=False, methods=['get'], url_path='top-10')
    def top_10(self, request):
        """Devuelve los 10 productos más vendidos del mes actual"""
        hoy = datetime.now()
        periodo = f"{hoy.year}-{hoy.month:02d}"
        
        top = ProductoMasVendido.objects.filter(
            periodo=periodo
        ).order_by('ranking')[:10]
        
        serializer = self.get_serializer(top, many=True)
        
        return Response({
            'periodo': periodo,
            'top_10': serializer.data
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ventas_historicas_y_predicciones(request):
    """
    Combina ventas reales + predicciones con análisis de crecimiento
    """
    try:
        from django.db.models import Avg
        
        # Calcular rango de 6 meses atrás
        fecha_fin = timezone.now()
        fecha_inicio = fecha_fin - timedelta(days=180)
        
        # 1. VENTAS REALES AGRUPADAS POR MES
        ventas_mensuales = {}
        ventas = Venta.objects.filter(
            fecha__gte=fecha_inicio, 
            estado='PAGADA'
        ).order_by('fecha')
        
        for venta in ventas:
            periodo = venta.fecha.strftime('%Y-%m')
            if periodo not in ventas_mensuales:
                ventas_mensuales[periodo] = 0
            ventas_mensuales[periodo] += float(venta.monto_total)
        
        # Convertir a lista y calcular crecimientos
        periodos_ordenados = sorted(ventas_mensuales.keys())
        datos_historicos = []
        
        for i, periodo in enumerate(periodos_ordenados):
            monto = ventas_mensuales[periodo]
            
            # Calcular crecimiento respecto al mes anterior
            crecimiento = 0
            if i > 0:
                periodo_anterior = periodos_ordenados[i - 1]
                monto_anterior = ventas_mensuales[periodo_anterior]
                if monto_anterior > 0:
                    crecimiento = ((monto - monto_anterior) / monto_anterior) * 100
            
            datos_historicos.append({
                'periodo': periodo,
                'monto': round(monto, 2),
                'tipo': 'real',
                'crecimiento': round(crecimiento, 1),
                'tendencia': 'subiendo' if crecimiento > 0 else 'bajando' if crecimiento < 0 else 'estable'
            })
        
        # 2. PREDICCIONES FUTURAS
        predicciones = PrediccionVenta.objects.filter(
            categoria__isnull=True,
            activo=True
        ).order_by('anio', 'mes')
        
        # Calcular crecimiento estimado vs último mes real
        ultimo_monto_real = datos_historicos[-1]['monto'] if datos_historicos else 0
        
        datos_predichos = []
        for p in predicciones:
            monto_pred = float(p.monto_estimado)
            crecimiento_pred = 0
            if ultimo_monto_real > 0:
                crecimiento_pred = ((monto_pred - ultimo_monto_real) / ultimo_monto_real) * 100
            
            datos_predichos.append({
                'periodo': p.periodo,
                'monto': round(monto_pred, 2),
                'tipo': 'prediccion',
                'crecimiento': round(crecimiento_pred, 1),
                'tendencia': 'subiendo' if crecimiento_pred > 0 else 'bajando'
            })
        
        # 3. ESTADÍSTICAS GENERALES
        montos_historicos = [d['monto'] for d in datos_historicos]
        
        estadisticas = {
            'monto_promedio': round(sum(montos_historicos) / len(montos_historicos), 2) if montos_historicos else 0,
            'monto_minimo': round(min(montos_historicos), 2) if montos_historicos else 0,
            'monto_maximo': round(max(montos_historicos), 2) if montos_historicos else 0,
            'total_meses_analizados': len(datos_historicos),
            'crecimiento_promedio': round(sum(d['crecimiento'] for d in datos_historicos) / len(datos_historicos), 1) if datos_historicos else 0
        }
        
        # 4. COMBINAR TODO
        datos_combinados = datos_historicos + datos_predichos
        
        return Response({
            'datos': datos_combinados,
            'estadisticas': estadisticas,
            'total_historico': len(datos_historicos),
            'total_predicciones': len(datos_predichos),
            'ultimo_mes_real': datos_historicos[-1]['periodo'] if datos_historicos else None
        })
        
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return Response({
            'error': str(e),
            'datos': []
        }, status=500)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def crecimiento_categorias(request):
    """
    Calcula el crecimiento REAL de cada categoría.
    Filtra categorías sin ventas para evitar negativos ficticios
    """
    try:
        from apps.productos.models import Categoria
        
        ahora = timezone.now()
        primer_dia_actual = ahora.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        if ahora.month == 1:
            primer_dia_anterior = primer_dia_actual.replace(year=ahora.year - 1, month=12)
        else:
            primer_dia_anterior = primer_dia_actual.replace(month=ahora.month - 1)
        
        # 1. VENTAS DEL MES ACTUAL
        ventas_actuales = {}
        detalles_actuales = DetalleVenta.objects.filter(
            venta__fecha__gte=primer_dia_actual,
            venta__estado='PAGADA'
        ).select_related('producto__categoria')
        
        for detalle in detalles_actuales:
            cat_id = detalle.producto.categoria_id
            cat_nombre = detalle.producto.categoria.nombre
            monto = float(detalle.precio_unitario) * detalle.cantidad
            
            if cat_id not in ventas_actuales:
                ventas_actuales[cat_id] = {'nombre': cat_nombre, 'monto': 0}
            ventas_actuales[cat_id]['monto'] += monto
        
        # 2. VENTAS DEL MES ANTERIOR
        ventas_anteriores = {}
        detalles_anteriores = DetalleVenta.objects.filter(
            venta__fecha__gte=primer_dia_anterior,
            venta__fecha__lt=primer_dia_actual,
            venta__estado='PAGADA'
        ).select_related('producto__categoria')
        
        for detalle in detalles_anteriores:
            cat_id = detalle.producto.categoria_id
            monto = float(detalle.precio_unitario) * detalle.cantidad
            
            if cat_id not in ventas_anteriores:
                ventas_anteriores[cat_id] = 0
            ventas_anteriores[cat_id] += monto
        
        # 3. CALCULAR CRECIMIENTO (SOLO CATEGORÍAS CON VENTAS)
        crecimientos = []
        
        # Unión de categorías con ventas en ambos períodos
        categorias_activas = set(ventas_actuales.keys()) | set(ventas_anteriores.keys())
        
        for cat_id in categorias_activas:
            actual = ventas_actuales.get(cat_id, {}).get('monto', 0)
            anterior = ventas_anteriores.get(cat_id, 0)
            
            # Obtener nombre de categoría
            if cat_id in ventas_actuales:
                nombre = ventas_actuales[cat_id]['nombre']
            else:
                try:
                    nombre = Categoria.objects.get(id=cat_id).nombre
                except Categoria.DoesNotExist:
                    continue
            
            # CALCULAR PORCENTAJE
            if anterior > 0:
                porcentaje = ((actual - anterior) / anterior) * 100
            elif actual > 0:
                porcentaje = 100  # Nueva categoría con ventas
            else:
                porcentaje = 0  # Sin ventas en ambos
            
            # DETERMINAR TENDENCIA
            if porcentaje > 20:
                tendencia = 'crecimiento_fuerte'
            elif porcentaje > 5:
                tendencia = 'crecimiento'
            elif porcentaje >= -5:
                tendencia = 'estable'
            elif porcentaje >= -20:
                tendencia = 'decrecimiento'
            else:
                tendencia = 'decrecimiento_fuerte'
            
            crecimientos.append({
                'categoria_id': cat_id,
                'categoria_nombre': nombre,
                'mes_actual': round(actual, 2),
                'mes_anterior': round(anterior, 2),
                'porcentaje_cambio': round(porcentaje, 1),
                'tendencia': tendencia,
                'tiene_datos': actual > 0 or anterior > 0
            })
        
        # 4. ORDENAR Y FILTRAR
        crecimientos_con_datos = [c for c in crecimientos if c['tiene_datos']]
        crecimientos_con_datos.sort(key=lambda x: x['porcentaje_cambio'], reverse=True)
        
        # 5. ESTADÍSTICAS
        estadisticas = {
            'categorias_analizadas': len(crecimientos_con_datos),
            'crecimiento_promedio': round(
                sum(c['porcentaje_cambio'] for c in crecimientos_con_datos) / len(crecimientos_con_datos), 1
            ) if crecimientos_con_datos else 0,
            'categorias_creciendo': sum(1 for c in crecimientos_con_datos if c['porcentaje_cambio'] > 0),
            'categorias_cayendo': sum(1 for c in crecimientos_con_datos if c['porcentaje_cambio'] < 0)
        }
        
        return Response({
            'crecimientos': crecimientos_con_datos[:10],  # Top 10
            'estadisticas': estadisticas,
            'mes_actual': primer_dia_actual.strftime('%Y-%m'),
            'mes_anterior': primer_dia_anterior.strftime('%Y-%m')
        })
        
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return Response({
            'error': str(e),
            'crecimientos': []
        }, status=500)
