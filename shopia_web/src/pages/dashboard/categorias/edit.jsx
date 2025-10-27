import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../../services/apiClient.js";
import CategoriasForm from "../../../components/dashboard/CategoriasForm.jsx";



export default function CategoriaEditPage() {
  const [loading, setLoading] = useState(true); 
  const [categoria, setCategoria] = useState(null); 
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const { id } = useParams(); 

  useEffect(() => {
    if (!id) return; 
    
    setLoading(true);
    setError("");
    
    api.get(`/api/categorias/${id}/`) 
      .then(data => {
        setCategoria(data); 
      })
      .catch(e => setError("No se pudo cargar la categoría. " + e.message))
      .finally(() => setLoading(false));
  }, [id]); 


  function handleSubmit(data) {
    setLoading(true);
    setError("");
    api.put(`/api/categorias/${id}/`, data) 
      .then(() => {
        navigate("/dashboard/categorias"); 
      })
      .catch(e => setError("Error al actualizar la categoría. " + e.message)) 
      .finally(() => setLoading(false));
  }

  
  function handleCancel() {
    navigate("/dashboard/categorias"); 
  }

  return (
    <div className="space-y-8 p-8 bg-gray-50 min-h-screen">
      {error && (
        <div className="px-4 py-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">
          <p className="font-bold">Ha ocurrido un error:</p>
          <p>{error}</p>
        </div>
      )}

      {loading && !categoria && (
        <p className="text-center text-gray-500">Cargando categoría...</p>
      )}

      {!loading && categoria && (
        <CategoriasForm
          initialCategoria={categoria} 
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      )}
    </div>
  );
}

