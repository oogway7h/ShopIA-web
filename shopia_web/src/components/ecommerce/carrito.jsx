import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../services/apiClient';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../ui/dialogo';
import ToastNotification from '../ui/ToastNotification';

// Componente memoizado fuera del principal
const CarritoItem = React.memo(function CarritoItem({ item, onCantidadChange, onEliminar, getImagenProducto }) {
  return (
    <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
      {/* Imagen del producto */}
      <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={getImagenProducto(item.producto)}
          alt={item.producto.nombre}
          className="w-full h-full object-contain p-1"
          loading="lazy"
          onError={e => { e.target.onerror = null; e.target.src = "https://placehold.co/64x64/e0e0e0/909090?text=Error"; }}
        />
      </div>
      {/* Información del producto */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 truncate">
          {item.producto.nombre}
        </h4>
        <p className="text-xs text-gray-500 mb-2">
          {item.producto.marca || "Sin marca"}
        </p>
        {/* Precio */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-bold text-gray-900">
            Bs{item.precio_unitario}
          </span>
          {item.producto.descuento > 0 && (
            <span className="text-xs text-gray-500 line-through">
              Bs{item.producto.precio}
            </span>
          )}
        </div>
        {/* Controles de cantidad */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onCantidadChange(item.producto.id, item.cantidad - 1)}
              className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
              disabled={item.cantidad <= 1}
            >
              -
            </button>
            <span className="text-sm font-medium w-8 text-center">
              {item.cantidad}
            </span>
            <button
              onClick={() => onCantidadChange(item.producto.id, item.cantidad + 1)}
              className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
            >
              +
            </button>
          </div>
          <button
            onClick={() => onEliminar(item.producto.id)}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
});

export default function CarritoSidebar({ isOpen, onClose, onCartChange }) {
  const [carrito, setCarrito] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '', productId: null });
  const [toast, setToast] = useState({ open: false, message: '', color: 'red' });
  const navigate = useNavigate();

  // Siempre recarga el carrito al abrir el sidebar
  useEffect(() => {
    if (isOpen) {
      cargarCarrito();
    }
  }, [isOpen]);

  const cargarCarrito = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/ventas/carrito/');
      setCarrito(data);
    } catch {
      setToast({ open: true, message: 'Error al cargar carrito', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  // Actualización optimista
  const handleEliminarProducto = async (productId) => {
    setConfirmDialog({ open: false, type: '', productId: null });
    const carritoAnterior = carrito;
    setCarrito((prev) => ({
      ...prev,
      items: prev.items.filter(item => item.producto.id !== productId)
    }));
    try {
      await api.del(`/api/ventas/carrito/eliminar-producto/${productId}/`);
      setToast({ open: true, message: 'Producto eliminado', color: 'green' });
      // Solo llama onCartChange si quieres actualizar el contador del header
      if (onCartChange) onCartChange();
      // NO llames cargarCarrito aquí, ya actualizaste localmente
    } catch {
      setCarrito(carritoAnterior);
      setToast({ open: true, message: 'Error al eliminar producto', color: 'red' });
    }
  };

  const handleCantidadChange = async (productId, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    const carritoAnterior = carrito;
    setCarrito((prev) => ({
      ...prev,
      items: prev.items.map(item =>
        item.producto.id === productId
          ? { ...item, cantidad: nuevaCantidad }
          : item
      )
    }));
    try {
      await api.put('/api/ventas/carrito/actualizar-cantidad/', {
        producto_id: productId,
        cantidad: nuevaCantidad
      });
      if (onCartChange) onCartChange();
      // NO llames cargarCarrito aquí, ya actualizaste localmente
    } catch {
      setCarrito(carritoAnterior);
      setToast({ open: true, message: 'Error al actualizar cantidad', color: 'red' });
    }
  };

  const handlePagar = () => {
    onClose();
    navigate('/cliente/checkout'); 
  };

  // Memo para imagen
  const getImagenProducto = useCallback((producto) => {
    if (producto.url_imagen_principal) return producto.url_imagen_principal;
    if (producto.imagenes && producto.imagenes.length > 0) {
      return producto.imagenes[0].url;
    }
    return "https://placehold.co/64x64/e0e0e0/909090?text=Sin+Imagen";
  }, []);

  // Memo para total
  const total = useMemo(() => {
    if (!carrito?.items) return 0;
    return carrito.items.reduce((total, item) => total + item.precio_unitario * item.cantidad, 0);
  }, [carrito?.items]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col sm:max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Mi Carrito ({carrito?.items?.length || 0})
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Cerrar carrito"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Cargando...</span>
            </div>
          ) : !carrito?.items?.length ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tu carrito está vacío</h3>
              <p className="text-gray-500">Agrega algunos productos para continuar</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {carrito.items.map((item) => (
                <CarritoItem
                  key={item.id}
                  item={item}
                  onCantidadChange={handleCantidadChange}
                  onEliminar={(productId) => setConfirmDialog({ 
                    open: true, 
                    type: 'eliminar-producto', 
                    productId 
                  })}
                  getImagenProducto={getImagenProducto}
                />
              ))}
            </div>
          )}
        </div>
        {/* Footer con total y botón de pago */}
        {carrito?.items?.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-gray-900">
                Bs{total.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handlePagar}
              className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Proceder al pago
            </button>
          </div>
        )}
        {/* Dialogs */}
        <ConfirmDialog
          open={confirmDialog.open && confirmDialog.type === 'eliminar-producto'}
          title="Eliminar producto"
          message="¿Estás seguro de que deseas eliminar este producto del carrito?"
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={() => handleEliminarProducto(confirmDialog.productId)}
          onCancel={() => setConfirmDialog({ open: false, type: '', productId: null })}
          zIndex={80}
        />
        <ToastNotification
          open={toast.open}
          message={toast.message}
          onClose={() => setToast({ open: false, message: '' })}
          color={toast.color}
        />
      </div>
    </>
  );
}