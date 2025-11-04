import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/apiClient';
import ToastNotification from '../../../components/ui/ToastNotification';

export default function Checkout() {
  const [direccion, setDireccion] = useState('');
  const [numeroInt, setNumeroInt] = useState('');
  const [tipoPagoId, setTipoPagoId] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', color: 'red' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/api/ventas/carrito/finalizar-compra/', {
        direccion,
        numero_int: numeroInt || null,
        tipo_pago_id: tipoPagoId
      });

      setToast({ open: true, message: 'Venta creada exitosamente', color: 'green' });
      setTimeout(() => {
        navigate(`/cliente/resumen-venta/${response.venta_id}`);
      }, 1000);

    } catch (error) {
      setToast({ 
        open: true, 
        message: error.response?.data?.detail || 'Error al procesar la compra', 
        color: 'red' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-100">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-blue-700">Finalizar Compra</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección de Envío <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Calle, Número, Colonia"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número Interior/Apartamento (Opcional)
            </label>
            <input
              type="number"
              value={numeroInt}
              onChange={(e) => setNumeroInt(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: 101"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pago <span className="text-red-500">*</span>
            </label>
            <select
              value={tipoPagoId}
              onChange={(e) => setTipoPagoId(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona un método</option>
              <option value="1">Tarjeta de Crédito/Débito (Stripe)</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-lg shadow-lg hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-lg transition"
          >
            {loading ? 'Procesando...' : 'Crear Orden de Compra'}
          </button>
        </form>
        <ToastNotification
          open={toast.open}
          message={toast.message}
          onClose={() => setToast({ open: false, message: '' })}
          color={toast.color}
        />
      </div>
    </div>
  );
}