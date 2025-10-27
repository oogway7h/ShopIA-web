import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function ProductoCard({ producto, imgIndex, totalImgs, onImgChange, onVerProducto }) {
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

  const { isAuthenticated, isClient } = useAuth();
  const navigate = useNavigate();

  const handleAgregarCarrito = () => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    if (!isClient()) {
      alert("Solo los clientes pueden agregar productos al carrito.");
      return;
    }
    // Aquí deberías llamar a la función que agrega el producto al carrito
    // Por ejemplo: addToCart(producto)
    alert("Producto agregado al carrito.");
  };

  return (
    <div
      className="bg-white dark:bg-gray-700 border border-gray-200 rounded-xl shadow-md hover:shadow-xl overflow-hidden flex flex-col transition-shadow duration-300 group"
    >
      <div className="overflow-hidden relative flex flex-col items-center">
        {tieneDescuento && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
            -{descuento * 100}%
          </span>
        )}
        <img
          className="h-56 md:h-64 w-full object-cover transition-transform duration-300 group-hover:scale-110"
          src={imagenes[imgIndex] || "https://placehold.co/400x300/e0e0e0/909090?text=Sin+Imagen"}
          alt={`Imagen de ${producto.nombre}`}
          onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x300/e0e0e0/909090?text=Error"; }}
        />
        {totalImgs > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
            <button
              onClick={() => onImgChange(-1)}
              className="bg-white/80 hover:bg-white rounded-full p-1 shadow"
              aria-label="Anterior imagen"
              type="button"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => onImgChange(1)}
              className="bg-white/80 hover:bg-white rounded-full p-1 shadow"
              aria-label="Siguiente imagen"
              type="button"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="p-4 md:p-5 flex flex-col flex-grow">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          {producto.marca || "Sin Marca"}
        </p>
        <h3
          className="text-base md:text-lg font-bold text-gray-800 dark:text-white truncate h-6 mb-1"
          title={producto.nombre}
        >
          {producto.nombre}
        </h3>

        <div className="mt-2 flex items-baseline gap-2">
          <p
            className={`font-bold text-xl md:text-2xl ${ 
              tieneDescuento ? "text-green-600" : "text-gray-900 dark:text-white"
            }`}
          >
            {precioFinalFormateado}
          </p>
          {tieneDescuento && (
            <p className="text-sm md:text-md text-gray-500 dark:text-gray-400 line-through">
              {precioBaseFormateado}
            </p>
          )}
        </div>

        <p
          className={`text-xs md:text-sm mt-1 ${ 
            producto.stock > 0 ? "text-green-700" : "text-red-600"
          }`}
        >
          {producto.stock > 0
            ? `${producto.stock} disponibles`
            : "Agotado"}
        </p>

        {/* Botón Agregar al carrito */}
        <button
          onClick={handleAgregarCarrito}
          disabled={producto.stock === 0}
          className="w-full px-4 py-2 mb-2 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          Agregar al carrito
        </button>

        <div className="mt-auto pt-1">
          <button
            onClick={onVerProducto}
            disabled={producto.stock === 0}
            className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            Ver detalles
          </button>
        </div>
      </div>
    </div>
  );
}