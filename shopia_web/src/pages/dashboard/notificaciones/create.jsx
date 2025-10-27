import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../services/apiClient.js";
import NotificacionForm from "../../../components/dashboard/NotificacionForm.jsx";

export default function NotificacionCreatePage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get("/api/cuenta/clientes/")
      .then((c) => setClientes(Array.isArray(c) ? c : []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function handleSubmit(data) {
    setLoading(true);
    api.post("/api/cuenta/notificaciones/", data)
      .then(() => navigate("/dashboard/notificaciones"))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  return (
    <div>
      {error && (
        <div className="mb-4 px-4 py-2 rounded border border-red-200 bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}
      <NotificacionForm
        clientes={clientes}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/dashboard/notificaciones")}
        loading={loading}
      />
    </div>
  );
}