import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleForm from "../../../components/dashboard/RoleForm.jsx";
import { api } from "../../../services/apiClient.js";

export default function RolCreatePage() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  function crear(data) {
    setLoading(true);
    setErr("");
    api.post("/api/cuenta/roles/", { nombre: data.nombre })
      .then(() => navigate("/dashboard/usuarios/roles"))
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }

  return (
    <div className="p-4 space-y-4">
      {err && (
        <div className="px-4 py-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {err}
        </div>
      )}
      <RoleForm
        onSubmit={crear}
        onCancel={() => navigate("/dashboard/usuarios/roles")}
        loading={loading}
      />
    </div>
  );
}