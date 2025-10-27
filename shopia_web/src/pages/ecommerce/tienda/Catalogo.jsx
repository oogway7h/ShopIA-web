import React, { useState, useEffect } from "react";
import { api } from "../../../services/apiClient.js";
import { useNavigate } from "react-router-dom";
import ProductoCard from "../../../components/ecommerce/ProductoCard";

export default function CatalogoProductos() {
  const [catalogo, setCatalogo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgIndexes, setImgIndexes] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);

    api.get("/api/catalogo/")
      .then((data) => {
        setCatalogo(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        setError("No se pudo cargar el catálogo. " + e.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  function handleVerProducto(id) {
    navigate(`/producto/${id}`);
  }

  function handleVerTodos(catId) {
    navigate(`/categoria/${catId}`);
  }

  function handleImgChange(prodId, total, dir) {
    setImgIndexes((prev) => ({
      ...prev,
      [prodId]: ((prev[prodId] || 0) + dir + total) % total,
    }));
  }

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
      </div>
    );
  }

  if (!catalogo.length) {
    return (
      <div className="p-8 text-center text-gray-600 dark:text-gray-400">
        No hay productos disponibles.
      </div>
    );
  }

  return (
    <div className="px-4 md:px-10 py-8 w-full bg-gray-100 min-h-screen">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-10 text-center">
        Nuestro Catálogo
      </h1>

      <div className="w-full max-w-7xl mx-auto space-y-12">
        {catalogo.map((cat) => (
          <section key={cat.id}>
            <div className="flex items-center mb-4 gap-2">
              <h2 className="text-2xl font-bold text-gray-700">{cat.nombre}</h2>
              <button
                onClick={() => handleVerTodos(cat.id)}
                className="ml-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Ver todos
              </button>
            </div>
            {cat.descripcion && (
              <p className="text-gray-500 mb-4">{cat.descripcion}</p>
            )}
            {cat.productos.length === 0 ? (
              <div className="text-gray-500 italic mb-8">No hay productos en esta categoría.</div>
            ) : (
              <div
                className="
                  grid 
                  grid-cols-2 
                  gap-4
                  md:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]
                  md:gap-10
                "
              >
                {cat.productos.map((producto) => {
                  // Array de imágenes (principal + adicionales, sin duplicar)
                  const imagenes = [
                    ...(producto.url_imagen_principal ? [producto.url_imagen_principal] : []),
                    ...(producto.imagenes ? producto.imagenes
                      .map(img => img.url)
                      .filter(url => url !== producto.url_imagen_principal)
                      : [])
                  ];
                  const totalImgs = imagenes.length;
                  const imgIndex = imgIndexes[producto.id] || 0;

                  return (
                    <ProductoCard
                      key={producto.id}
                      producto={producto}
                      imgIndex={imgIndex}
                      totalImgs={totalImgs}
                      onImgChange={(dir) => handleImgChange(producto.id, totalImgs, dir)}
                      onVerProducto={() => handleVerProducto(producto.id)}
                    />
                  );
                })}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

