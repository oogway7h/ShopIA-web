import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../../services/apiClient.js";
import ClientesForm from "../../../components/dashboard/ClientesForm.jsx";

export default function ClienteEditPage() {
  const { id } = useParams();
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get(`/api/cuenta/clientes/${id}/`)
      .then((c) => setCliente(c))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  function handleSubmit(data) {
    setLoading(true);
    api.put(`/api/cuenta/clientes/${id}/`, data)
      .then(() => navigate("/dashboard/clientes"))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  if (loading && !cliente) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div>
      {error && (
        <div className="mb-4 px-4 py-2 rounded border border-red-200 bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}
      {cliente && (
        <ClientesForm
          initialCliente={cliente}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/dashboard/clientes")}
          loading={loading}
        />
      )}
    </div>
  );
}