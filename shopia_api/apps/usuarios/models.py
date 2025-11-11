from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone

class Rol(models.Model):
    CHOICES_ROLES = (
        ('admin', 'Administrador'),
        ('cliente', 'Cliente'),
    )
    
    nombre = models.CharField(max_length=50, unique=True, choices=CHOICES_ROLES)

    def __str__(self):
        return self.nombre

    class Meta:
        db_table = 'rol'
        verbose_name = 'Rol'
        verbose_name_plural = 'Roles'
        ordering = ['nombre']


class UsuarioManager(BaseUserManager):
    def create_user(self, correo, password=None, **extra):
        if not correo:
            raise ValueError('El correo es obligatorio')
        correo = self.normalize_email(correo)
        user = self.model(correo=correo, **extra)
        if password:
            user.set_password(password)  # hash
        else:
            user.set_unusable_password()
        user.save()
        return user
    def create_superuser(self, correo, password=None, **extra):
        extra.setdefault('estado', True)
        return self.create_user(correo, password, **extra)

class Usuario(AbstractBaseUser, PermissionsMixin):
    CHOISES_SEXO = (
        ('M', 'Masculino'),
        ('F', 'Femenino'),
    )
    
    correo = models.EmailField(unique=True)
    nombre = models.CharField(max_length=100, blank=True)
    apellido = models.CharField(max_length=100, blank=True)
    sexo = models.CharField(max_length=10, blank=True, null=True, choices=CHOISES_SEXO)
    telefono = models.CharField(max_length=15, blank=True, null=True)
    roles = models.ManyToManyField(Rol, related_name='usuarios')
    
    estado = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    actualizado = models.DateTimeField(auto_now=True)
    
    # Campos para control de intentos fallidos
    intentos_fallidos = models.IntegerField(default=0)
    bloqueado_hasta = models.DateTimeField(null=True, blank=True)
    
    # Campos para recuperación de contraseña
    token_recuperacion = models.CharField(max_length=100, null=True, blank=True)
    token_expira = models.DateTimeField(null=True, blank=True)

    # Token FCM para notificaciones push
    fcm_token = models.CharField(
        max_length=255, 
        null=True, 
        blank=True,
        help_text="Token de Firebase Cloud Messaging para notificaciones push"
    )
    fcm_token_actualizado = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'correo'
    REQUIRED_FIELDS = []  
    objects = UsuarioManager()

    def __str__(self):
        return self.correo

    class Meta:
        db_table = 'usuario'
        ordering = ['correo']
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

    def esta_bloqueado(self):
        """Verifica si el usuario está bloqueado por intentos fallidos"""
        if self.bloqueado_hasta and timezone.now() < self.bloqueado_hasta:
            return True
        return False
    
    def incrementar_intentos_fallidos(self):
        """Incrementa los intentos fallidos y bloquea si llega a 3"""
        self.intentos_fallidos += 1
        if self.intentos_fallidos >= 3:
            # Bloquear por 30 minutos
            self.bloqueado_hasta = timezone.now() + timezone.timedelta(minutes=30)
        self.save()
    
    def resetear_intentos_fallidos(self):
        """Resetea los intentos fallidos al login exitoso"""
        self.intentos_fallidos = 0
        self.bloqueado_hasta = None
        self.save()

class Bitacora(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    accion = models.CharField(max_length=100)  
    descripcion = models.TextField(blank=True)
    ip = models.GenericIPAddressField(null=True, blank=True)
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'bitacora'
        ordering = ['-fecha']

    def __str__(self):
        return f"{self.usuario.correo} - {self.accion} - {self.fecha}"

class Notificacion(models.Model):
    TIPO_CHOICES = (
        ('info', 'Información'),
        ('warning', 'Advertencia'),
        ('error', 'Error'),
        ('success', 'Éxito'),
        ('promocion', 'Promoción'),
        ('sistema', 'Sistema'),
    )
    
    PLATAFORMA_CHOICES = (
        ('web', 'Web'),
        ('email', 'Email'),
        ('push', 'Push'),
        ('sms', 'SMS'),
    )
    
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='info')
    plataforma = models.CharField(max_length=20, choices=PLATAFORMA_CHOICES, default='web')
    fecha_inicio = models.DateTimeField(default=timezone.now)
    fecha_fin = models.DateTimeField(null=True, blank=True)
    estado = models.BooleanField(default=True) 
    
    usuarios = models.ManyToManyField(
        Usuario, 
        related_name='notificaciones_recibidas',
        blank=True,
        help_text="Usuarios que deberían ver esta notificación"
    )
    
    # Campos de auditoria
    creado_por = models.ForeignKey(
        Usuario, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='notificaciones_creadas'
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.titulo

    def esta_activa(self):
        """Verifica si la notificación está activa y dentro del rango de fechas"""
        ahora = timezone.now()
        if not self.estado:
            return False
        if self.fecha_inicio > ahora:
            return False
        if self.fecha_fin and self.fecha_fin < ahora:
            return False
        return True

    def total_lecturas(self):
        """Retorna el total de usuarios que han leído esta notificación"""
        return NotificacionLeida.objects.filter(notificacion=self).count()

    def total_usuarios_objetivo(self):
        """Retorna el total de usuarios que deberían ver esta notificación"""
        return self.usuarios.count()

    def porcentaje_leido(self):
        """Retorna el porcentaje de usuarios que han leído la notificación"""
        total = self.total_usuarios_objetivo()
        if total == 0:
            return 0
        leidos = self.total_lecturas()
        return round((leidos / total) * 100, 2)

    class Meta:
        db_table = 'notificacion'
        verbose_name = 'Notificación'
        verbose_name_plural = 'Notificaciones'
        ordering = ['-fecha_creacion']

class NotificacionLeida(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    notificacion = models.ForeignKey(Notificacion, on_delete=models.CASCADE, related_name='lecturas')
    fecha_lectura = models.DateTimeField(auto_now_add=True)
    plataforma_lectura = models.CharField(max_length=20, default='web')
    
    class Meta:
        db_table = 'notificacion_leida'
        unique_together = ('usuario', 'notificacion')  
        verbose_name = 'Notificación Leída'
        verbose_name_plural = 'Notificaciones Leídas'
        ordering = ['-fecha_lectura']

    def __str__(self):
        return f"{self.usuario.correo} leyó '{self.notificacion.titulo}'"