import React, { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
} from 'recharts';
import { ArrowLeft, AlertCircle, Loader2, Users, DollarSign, ShoppingCart, TrendingUp, FileText } from 'lucide-react';
import {useNavigate, useParams} from 'react-router-dom';
import {api} from '../../services/apiClient';
const API_BASE = import.meta.env.VITE_API_BASE;
import axios from "axios";




function StatsCard({ title, value, icon, formato }) {
  const Icon = icon;
  let valorFormateado = value;
  if (formato === 'moneda') {
    valorFormateado = `Bs. ${value.toFixed(2)}`;
  } else if (formato === 'entero') {
    valorFormateado = Math.round(value);
  }
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 flex items-center gap-6">
      <div className="p-4 bg-blue-100 rounded-full">
        <Icon className="w-8 h-8 text-blue-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{valorFormateado}</p>
      </div>
    </div>
  );
}

//garfico de ventas
function VentasChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="fecha" stroke="#666" />
        <YAxis yAxisId="left" stroke="#666" />
        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
        <Tooltip 
          formatter={(value, name) => name === 'Total Vendido' ? `Bs. ${value.toFixed(2)}` : value} 
        />
        <Legend />
        <Line 
          yAxisId="left" 
          type="monotone" 
          dataKey="total_vendido" 
          name="Total Vendido" 
          stroke="#3b82f6" 
          strokeWidth={3} 
          dot={{ r: 5 }} 
          activeDot={{ r: 8 }}
        />
        <Line 
          yAxisId="right" 
          type="monotone" 
          dataKey="num_ventas" 
          name="N° de Ventas" 
          stroke="#10b981" 
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

//Grafico de clientes
function ClientesChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="mes" stroke="#666" />
        <YAxis stroke="#666" />
        <Tooltip />
        <Legend />
        <Bar 
          dataKey="total" 
          name="Nuevos Clientes" 
          fill="#3b82f6" 
          radius={[4, 4, 0, 0]} 
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
//componente principal
const getISODate = (daysAgo = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

export default function DashboardReportePage() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [titulo, setTitulo] = useState("");
  
  const [fechas, setFechas] = useState({
    fecha_inicio: getISODate(29), 
    fecha_fin: getISODate(0)      
  });
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroProducto, setFiltroProducto] = useState("");
  const [formatoDescarga, setFormatoDescarga] = useState("pdf");
  const [loadingDescarga, setLoadingDescarga] = useState(false);
  

  const { reporteId } = useParams(); 
  const navigate = useNavigate();

  useEffect(() => {
    let apiUrl = "";
    
    if (reporteId === 'ventas') {
      apiUrl = "/api/reportes/ventasjson/";
      setTitulo("Dashboard de Ventas");
    } else if (reporteId === 'clientes') {
      apiUrl = "/api/reportes/clientesjson/";
      setTitulo("Dashboard de Clientes");
    } else {
      setError("Reporte no válido o no encontrado.");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    params.append('fecha_inicio', fechas.fecha_inicio);
    params.append('fecha_fin', fechas.fecha_fin);
    
    api.get(`${apiUrl}?${params.toString()}`)
      .then(data => {
        if (reporteId === 'ventas') {
          setChartData(data.datos_grafico_ventas || []);
        } else if (reporteId === 'clientes') {
          setChartData(data.datos_grafico_clientes || []);
        }
      })
      .catch(e => setError("No se pudieron cargar los datos. " + e.message))
      .finally(() => setLoading(false));
      
  }, [reporteId, fechas]);

  useEffect(() => {
    if (reporteId === 'ventas') {
      api.get("/api/categorias/") 
        .then(data => setCategorias(Array.isArray(data) ? data : []))
        .catch(e => console.error("Error cargando categorías", e));
    }
  }, [reporteId]); 

  useEffect(() => {
    if (filtroCategoria) {
      setProductos([]); 
      api.get(`/api/productos/?categoria=${filtroCategoria}`) 
        .then(data => setProductos(Array.isArray(data) ? data : []))
        .catch(e => console.error("Error cargando productos", e));
    } else {
      setProductos([]); 
    }
  }, [filtroCategoria]); 



  async function handleDescargarReporte() {
    setLoadingDescarga(true);
    setError("");
    
    let urlPath = "";
    let fileName = "";

    if (reporteId === 'ventas') {
      urlPath = formatoDescarga === 'pdf' 
        ? '/api/reportes/ventas/pdf/' 
        : '/api/reportes/ventas/excel/';
      fileName = `reporte_ventas.${formatoDescarga}`;
    } else if (reporteId === 'clientes') {
      urlPath = formatoDescarga === 'pdf' 
        ? '/api/reportes/clientes/pdf/' 
        : '/api/reportes/clientes/excel/';
      fileName = `reporte_clientes.${formatoDescarga}`;
    } else {
      setError("Tipo de reporte no válido para descarga.");
      setLoadingDescarga(false);
      return;
    }

    const params = new URLSearchParams();
    params.append('fecha_inicio', fechas.fecha_inicio);
    params.append('fecha_fin', fechas.fecha_fin);
    
    if (filtroCategoria) {
      params.append('categoria_id', filtroCategoria);
    }
    if (filtroProducto) {
      params.append('producto_id', filtroProducto);
    }

    const url = `${API_BASE}${urlPath}?${params.toString()}`;
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(url, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        responseType: "blob", 
      });

      const fileType = response.headers['content-type'] || 'application/octet-stream';
      const file = new Blob([response.data], { type: fileType });
      const fileURL = URL.createObjectURL(file);

      const link = document.createElement("a");
      link.href = fileURL;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      URL.revokeObjectURL(fileURL);

    } catch (e) {
      console.error(`Error al descargar ${fileName}:`, e);
      setError("Error al descargar el reporte: " + (e.message || "Error desconocido"));
    } finally {
      setLoadingDescarga(false);
    }
  }

  const estadisticas = useMemo(() => {
    if (reporteId === 'ventas') {
      const totalVendido = chartData.reduce((sum, item) => sum + (item.total_vendido || 0), 0);
      const totalVentas = chartData.reduce((sum, item) => sum + (item.num_ventas || 0), 0);
      const ticketPromedio = totalVentas > 0 ? totalVendido / totalVentas : 0;
      return [
        { id: 1, title: 'Ventas Totales (Periodo)', value: totalVendido, icon: DollarSign, formato: 'moneda' },
        { id: 2, title: 'N° de Transacciones', value: totalVentas, icon: ShoppingCart, formato: 'entero' },
        { id: 3, title: 'Ticket Promedio', value: ticketPromedio, icon: TrendingUp, formato: 'moneda' },
      ];
    }
    if (reporteId === 'clientes') {
      const totalClientes = chartData.reduce((sum, item) => sum + (item.total || 0), 0);
      return [
        { id: 1, title: 'Nuevos Clientes (Periodo)', value: totalClientes, icon: Users, formato: 'entero' },
      ];
    }
    return [];
  }, [chartData, reporteId]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/dashboard/reportes")} // Volver a la selección
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Volver a Reportes</span>
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{titulo}</h1>
          </div>
        </div>

        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-200 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filtrar Gráfico por Fecha</h3>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* Fecha Inicio */}
            <div className="w-full md:w-auto">
              <label htmlFor="fecha_inicio" className="block text-sm font-medium text-gray-700">
                Fecha Inicio
              </label>
              <input 
                type="date" 
                id="fecha_inicio"
                value={fechas.fecha_inicio}
                onChange={e => setFechas(f => ({...f, fecha_inicio: e.target.value}))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
              />
            </div>
            <div className="w-full md:w-auto">
              <label htmlFor="fecha_fin" className="block text-sm font-medium text-gray-700">
                Fecha Fin
              </label>
              <input 
                type="date" 
                id="fecha_fin"
                value={fechas.fecha_fin}
                onChange={e => setFechas(f => ({...f, fecha_fin: e.target.value}))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
              />
            </div>
          </div>
        </div>

        
        {loading && (
        <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-300">Cargando datos...</span>
        </div>
        )}

        {!loading && !error && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {estadisticas.map(stat => (
                <StatsCard key={stat.id} {...stat} />
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                {reporteId === 'ventas' ? 'Evolución de Ventas' : 'Crecimiento de Clientes'}
              </h2>
              {reporteId === 'ventas' && <VentasChart data={chartData} />}
              {reporteId === 'clientes' && <ClientesChart data={chartData} />}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Descarga Avanzada de Reportes</h2>
              <p className="text-sm text-gray-600 mb-6 -mt-4">
                Los filtros de fecha de arriba se aplicarán a la descarga.
                {reporteId === 'ventas' && " Puedes filtrar aún más por categoría o producto."}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                
                {/*selector de formato de descarga */}
                <div className="md:col-span-1">
                  <label htmlFor="formato" className="block text-sm font-medium text-gray-700">Formato</label>
                  <select 
                    id="formato" 
                    value={formatoDescarga} 
                    onChange={e => setFormatoDescarga(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="pdf">PDF</option>
                    <option value="xlsx">Excel</option>
                  </select>
                </div>

                {reporteId === 'ventas' && (
                  <div className="md:col-span-1">
                    <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">Categoría (Opcional)</label>
                    <select 
                      id="categoria"
                      value={filtroCategoria}
                      onChange={e => setFiltroCategoria(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="">Todas las Categorías</option>
                      {categorias.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                      ))}
                    </select>
                  </div>
                )}

                {reporteId === 'ventas' && (
                  <div className="md:col-span-1">
                    <label htmlFor="producto" className="block text-sm font-medium text-gray-700">Producto (Opcional)</label>
                    <select 
                      id="producto"
                      value={filtroProducto}
                      onChange={e => setFiltroProducto(e.target.value)}
                      disabled={!filtroCategoria || productos.length === 0}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                    >
                      <option value="">Todos en Categoría</option>
                      {productos.map(prod => (
                        <option key={prod.id} value={prod.id}>{prod.nombre}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className={reporteId === 'ventas' ? "md:col-span-1" : "md:col-span-3"}>
                  <button
                    onClick={handleDescargarReporte}
                    disabled={loadingDescarga}
                    className="w-full flex items-center justify-center gap-2 px-5 py-2.5 text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-md transition-colors font-semibold disabled:opacity-50"
                  >
                    {loadingDescarga ? <Loader2 size={20} className="animate-spin" /> : <FileText size={20} />}
                    <span>{loadingDescarga ? "Generando..." : "Descargar Reporte"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}