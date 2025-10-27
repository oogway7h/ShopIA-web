import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SmartTable from "../../../components/tabla/SmartTable.jsx";
import ConfirmDialog from "../../../components/ui/dialogo.jsx";
import { api } from "../../../services/apiClient.js";

export default function ClientesPage() {
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [deleteItem, setDeleteItem] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function cargar() {
    setLoading(true);
    setError("");
    api.get("/api/cuenta/clientes/")
      .then((data) => setClientes(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    cargar();
  }, []);

  function onCreate() {
    navigate("/dashboard/clientes/create");
  }

  function onEdit(row) {
    navigate(`/dashboard/clientes/edit/${row.id}`);
  }

  function onDelete(row) {
    const cliente = clientes.find((c) => c.id === row.id);
    if (!cliente) return;
    setDeleteItem(cliente);
  }

  function confirmDelete() {
    if (!deleteItem) return;
    setLoading(true);
    api.del(`/api/cuenta/clientes/${deleteItem.id}/`)
      .then(() => {
        setDeleteItem(null);
        cargar();
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  // Formatear estado
  function renderEstado(row, estado) {
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
        estado ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}>
        {estado ? "Activo" : "Inactivo"}
      </span>
    );
  }

  const rows = clientes.map((c) => ({
    id: c.id,
    nombre_completo: c.nombre_completo || `${c.nombre} ${c.apellido}`,
    correo: c.correo,
    telefono: c.telefono,
    estado: c.estado
  }));

  const columns = [
    { key: "id", label: "ID", width: "60px", enableSort: true },
    { key: "nombre_completo", label: "Nombre Completo", enableSort: true },
    { key: "correo", label: "Correo", enableSort: true },
    { key: "telefono", label: "Teléfono", enableSort: true },
    { key: "estado", label: "Estado", width: "90px", enableSort: true, render: renderEstado }
  ];

  return (
    <div className="space-y-8">
      {error && (
        <div className="px-4 py-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
          {error}
        </div>
      )}

      <SmartTable
        titulo="Clientes"
        data={rows}
        loading={loading}
        columns={columns}
        onCreate={onCreate}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <ConfirmDialog
        open={!!deleteItem}
        title="Eliminar Cliente"
        message={`¿Eliminar cliente "${deleteItem?.nombre_completo}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={loading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteItem(null)}
      />
    </div>
  );
}