import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../../services/apiClient.js";
import AccountForm from "../../../components/dashboard/UsuariosForm.jsx";

export default function UsuarioEditPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/api/cuenta/usuarios/${id}/`),
      api.get("/api/cuenta/roles/")
    ])
      .then(([u, r]) => {
        setUser(u);
        setRoles(Array.isArray(r) ? r : []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  function handleSubmit(data) {
    setLoading(true);
    api.put(`/api/cuenta/usuarios/${id}/`, data)
      .then(() => navigate("/dashboard/usuarios"))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  if (loading && !user) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      {error && (
        <div className="mb-4 px-4 py-2 rounded border border-red-200 bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}
      {user && (
        <AccountForm
          initialUser={user}
          roles={roles}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/dashboard/usuarios")}
          loading={loading}
        />
      )}
    </div>
  );
}