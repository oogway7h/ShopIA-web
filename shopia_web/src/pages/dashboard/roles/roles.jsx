import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SmartTable from "../../../components/tabla/SmartTable.jsx";
import { api } from "../../../services/apiClient.js";
import ConfirmDialog from "../../../components/ui/dialogo.jsx";

export default function RolesPage() {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState("");
  const [deleteRol, setDeleteRol] = useState(null);
  const navigate = useNavigate();

  function cargar() {
    setLoading(true);
    setError("");
    api
      .get("/api/cuenta/roles/")
      .then((data) => setRoles(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    cargar();
  }, []);

  function onDelete(row) {
    const rol = roles.find((r) => r.id === row.id);
    if (!rol) return;
    setDeleteRol(rol);
  }

  function confirmDelete() {
    if (!deleteRol) return;
    setLoading(true);
    api
      .del(`/api/cuenta/roles/${deleteRol.id}/`)
      .then(() => {
        setDeleteRol(null);
        cargar();
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="px-4 py-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {error}
        </div>
      )}
      <SmartTable
        titulo="Roles"
        data={roles}
        loading={loading}
        columns={[
          { key: "id", label: "ID", width: "70px", enableSort: true },
          { key: "nombre", label: "Nombre", enableSort: true },
        ]}
        onCreate={() => navigate("/dashboard/usuarios/roles/nuevo")}
        onEdit={(row) => navigate(`/dashboard/usuarios/roles/${row.id}/editar`)}
        onDelete={onDelete}
      />

      <ConfirmDialog
        open={!!deleteRol}
        title="Eliminar Rol"
        message={`¿Seguro que deseas eliminar "${deleteRol?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={loading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteRol(null)}
      />
    </div>
  );
}
