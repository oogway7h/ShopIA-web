import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../../services/apiClient';
import ToastNotification from '../../../components/ui/ToastNotification';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ResumenVenta() {
  const { id } = useParams();
  useNavigate();
  const [venta, setVenta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingPago, setLoadingPago] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', color: 'red' });

  useEffect(() => {
    cargarVenta();
    // eslint-disable-next-line
  }, [id]);

  const cargarVenta = async () => {
    try {
      const data = await api.get(`/api/ventas/ventas/${id}/`);
      setVenta(data);
    } catch {
      setToast({ open: true, message: 'Error al cargar la venta', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const handlePagar = async () => {
    setLoadingPago(true);
    try {
      const response = await api.post(`/api/ventas/ventas/${id}/crear-sesion-pago/`);
      window.location.href = response.url;
    } catch (error) {
      setToast({ 
        open: true, 
        message: error.response?.data?.detail || 'Error al crear sesión de pago', 
        color: 'red' 
      });
      setLoadingPago(false);
    }
  };

  const handleDescargarPDF = () => {
    if (!venta) return;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Comprobante de Compra', 14, 18);

    doc.setFontSize(12);
    doc.text(`N° Orden: #${venta.id}`, 14, 30);
    doc.text(`Fecha: ${new Date(venta.fecha).toLocaleString()}`, 14, 38);
    doc.text(`Estado: ${venta.estado}`, 14, 46);
    doc.text(`Dirección: ${venta.direccion}`, 14, 54);
    if (venta.numero_int) {
      doc.text(`Interior/Apto: ${venta.numero_int}`, 14, 62);
    }
    doc.text(`Total: Bs${venta.monto_total}`, 14, venta.numero_int ? 70 : 62);

    autoTable(doc, {
      startY: venta.numero_int ? 78 : 70,
      head: [['Producto', 'Cantidad', 'Precio Unitario', 'Subtotal']],
      body: venta.detalles.map(detalle => [
        detalle.producto.nombre,
        detalle.cantidad,
        `Bs${detalle.precio_unitario}`,
        `Bs${(detalle.precio_unitario * detalle.cantidad).toFixed(2)}`
      ]),
    });

    doc.save(`comprobante_venta_${venta.id}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!venta) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Venta no encontrada</h2>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-10">
      <h1 className="text-3xl font-bold mb-6 text-blue-700 text-center">Resumen de Compra</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Número de Orden</p>
          <p className="text-lg font-semibold">#{venta.id}</p>
          <p className="text-sm text-gray-500 mt-2">Estado</p>
          <p className={`text-lg font-semibold ${
            venta.estado === 'PENDIENTE' ? 'text-yellow-600' : 
            venta.estado === 'PAGADA' ? 'text-green-600' : 
            'text-gray-600'
          }`}>
            {venta.estado}
          </p>
          <p className="text-sm text-gray-500 mt-2">Fecha</p>
          <p className="text-lg">{new Date(venta.fecha).toLocaleString()}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Dirección de Envío</p>
          <p className="text-lg">{venta.direccion}</p>
          {venta.numero_int && (
            <p className="text-sm text-gray-600">Interior/Apto: {venta.numero_int}</p>
          )}
          <p className="text-sm text-gray-500 mt-2">Total</p>
          <p className="text-2xl font-bold text-blue-600">Bs{venta.monto_total}</p>
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 text-blue-700">Productos</h2>
        <div className="space-y-4">
          {venta.detalles.map((detalle) => (
            <div key={detalle.id} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
              <div className="flex-1">
                <h3 className="font-semibold">{detalle.producto.nombre}</h3>
                <p className="text-sm text-gray-600">
                  Cantidad: {detalle.cantidad} x Bs{detalle.precio_unitario}
                </p>
              </div>
              <p className="text-lg font-bold">
                Bs{(detalle.precio_unitario * detalle.cantidad).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        {venta.estado === 'PENDIENTE' && (
          <button
            onClick={handlePagar}
            disabled={loadingPago}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-lg shadow-lg hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-lg transition"
          >
            {loadingPago ? 'Redirigiendo a Stripe...' : 'Pagar con Tarjeta'}
          </button>
        )}
        <button
          onClick={handleDescargarPDF}
          className="flex-1 px-6 py-4 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 text-lg transition"
        >
          Descargar Comprobante PDF
        </button>
      </div>
      {venta.estado === 'PAGADA' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center mt-6">
          <svg className="w-12 h-12 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-lg font-semibold text-green-800">¡Pago completado exitosamente!</p>
        </div>
      )}
      <ToastNotification
        open={toast.open}
        message={toast.message}
        onClose={() => setToast({ open: false, message: '' })}
        color={toast.color}
      />
    </div>
  );
}