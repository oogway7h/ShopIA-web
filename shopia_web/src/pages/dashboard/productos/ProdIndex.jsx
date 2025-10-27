import { useEffect, useState } from "react";
import SmartTable from "../../../components/tabla/SmartTable.jsx";
import ConfirmDialog from "../../../components/ui/dialogo.jsx";
import { api } from "../../../services/apiClient.js";
import { useNavigate } from "react-router-dom";

export default function ProductosIndexPage() {
  const [loading, setLoading] = useState(false);
  const [productos, setProductos] = useState([]);
  const [deleteProducto, setDeleteProducto] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();


  function cargar() {
    setLoading(true);
    setError("");
    api.get("/api/productos/")
      .then(data => {
        setProductos(Array.isArray(data) ? data : []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }


  useEffect(() => {
    cargar();
  }, []);


  function onCreate() {
    navigate("/dashboard/productos/create");
  }


  function onEdit(row) {
    navigate(`/dashboard/productos/edit/${row.id}`);
  }


  function onDelete(row) {
    const producto = productos.find(p => p.id === row.id);
    if (!producto) return;
    setDeleteProducto(producto);
  }


  function confirmDelete() {
    if (!deleteProducto) return;
    setLoading(true);
    api.del(`/api/productos/${deleteProducto.id}/`)
      .then(() => {
        setDeleteProducto(null);
        cargar();
      })
      .catch(e => {
        setError("Error al eliminar el producto. " + e.message);
        setLoading(false);
      });
  }

  
  const rows = productos.map(p => ({
    id: p.id,
    nombre: p.nombre,
    marca:p.marca,
    categoria: p.categoria?.nombre || 'Sin categoría', 
    precio: `Bs ${parseFloat(p.precio).toFixed(2)}`, 
    stock: p.stock,
    descuento:p.descuento*100,

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
        titulo="Productos"
        data={rows}
        loading={loading}
        columns={[
          { key: "id", label: "ID", width: "70px", enableSort: true },
          { key: "nombre", label: "Nombre", enableSort: true },
          {key: "marca", label: "Marca", enableSort: true, width:"100px"},
          { key: "categoria", label: "Categoría", enableSort: true, hideBelow: "sm" },
          { key: "precio", label: "Precio", enableSort: true, width: "100px" },
          { key: "stock", label: "Stock", enableSort: true, width: "100px" },
          {key: "descuento", label: "Descuento %", enableSort: true, width:"100px"},
        ]}
        onCreate={onCreate}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <ConfirmDialog
        open={!!deleteProducto}
        title="Eliminar Producto"
        message={`¿Seguro que deseas eliminar el producto "${deleteProducto?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={loading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteProducto(null)}
      />
    </div>
  );
}