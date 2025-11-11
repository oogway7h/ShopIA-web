import { useEffect, useState } from "react";
import { getUser } from "../../services/auth.js";
import { api } from "../../services/apiClient.js";
import StatCard from "../../components/dashboard/StatCard.jsx";
import PrediccionesChart from "../../components/dashboard/PrediccionesChart.jsx";
import CrecimientoChart from "../../components/dashboard/CrecimientoChart.jsx";
import TopProductos from "../../components/dashboard/TopProductos.jsx";
import DialogoGenerarPrediccion from "../../components/ui/DialogoGenerarPrediccion.jsx";
import ToastNotification from "../../components/ui/ToastNotification.jsx";

export default function DashboardHome() {
  const user = getUser();

  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    color: "red",
  });

  const [stats, setStats] = useState({
    usuarios: 0,
    productos: 0,
    ventasMes: 0,
    prediccionesActivas: 0,
  });

  const [topProductos, setTopProductos] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [chartsKey, setChartsKey] = useState(0);

  // Cargar todos los datos
  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [
        categoriasRes,
        productosRes,
        topRes,
        resumenRes
      ] = await Promise.all([
        api.get("/api/categorias/").catch(() => ({ data: [] })), // <-- ahora categorías
        api.get("/api/productos/").catch(() => ({ data: [] })),
        api.get("/api/predicciones/productos-top/top-10/").catch(() => ({ top_10: [] })),
        api.get("/api/predicciones/ventas/resumen/").catch(() => null),
      ]);

      // Determinar si es array directo o tiene results
      const categoriasArray = Array.isArray(categoriasRes)
        ? categoriasRes
        : categoriasRes.results || categoriasRes.data || [];
      const productosArray = Array.isArray(productosRes)
        ? productosRes
        : productosRes.results || productosRes.data || [];

      // Filtrar productos activos (estado=true)
      const productosActivos = productosArray.filter((p) => p.estado === true);

      setStats({
        usuarios: categoriasArray.length, // <-- ahora muestra cantidad de categorías
        productos: productosActivos.length,
        ventasMes: resumenRes?.prediccion_total?.monto_estimado ?? 0,
        prediccionesActivas: resumenRes?.top_categorias?.length ?? 0,
      });

      setTopProductos(topRes.top_10 ?? []);
      setResumen(resumenRes);
      setChartsKey((prev) => prev + 1);
    } catch {
      setToast({
        open: true,
        message: "Error al cargar datos del dashboard",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔄 REGENERAR TODO EL SISTEMA DE PREDICCIONES
  const handleRegenerarPredicciones = async () => {
    setGenerando(true);

    try {
      const result = await api.post(
        "/api/predicciones/ventas/generar-nueva/",
        {}
      );

      setToast({
        open: true,
        message: `✅ Predicciones regeneradas! Período: ${result.periodo}`,
        color: "green",
      });

      // Recarga todos los datos del dashboard
      await cargarDatos();
    } catch (error) {
      setToast({
        open: true,
        message: `❌ Error: ${error.message || "Error desconocido"}`,
        color: "red",
      });
    } finally {
      setGenerando(false);
      setShowDialog(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    /// eslint-disable-next-line
  }, []);

  const formatCurrency = (value) => {
    return `Bs ${value?.toLocaleString("es-BO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8">
      {/* Header con botón de regeneración */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 md:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              ¡Bienvenido, {user?.nombre || "Administrador"}!
            </h1>
            <p className="text-blue-100 text-sm md:text-base">
              Dashboard de Predicciones con IA
            </p>
          </div>
          <button
            onClick={() => setShowDialog(true)}
            disabled={generando || loading}
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 w-full md:w-auto justify-center shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
          >
            {generando ? (
              <>
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.418 2A8.001 8.001 0 114.582 9M4 4l16 16"
                  />
                </svg>
                Regenerando...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.418 2A8.001 8.001 0 114.582 9M4 4l16 16"
                  />
                </svg>
                Regenerar Predicciones
              </>
            )}
          </button>
        </div>
      </div>

      {/* Diálogo de confirmación */}
      <DialogoGenerarPrediccion
        open={showDialog}
        loading={generando}
        onConfirm={handleRegenerarPredicciones}
        onCancel={() => setShowDialog(false)}
      />

      {/* Toast de notificaciones */}
      <ToastNotification
        open={toast.open}
        message={toast.message}
        color={toast.color}
        onClose={() => setToast({ ...toast, open: false })}
        duration={5000}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          label="Categorías de Productos"
          value={stats.usuarios.toLocaleString()}
          color="blue"
          loading={loading}
        />
        <StatCard
          label="Productos Activos"
          value={stats.productos.toLocaleString()}
          color="green"
          loading={loading}
        />
        <StatCard
          label="Ventas Estimadas"
          value={formatCurrency(stats.ventasMes)}
          color="yellow"
          loading={loading}
        />
        <StatCard
          label="Predicciones Activas"
          value={stats.prediccionesActivas.toLocaleString()}
          color="purple"
          loading={loading}
        />
      </div>

      {/* Gráficas principales con key para forzar refresco */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PrediccionesChart key={`pred-${chartsKey}`} />
        <CrecimientoChart key={`crec-${chartsKey}`} />
      </div>

      {/* Top productos + Resumen */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <TopProductos productos={topProductos} />
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            Resumen del Próximo Mes
          </h3>
          {resumen?.prediccion_total ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm opacity-90 mb-1">
                  Ventas Totales Estimadas
                </p>
                <p className="text-3xl font-bold">
                  {formatCurrency(resumen.prediccion_total.monto_estimado)}
                </p>
              </div>
              <div>
                <p className="text-sm opacity-90 mb-1">Productos Estimados</p>
                <p className="text-2xl font-semibold">
                  {resumen.prediccion_total.cantidad_estimada?.toLocaleString() ||
                    0}{" "}
                  unidades
                </p>
              </div>
              <div className="pt-4 border-t border-white/20">
                <p className="text-sm opacity-90 mb-2">Top Categorías</p>
                <div className="space-y-2">
                  {resumen.top_categorias?.slice(0, 3).map((cat, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="truncate mr-2">
                        {cat.categoria_nombre}
                      </span>
                      <span className="font-semibold whitespace-nowrap">
                        {formatCurrency(cat.monto_estimado)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm opacity-90 mb-3">
                No hay predicciones disponibles
              </p>
              <button
                onClick={() => setShowDialog(true)}
                disabled={generando}
                className="text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                Generar Ahora
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
