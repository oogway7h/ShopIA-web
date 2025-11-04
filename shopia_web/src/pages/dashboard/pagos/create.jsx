import React, { useState} from "react";
import { useNavigate } from "react-router-dom"; 
import { api } from "../../../services/apiClient.js";
import MetodosPagoForm from "../../../components/dashboard/PagosForm.jsx"



export default function MetodoPagoCreatePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleSubmit(data) {
    setLoading(true);
    setError("");
    api.post("/api/ventas/metodos/", data) 
      .then(() => {
        navigate("/dashboard/pagos");
      })
      .catch(e => {
        setError("No se pudo crear el método de pago. " + (e.message || "Error desconocido"));
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Crear Nuevo Método de Pago</h1>
      {error && (
        <div className="mb-4 px-4 py-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm shadow-sm">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      <MetodosPagoForm
        onSubmit={handleSubmit}
        onCancel={() => navigate("/dashboard/metodos-pago")} // Ajusta la ruta
        loading={loading}
      />
    </div>
  );
}

