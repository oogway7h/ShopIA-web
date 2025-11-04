import { useEffect, useState } from "react";
import SmartTable from "../../../components/tabla/SmartTable.jsx";
import { api } from "../../../services/apiClient.js";

export default function VentaLogPage() {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [error, setError] = useState("");

  function cargar() {
    setLoading(true);
    setError("");
    api
      .get("/api/ventas/ventas/")
      .then((d) => setList(Array.isArray(d.results) ? d.results : d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    cargar();
  }, []);

  const rows = list.map((v) => ({
    id: v.id,
    usuario: v.usuario,
    fecha: v.fecha,
    estado: v.estado,
    direccion: v.direccion,
    total: v.monto_total,
  }));

  function renderFecha(row, value) {
    if (!value) return "—";
    const d = new Date(value);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  function renderEstado(row, value) {
    switch (value) {
      case "PENDIENTE": return <span className="text-yellow-600 font-semibold">Pendiente</span>;
      case "PAGADA": return <span className="text-green-600 font-semibold">Pagada</span>;
      case "ENVIADA": return <span className="text-blue-600 font-semibold">Enviada</span>;
      case "CANCELADA": return <span className="text-red-600 font-semibold">Cancelada</span>;
      default: return value;
    }
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="px-4 py-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
          {error}
        </div>
      )}

      <SmartTable
        titulo="Log de Ventas"
        data={rows}
        loading={loading}
        columns={[
          { key: "id", label: "ID", width: "60px", enableSort: true },
          { key: "usuario", label: "Usuario", enableSort: true },
          { key: "fecha", label: "Fecha", enableSort: true, render: renderFecha },
          { key: "estado", label: "Estado", enableSort: true, render: renderEstado },
          { key: "direccion", label: "Dirección", enableSort: true },
          { key: "total", label: "Total (Bs)", enableSort: true },
        ]}
        actionsRender={false}
        onCreate={null}
        onEdit={null}
        onDelete={null}
        hideActions={true}
      />
    </div>
  );
}