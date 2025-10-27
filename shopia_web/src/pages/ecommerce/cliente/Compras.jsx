import React from "react";

export default function ComprasPage() {
  return (
    <div className="max-w-4xl">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Mis Compras</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Historial completo de tus pedidos y facturas</p>
        
        {/* Próximamente */}
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Próximamente</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Esta sección estará disponible cuando implementemos el módulo de compras.
          </p>
        </div>
      </div>
    </div>
  );
}