import json
import firebase_admin
from firebase_admin import credentials, messaging
from django.conf import settings

# Inicializar Firebase Admin SDK
def inicializar_firebase():
    """Inicializa Firebase Admin SDK una sola vez"""
    if not firebase_admin._apps:
        try:
            cred_dict = json.loads(settings.GOOGLE_CREDENTIALS_JSON)
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
            print("✅ Firebase Admin SDK inicializado correctamente")
        except Exception as e:
            print(f"❌ Error al inicializar Firebase: {e}")
            raise

# Enviar notificación push a un token específico
def enviar_push_notification(token, titulo, descripcion, data=None):
    """
    Envía una notificación push a un dispositivo específico
    
    Args:
        token: Token FCM del dispositivo
        titulo: Título de la notificación
        descripcion: Cuerpo de la notificación
        data: Datos adicionales (dict) opcional
    """
    inicializar_firebase()
    
    try:
        message = messaging.Message(
            notification=messaging.Notification(
                title=titulo,
                body=descripcion,
            ),
            data=data or {},
            token=token,
            android=messaging.AndroidConfig(
                priority='high',
                notification=messaging.AndroidNotification(
                    channel_id='shopia_channel',
                    priority='high',
                    default_sound=True,
                    default_vibrate_timings=True,
                )
            ),
        )
        
        response = messaging.send(message)
        print(f"✅ Notificación enviada exitosamente: {response}")
        return {'success': True, 'message_id': response}
    except Exception as e:
        print(f"❌ Error al enviar notificación: {e}")
        return {'success': False, 'error': str(e)}

# Enviar notificación push a múltiples tokens
def enviar_push_notifications_masivas(tokens, titulo, descripcion, data=None):
    """
    Envía notificaciones push a múltiples dispositivos
    
    Args:
        tokens: Lista de tokens FCM
        titulo: Título de la notificación
        descripcion: Cuerpo de la notificación
        data: Datos adicionales (dict) opcional
    """
    inicializar_firebase()
    
    if not tokens:
        print("⚠️ No hay tokens para enviar")
        return {'success': False, 'error': 'No hay tokens para enviar'}
    
    try:
        # Crear mensajes para cada token
        messages = [
            messaging.Message(
                notification=messaging.Notification(
                    title=titulo,
                    body=descripcion,
                ),
                data=data or {},
                token=token,
                android=messaging.AndroidConfig(
                    priority='high',
                    notification=messaging.AndroidNotification(
                        channel_id='shopia_channel',
                        priority='high',
                        default_sound=True,
                        default_vibrate_timings=True,
                    )
                ),
            )
            for token in tokens
        ]
        
        # ✅ Método correcto: send_each() no send_all()
        response = messaging.send_each(messages)
        
        print(f"📱 Notificaciones enviadas: {response.success_count} éxito, {response.failure_count} fallidas")
        
        # Mostrar errores si hay
        if response.failure_count > 0:
            for idx, resp in enumerate(response.responses):
                if not resp.success:
                    print(f"❌ Error en token {idx}: {resp.exception}")
        
        return {
            'success': True,
            'success_count': response.success_count,
            'failure_count': response.failure_count,
        }
    except Exception as e:
        print(f"❌ Error al enviar notificaciones masivas: {e}")
        return {'success': False, 'error': str(e)}