import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useState, useEffect } from 'react';
import { api } from '../../services/apiClient';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function PrediccionesChart() {
  const [data, setData] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/predicciones/ventas/historico-predicciones/')
      .then(res => {
        setData(res.datos || []);
        setEstadisticas(res.estadisticas || null);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (value) => {
    return `Bs ${value.toLocaleString('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const ultimoPeriodoReal = data.filter(d => d.tipo === 'real').slice(-1)[0]?.periodo;

  if (loading) {
    return <div className="bg-white rounded-xl shadow-sm border p-6 animate-pulse h-96" />;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      {/* Header con estadísticas */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Ventas Históricas y Predicciones
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Últimos 6 meses
            </p>
          </div>
        </div>

        {/* Métricas resumidas */}
        {estadisticas && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Promedio Mensual</p>
              <p className="text-sm font-bold text-gray-900">
                {formatCurrency(estadisticas.monto_promedio)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Mes Máximo</p>
              <p className="text-sm font-bold text-green-600">
                {formatCurrency(estadisticas.monto_maximo)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Mes Mínimo</p>
              <p className="text-sm font-bold text-red-600">
                {formatCurrency(estadisticas.monto_minimo)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Crecimiento Promedio</p>
              <p className={`text-sm font-bold flex items-center justify-center gap-1 ${
                estadisticas.crecimiento_promedio > 0 ? 'text-green-600' : 
                estadisticas.crecimiento_promedio < 0 ? 'text-red-600' : 
                'text-gray-600'
              }`}>
                {estadisticas.crecimiento_promedio > 0 ? <TrendingUp size={14} /> : 
                 estadisticas.crecimiento_promedio < 0 ? <TrendingDown size={14} /> : 
                 <Minus size={14} />}
                {estadisticas.crecimiento_promedio > 0 ? '+' : ''}{estadisticas.crecimiento_promedio}%
              </p>
            </div>
          </div>
        )}
      </div>
      
      {data.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No hay datos</p>
          <p className="text-sm">Realiza ventas y genera predicciones</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="periodo" 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const dato = payload[0].payload;
                return (
                  <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-bold text-gray-900 mb-1">{dato.periodo}</p>
                    <p className="text-sm text-gray-600">
                      {dato.tipo === 'real' ? 'Ventas reales' : 'Predicción IA'}
                    </p>
                    <p className="text-lg font-bold text-blue-600 mt-1">
                      {formatCurrency(dato.monto)}
                    </p>
                    {dato.crecimiento !== 0 && (
                      <p className={`text-sm mt-1 flex items-center gap-1 ${
                        dato.crecimiento > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {dato.crecimiento > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {dato.crecimiento > 0 ? '+' : ''}{dato.crecimiento}% vs anterior
                      </p>
                    )}
                  </div>
                );
              }}
            />
            <Legend />
            
            {/* Línea divisoria */}
            {ultimoPeriodoReal && (
              <ReferenceLine 
                x={ultimoPeriodoReal} 
                stroke="#94a3b8" 
                strokeDasharray="5 5"
                label={{ 
                  value: 'Predicciones →', 
                  position: 'top', 
                  fill: '#64748b',
                  fontSize: 12
                }}
              />
            )}
            
            {/* Línea de ventas reales */}
            <Line 
              type="monotone" 
              dataKey={(d) => d.tipo === 'real' ? d.monto : null}
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 5 }}
              activeDot={{ r: 7 }}
              name="Ventas Reales"
              connectNulls={false}
            />
            
            {/* Línea de predicciones */}
            <Line 
              type="monotone" 
              dataKey={(d) => d.tipo === 'prediccion' ? d.monto : null}
              stroke="#a855f7" 
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ fill: '#a855f7', r: 5, strokeDasharray: '' }}
              activeDot={{ r: 7 }}
              name="Predicción IA"
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Leyenda mejorada */}
      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-blue-600"></div>
          <span className="text-gray-600">Ventas reales</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-purple-600" style={{ borderTop: '2px dashed' }}></div>
          <span className="text-gray-600">Predicciones IA</span>
        </div>
      </div>
    </div>
  );
}
