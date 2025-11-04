import React, { useEffect, useState } from "react";
import { api } from "../../../services/apiClient.js";
import { useNavigate } from "react-router-dom";

const estadoColor = {
  PENDIENTE: "bg-yellow-100 text-yellow-800",
  PAGADA: "bg-green-100 text-green-800",
  ENVIADA: "bg-blue-100 text-blue-800",
  CANCELADA: "bg-red-100 text-red-800",
};

export default function ComprasPage() {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function cargar() {
    setLoading(true);
    setError("");
    api
      .get("/api/ventas/ventas/")
      .then((d) => setList(Array.isArray(d.results) ? d.results : d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-2 text-center">Mis Compras</h1>
      {error && (
        <div className="px-4 py-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded mb-4">
          {error}
        </div>
      )}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : list.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <svg className="mx-auto mb-4 w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p className="text-lg">No tienes compras registradas aún.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {list.map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-xl shadow-md p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:shadow-lg transition"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-gray-400">Orden #{v.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${estadoColor[v.estado] || "bg-gray-100 text-gray-700"}`}
                  >
                    {v.estado.charAt(0) + v.estado.slice(1).toLowerCase()}
                  </span>
                </div>
                <div className="text-sm text-gray-700 mb-1">
                  <span className="font-medium">Fecha:</span>{" "}
                  {v.fecha ? new Date(v.fecha).toLocaleString() : "—"}
                </div>
                <div className="text-sm text-gray-700 mb-1">
                  <span className="font-medium">Dirección:</span> {v.direccion}
                </div>
                <div className="text-sm text-gray-700 mb-1">
                  <span className="font-medium">Total:</span>{" "}
                  <span className="text-blue-700 font-bold">Bs{v.monto_total}</span>
                </div>
              </div>
              <div className="flex flex-row md:flex-col gap-2 md:items-end">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
                  onClick={() => navigate(`/cliente/resumen-venta/${v.id}`)}
                >
                  Ver Detalle
                </button>
                {v.estado === "PAGADA" && (
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700 transition"
                    onClick={() => navigate(`/cliente/resumen-venta/${v.id}`)}
                  >
                    Descargar Comprobante
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}