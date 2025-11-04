import React, { useState, useEffect } from "react";
import SmartTable from "../../../components/tabla/SmartTable.jsx"; 
import ConfirmDialog from "../../../components/ui/dialogo.jsx"; 
import { api } from "../../../services/apiClient.js"; 
import { useNavigate } from "react-router-dom"; 


export default function MetodosPagoIndexPage() {
  const [loading, setLoading] = useState(false);
  const [metodosPago, setMetodosPago] = useState([]);
  const [deleteMetodo, setDeleteMetodo] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  
  function cargar() {
    setLoading(true);
    setError("");
    api.get("/api/ventas/metodos/")
      .then(data => {
        setMetodosPago(Array.isArray(data) ? data : []);
      })
      .catch(e => setError("No se pudieron cargar los métodos de pago. " + e.message))
      .finally(() => setLoading(false));
  }


  useEffect(() => {
    cargar();
  }, []);


  function onCreate() {

    navigate("/dashboard/pagos/create"); 
  }

  // Navegar a la página de edición
  function onEdit(row) {

    navigate(`/dashboard/pagos/edit/${row.id}`);
  }


  function onDelete(row) {
    const metodo = metodosPago.find(m => m.id === row.id);
    if (!metodo) return;
    setDeleteMetodo(metodo);
  }


  function confirmDelete() {
    if (!deleteMetodo) return;
    setLoading(true);
    api.del(`/api/ventas/metodos/${deleteMetodo.id}/`)
      .then(() => {
        setDeleteMetodo(null); 
        cargar(); 
      })
      .catch(e => {
        setError("Error al eliminar el método de pago. " + e.message);
        setLoading(false); 
      });
      
  }

  
  const rows = metodosPago.map(m => ({
    id: m.id,
    nombre: m.nombre,
    descripcion: m.descripcion || '—', //muestra '—' si no hay descripción
    activo: m.activo,
  }));

  return (
    <div className="space-y-8 p-8 bg-gray-50 min-h-screen">
      {error && (
        <div className="px-4 py-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">
          <p className="font-bold">Ha ocurrido un error:</p>
          <p>{error}</p>
        </div>
      )}

      <SmartTable
        titulo="Métodos de Pago"
        data={rows}
        loading={loading}
        columns={[
          { key: "id", label: "ID", width: "70px", enableSort: true },
          { key: "nombre", label: "Nombre", enableSort: true },
          {
            key: "activo",
            label: "Estado",
            render: (row) => (
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${
                  row.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                }`}
              >
                {row.activo ? "Activo" : "Inactivo"}
              </span>
            ),
            width: "110px"
          }
        ]}
        onCreate={onCreate}
        onEdit={onEdit}
        onDelete={onDelete}
        emptyMessage="No hay métodos de pago registrados."
      />

      <ConfirmDialog
        open={!!deleteMetodo}
        title="Eliminar Método de Pago"
        message={`¿Seguro que deseas eliminar el método "${deleteMetodo?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={loading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteMetodo(null)}
      />
    </div>
  );
}
