import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../../../services/apiClient';

export default function CompraExitosa() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sessionId = searchParams.get('session_id');
  const ventaId = searchParams.get('venta_id');

  useEffect(() => {
    confirmarPago();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmarPago = async () => {
    try {
      await api.post(`/api/ventas/ventas/${ventaId}/confirmar-pago/`, {
        session_id: sessionId
      });
      setLoading(false);
    } catch {
      setError('Error al confirmar el pago');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Confirmando tu pago...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-red-50 border border-red-200 rounded-lg text-center">
        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        <h2 className="text-2xl font-bold text-red-800 mb-2">Error</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => navigate(`/cliente/resumen-venta/${ventaId}`)}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Volver al resumen
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-gradient-to-br from-green-100 to-green-50 border border-green-200 rounded-lg text-center shadow-lg">
      <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <h2 className="text-2xl font-bold text-green-800 mb-2">¡Pago Exitoso!</h2>
      <p className="text-green-600 mb-6">Tu compra ha sido procesada correctamente</p>
      <div className="space-y-3">
        <button
          onClick={() => navigate(`/cliente/resumen-venta/${ventaId}`)}
          className="w-full px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Ver Resumen de Compra
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Volver al Inicio
        </button>
      </div>
    </div>
  );
}