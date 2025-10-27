import { useEffect, useState } from "react";

export default function ClientesForm({
  initialCliente = null,
  onSubmit,
  onCancel,
  loading = false
}) {
  const editMode = !!initialCliente;
  const [form, setForm] = useState({
    correo: "",
    password: "",
    nombre: "",
    apellido: "",
    telefono: "",
    sexo: "",
    estado: true
  });
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (initialCliente) {
      setForm({
        correo: initialCliente.correo || "",
        password: "",
        nombre: initialCliente.nombre || "",
        apellido: initialCliente.apellido || "",
        telefono: initialCliente.telefono || "",
        sexo: initialCliente.sexo || "",
        estado: initialCliente.estado !== undefined ? initialCliente.estado : true
      });
    }
  }, [initialCliente]);

  function setField(name, value) {
    setForm(f => ({ ...f, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setTouched({
      correo: true,
      password: !editMode,
      nombre: true,
      apellido: true
    });

    if (!form.correo || (!editMode && !form.password) || !form.nombre || !form.apellido) return;

    const payload = {
      correo: form.correo.trim(),
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      telefono: form.telefono.trim() || null,
      sexo: form.sexo || null,
      estado: form.estado
    };
    if (form.password.trim()) {
      payload.password = form.password.trim();
    }
    onSubmit(payload);
  }

  const invalid = {
    correo: touched.correo && !form.correo,
    password: touched.password && !editMode && !form.password,
    nombre: touched.nombre && !form.nombre,
    apellido: touched.apellido && !form.apellido
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Volver a Clientes</span>
          </button>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-blue-600 px-8 py-6 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                  <div className="w-2 h-10 bg-white rounded-full"></div>
                  {editMode ? "Editar Cliente" : "Crear Nuevo Cliente"}
                </h1>
                <p className="text-emerald-100 text-lg">
                  {editMode ? "Modifica los datos del cliente seleccionado" : "Completa el formulario para crear un nuevo cliente"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl overflow-hidden">
          <div className="p-8 md:p-10">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
              {/* Información Personal */}
              <div className="space-y-6">
                <div className="border-l-4 border-emerald-500 pl-6 py-2">
                  <h3 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                    <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Información Personal
                  </h3>
                  <p className="text-gray-600">Datos básicos del cliente</p>
                </div>
                <div className="space-y-5">
                  <Field
                    label="Correo electrónico"
                    required
                    error={invalid.correo && "El correo es obligatorio"}
                  >
                    <input
                      type="email"
                      value={form.correo}
                      onChange={e => setField("correo", e.target.value)}
                      onBlur={() => setTouched(t => ({ ...t, correo: true }))}
                      disabled={loading || editMode}
                      className={`form-input ${invalid.correo ? "border-red-300 focus:border-red-500 focus:ring-red-200" : ""}`}
                      placeholder="cliente@ejemplo.com"
                    />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field
                      label="Nombre"
                      required
                      error={invalid.nombre && "El nombre es obligatorio"}
                    >
                      <input
                        value={form.nombre}
                        onChange={e => setField("nombre", e.target.value)}
                        onBlur={() => setTouched(t => ({ ...t, nombre: true }))}
                        disabled={loading}
                        className={`form-input ${invalid.nombre ? "border-red-300 focus:border-red-500 focus:ring-red-200" : ""}`}
                        placeholder="Nombre"
                      />
                    </Field>
                    <Field
                      label="Apellido"
                      required
                      error={invalid.apellido && "El apellido es obligatorio"}
                    >
                      <input
                        value={form.apellido}
                        onChange={e => setField("apellido", e.target.value)}
                        onBlur={() => setTouched(t => ({ ...t, apellido: true }))}
                        disabled={loading}
                        className={`form-input ${invalid.apellido ? "border-red-300 focus:border-red-500 focus:ring-red-200" : ""}`}
                        placeholder="Apellido"
                      />
                    </Field>
                  </div>
                  <Field label="Teléfono">
                    <input
                      type="tel"
                      value={form.telefono}
                      onChange={e => setField("telefono", e.target.value)}
                      disabled={loading}
                      className="form-input"
                      placeholder="+1 234 567 8900"
                    />
                  </Field>
                  <Field label="Sexo">
                    <select
                      value={form.sexo}
                      onChange={e => setField("sexo", e.target.value)}
                      disabled={loading}
                      className="form-input"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                    </select>
                  </Field>
                </div>
              </div>
              {/* Seguridad */}
              <div className="space-y-6">
                <div className="border-l-4 border-purple-500 pl-6 py-2">
                  <h3 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                    <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Seguridad
                  </h3>
                  <p className="text-gray-600">Contraseña de acceso</p>
                </div>
                <div className="space-y-5">
                  <Field
                    label="Contraseña"
                    required={!editMode}
                    description={editMode ? "Dejar vacío para mantener la contraseña actual" : "Mínimo 4 caracteres"}
                    error={invalid.password && "La contraseña es obligatoria"}
                  >
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={e => setField("password", e.target.value)}
                        onBlur={() => setTouched(t => ({ ...t, password: true }))}
                        disabled={loading}
                        className={`form-input pr-12 ${invalid.password ? "border-red-300 focus:border-red-500 focus:ring-red-200" : ""}`}
                        placeholder={editMode ? "Dejar vacío para mantener actual" : "Mínimo 4 caracteres"}
                        minLength={4}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </Field>
                  <Field label="Rol">
                    <div className="p-4 border-2 border-gray-200 rounded-xl bg-blue-50 text-blue-700 font-semibold">
                      Este usuario será registrado como <span className="font-bold">cliente</span>.
                    </div>
                  </Field>
                  <Field label="Estado del cliente" description="Controla si el cliente puede acceder al sistema">
                    <div className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl bg-gray-50/50">
                      <button
                        type="button"
                        onClick={() => setField("estado", !form.estado)}
                        disabled={loading}
                        className={`relative inline-flex h-7 w-13 items-center rounded-full transition-colors border-2 ${
                          form.estado ? "bg-emerald-600 border-emerald-600" : "bg-gray-300 border-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition border-2 border-gray-200 ${
                            form.estado ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                      <div>
                        <span className="font-semibold text-gray-700">
                          {form.estado ? "Cliente activo" : "Cliente inactivo"}
                        </span>
                        <p className="text-sm text-gray-500">
                          {form.estado 
                            ? "El cliente puede iniciar sesión normalmente" 
                            : "El cliente no puede acceder al sistema"
                          }
                        </p>
                      </div>
                    </div>
                  </Field>
                </div>
              </div>
            </div>
          </div>
          {/* Footer */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 md:px-10 py-6 border-t-2 border-gray-200 flex flex-col sm:flex-row justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-8 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all shadow-md disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-lg hover:shadow-xl border-2 border-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? "Guardando..." : editMode ? "Actualizar Cliente" : "Crear Cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required, error, description, children }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
      {children}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}