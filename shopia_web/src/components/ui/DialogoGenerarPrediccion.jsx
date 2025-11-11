import React from "react";

export default function DialogoGenerarPrediccion({
  open,
  loading = false,
  onConfirm,
  onCancel
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex h-screen items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in">
        <h2 className="text-xl font-bold mb-2 text-purple-700 flex items-center gap-2">
          <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.418 2A8.001 8.001 0 114.582 9M4 4l16 16" />
          </svg>
          Regenerar Predicciones IA
        </h2>
        <div className="text-gray-700 mb-4 whitespace-pre-line">
          Esto actualizará:
          <ul className="list-disc ml-6 mt-2 text-sm">
            <li>Reentrenar el modelo de IA</li>
            <li>Predicciones del próximo mes</li>
            <li>Análisis de crecimiento de categorías</li>
            <li>Ranking de productos más vendidos</li>
          </ul>
          <div className="mt-3 text-xs text-gray-500">
            ⏱️ El proceso puede tardar entre 10 y 30 segundos.
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
            type="button"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors flex items-center gap-2"
            type="button"
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            )}
            Sí, regenerar
          </button>
        </div>
        <button
          onClick={onCancel}
          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl font-bold"
          type="button"
          aria-label="Cerrar"
        >
          ×
        </button>
      </div>
    </div>
  );
}