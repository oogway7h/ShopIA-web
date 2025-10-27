import { useState, useEffect } from "react";
import { api } from "../../../services/apiClient.js";
import AccountForm from "../../../components/dashboard/UsuariosForm.jsx";
import { useNavigate } from "react-router-dom";

export default function UsuarioCreatePage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get("/api/cuenta/roles/")
      .then((r) => setRoles(Array.isArray(r) ? r : []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function handleSubmit(data) {
    setLoading(true);
    api.post("/api/cuenta/usuarios/", data)
      .then(() => navigate("/dashboard/usuarios"))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      {error && (
        <div className="mb-4 px-4 py-2 rounded border border-red-200 bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}
      <AccountForm
        roles={roles}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/dashboard/usuarios")}
        loading={loading}
      />
    </div>
  );
}