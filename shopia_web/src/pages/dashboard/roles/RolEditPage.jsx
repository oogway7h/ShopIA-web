import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RoleForm from "../../../components/dashboard/RoleForm.jsx";
import { api } from "../../../services/apiClient.js";

export default function RolEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    setLoading(true);
    api.get(`/api/cuenta/roles/${id}/`)
      .then(data => setRole(data))
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  function guardar(data) {
    setLoading(true);
    setErr("");
    api.put(`/api/cuenta/roles/${id}/`, { nombre: data.nombre })
      .then(() => navigate("/dashboard/usuarios/roles"))
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }

  if (!role && !err) return <div className="p-4 text-sm">Cargando...</div>;

  return (
    <div className="p-4 space-y-4">
      {err && (
        <div className="px-4 py-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {err}
        </div>
      )}
      {role && (
        <RoleForm
          initialRole={role}
          onSubmit={guardar}
          onCancel={() => navigate("/dashboard/usuarios/roles")}
          loading={loading}
        />
      )}
    </div>
  );
}