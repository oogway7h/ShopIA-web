import React, { useState, useEffect } from "react";
import { setToken, setUser } from "../services/auth.js";
import { api } from "../services/apiClient";

export default function Login() {
  const [show, setShow] = useState(false);
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bloqueado, setBloqueado] = useState(false);
  const [intentosRestantes, setIntentosRestantes] = useState(3);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 50);
    return () => clearTimeout(t);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      console.log("🔐 Enviando login a /api/cuenta/token/");
      const data = await api.post("/api/cuenta/token/", { correo, password });
      console.log("✅ Respuesta login:", data);

      if (!data.access) {
        throw new Error("No se recibió token de acceso");
      }

      // Guardar token
      setToken(data.access);
      
      // El backend ya devuelve el usuario en la respuesta del login
      if (data.usuario) {
        setUser(data.usuario);
        console.log("👤 Usuario guardado:", data.usuario);
        
        // Verificar roles para redirección
        const roles = data.usuario.roles?.map(r => r.nombre.toLowerCase()) || [];
        const isAdmin = roles.includes('admin') || roles.includes('administrador');
        
        window.location.href = isAdmin ? "/dashboard" : "/";
      } else {
        // Si no viene el usuario, obtenerlo del perfil
        console.log("👤 Obteniendo perfil del usuario...");
        const perfil = await api.get("/api/cuenta/perfil/");
        setUser(perfil);
        
        const roles = perfil.roles?.map(r => r.nombre.toLowerCase()) || [];
        const isAdmin = roles.includes('admin') || roles.includes('administrador');
        
        window.location.href = isAdmin ? "/dashboard" : "/";
        
      }
      
      
    } catch (err) {
      console.error("❌ Error login:", err);
      
      if (err.message.includes('423')) {
        // Usuario bloqueado
        setBloqueado(true);
        if (err.message.includes('debe_recuperar')) {
          setError("Usuario bloqueado. Serás redirigido a recuperación de contraseña...");
          setTimeout(() => {
            window.location.href = "/recuperar-password";
          }, 3000);
        } else {
          setError("Usuario bloqueado por múltiples intentos fallidos. Intenta más tarde o solicita recuperación de contraseña.");
        }
      } else if (err.message.includes('401')) {
        // Credenciales incorrectas - intentar extraer intentos restantes del mensaje
        const match = err.message.match(/intentos_restantes.*?(\d+)/);
        if (match) {
          const intentos = parseInt(match[1]);
          setIntentosRestantes(intentos);
          setError(`Credenciales incorrectas. Te quedan ${intentos} intentos.`);
          if (intentos === 0) {
            setTimeout(() => {
              window.location.href = "/recuperar-password";
            }, 2000);
          }
        } else {
          setError("Correo o contraseña incorrectos");
        }
      } else if (err.message.includes("404")) {
        setError("Servicio no disponible. Intenta más tarde.");
      } else {
        setError(err.message || "Error de conexión");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 px-4">
      <div
        className={`w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 transition-all duration-700 ${
          show ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
        }`}
        style={{ boxShadow: "0 8px 32px 0 rgba(60,130,246,0.15)" }}
      >
        <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center drop-shadow">
          Iniciar sesión
        </h1>
        {intentosRestantes < 3 && !bloqueado && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm text-center shadow">
            ⚠️ Te quedan {intentosRestantes} intentos antes del bloqueo
          </div>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <input
              className="w-full border border-blue-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg bg-blue-50/30 transition"
              placeholder="Correo"
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              disabled={loading || bloqueado}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12v1a4 4 0 01-8 0v-1m8 0a4 4 0 01-8 0m8 0V7a4 4 0 00-8 0v5" />
              </svg>
            </span>
          </div>
          <div className="relative">
            <input
              className="w-full border border-blue-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg bg-blue-50/30 transition"
              placeholder="Contraseña"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || bloqueado}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
          </div>
          <button
            type="submit"
            disabled={loading || bloqueado}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl px-4 py-3 font-semibold text-lg shadow hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
          <div className="text-center">
            <button
              type="button"
              onClick={() => window.location.href = "/recuperar-password"}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <div className="text-center mt-2">
            <button
              type="button"
              onClick={() => window.location.href = "/register"}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
            >
              ¿Aún no tienes cuenta? Regístrate
            </button>
          </div>
          {error && (
            <div className={`text-sm text-center p-3 rounded-xl mt-2 ${
              bloqueado ? 'bg-red-50 text-red-600 border border-red-200 shadow' : 'text-red-500 bg-red-50 border border-red-200 shadow'
            }`}>
              {error}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
