export default function TopProductos({ productos = [] }) {
  const getMedalla = (ranking) => {
    return `#${ranking}`;
  };

  const formatCurrency = (value) => {
    return `Bs ${value.toLocaleString("es-BO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          Top 10 Productos Más Vendidos
        </h3>
        <span className="text-sm text-gray-500">Este mes</span>
      </div>

      {productos.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No hay productos vendidos</p>
          <p className="text-sm">Realiza algunas ventas para ver el ranking</p>
        </div>
      ) : (
        <div className="space-y-3">
          {productos.map((prod) => (
            <div
              key={prod.id}
              className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <span className="text-2xl font-bold w-12 text-center">
                  {getMedalla(prod.ranking)}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800 truncate">
                    {prod.producto_detalle?.nombre || "Producto"}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {prod.cantidad_vendida} unidades
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold text-gray-900">
                  {formatCurrency(prod.monto_total)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
