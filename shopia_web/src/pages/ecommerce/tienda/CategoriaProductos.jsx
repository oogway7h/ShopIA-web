import React, { useState, useEffect } from "react";
import { api } from "../../../services/apiClient.js";
import { useParams, useNavigate } from "react-router-dom";
import ProductoCard from "../../../components/ecommerce/ProductoCard";

export default function CategoriaProductos() {
  const { id } = useParams();
  const [categoria, setCategoria] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgIndexes, setImgIndexes] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);

    api.get(`/api/categorias/${id}/`)
      .then((cat) => {
        setCategoria(cat);
        return api.get(`/api/productos/?categoria=${id}`);
      })
      .then((data) => {
        setProductos(Array.isArray(data.results) ? data.results : data);
      })
      .catch((e) => {
        setError("No se pudieron cargar los productos de la categoría. " + e.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  function handleVerProducto(prodId) {
    navigate(`/producto/${prodId}`);
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
        <span className="ml-3 text-gray-600 dark:text-gray-300">Cargando productos...</span>
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

  return (
    <div className="px-4 md:px-10 py-8 w-full bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6 gap-2">
          <h1 className="text-3xl font-bold text-gray-800">{categoria?.nombre || "Categoría"}</h1>
          <button
            onClick={() => navigate(-1)}
            className="ml-2 px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
          >
            Volver
          </button>
        </div>
        {categoria?.descripcion && (
          <p className="text-gray-500 mb-4">{categoria.descripcion}</p>
        )}
        {productos.length === 0 ? (
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
            {productos.map((producto) => {
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
      </div>
    </div>
  );
}