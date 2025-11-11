import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"; 
import { api } from "../../../services/apiClient.js"; 
import MetodosPagoForm from "../../../components/dashboard/PagosForm.jsx"


export default function MetodoPagoEditPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialData, setInitialData] = useState(null); 
  const navigate = useNavigate();
  const { id } = useParams(); 

  useEffect(() => {
    if (!id) {
      setError("ID del método de pago no especificado.");
      return;
    }

    setLoading(true);
    setError("");
    api.get(`/api/ventas/metodos/${id}/`)
      .then(data => {
        setInitialData(data); 
      })
      .catch(e => {
        setError("No se pudo cargar el método de pago para editar. " + (e.message || "Error desconocido"));
        setInitialData(null); 
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]); 

  function handleSubmit(data) {
    if (!id) {
      setError("No se puede actualizar: ID del método de pago no especificado.");
      return;
    }

    setLoading(true);
    setError("");
    api.put(`/api/ventas/metodos/${id}/`, data)
      .then(() => {
        navigate("/dashboard/pagos");
      })
      .catch(e => {
        setError("No se pudo actualizar el método de pago. " + (e.message || "Error desconocido"));
      })
      .finally(() => {
        setLoading(false);
      });
  }

  if (loading && !initialData) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Cargando datos del método de pago...</p>
      </div>
    );
  }

  if (error && !initialData) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="mb-4 px-4 py-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm shadow-sm">
          <p className="font-bold">Error al cargar:</p>
          <p>{error}</p>
          <button
            onClick={() => navigate("/dashboard/metodos-pago")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Volver a Métodos de Pago
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Editar Método de Pago</h1>
      {error && (
        <div className="mb-4 px-4 py-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm shadow-sm">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      <MetodosPagoForm
        initialMetodoPago={initialData}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/dashboard/pagos")}
        loading={loading}
      />
    </div>
  );
}
