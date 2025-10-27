import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../../services/apiClient.js";
import NotificacionForm from "../../../components/dashboard/NotificacionForm.jsx";

export default function NotificacionEditPage() {
  const { id } = useParams();
  const [notificacion, setNotificacion] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/api/cuenta/notificaciones/${id}/`),
      api.get("/api/cuenta/clientes/")
    ])
      .then(([n, c]) => {
        setNotificacion(n);
        setClientes(Array.isArray(c) ? c : []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  function handleSubmit(data) {
    setLoading(true);
    api.put(`/api/cuenta/notificaciones/${id}/`, data)
      .then(() => navigate("/dashboard/notificaciones"))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  if (loading && !notificacion) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div>
      {error && (
        <div className="mb-4 px-4 py-2 rounded border border-red-200 bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}
      {notificacion && (
        <NotificacionForm
          initialNotificacion={notificacion}
          clientes={clientes}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/dashboard/notificaciones")}
          loading={loading}
        />
      )}
    </div>
  );
}