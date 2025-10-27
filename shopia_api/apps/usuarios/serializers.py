from rest_framework import serializers
from .models import Usuario, Rol, Bitacora, Notificacion, NotificacionLeida

class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = ['id', 'nombre']

class UsuarioReadSerializer(serializers.ModelSerializer):
    roles = RolSerializer(many=True, read_only=True)
    nombre_completo = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = [
            'id', 'correo', 'nombre', 'apellido', 'nombre_completo', 'telefono', 'sexo', 
            'estado', 'last_login', 'roles', 'date_joined', 'actualizado'
        ]

    def get_nombre_completo(self, obj):
        return f"{obj.nombre} {obj.apellido}".strip()

class UsuarioWriteSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=4)
    roles = serializers.PrimaryKeyRelatedField(
        queryset=Rol.objects.all(), many=True, required=False
    )

    class Meta:
        model = Usuario
        fields = [
            'id', 'correo', 'password', 'nombre', 'apellido', 'telefono', 
            'sexo', 'roles', 'estado'
        ]

    def to_internal_value(self, data):
        if self.instance and 'password' not in data:
            self.fields['password'].required = False
        return super().to_internal_value(data)

    def create(self, validated_data):
        roles = validated_data.pop('roles', [])
        password = validated_data.pop('password')
        user = Usuario.objects.create_user(password=password, **validated_data)
        if roles:
            user.roles.set(roles)
        return user

    def update(self, instance, validated_data):
        roles = validated_data.pop('roles', None)
        password = validated_data.pop('password', None)
        for k, v in validated_data.items():
            setattr(instance, k, v)
        if password:
            instance.set_password(password)
        instance.save()
        if roles is not None:
            instance.roles.set(roles)
        return instance

# Serializer para registro público (AUTOMÁTICAMENTE CLIENTE)
class RegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=4)

    class Meta:
        model = Usuario
        fields = ['correo', 'password', 'nombre', 'apellido', 'telefono', 'sexo']

    def validate_correo(self, value):
        if Usuario.objects.filter(correo=value).exists():
            raise serializers.ValidationError("Este correo ya está registrado")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = Usuario.objects.create_user(password=password, **validated_data)
        rol_cliente, _ = Rol.objects.get_or_create(nombre='cliente')
        user.roles.add(rol_cliente)
        return user

# Serializer para que cliente edite su perfil (campos limitados)
class PerfilClienteSerializer(serializers.ModelSerializer):
    roles = RolSerializer(many=True, read_only=True)
    nombre_completo = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = [
            'id', 'correo', 'nombre', 'apellido', 'nombre_completo', 'telefono', 'sexo', 'roles', 'date_joined'
        ]
        read_only_fields = ['correo']  # El cliente no puede cambiar su correo

    def get_nombre_completo(self, obj):
        return f"{obj.nombre} {obj.apellido}".strip()

class CambiarPasswordSerializer(serializers.Serializer):
    password_actual = serializers.CharField()
    password_nueva = serializers.CharField(min_length=4)

    def validate_password_nueva(self, value):
        if len(value) < 4:
            raise serializers.ValidationError("La contraseña debe tener al menos 4 caracteres")
        return value

class SolicitarRecuperacionSerializer(serializers.Serializer):
    correo = serializers.EmailField()

class ConfirmarRecuperacionSerializer(serializers.Serializer):
    token = serializers.CharField(max_length=100)
    nueva_password = serializers.CharField(min_length=4, max_length=128)
    confirmar_password = serializers.CharField(max_length=128)
    
    def validate(self, attrs):
        if attrs['nueva_password'] != attrs['confirmar_password']:
            raise serializers.ValidationError("Las contraseñas no coinciden")
        if len(attrs['nueva_password']) < 4:
            raise serializers.ValidationError("La contraseña debe tener al menos 4 caracteres")
        return attrs

class BitacoraSerializer(serializers.ModelSerializer):
    usuario_correo = serializers.CharField(source='usuario.correo', read_only=True)
    usuario_nombre = serializers.CharField(source='usuario.nombre', read_only=True)

    class Meta:
        model = Bitacora
        fields = ['id', 'usuario', 'usuario_correo', 'usuario_nombre', 'accion', 'descripcion', 'ip', 'fecha']
        read_only_fields = ['fecha']

class NotificacionReadSerializer(serializers.ModelSerializer):
    """Serializer para leer notificaciones con estadísticas"""
    creado_por_nombre = serializers.CharField(source='creado_por.nombre', read_only=True)
    total_lecturas = serializers.SerializerMethodField()
    total_usuarios_objetivo = serializers.SerializerMethodField()
    porcentaje_leido = serializers.SerializerMethodField()
    es_activa = serializers.SerializerMethodField()
    usuarios_count = serializers.SerializerMethodField()

    class Meta:
        model = Notificacion
        fields = [
            'id', 'titulo', 'descripcion', 'tipo', 'plataforma',
            'fecha_inicio', 'fecha_fin', 'estado', 'creado_por',
            'creado_por_nombre', 'fecha_creacion', 'fecha_actualizacion',
            'total_lecturas', 'total_usuarios_objetivo', 'porcentaje_leido',
            'es_activa', 'usuarios_count'
        ]

    def get_total_lecturas(self, obj):
        return obj.total_lecturas()

    def get_total_usuarios_objetivo(self, obj):
        return obj.total_usuarios_objetivo()

    def get_porcentaje_leido(self, obj):
        return obj.porcentaje_leido()

    def get_es_activa(self, obj):
        return obj.esta_activa()

    def get_usuarios_count(self, obj):
        return obj.usuarios.count()

class NotificacionWriteSerializer(serializers.ModelSerializer):
    """Serializer para crear/editar notificaciones"""
    usuarios_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        help_text="Lista de IDs de usuarios objetivo. Si está vacío, se envía a todos los clientes."
    )

    class Meta:
        model = Notificacion
        fields = [
            'id', 'titulo', 'descripcion', 'tipo', 'plataforma',
            'fecha_inicio', 'fecha_fin', 'estado', 'usuarios_ids'
        ]

    def validate_usuarios_ids(self, value):
        """Validar que los usuarios existen y son clientes"""
        if value:
            usuarios_validos = Usuario.objects.filter(
                id__in=value,
                roles__nombre='cliente',
                estado=True
            ).count()
            if usuarios_validos != len(value):
                raise serializers.ValidationError(
                    "Algunos usuarios no existen o no son clientes activos"
                )
        return value

    def create(self, validated_data):
        usuarios_ids = validated_data.pop('usuarios_ids', [])
        request = self.context.get('request')
        
        # Asignar creado_por
        if request and request.user:
            validated_data['creado_por'] = request.user

        notificacion = Notificacion.objects.create(**validated_data)

        # Asignar usuarios objetivo
        if usuarios_ids:
            usuarios = Usuario.objects.filter(
                id__in=usuarios_ids,
                roles__nombre='cliente',
                estado=True
            )
        else:
            # Si no se especifican usuarios, enviar a todos los clientes activos
            usuarios = Usuario.objects.filter(
                roles__nombre='cliente',
                estado=True
            )

        notificacion.usuarios.set(usuarios)
        return notificacion

    def update(self, instance, validated_data):
        usuarios_ids = validated_data.pop('usuarios_ids', None)
        
        # Actualizar campos básicos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Actualizar usuarios objetivo si se proporcionaron
        if usuarios_ids is not None:
            if usuarios_ids:
                usuarios = Usuario.objects.filter(
                    id__in=usuarios_ids,
                    roles__nombre='cliente',
                    estado=True
                )
            else:
                usuarios = Usuario.objects.filter(
                    roles__nombre='cliente',
                    estado=True
                )
            instance.usuarios.set(usuarios)

        return instance

class NotificacionLeidaSerializer(serializers.ModelSerializer):
    """Serializer para notificaciones leídas"""
    usuario_nombre = serializers.CharField(source='usuario.nombre', read_only=True)
    notificacion_titulo = serializers.CharField(source='notificacion.titulo', read_only=True)

    class Meta:
        model = NotificacionLeida
        fields = [
            'id', 'usuario', 'notificacion', 'fecha_lectura', 
            'plataforma_lectura', 'usuario_nombre', 'notificacion_titulo'
        ]
        read_only_fields = ['fecha_lectura']

class NotificacionClienteSerializer(serializers.ModelSerializer):
    """Serializer para que los clientes vean sus notificaciones"""
    leida = serializers.SerializerMethodField()
    fecha_lectura = serializers.SerializerMethodField()

    class Meta:
        model = Notificacion
        fields = [
            'id', 'titulo', 'descripcion', 'tipo', 'plataforma',
            'fecha_inicio', 'fecha_creacion', 'leida', 'fecha_lectura'
        ]

    def get_leida(self, obj):
        """Verificar si el usuario actual ha leído esta notificación"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return NotificacionLeida.objects.filter(
                usuario=request.user,
                notificacion=obj
            ).exists()
        return False

    def get_fecha_lectura(self, obj):
        """Obtener la fecha de lectura si existe"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            lectura = NotificacionLeida.objects.filter(
                usuario=request.user,
                notificacion=obj
            ).first()
            return lectura.fecha_lectura if lectura else None
        return None