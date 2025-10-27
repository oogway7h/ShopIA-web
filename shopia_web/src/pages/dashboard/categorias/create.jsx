import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../services/apiClient.js";
import CategoriasForm from "../../../components/dashboard/CategoriasForm.jsx";

export default function CategoriaCreatePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleSubmit(data) {
    setLoading(true);
    api.post("/api/categorias/", data)
      .then(() => navigate("/dashboard/categorias"))
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
      <CategoriasForm
        onSubmit={handleSubmit}
        onCancel={() => navigate("/dashboard/categorias")}
        loading={loading}
      />
    </div>
  );
}
