import React, { useEffect, useState } from "react";
import { api } from "../../services/apiClient";

export default function UserNotifications() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("todas"); // todas, leidas, no-leidas

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  const fetchNotificaciones = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get("/api/cuenta/mis-notificaciones/");
      setNotificaciones(data.results || data);
    } catch (error) {
      setError(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  const marcarLeida = async (notificacionId) => {
    try {
      await api.post(`/api/cuenta/mis-notificaciones/${notificacionId}/marcar_leida/`, {
        plataforma: 'web'
      });
      
      setNotificaciones(prev => 
        prev.map(notif => 
          notif.id === notificacionId 
            ? { ...notif, leida: true, fecha_lectura: new Date().toISOString() }
            : notif
        )
      );
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
    }
  };

  // Filtrar notificaciones
  const notificacionesFiltradas = notificaciones.filter(n => {
    if (filter === "leidas") return n.leida;
    if (filter === "no-leidas") return !n.leida;
    return true; // todas
  });

  const noLeidasCount = notificaciones.filter(n => !n.leida).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-300">Cargando notificaciones...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Mis Notificaciones</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {noLeidasCount > 0 ? `Tienes ${noLeidasCount} notificaciones sin leer` : "Todas las notificaciones están al día"}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mt-4">
          {[
            { key: "todas", label: "Todas", count: notificaciones.length },
            { key: "no-leidas", label: "Sin leer", count: noLeidasCount },
            { key: "leidas", label: "Leídas", count: notificaciones.length - noLeidasCount }
          ].map(filterOption => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === filterOption.key
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {filterOption.label} ({filterOption.count})
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700 dark:text-red-300">{error}</span>
            <button
              onClick={fetchNotificaciones}
              className="ml-auto px-3 py-1 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Notificaciones */}
      <div className="space-y-4">
        {notificacionesFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V9a6 6 0 10-12 0v3l-5 5h5m7 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {filter === "todas" ? "No tienes notificaciones" : 
               filter === "no-leidas" ? "No tienes notificaciones sin leer" : 
               "No tienes notificaciones leídas"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filter === "todas" ? "Cuando recibas notificaciones aparecerán aquí." :
               filter === "no-leidas" ? "¡Perfecto! Estás al día con todas tus notificaciones." :
               "Las notificaciones que leas aparecerán en esta sección."}
            </p>
          </div>
        ) : (
          notificacionesFiltradas.map((notificacion) => (
            <div
              key={notificacion.id}
              className={`bg-white dark:bg-gray-800 rounded-xl border transition-all duration-200 hover:shadow-md ${
                !notificacion.leida
                  ? 'border-blue-200 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-2 h-2 rounded-full ${!notificacion.leida ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                      <h3 className={`font-semibold ${!notificacion.leida ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'}`}>
                        {notificacion.titulo}
                      </h3>
                      
                      {/* Tipo badge */}
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        notificacion.tipo === 'promocion' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                        notificacion.tipo === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                        notificacion.tipo === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {notificacion.tipo}
                      </span>
                    </div>

                    {/* Descripción */}
                    <p className="text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                      {notificacion.descripcion}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                        <span>
                          📅 {new Date(notificacion.fecha_creacion).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        
                        {notificacion.plataforma && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {notificacion.plataforma}
                          </span>
                        )}
                      </div>

                      {/* Estado y acciones */}
                      <div className="flex items-center gap-3">
                        {notificacion.leida ? (
                          <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Leída {notificacion.fecha_lectura && `el ${new Date(notificacion.fecha_lectura).toLocaleDateString('es-ES')}`}
                          </span>
                        ) : (
                          <button
                            onClick={() => marcarLeida(notificacion.id)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Marcar como leída
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}