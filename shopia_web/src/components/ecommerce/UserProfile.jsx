import React, { useEffect, useState } from "react";
import { api } from "../../services/apiClient";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await api.get("/api/cuenta/perfil/");
      setUser(data);
      setForm(data);
      setErrors({});
      setMsg("");
    } catch (error) {
      setMsg(`❌ ${error.message || "Error al cargar el perfil"}`);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setErrors({});

    try {
      const data = await api.put("/api/cuenta/perfil/", {
        nombre: form.nombre,
        apellido: form.apellido,
        telefono: form.telefono,
        sexo: form.sexo,
      });

      setMsg("✅ Perfil actualizado correctamente");
      setEdit(false);
      setUser(data);
      setForm(data);
    } catch (error) {
      if (error.message.includes('{')) {
        try {
          const errorData = JSON.parse(error.message);
          setErrors(errorData);
        } catch {
          setMsg(`❌ ${error.message}`);
        }
      } else {
        setMsg(`❌ ${error.message}`);
      }
    }
    setLoading(false);
  };

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-300">Cargando perfil...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 dark:text-red-400 mb-4">❌ No se pudo cargar el perfil</div>
        <button
          onClick={fetchProfile}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Mi Perfil</h1>
            <p className="text-gray-600 dark:text-gray-400">Gestiona tu información personal y configuración de cuenta</p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
            {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </div>

      {/* Messages */}
      {msg && (
        <div className={`mb-6 p-4 rounded-xl border ${
          msg.includes('✅') 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' 
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
        }`}>
          {msg}
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Correo (solo lectura) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <input
                type="email"
                value={user.correo}
                disabled
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              El correo no se puede modificar por seguridad
            </p>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Nombre
            </label>
            <input
              type="text"
              name="nombre"
              value={form.nombre || ""}
              onChange={handleChange}
              disabled={!edit}
              className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 ${
                edit 
                  ? 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700'
              } ${errors.nombre ? 'border-red-300 dark:border-red-600' : ''} 
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`}
            />
            {errors.nombre && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.nombre[0]}</p>
            )}
          </div>

          {/* Apellido */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Apellido
            </label>
            <input
              type="text"
              name="apellido"
              value={form.apellido || ""}
              onChange={handleChange}
              disabled={!edit}
              className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 ${
                edit 
                  ? 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700'
              } ${errors.apellido ? 'border-red-300 dark:border-red-600' : ''} 
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`}
            />
            {errors.apellido && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.apellido[0]}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              name="telefono"
              value={form.telefono || ""}
              onChange={handleChange}
              disabled={!edit}
              placeholder="Ej: +1234567890"
              className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 ${
                edit 
                  ? 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700'
              } ${errors.telefono ? 'border-red-300 dark:border-red-600' : ''} 
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`}
            />
            {errors.telefono && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.telefono[0]}</p>
            )}
          </div>

          {/* Sexo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Sexo
            </label>
            <select
              name="sexo"
              value={form.sexo || ""}
              onChange={handleChange}
              disabled={!edit}
              className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 ${
                edit 
                  ? 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700'
              } ${errors.sexo ? 'border-red-300 dark:border-red-600' : ''} 
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`}
            >
              <option value="">Selecciona una opción</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
            {errors.sexo && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.sexo[0]}</p>
            )}
          </div>

          {/* Información adicional */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">Miembro desde:</span>
                <span className="ml-2 text-gray-900 dark:text-gray-100">
                  {new Date(user.date_joined).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">Tipo de cuenta:</span>
                <span className="ml-2 text-gray-900 dark:text-gray-100">Cliente</span>
              </div>
            </div>
          </div>

          {/* Botones de acción - SOLO ESTOS, eliminar los de arriba */}
        </form>

        {/* Botones FUERA del formulario */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
          {!edit ? (
            <button
              type="button"
              onClick={() => setEdit(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar Perfil
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Guardar Cambios
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEdit(false);
                  setForm(user);
                  setMsg("");
                  setErrors({});
                }}
                className="px-6 py-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}