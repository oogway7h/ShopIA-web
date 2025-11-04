import { useEffect, useState } from "react";
import SmartTable from "../../../components/tabla/SmartTable.jsx";
import ConfirmDialog from "../../../components/ui/dialogo.jsx";
import { api } from "../../../services/apiClient.js";
import { useNavigate } from "react-router-dom";




export default function CategoriasIndexPage() {
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [deleteCategoria, setDeleteCategoria] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate(); 

  //cargar datos de categorias el modelo
  function cargar() {
    setLoading(true);
    setError("");
    api.get("/api/categorias/")
      .then(data => {
        setCategorias(Array.isArray(data) ? data : []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  //montar el compo
  useEffect(() => {
    cargar();
  }, []);

  //navegar a crear
  function onCreate() {
    navigate("/dashboard/categorias/create");
  }

  //navegar a editar
  function onEdit(row) {
    navigate(`/dashboard/categorias/edit/${row.id}`);
  }

  //eliminar categoria
  function onDelete(row) {
    const categoria = categorias.find(c => c.id === row.id);
    if (!categoria) return;
    setDeleteCategoria(categoria);
  }

  
  function confirmDelete() {
    if (!deleteCategoria) return;
    setLoading(true);
    api.del(`/api/categorias/${deleteCategoria.id}/`)
      .then(() => {
        setDeleteCategoria(null);
        cargar(); // Recarga la lista de categorías
      })
      .catch(e => {
        setError("Error al eliminar. Es posible que tenga productos asociados. " + e.message);
        setLoading(false);
      });
  }


  const rows = categorias.map(c => ({
    id: c.id,
    nombre: c.nombre,
    descripcion: c.descripcion || '—', 
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
        titulo="Categorías"
        data={rows}
        loading={loading}
        columns={[
          { key: "id", label: "ID", width: "70px", enableSort: true },
          { key: "nombre", label: "Nombre", enableSort: true },
          { key: "descripcion", label: "Descripción", hideBelow: "sm" },
        ]}
        onCreate={onCreate}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      
      <ConfirmDialog
        open={!!deleteCategoria}
        title="Eliminar Categoría"
        message={`¿Seguro que deseas eliminar la categoría "${deleteCategoria?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={loading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteCategoria(null)}
      />
    </div>
  );
}

