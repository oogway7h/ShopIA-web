from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .utils import enviar_email_brevo
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
import secrets
from django.db import models
from django.db.models import Q

from .models import Usuario, Rol, Bitacora, Notificacion, NotificacionLeida
from .serializers import *


# LOGIN usando correo + password => devuelve access / refresh y usuario
class LoginJWTView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        correo = request.data.get("correo")
        password = request.data.get("password")

        # Verificar si existe el usuario
        try:
            usuario = Usuario.objects.get(correo=correo)

            # Verificar si está bloqueado
            if usuario.esta_bloqueado():
                tiempo_restante = (
                    usuario.bloqueado_hasta - timezone.now()
                ).seconds // 60
                return Response(
                    {
                        "detail": "Usuario bloqueado por múltiples intentos fallidos",
                        "bloqueado": True,
                        "minutos_restantes": tiempo_restante,
                    },
                    status=status.HTTP_423_LOCKED,
                )

        except Usuario.DoesNotExist:
            return Response(
                {"detail": "Credenciales inválidas"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Autenticar
        user = authenticate(request, correo=correo, password=password)
        if not user:
            # Incrementar intentos fallidos
            usuario.incrementar_intentos_fallidos()
            registrar_bitacora(
                usuario,
                "LOGIN_FALLIDO",
                f'Intento de login fallido desde {request.META.get("REMOTE_ADDR", "IP desconocida")}',
                request,
            )

            if usuario.intentos_fallidos >= 3:
                return Response(
                    {
                        "detail": "Usuario bloqueado por múltiples intentos fallidos. Solicita recuperación de contraseña.",
                        "bloqueado": True,
                        "debe_recuperar": True,
                    },
                    status=status.HTTP_423_LOCKED,
                )

            return Response(
                {
                    "detail": "Credenciales inválidas",
                    "intentos_restantes": 3 - usuario.intentos_fallidos,
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.estado:
            return Response(
                {"detail": "Usuario inactivo"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Login exitoso - resetear intentos fallidos
        user.resetear_intentos_fallidos()
        registrar_bitacora(
            user,
            "LOGIN",
            f'Login exitoso desde {request.META.get("REMOTE_ADDR", "IP desconocida")}',
            request,
        )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "usuario": UsuarioReadSerializer(user).data,
            }
        )


# PERFIL (para cliente - puede editar algunos campos)
class PerfilView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ser = PerfilClienteSerializer(request.user)
        registrar_bitacora(
            request.user,
            "PERFIL_CONSULTADO",
            f'Acceso a perfil desde {request.META.get("REMOTE_ADDR", "IP desconocida")}',
            request,
        )
        return Response(ser.data)

    def put(self, request):
        ser = PerfilClienteSerializer(request.user, data=request.data, partial=True)
        if ser.is_valid():
            ser.save()
            registrar_bitacora(
                request.user,
                "PERFIL_ACTUALIZADO",
                f'Perfil actualizado desde {request.META.get("REMOTE_ADDR", "IP desconocida")}',
                request,
            )
            return Response(ser.data)
        return Response(ser.errors, status=400)

    @action(detail=False, methods=["post"])
    def cambiar_password(self, request):
        serializer = CambiarPasswordSerializer(data=request.data)
        if serializer.is_valid():
            usuario = request.user
            if not usuario.check_password(serializer.validated_data["password_actual"]):
                return Response({"detail": "Contraseña actual incorrecta"}, status=400)
            usuario.set_password(serializer.validated_data["password_nueva"])
            usuario.save()
            registrar_bitacora(
                usuario,
                "PASSWORD_CAMBIADO",
                f'Contraseña cambiada desde {request.META.get("REMOTE_ADDR", "IP desconocida")}',
                request,
            )
            return Response({"detail": "Contraseña actualizada correctamente"})
        return Response(serializer.errors, status=400)


# ROLES CRUD
class RolViewSet(viewsets.ModelViewSet):
    queryset = Rol.objects.all().order_by("id")
    serializer_class = RolSerializer
    permission_classes = [IsAuthenticated]


# USUARIOS CRUD (admin gestiona usuarios con rol admin o sin roles)
class UsuarioViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Usuarios con rol admin o sin roles
        return Usuario.objects.filter(
            models.Q(roles__nombre="admin") | models.Q(roles__isnull=True)
        ).distinct()

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return UsuarioWriteSerializer
        return UsuarioReadSerializer


# CLIENTES (solo usuarios con rol cliente)
class ClienteViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Usuario.objects.filter(roles__nombre="cliente").distinct()

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return UsuarioWriteSerializer
        return UsuarioReadSerializer
    
    def perform_create(self, serializer):
        user = serializer.save()
        rol_cliente, _ = Rol.objects.get_or_create(nombre='cliente')
        user.roles.add(rol_cliente)

# REGISTRO público (solo clientes) - ROL AUTOMÁTICO
class RegistroView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        ser = RegistroSerializer(data=request.data)
        if ser.is_valid():
            user = ser.save()
            registrar_bitacora(
                user,
                "REGISTRO",
                f'Registro exitoso desde {request.META.get("REMOTE_ADDR", "IP desconocida")}',
                request,
            )
            return Response(
                {
                    "id": user.id,
                    "correo": user.correo,
                    "nombre": user.nombre,
                    "apellido": user.apellido,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)


# LOGOUT
class LogoutJWTView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"detail": "Falta refresh token"}, status=400)
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            return Response({"detail": "Refresh token inválido"}, status=400)
        return Response({"detail": "Logout exitoso"})


# SOLICITAR RECUPERACIÓN (con email)
class SolicitarRecuperacionView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SolicitarRecuperacionSerializer(data=request.data)
        if serializer.is_valid():
            correo = serializer.validated_data["correo"]
            try:
                usuario = Usuario.objects.get(correo=correo, estado=True)

                # Generar token seguro
                token = secrets.token_urlsafe(32)
                usuario.token_recuperacion = token
                usuario.token_expira = timezone.now() + timezone.timedelta(hours=1)
                usuario.save()

                # Enviar email con Brevo
                try:
                    enviar_email_brevo(
                        to_email=correo,
                        subject="Recuperación de Contraseña - Shopia",
                        html_content=f"""
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #1f2937; text-align: center;">Recuperación de Contraseña</h2>
                            <p>Hola <strong>{usuario.nombre}</strong>,</p>
                            <p>Has solicitado recuperar tu contraseña en Shopia. Usa el siguiente token para crear una nueva contraseña:</p>
                            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                                <h3 style="color: #2563eb; margin: 0; font-size: 18px;">{token}</h3>
                            </div>
                            <p style="color: #ef4444;"><strong>Este token expira en 1 hora.</strong></p>
                            <p>Si no solicitaste este cambio, ignora este email.</p>
                            <hr style="margin: 30px 0; border: none; height: 1px; background: #e5e7eb;">
                            <p style="color: #6b7280; font-size: 14px;">
                                Saludos,<br>
                                <strong>Equipo Shopia</strong><br>
                                Ecommerce potenciado con IA
                            </p>
                        </div>
                        """,
                    )

                    registrar_bitacora(
                        usuario,
                        "SOLICITAR_RECUPERACION",
                        f'Token de recuperación enviado desde {request.META.get("REMOTE_ADDR", "IP desconocida")}',
                        request,
                    )

                    return Response(
                        {
                            "detail": "Se ha enviado un token de recuperación a tu email",
                            "email_enviado": True,
                        }
                    )

                except Exception as e:
                    return Response(
                        {
                            "detail": "Error al enviar email",
                            "error": str(e),
                            "token_temporal": token,  # Solo para desarrollo
                        },
                        status=500,
                    )

            except Usuario.DoesNotExist:
                pass

        # Siempre responder lo mismo por seguridad
        return Response(
            {"detail": "Si el correo existe, se enviará el token de recuperación"}
        )


# CONFIRMAR RECUPERACIÓN
class ConfirmarRecuperacionView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ConfirmarRecuperacionSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data["token"]
            nueva_password = serializer.validated_data["nueva_password"]

            try:
                usuario = Usuario.objects.get(
                    token_recuperacion=token,
                    token_expira__gt=timezone.now(),
                    estado=True,
                )

                # Cambiar contraseña y limpiar tokens
                usuario.set_password(nueva_password)
                usuario.token_recuperacion = None
                usuario.token_expira = None
                # Desbloquear usuario y resetear intentos
                usuario.resetear_intentos_fallidos()
                usuario.save()

                registrar_bitacora(
                    usuario,
                    "RECUPERACION_EXITOSA",
                    f'Contraseña recuperada exitosamente desde {request.META.get("REMOTE_ADDR", "IP desconocida")}',
                    request,
                )

                return Response(
                    {"detail": "Contraseña actualizada correctamente", "exito": True}
                )

            except Usuario.DoesNotExist:
                return Response(
                    {"detail": "Token inválido o expirado"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BitacoraViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Bitacora.objects.all().select_related("usuario").order_by("-fecha")
    serializer_class = BitacoraSerializer
    permission_classes = [IsAuthenticated]


# ===================== NOTIFICACIONES =====================
class NotificacionViewSet(viewsets.ModelViewSet):
    """CRUD completo para notificaciones (solo admins)"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Notificacion.objects.all().select_related('creado_por').order_by('-fecha_creacion')

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return NotificacionWriteSerializer
        return NotificacionReadSerializer

    def perform_create(self, serializer):
        """Registrar en bitácora cuando se crea una notificación"""
        notificacion = serializer.save()
        registrar_bitacora(
            self.request.user,
            "NOTIFICACION_CREADA",
            f'Notificación "{notificacion.titulo}" creada para {notificacion.usuarios.count()} usuarios',
            self.request
        )

    def perform_update(self, serializer):
        """Registrar en bitácora cuando se actualiza una notificación"""
        notificacion = serializer.save()
        registrar_bitacora(
            self.request.user,
            "NOTIFICACION_ACTUALIZADA",
            f'Notificación "{notificacion.titulo}" actualizada',
            self.request
        )

    def perform_destroy(self, instance):
        """Registrar en bitácora cuando se elimina una notificación"""
        registrar_bitacora(
            self.request.user,
            "NOTIFICACION_ELIMINADA",
            f'Notificación "{instance.titulo}" eliminada',
            self.request
        )
        super().perform_destroy(instance)

    @action(detail=True, methods=['get'])
    def estadisticas(self, request, pk=None):
        """Obtener estadísticas detalladas de una notificación"""
        notificacion = self.get_object()
        
        # Usuarios que han leído
        lecturas = NotificacionLeida.objects.filter(
            notificacion=notificacion
        ).select_related('usuario').order_by('-fecha_lectura')

        # Usuarios objetivo que NO han leído
        usuarios_objetivo = notificacion.usuarios.all()
        usuarios_leidos = lecturas.values_list('usuario_id', flat=True)
        usuarios_no_leidos = usuarios_objetivo.exclude(id__in=usuarios_leidos)

        return Response({
            'notificacion': NotificacionReadSerializer(notificacion).data,
            'total_objetivo': usuarios_objetivo.count(),
            'total_leidos': lecturas.count(),
            'total_no_leidos': usuarios_no_leidos.count(),
            'porcentaje_leido': notificacion.porcentaje_leido(),
            'lecturas_recientes': NotificacionLeidaSerializer(
                lecturas[:10], many=True
            ).data,
            'usuarios_no_leidos': UsuarioReadSerializer(
                usuarios_no_leidos[:10], many=True
            ).data
        })

    @action(detail=False, methods=['get'])
    def resumen(self, request):
        """Resumen general de notificaciones"""
        total_notificaciones = Notificacion.objects.count()
        notificaciones_activas = Notificacion.objects.filter(estado=True).count()
        total_lecturas = NotificacionLeida.objects.count()
        
        # Notificaciones más leídas (últimos 30 días)
        from datetime import timedelta
        hace_30_dias = timezone.now() - timedelta(days=30)
        
        mas_leidas = Notificacion.objects.filter(
            fecha_creacion__gte=hace_30_dias
        ).annotate(
            total_lecturas=models.Count('notificacion_leidas')
        ).order_by('-total_lecturas')[:5]

        return Response({
            'total_notificaciones': total_notificaciones,
            'notificaciones_activas': notificaciones_activas,
            'total_lecturas': total_lecturas,
            'notificaciones_mas_leidas': NotificacionReadSerializer(
                mas_leidas, many=True
            ).data
        })

class NotificacionClienteViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para que los clientes vean sus notificaciones"""
    permission_classes = [IsAuthenticated]
    serializer_class = NotificacionClienteSerializer

    def get_queryset(self):
        """Solo notificaciones activas dirigidas al usuario actual"""
        user = self.request.user
        
        # Verificar que el usuario es cliente
        if not user.roles.filter(nombre='cliente').exists():
            return Notificacion.objects.none()

        return Notificacion.objects.filter(
            usuarios=user,
            estado=True,
            fecha_inicio__lte=timezone.now()
        ).filter(
            Q(fecha_fin__isnull=True) | Q(fecha_fin__gte=timezone.now())
        ).order_by('-fecha_creacion')

    @action(detail=True, methods=['post'])
    def marcar_leida(self, request, pk=None):
        """Marcar una notificación como leída"""
        notificacion = self.get_object()
        user = request.user
        
        # Verificar que el usuario es cliente
        if not user.roles.filter(nombre='cliente').exists():
            return Response(
                {'detail': 'Solo los clientes pueden marcar notificaciones como leídas'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Verificar que la notificación está dirigida a este usuario
        if not notificacion.usuarios.filter(id=user.id).exists():
            return Response(
                {'detail': 'Esta notificación no está dirigida a ti'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Marcar como leída (get_or_create evita duplicados)
        lectura, creada = NotificacionLeida.objects.get_or_create(
            usuario=user,
            notificacion=notificacion,
            defaults={
                'plataforma_lectura': request.data.get('plataforma', 'web')
            }
        )

        if creada:
            registrar_bitacora(
                user,
                "NOTIFICACION_LEIDA",
                f'Notificación "{notificacion.titulo}" marcada como leída',
                request
            )
            return Response({
                'detail': 'Notificación marcada como leída',
                'fecha_lectura': lectura.fecha_lectura
            })
        else:
            return Response({
                'detail': 'Ya habías leído esta notificación',
                'fecha_lectura': lectura.fecha_lectura
            })

    @action(detail=False, methods=['get'])
    def no_leidas(self, request):
        """Obtener solo notificaciones no leídas"""
        user = request.user
        
        if not user.roles.filter(nombre='cliente').exists():
            return Response([])

        # Notificaciones activas no leídas por el usuario
        no_leidas = Notificacion.objects.filter(
            usuarios=user,
            estado=True,
            fecha_inicio__lte=timezone.now()
        ).filter(
            Q(fecha_fin__isnull=True) | Q(fecha_fin__gte=timezone.now())
        ).exclude(
            notificacion_leidas__usuario=user
        ).order_by('-fecha_creacion')

        serializer = self.get_serializer(no_leidas, many=True)
        return Response({
            'count': no_leidas.count(),
            'results': serializer.data
        })

    @action(detail=False, methods=['post'])
    def marcar_todas_leidas(self, request):
        """Marcar todas las notificaciones como leídas"""
        user = request.user
        
        if not user.roles.filter(nombre='cliente').exists():
            return Response(
                {'detail': 'Solo los clientes pueden marcar notificaciones como leídas'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Obtener notificaciones no leídas
        notificaciones_no_leidas = Notificacion.objects.filter(
            usuarios=user,
            estado=True,
            fecha_inicio__lte=timezone.now()
        ).filter(
            Q(fecha_fin__isnull=True) | Q(fecha_fin__gte=timezone.now())
        ).exclude(
            notificacion_leidas__usuario=user
        )

        # Crear registros de lectura en batch
        lecturas_nuevas = []
        for notificacion in notificaciones_no_leidas:
            lecturas_nuevas.append(
                NotificacionLeida(
                    usuario=user,
                    notificacion=notificacion,
                    plataforma_lectura=request.data.get('plataforma', 'web')
                )
            )

        if lecturas_nuevas:
            NotificacionLeida.objects.bulk_create(lecturas_nuevas)
            registrar_bitacora(
                user,
                "NOTIFICACIONES_TODAS_LEIDAS",
                f'{len(lecturas_nuevas)} notificaciones marcadas como leídas',
                request
            )

        return Response({
            'detail': f'{len(lecturas_nuevas)} notificaciones marcadas como leídas'
        })

class NotificacionLeidaViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Endpoint para consultar notificaciones leídas (lecturas).
    Solo lectura, accesible para admin.
    """
    queryset = NotificacionLeida.objects.select_related('usuario', 'notificacion').all().order_by('-fecha_lectura')
    serializer_class = NotificacionLeidaSerializer
    permission_classes = [IsAuthenticated]

# Función helper para registrar en bitácora
def registrar_bitacora(usuario, accion, descripcion="", request=None):
    ip = None
    if request:
        ip = request.META.get("HTTP_X_FORWARDED_FOR", request.META.get("REMOTE_ADDR"))
        if ip and ',' in ip:
            ip = ip.split(',')[0].strip()
    
    Bitacora.objects.create(
        usuario=usuario, accion=accion, descripcion=descripcion, ip=ip
    )