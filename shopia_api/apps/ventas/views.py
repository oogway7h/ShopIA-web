from django.shortcuts import render
from rest_framework import viewsets, permissions, response, status
from rest_framework.decorators import action
from django.db.models import ProtectedError
from django.db import transaction
from django.utils import timezone
from django.conf import settings
import stripe
import traceback  # <-- AGREGA ESTO

from .models import TipoPago, Carrito, ItemCarrito, Venta, DetalleVenta, Pago
from .serializers import (
    TipoPagoSerializer, CarritoSerializer, ItemCarritoSerializer,
    VentaSerializer, CrearVentaSerializer
)
from apps.productos.models import Producto  
from rest_framework.exceptions import NotAuthenticated
from decimal import Decimal

# Configurar Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

class TipoPagoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para el CRUD completo del modelo TipoPago.
    
    Proporciona automáticamente las acciones:
    - list (GET /api/pagos/metodos/)
    - create (POST /api/pagos/metodos/)
    - retrieve (GET /api/pagos/metodos/<pk>/)
    - update (PUT /api/pagos/metodos/<pk>/)
    - partial_update (PATCH /api/pagos/metodos/<pk>/)
    - destroy (DELETE /api/pagos/metodos/<pk>/)
    """
    queryset = TipoPago.objects.all()
    serializer_class = TipoPagoSerializer
        
    def get_permissions(self):
    
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.IsAuthenticated] 
        else:
            permission_classes = [permissions.IsAdminUser]
        
        return [permission() for permission in permission_classes]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            self.perform_destroy(instance)
            # Si tiene éxito, devuelve 204 No Content (estándar de DRF)
            return response.Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError:
            # Si falla por protección, devuelve un error 400
            error_msg = f"No se puede eliminar '{instance.nombre}' porque está siendo usado en uno o más pagos."
            return response.Response(
                {"detail": error_msg},
                status=status.HTTP_400_BAD_REQUEST
            )

class CarritoViewSet(viewsets.ModelViewSet):
    queryset = Carrito.objects.all()
    serializer_class = CarritoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Si el usuario no está autenticado, devuelve vacío
        if not self.request.user.is_authenticated:
            return Carrito.objects.none()
        return Carrito.objects.filter(usuario=self.request.user)

    def get_object(self):
        # Si el usuario no está autenticado, lanza 401
        if not self.request.user.is_authenticated:
            raise NotAuthenticated("No autenticado")
        # Siempre devuelve o crea el carrito del usuario
        carrito, created = Carrito.objects.get_or_create(usuario=self.request.user)
        return carrito

    def list(self, request, *args, **kwargs):
        # Devuelve el carrito del usuario autenticado (crea si no existe)
        if not request.user.is_authenticated:
            return response.Response({'detail': 'No autenticado'}, status=status.HTTP_401_UNAUTHORIZED)
        carrito, _ = Carrito.objects.get_or_create(usuario=request.user)
        serializer = self.get_serializer(carrito)
        return response.Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='agregar-producto')
    def agregar_producto(self, request):
        """Agrega un producto al carrito"""
        # Verificar que el usuario sea cliente
        if not request.user.roles.filter(nombre='cliente').exists():
            return response.Response(
                {"detail": "Solo los clientes pueden agregar productos al carrito."},
                status=status.HTTP_403_FORBIDDEN
            )

        producto_id = request.data.get('producto_id')
        cantidad = int(request.data.get('cantidad', 1))

        try:
            producto = Producto.objects.get(id=producto_id)
        except Producto.DoesNotExist:
            return response.Response(
                {"detail": "Producto no encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )

        if producto.stock < cantidad:
            return response.Response(
                {"detail": "Stock insuficiente."},
                status=status.HTTP_400_BAD_REQUEST
            )

        carrito = self.get_object()
        
        # Calcular precio con descuento si existe - CORREGIDO
        precio_final = producto.precio
        if producto.descuento and producto.descuento > 0:
            # Convertir descuento a Decimal para evitar error de tipos
            descuento_decimal = Decimal(str(producto.descuento))
            precio_final = producto.precio * (Decimal('1') - descuento_decimal / Decimal('100'))
        
        # Verificar si el producto ya está en el carrito
        item_carrito, created = ItemCarrito.objects.get_or_create(
            carrito=carrito,
            producto=producto,
            defaults={
                'precio_unitario': precio_final,
                'cantidad': cantidad
            }
        )

        if not created:
            # Si ya existe, actualizar cantidad
            nueva_cantidad = item_carrito.cantidad + cantidad
            if producto.stock < nueva_cantidad:
                return response.Response(
                    {"detail": "Stock insuficiente para esta cantidad."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            item_carrito.cantidad = nueva_cantidad
            item_carrito.save()

        carrito.save()

        serializer = CarritoSerializer(carrito)
        return response.Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['put'], url_path='actualizar-cantidad')
    def actualizar_cantidad(self, request):
        """Actualiza la cantidad de un producto en el carrito"""
        producto_id = request.data.get('producto_id')
        cantidad = int(request.data.get('cantidad', 1))

        carrito = self.get_object()
        
        try:
            item = ItemCarrito.objects.get(carrito=carrito, producto_id=producto_id)
            producto = item.producto
            
            if cantidad <= 0:
                item.delete()
            else:
                if producto.stock < cantidad:
                    return response.Response(
                        {"detail": "Stock insuficiente."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                item.cantidad = cantidad
                item.save()
                
        except ItemCarrito.DoesNotExist:
            return response.Response(
                {"detail": "Producto no encontrado en el carrito."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = CarritoSerializer(carrito)
        return response.Response(serializer.data)

    @action(detail=False, methods=['delete'], url_path='eliminar-producto/(?P<producto_id>[^/.]+)')
    def eliminar_producto(self, request, producto_id=None):
        """Elimina un producto del carrito"""
        carrito = self.get_object()
        
        try:
            item = ItemCarrito.objects.get(carrito=carrito, producto_id=producto_id)
            item.delete()
        except ItemCarrito.DoesNotExist:
            return response.Response(
                {"detail": "Producto no encontrado en el carrito."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = CarritoSerializer(carrito)
        return response.Response(serializer.data)

    @action(detail=False, methods=['delete'], url_path='limpiar')
    def limpiar_carrito(self, request):
        """Limpia todo el carrito"""
        carrito = self.get_object()
        carrito.items.all().delete()
        
        serializer = CarritoSerializer(carrito)
        return response.Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='finalizar-compra')
    def finalizar_compra(self, request):
        """Convierte el carrito en una venta"""
        if not request.user.roles.filter(nombre='cliente').exists():
            return response.Response(
                {"detail": "Solo los clientes pueden realizar compras."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = CrearVentaSerializer(data=request.data)
        if not serializer.is_valid():
            return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        carrito = self.get_object()
        
        if not carrito.items.exists():
            return response.Response(
                {"detail": "El carrito está vacío."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar stock antes de procesar
        for item in carrito.items.all():
            if item.producto.stock < item.cantidad:
                return response.Response(
                    {"detail": f"Stock insuficiente para {item.producto.nombre}."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        try:
            with transaction.atomic():
                # Crear la venta
                venta = Venta.objects.create(
                    usuario=request.user,
                    monto_total=carrito.total_precio(),
                    direccion=serializer.validated_data['direccion'],
                    numero_int=serializer.validated_data.get('numero_int'),
                    estado='PENDIENTE'
                )

                # Crear detalles de venta y actualizar stock
                for item in carrito.items.all():
                    DetalleVenta.objects.create(
                        venta=venta,
                        producto=item.producto,
                        precio_unitario=item.precio_unitario,
                        cantidad=item.cantidad
                    )
                    
                    # Actualizar stock
                    producto = item.producto
                    producto.stock -= item.cantidad
                    producto.save()

                # Crear pago pendiente
                tipo_pago = TipoPago.objects.get(id=serializer.validated_data['tipo_pago_id'])
                Pago.objects.create(
                    venta=venta,
                    tipo_pago=tipo_pago,
                    monto=venta.monto_total,
                    estado='PENDIENTE'
                )

                # Limpiar carrito
                carrito.items.all().delete()

                # Devolver ID de venta para redirigir al resumen
                return response.Response(
                    {
                        "detail": "Venta creada exitosamente.",
                        "venta_id": venta.id
                    },
                    status=status.HTTP_201_CREATED
                )

        except Exception as e:
            return response.Response(
                {"detail": f"Error al procesar la compra: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class VentaViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = VentaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        if user.roles.filter(nombre='admin').exists():
            return Venta.objects.all()
        
        if user.roles.filter(nombre='cliente').exists():
            return Venta.objects.filter(usuario=user)
        
        return Venta.objects.none()

    @action(detail=True, methods=['post'], url_path='crear-sesion-pago')
    def crear_sesion_pago(self, request, pk=None):
        """Crea una sesión de pago de Stripe"""
        venta = self.get_object()

        # Verificar que la venta pertenezca al usuario
        if venta.usuario != request.user:
            return response.Response(
                {"detail": "No tienes permiso para pagar esta venta."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Verificar que la venta esté pendiente
        if venta.estado != 'PENDIENTE':
            return response.Response(
                {"detail": "Esta venta ya no está pendiente de pago."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Crear line items para Stripe
            line_items = []
            for detalle in venta.detalles.all():
                # Validar que el precio sea mayor a 0
                if detalle.precio_unitario <= 0:
                    return response.Response(
                        {"detail": f"El precio del producto '{detalle.producto.nombre}' es inválido."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                line_items.append({
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': detalle.producto.nombre,
                            'description': detalle.producto.descripcion[:100] if detalle.producto.descripcion else 'Producto',
                        },
                        'unit_amount': int(float(detalle.precio_unitario) * 100),  # Convertir a centavos
                    },
                    'quantity': detalle.cantidad,
                })

            # Validar que haya items
            if not line_items:
                return response.Response(
                    {"detail": "No hay productos en esta venta."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Crear sesión de Stripe
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=line_items,
                mode='payment',
                success_url=f"{settings.FRONTEND_URL}/cliente/compra-exitosa?session_id={{CHECKOUT_SESSION_ID}}&venta_id={venta.id}",
                cancel_url=f"{settings.FRONTEND_URL}/cliente/resumen-venta/{venta.id}?canceled=true",
                metadata={
                    'venta_id': venta.id,
                }
            )

            # Guardar session_id en el pago
            pago = venta.pagos.first()
            if pago:
                pago.transaccion_id = checkout_session.id
                pago.save()

            return response.Response({
                'session_id': checkout_session.id,
                'url': checkout_session.url
            })

        except stripe.error.StripeError as e:
            # Error específico de Stripe
            print(f"ERROR STRIPE: {str(e)}")
            print(traceback.format_exc())
            return response.Response(
                {"detail": f"Error de Stripe: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            # Cualquier otro error
            print(f"ERROR GENERAL: {str(e)}")
            print(traceback.format_exc())
            return response.Response(
                {"detail": f"Error al crear sesión de pago: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'], url_path='confirmar-pago')
    def confirmar_pago(self, request, pk=None):
        """Confirma el pago de una venta después de Stripe"""
        venta = self.get_object()
        session_id = request.data.get('session_id')

        if not session_id:
            return response.Response(
                {"detail": "Se requiere session_id."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Verificar la sesión con Stripe
            session = stripe.checkout.Session.retrieve(session_id)

            if session.payment_status == 'paid':
                # Actualizar estado de venta
                venta.estado = 'PAGADA'
                venta.save()

                # Actualizar estado de pago
                pago = venta.pagos.first()
                if pago:
                    pago.estado = 'COMPLETADO'
                    pago.transaccion_id = session.payment_intent
                    pago.save()

                return response.Response({
                    "detail": "Pago confirmado exitosamente.",
                    "venta": VentaSerializer(venta).data
                })
            else:
                return response.Response(
                    {"detail": "El pago no ha sido completado."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        except stripe.error.StripeError as e:
            print(f"ERROR STRIPE AL CONFIRMAR: {str(e)}")
            return response.Response(
                {"detail": f"Error de Stripe: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            print(f"ERROR AL CONFIRMAR PAGO: {str(e)}")
            print(traceback.format_exc())
            return response.Response(
                {"detail": f"Error al confirmar pago: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'], url_path='crear-payment-intent-mobile')
    def crear_payment_intent_mobile(self, request, pk=None):
        """Crea un Payment Intent de Stripe para pagos nativos en móvil"""
        venta = self.get_object()

        if venta.usuario != request.user:
            return response.Response(
                {"detail": "No tienes permiso para pagar esta venta."},
                status=status.HTTP_403_FORBIDDEN
            )

        if venta.estado != 'PENDIENTE':
            return response.Response(
                {"detail": "Esta venta ya no está pendiente de pago."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Crear Payment Intent
            payment_intent = stripe.PaymentIntent.create(
                amount=int(float(venta.monto_total) * 100),  # Convertir a centavos
                currency='usd',
                metadata={
                    'venta_id': venta.id,
                    'usuario': venta.usuario.correo,
                },
                automatic_payment_methods={
                    'enabled': True,
                },
            )

            # Guardar el payment_intent_id en el pago
            pago = venta.pagos.first()
            if pago:
                pago.transaccion_id = payment_intent.id
                pago.save()

            return response.Response({
                'client_secret': payment_intent.client_secret,
                'payment_intent_id': payment_intent.id,
            })

        except stripe.error.StripeError as e:
            return response.Response(
                {"detail": f"Error de Stripe: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            return response.Response(
                {"detail": f"Error al crear payment intent: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


    @action(detail=True, methods=['post'], url_path='confirmar-pago-mobile')
    def confirmar_pago_mobile(self, request, pk=None):
        """Confirma el pago después de completar el Payment Intent en móvil"""
        venta = self.get_object()
        payment_intent_id = request.data.get('payment_intent_id')

        if not payment_intent_id:
            return response.Response(
                {'error': 'Se requiere payment_intent_id'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Verificar el Payment Intent en Stripe
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)

            if payment_intent.status == 'succeeded':
                # Actualizar el estado de la venta
                venta.estado = 'PAGADA'
                venta.save()

                # Actualizar o crear el pago
                pago = venta.pagos.first()
                if pago:
                    pago.transaccion_id = payment_intent_id
                    pago.fecha_pago = timezone.now()
                    pago.save()

                return response.Response({
                    'message': 'Pago confirmado exitosamente',
                    'venta_id': venta.id,
                    'estado': venta.estado,
                })
            else:
                return response.Response(
                    {'error': f'El pago no se completó. Estado: {payment_intent.status}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        except stripe.error.StripeError as e:
            return response.Response(
                {"detail": f"Error de Stripe: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            return response.Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
