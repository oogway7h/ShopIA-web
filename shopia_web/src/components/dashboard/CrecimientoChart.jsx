import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useState, useEffect } from 'react';
import { api } from '../../services/apiClient';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

export default function CrecimientoChart() {
  const [data, setData] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mesInfo, setMesInfo] = useState({ actual: '', anterior: '' });

  useEffect(() => {
    api.get('/api/predicciones/crecimiento/')
      .then(res => {
        const crecimientos = res.crecimientos || [];
        setData(
          crecimientos.map(c => ({
            nombre: c.categoria_nombre || 'Sin categoría',
            porcentaje: c.porcentaje_cambio,
            tendencia: c.tendencia,
            mes_actual: c.mes_actual,
            mes_anterior: c.mes_anterior
          }))
        );
        setEstadisticas(res.estadisticas || null);
        setMesInfo({
          actual: res.mes_actual,
          anterior: res.mes_anterior
        });
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getColor = (porcentaje) => {
    if (porcentaje >= 20) return '#10b981';
    if (porcentaje >= 5) return '#34d399';
    if (porcentaje >= -5) return '#fbbf24';
    if (porcentaje >= -20) return '#f97316';
    return '#ef4444';
  };

  const formatCurrency = (value) => {
    return `Bs ${value.toLocaleString('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  if (loading) {
    return <div className="bg-white rounded-xl shadow-sm border p-6 animate-pulse h-96" />;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Crecimiento por Categoría
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {mesInfo.actual} vs {mesInfo.anterior}
            </p>
          </div>
        </div>

        {/* Estadísticas resumidas */}
        {estadisticas && (
          <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Creciendo</p>
              <p className="text-lg font-bold text-green-600 flex items-center justify-center gap-1">
                <TrendingUp size={16} />
                {estadisticas.categorias_creciendo}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">En Caída</p>
              <p className="text-lg font-bold text-red-600 flex items-center justify-center gap-1">
                <TrendingDown size={16} />
                {estadisticas.categorias_cayendo}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Promedio</p>
              <p className={`text-lg font-bold ${
                estadisticas.crecimiento_promedio > 0 ? 'text-green-600' : 
                estadisticas.crecimiento_promedio < 0 ? 'text-red-600' : 
                'text-gray-600'
              }`}>
                {estadisticas.crecimiento_promedio > 0 ? '+' : ''}{estadisticas.crecimiento_promedio}%
              </p>
            </div>
          </div>
        )}
      </div>
      
      {data.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg mb-2">No hay datos de crecimiento</p>
          <p className="text-sm">Espera a tener ventas de meses anteriores</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              type="number" 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `${value > 0 ? '+' : ''}${value.toFixed(0)}%`}
            />
            <YAxis 
              type="category" 
              dataKey="nombre" 
              stroke="#9ca3af"
              style={{ fontSize: '11px' }}
              width={120}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const dato = payload[0].payload;
                return (
                  <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-bold text-gray-900 mb-2">{dato.nombre}</p>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600">
                        Mes actual: <span className="font-semibold">{formatCurrency(dato.mes_actual)}</span>
                      </p>
                      <p className="text-gray-600">
                        Mes anterior: <span className="font-semibold">{formatCurrency(dato.mes_anterior)}</span>
                      </p>
                      <p className={`font-bold text-lg ${
                        dato.porcentaje > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {dato.porcentaje > 0 ? '+' : ''}{dato.porcentaje.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="porcentaje" radius={[0, 8, 8, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.porcentaje)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Leyenda de colores */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10b981' }}></div>
          <span className="text-gray-600">+20% o más</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#34d399' }}></div>
          <span className="text-gray-600">+5% a +20%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#fbbf24' }}></div>
          <span className="text-gray-600">-5% a +5%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f97316' }}></div>
          <span className="text-gray-600">-20% a -5%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }}></div>
          <span className="text-gray-600">-20% o menos</span>
        </div>
      </div>
    </div>
  );
}