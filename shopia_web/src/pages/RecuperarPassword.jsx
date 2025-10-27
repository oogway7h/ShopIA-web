import React, { useState } from "react";
import { api } from "../services/apiClient";

export default function RecuperarPassword() {
  const [step, setStep] = useState(1); // 1: solicitar, 2: confirmar
  const [correo, setCorreo] = useState("");
  const [token, setToken] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function handleSolicitar(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await api.post("/api/cuenta/solicitar-recuperacion/", { correo });
      setMensaje(response.detail);
      
      // Si hay token temporal (desarrollo), mostrarlo
      if (response.token_temporal) {
        setToken(response.token_temporal);
        setMensaje(`${response.detail} Token: ${response.token_temporal}`);
      }
      
      setStep(2);
    } catch (err) {
      setError(err.message || "Error al solicitar recuperación");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmar(e) {
    e.preventDefault();
    if (nuevaPassword !== confirmarPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      await api.post("/api/cuenta/confirmar-recuperacion/", {
        token,
        nueva_password: nuevaPassword,
        confirmar_password: confirmarPassword
      });
      
      setMensaje("¡Contraseña actualizada! Redirigiendo al login...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
      
    } catch (err) {
      setError(err.message || "Error al confirmar recuperación");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">
          Recuperar Contraseña
        </h1>

        {step === 1 ? (
          <form className="space-y-6" onSubmit={handleSolicitar}>
            <p className="text-gray-600 text-center text-sm mb-4">
              Ingresa tu correo para recibir un token de recuperación
            </p>
            
            <input
              className="w-full border border-blue-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              placeholder="Correo electrónico"
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              disabled={loading}
            />
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white rounded-2xl px-4 py-3 font-semibold text-lg shadow hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? "Enviando..." : "Enviar Token"}
            </button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => window.location.href = "/login"}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
              >
                Volver al login
              </button>
            </div>
          </form>
        ) : (
          <form className="space-y-6" onSubmit={handleConfirmar}>
            <p className="text-gray-600 text-center text-sm mb-4">
              Ingresa el token recibido y tu nueva contraseña
            </p>
            
            {mensaje && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs">
                💡 {mensaje}
              </div>
            )}
            
            <input
              className="w-full border border-blue-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              placeholder="Token de recuperación"
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={loading}
            />
            
            <input
              className="w-full border border-blue-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              placeholder="Nueva contraseña"
              type="password"
              required
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              disabled={loading}
              minLength={6}
            />
            
            <input
              className="w-full border border-blue-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              placeholder="Confirmar nueva contraseña"
              type="password"
              required
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              disabled={loading}
              minLength={6}
            />
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white rounded-2xl px-4 py-3 font-semibold text-lg shadow hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? "Actualizando..." : "Cambiar Contraseña"}
            </button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
              >
                Solicitar nuevo token
              </button>
            </div>
          </form>
        )}

        {step === 1 && mensaje && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm text-center">
            ✅ {mensaje}
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
            ❌ {error}
          </div>
        )}
      </div>
    </section>
  );
}