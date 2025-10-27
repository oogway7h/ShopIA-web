import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SmartTable from "../../../components/tabla/SmartTable.jsx";
import ConfirmDialog from "../../../components/ui/dialogo.jsx";
import { api } from "../../../services/apiClient.js";

export default function NotificacionesPage() {
  const [loading, setLoading] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [deleteItem, setDeleteItem] = useState(null);
  const [error, setError] = useState("");
  const [vistaModoLeidas, setVistaModoLeidas] = useState(false); // false = notificaciones, true = leídas
  const navigate = useNavigate();

  function cargar() {
    setLoading(true);
    setError("");

    const endpoint = vistaModoLeidas
      ? "/api/cuenta/notificacionesleida/"
      : "/api/cuenta/notificaciones/";

    api.get(endpoint)
      .then((data) => {
        if (vistaModoLeidas) {
          // Aquí el backend devuelve un array directamente
          setNotificaciones(Array.isArray(data) ? data : []);
        } else {
          setNotificaciones(Array.isArray(data) ? data : []);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vistaModoLeidas]);

  function onCreate() {
    navigate("/dashboard/notificaciones/create");
  }

  function onEdit(row) {
    navigate(`/dashboard/notificaciones/edit/${row.id}`);
  }

  function onDelete(row) {
    const notificacion = notificaciones.find((n) => n.id === row.id);
    if (!notificacion) return;
    setDeleteItem(notificacion);
  }

  function confirmDelete() {
    if (!deleteItem) return;
    setLoading(true);
    api.del(`/api/cuenta/notificaciones/${deleteItem.id}/`)
      .then(() => {
        setDeleteItem(null);
        cargar();
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  function toggleVista() {
    setVistaModoLeidas(!vistaModoLeidas);
  }

  // Función para formatear fecha
  function formatearFecha(fechaISO) {
    if (!fechaISO) return "—";
    const fecha = new Date(fechaISO);
    return `${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  // Función para renderizar tipo con color
  function renderTipo(row, tipo) {
    const colores = {
      info: "bg-blue-100 text-blue-800",
      warning: "bg-yellow-100 text-yellow-800",
      error: "bg-red-100 text-red-800",
      success: "bg-green-100 text-green-800",
      promocion: "bg-purple-100 text-purple-800",
      sistema: "bg-gray-100 text-gray-800"
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colores[tipo] || colores.info}`}>
        {tipo}
      </span>
    );
  }

  // Función para renderizar estado
  function renderEstado(row, estado) {
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
        estado ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}>
        {estado ? "Activa" : "Inactiva"}
      </span>
    );
  }

  // Función para renderizar porcentaje de lectura
  function renderPorcentaje(row, porcentaje) {
    const color = porcentaje >= 80 ? "text-green-600" : porcentaje >= 50 ? "text-yellow-600" : "text-red-600";
    return (
      <span className={`font-medium ${color}`}>
        {porcentaje}%
      </span>
    );
  }

  // Preparar datos para la tabla según la vista
  let rows, columns;

  if (vistaModoLeidas) {
    // Vista de notificaciones leídas
    rows = notificaciones.map((lectura) => ({
      id: lectura.id,
      notificacion_titulo: lectura.notificacion_titulo || "—",
      usuario_nombre: lectura.usuario_nombre || "—",
      fecha_lectura: lectura.fecha_lectura || "—",
      plataforma_lectura: lectura.plataforma_lectura || "web"
    }));

    columns = [
      { key: "id", label: "ID", width: "60px", enableSort: true },
      { key: "notificacion_titulo", label: "Notificación", enableSort: true },
      { key: "usuario_nombre", label: "Usuario", enableSort: true },
      { 
        key: "fecha_lectura", 
        label: "Fecha de Lectura", 
        enableSort: true,
        render: (r, value) => formatearFecha(value)
      },
      { 
        key: "plataforma_lectura", 
        label: "Plataforma", 
        width: "100px",
        render: (r, plataforma) => (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
            {plataforma}
          </span>
        )
      }
    ];
  } else {
    // Vista de notificaciones normales
    rows = notificaciones.map((n) => ({
      id: n.id,
      titulo: n.titulo || "—",
      tipo: n.tipo || "info",
      plataforma: n.plataforma || "web",
      estado: n.estado,
      fecha_creacion: n.fecha_creacion || "—",
      total_usuarios_objetivo: n.total_usuarios_objetivo || 0,
      total_lecturas: n.total_lecturas || 0,
      porcentaje_leido: n.porcentaje_leido || 0
    }));

    columns = [
      { key: "id", label: "ID", width: "60px", enableSort: true },
      { key: "titulo", label: "Título", enableSort: true },
      { 
        key: "tipo", 
        label: "Tipo", 
        width: "120px",
        enableSort: true,
        render: renderTipo
      },
      { 
        key: "plataforma", 
        label: "Plataforma", 
        width: "100px",
        render: (r, plataforma) => (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
            {plataforma}
          </span>
        )
      },
      { 
        key: "estado", 
        label: "Estado", 
        width: "90px",
        enableSort: true,
        render: renderEstado
      },
      { 
        key: "fecha_creacion", 
        label: "Fecha Creación", 
        enableSort: true,
        render: (r, value) => formatearFecha(value),
        hideBelow: "md"
      },
      { 
        key: "total_usuarios_objetivo", 
        label: "Destinatarios", 
        width: "100px",
        enableSort: true,
        hideBelow: "lg"
      },
      { 
        key: "total_lecturas", 
        label: "Leídas", 
        width: "80px",
        enableSort: true,
        hideBelow: "lg"
      },
      { 
        key: "porcentaje_leido", 
        label: "% Leído", 
        width: "80px",
        enableSort: true,
        render: renderPorcentaje,
        hideBelow: "md"
      }
    ];
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="px-4 py-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
          {error}
        </div>
      )}

      <SmartTable
        titulo={vistaModoLeidas ? "Notificaciones Leídas" : "Notificaciones"}
        data={rows}
        loading={loading}
        columns={columns}
        onCreate={vistaModoLeidas ? null : onCreate}
        onEdit={vistaModoLeidas ? null : onEdit}
        onDelete={vistaModoLeidas ? null : onDelete}
        hideActions={vistaModoLeidas}
        customHeaderActions={
          <button
            onClick={toggleVista}
            className={`px-4 py-3 text-sm rounded-xl font-medium border-2 transition-all duration-200 flex items-center gap-2 ${
              vistaModoLeidas
                ? "bg-blue-50 border-blue-300 text-blue-800 hover:bg-blue-100 shadow-md"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm"
            }`}
          >
            <span>{vistaModoLeidas ? "📊" : "👁️"}</span>
            <span className="hidden sm:inline">
              {vistaModoLeidas ? "Ver Notificaciones" : "Ver Lecturas"}
            </span>
            <span className="sm:hidden">
              {vistaModoLeidas ? "Notificaciones" : "Lecturas"}
            </span>
          </button>
        }
      />

      <ConfirmDialog
        open={!!deleteItem}
        title="Eliminar Notificación"
        message={`¿Eliminar notificación "${deleteItem?.titulo}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={loading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteItem(null)}
      />
    </div>
  );
}