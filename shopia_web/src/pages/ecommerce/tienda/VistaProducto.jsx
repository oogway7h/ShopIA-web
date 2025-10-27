import React, { useState, useEffect } from "react";
import { api } from "../../../services/apiClient.js"; 
import { useNavigate, useParams } from "react-router-dom";

export default function ProductoDetallePage() {
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgIndex, setImgIndex] = useState(0);
  const navigate = useNavigate();
  const { id } = useParams(); 

  useEffect(() => {
    setLoading(true);
    setError(null);

    api.get(`/api/productos/${id}/`)
      .then((data) => {
        setProducto(data);
        setImgIndex(0);
      })
      .catch((e) => {
        setError("No se pudo cargar el producto. " + e.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]); 

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-300">Cargando Catálogo...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 m-4 bg-red-50 text-red-700 border border-red-200 rounded-lg shadow">
        <p className="font-bold">Error:</p>
        <p>{error}</p>
        <button
          onClick={() => navigate("/")} 
          className="mt-4 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow hover:bg-red-700 transition-colors"
        >
          Volver al catálogo
        </button>
      </div>
    );
  }

  if (!producto) {
    return <div className="p-8 text-center text-gray-600">Producto no encontrado.</div>;
  }

  // Construir el array de imágenes (principal + adicionales, sin duplicar)
  const imagenes = [
    ...(producto.url_imagen_principal ? [producto.url_imagen_principal] : []),
    ...(producto.imagenes ? producto.imagenes
      .map(img => img.url)
      .filter(url => url !== producto.url_imagen_principal)
      : [])
  ];
  const totalImgs = imagenes.length;

  const precioBase = parseFloat(producto.precio);
  const descuento = parseFloat(producto.descuento) || 0;
  const tieneDescuento = descuento > 0;
  const precioFinal = precioBase * (1 - descuento);
  const precioBaseFormateado = `Bs${precioBase.toFixed(2)}`;
  const precioFinalFormateado = `Bs${precioFinal.toFixed(2)}`;
  const hayStock = producto.stock > 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 md:p-8">
        <div className="mb-6">
          <button
            onClick={() => navigate("/")} 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Volver al catálogo</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Carrusel de imágenes */}
            <div className="p-4 md:p-6 bg-gray-100 flex flex-col items-center">
              <div className="relative w-full flex justify-center items-center">
                <img
                  className="w-full h-auto max-h-[500px] object-contain rounded-lg"
                  src={imagenes[imgIndex] || "https://placehold.co/600x400/e0e0e0/909090?text=Sin+Imagen"}
                  alt={`Imagen de ${producto.nombre}`}
                />
                {totalImgs > 1 && (
                  <>
                    <button
                      onClick={() => setImgIndex((imgIndex - 1 + totalImgs) % totalImgs)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow"
                      aria-label="Anterior imagen"
                    >
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setImgIndex((imgIndex + 1) % totalImgs)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow"
                      aria-label="Siguiente imagen"
                    >
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
              {/* Miniaturas opcionales */}
              {totalImgs > 1 && (
                <div className="flex gap-2 mt-4 justify-center">
                  {imagenes.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setImgIndex(idx)}
                      className={`border-2 rounded-md ${imgIndex === idx ? "border-blue-500" : "border-transparent"}`}
                    >
                      <img src={img} alt="" className="h-14 w-14 object-cover rounded" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ...resto del código igual... */}
            <div className="p-6 md:p-10 flex flex-col">
              <span className="text-sm font-medium text-blue-600 mb-2">
                {producto.categoria?.nombre || "Categoría"}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {producto.nombre}
              </h1>
              <p className="text-base text-gray-600 mb-5">
                Por: <span className="font-semibold">{producto.marca || "Sin Marca"}</span>
              </p>
              <div className="flex items-baseline gap-3 mb-5">
                <p className={`font-bold text-4xl ${tieneDescuento ? 'text-green-600' : 'text-gray-900'}`}>
                  {precioFinalFormateado}
                </p>
                {tieneDescuento && (
                  <p className="text-2xl text-gray-500 line-through">
                    {precioBaseFormateado}
                  </p>
                )}
              </div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Descripción</h2>
                <p className="text-gray-700 leading-relaxed">
                  {producto.descripcion}
                </p>
              </div>
              <div className="mt-auto space-y-4">
                <p className={`text-lg font-semibold ${hayStock ? 'text-green-700' : 'text-red-600'}`}>
                  {hayStock
                    ? `${producto.stock} unidades disponibles`
                    : 'Producto Agotado'}
                </p>
                <button
                  disabled={!hayStock}
                  className="w-full px-6 py-4 bg-blue-600 text-white text-lg font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Añadir al carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
