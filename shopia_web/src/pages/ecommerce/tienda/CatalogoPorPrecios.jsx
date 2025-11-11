import React, { useState, useEffect } from "react";
import { api } from "../../../services/apiClient.js";
import { useNavigate, useSearchParams } from "react-router-dom";
import ProductoCard from "../../../components/ecommerce/ProductoCard";
import VoiceCommandButton from "../../../pages/dashboard/Reportes/reconocimieto_voz.jsx";


export default function BusquedaProductosPage() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [titulo, setTitulo] = useState("Resultados de Búsqueda");
  const [imgIndexes, setImgIndexes] = useState({});
  const navigate = useNavigate();
  
  const [searchParams] = useSearchParams(); 

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams(searchParams);
    
    let tituloDinamico = "Resultados de Búsqueda";
    const search = params.get('search');
    const gte = params.get('precio__gte');
    const lte = params.get('precio__lte');

    if (search) {
      tituloDinamico = `Búsqueda: "${search}"`;
    } else if (gte && lte) {
      tituloDinamico = `Productos entre Bs. ${gte} y Bs. ${lte}`;
    } else if (lte) {
      tituloDinamico = `Productos de hasta Bs. ${lte}`;
    } else if (gte) {
      tituloDinamico = `Productos desde Bs. ${gte}`;
    }
    setTitulo(tituloDinamico);

    const apiUrl = `/api/productos/?${params.toString()}`;
    console.log("Cargando productos filtrados desde:", apiUrl);

    api.get(apiUrl)
      .then((data) => {
        setProductos(Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        setError("No se pudieron cargar los productos. " + e.message);
      })
      .finally(() => {
        setLoading(false);
      });
      
  }, [searchParams]);

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
        <span className="ml-3 text-gray-600">Buscando productos...</span>
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
    <div className="relative px-4 md:px-10 py-8 w-full bg-gray-100 min-h-screen">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-10 text-center">
        {titulo}
      </h1>

      <div className="w-full max-w-7xl mx-auto">
        {productos.length === 0 ? (
          <div className="text-center text-gray-500 italic p-8">
            No se encontraron productos que coincidan con tu búsqueda.
          </div>
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

      <div className="fixed bottom-6 right-6 z-50">
        <VoiceCommandButton
          variant="fab" 
        />
      </div>
    </div>
  );
}