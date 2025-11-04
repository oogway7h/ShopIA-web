import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/apiClient";
import ConfirmDialog from "../ui/dialogo";
import ToastNotification from "../ui/ToastNotification"; // Asegúrate de que la ruta sea la correcta

export default function ProductoCard({ producto, imgIndex, totalImgs, onImgChange, onVerProducto }) {
  const [cantidad, setCantidad] = useState(1);
  const [showDialog, setShowDialog] = useState(false);
  const [agregandoCarrito, setAgregandoCarrito] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', color: 'green' });
  
  const { isAuthenticated, isClient } = useAuth();
  const navigate = useNavigate();

  const precioBase = parseFloat(producto.precio);
  const descuento = parseFloat(producto.descuento) || 0;
  const tieneDescuento = descuento > 0;
  const precioFinal = precioBase * (1 - descuento);
  const precioBaseFormateado = `Bs${precioBase.toFixed(2)}`;
  const precioFinalFormateado = `Bs${precioFinal.toFixed(2)}`;

  // Array de imágenes (principal + adicionales, sin duplicar)
  const imagenes = [
    ...(producto.url_imagen_principal ? [producto.url_imagen_principal] : []),
    ...(producto.imagenes ? producto.imagenes
      .map(img => img.url)
      .filter(url => url !== producto.url_imagen_principal)
      : [])
  ];

  const handleAgregarCarrito = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    if (!isClient()) {
      setShowDialog(true);
      return;
    }

    try {
      setAgregandoCarrito(true);
      await api.post('/api/ventas/carrito/agregar-producto/', {
        producto_id: producto.id,
        cantidad: cantidad
      });
      setCantidad(1);
      setToast({ open: true, message: 'Producto agregado al carrito', color: 'green' });
    } catch (error) {
      setToast({ open: true, message: 'Error al agregar al carrito', color: 'red' });
      console.error(error);
    } finally {
      setAgregandoCarrito(false);
    }
  };

  const handleCantidadChange = (nuevaCantidad) => {
    if (nuevaCantidad >= 1 && nuevaCantidad <= producto.stock) {
      setCantidad(nuevaCantidad);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-700 border border-gray-200 rounded-xl shadow-md hover:shadow-xl overflow-hidden flex flex-col transition-all duration-300 group h-full max-w-sm mx-auto">
        
        {/* Contenedor de imagen mejorado con padding */}
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-50 p-3">
          {tieneDescuento && (
            <span className="absolute top-5 right-5 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-20 shadow-sm">
              -{Math.round(descuento * 100)}%
            </span>
          )}
          
          <img
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 rounded-lg bg-white"
            src={imagenes[imgIndex] || "https://placehold.co/400x300/e0e0e0/909090?text=Sin+Imagen"}
            alt={`Imagen de ${producto.nombre}`}
            onError={(e) => { 
              e.target.onerror = null; 
              e.target.src = "https://placehold.co/400x300/e0e0e0/909090?text=Error"; 
            }}
          />
          
          {/* Botones de navegación de imágenes */}
          {totalImgs > 1 && (
            <>
              <button
                onClick={() => onImgChange(-1)}
                className="absolute left-5 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                aria-label="Anterior imagen"
                type="button"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={() => onImgChange(1)}
                className="absolute right-5 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                aria-label="Siguiente imagen"
                type="button"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              {/* Indicadores de imagen */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {imagenes.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      idx === imgIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Contenido de la card */}
        <div className="flex flex-col flex-grow p-3 sm:p-4">
          
          {/* Información básica */}
          <div className="flex-grow space-y-1 mb-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {producto.marca || "Sin Marca"}
            </p>
            
            {/* Nombre con truncado FIJO para móviles */}
            <h3 
              className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white leading-tight h-10 overflow-hidden relative"
              title={producto.nombre}
            >
              <span 
                className="block absolute inset-0"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  lineHeight: '1.25rem'
                }}
              >
                {producto.nombre}
              </span>
            </h3>
            
            {/* Precio */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-lg sm:text-xl font-bold ${
                tieneDescuento ? "text-green-600" : "text-gray-900 dark:text-white"
              }`}>
                {precioFinalFormateado}
              </span>
              {tieneDescuento && (
                <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  {precioBaseFormateado}
                </span>
              )}
            </div>
            
            {/* Stock */}
            <p className={`text-xs ${
              producto.stock > 0 ? "text-green-700" : "text-red-600"
            }`}>
              {producto.stock > 0 ? `${producto.stock} disponibles` : "Agotado"}
            </p>
          </div>

          {/* Selector de cantidad */}
          {producto.stock > 0 && (
            <div className="flex items-center justify-center gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
              <button
                onClick={() => handleCantidadChange(cantidad - 1)}
                disabled={cantidad <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -
              </button>
              <span className="text-sm font-medium w-8 text-center">
                {cantidad}
              </span>
              <button
                onClick={() => handleCantidadChange(cantidad + 1)}
                disabled={cantidad >= producto.stock}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          )}

          {/* Botones */}
          <div className="space-y-2">
            <button
              onClick={handleAgregarCarrito}
              disabled={producto.stock === 0 || agregandoCarrito}
              className="w-full px-3 py-2 text-sm font-medium bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {agregandoCarrito ? "Agregando..." : "Agregar al carrito"}
            </button>

            <button
              onClick={onVerProducto}
              disabled={producto.stock === 0}
              className="w-full px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              Ver detalles
            </button>
          </div>
        </div>
      </div>

      {/* Dialog para usuarios no autorizados */}
      <ConfirmDialog
        open={showDialog}
        title="Acción de Cliente"
        message="Solo los usuarios con rol de cliente pueden agregar productos al carrito. ¿Deseas iniciar sesión como cliente?"
        confirmText="Iniciar Sesión"
        cancelText="Cancelar"
        onConfirm={() => {
          setShowDialog(false);
          navigate("/login");
        }}
        onCancel={() => setShowDialog(false)}
      />

      {/* Toast para notificaciones */}
      <ToastNotification
        open={toast.open}
        message={toast.message}
        onClose={() => setToast({ open: false, message: '' })}
        color={toast.color}
      />
    </>
  );
}