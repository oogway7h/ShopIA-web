import { useEffect, useState } from "react";

export default function NotificacionForm({
  initialNotificacion = null,
  onSubmit,
  onCancel,
  loading = false
}) {
  const editMode = !!initialNotificacion;
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    tipo: "info",
    plataforma: "web",
    fecha_inicio: "",
    fecha_fin: "",
    estado: true,
    usuarios_ids: []
  });
  const [touched, setTouched] = useState({});

  useEffect(() => {
    // Obtener fecha local en formato YYYY-MM-DDTHH:mm
    function getLocalDateTimeString() {
      const now = new Date();
      now.setSeconds(0, 0);
      const tzOffset = now.getTimezoneOffset() * 60000;
      const localISOTime = new Date(now - tzOffset).toISOString().slice(0, 16);
      return localISOTime;
    }

    if (initialNotificacion) {
      setForm({
        titulo: initialNotificacion.titulo || "",
        descripcion: initialNotificacion.descripcion || "",
        tipo: initialNotificacion.tipo || "info",
        plataforma: initialNotificacion.plataforma || "web",
        fecha_inicio: initialNotificacion.fecha_inicio
          ? initialNotificacion.fecha_inicio.slice(0, 16)
          : getLocalDateTimeString(),
        fecha_fin: initialNotificacion.fecha_fin
          ? initialNotificacion.fecha_fin.slice(0, 16)
          : "",
        estado: initialNotificacion.estado !== undefined ? initialNotificacion.estado : true,
        usuarios_ids: [] // Siempre todos los clientes
      });
    } else {
      setForm({
        titulo: "",
        descripcion: "",
        tipo: "info",
        plataforma: "web",
        fecha_inicio: getLocalDateTimeString(),
        fecha_fin: "",
        estado: true,
        usuarios_ids: [] // Siempre todos los clientes
      });
    }
  }, [initialNotificacion]);

  function setField(name, value) {
    setForm(f => ({ ...f, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setTouched({
      titulo: true,
      descripcion: true
    });
    
    if (!form.titulo || !form.descripcion) return;

    const payload = {
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      tipo: form.tipo,
      plataforma: form.plataforma,
      fecha_inicio: form.fecha_inicio || null,
      fecha_fin: form.fecha_fin || null,
      estado: form.estado,
      usuarios_ids: form.usuarios_ids
    };

    onSubmit(payload);
  }

  const invalid = {
    titulo: touched.titulo && !form.titulo,
    descripcion: touched.descripcion && !form.descripcion
  };

  const tipoOptions = [
    { value: "info", label: "Información", color: "blue" },
    { value: "promocion", label: "Promoción", color: "purple" },
    { value: "sistema", label: "Sistema", color: "gray" }
  ];

  const plataformaOptions = [
    { value: "web", label: "Web", icon: "🌐" },
    { value: "email", label: "Email", icon: "✉️" },
    { value: "push", label: "Push", icon: "🔔" },
  ];

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
            <span className="font-medium">Volver a Notificaciones</span>
          </button>
        </div>

        {/* Header independiente */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                  <div className="w-2 h-10 bg-white rounded-full"></div>
                  {editMode ? "Editar Notificación" : "Crear Nueva Notificación"}
                </h1>
                <p className="text-purple-100 text-lg">
                  {editMode ? "Modifica los datos de la notificación seleccionada" : "Completa el formulario para crear una nueva notificación en el sistema"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 01-7.5-7.5C7.5 6.716 9.716 4.5 12 4.5s4.5 2.216 4.5 4.5-2.216 4.5-4.5 4.5V17z" />
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
              {/* Contenido de la Notificación */}
              <div className="space-y-6">
                <div className="border-l-4 border-purple-500 pl-6 py-2">
                  <h3 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                    <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Contenido de la Notificación
                  </h3>
                  <p className="text-gray-600">Información principal del mensaje</p>
                </div>
                
                <div className="space-y-5">
                  <Field
                    label="Título"
                    required
                    error={invalid.titulo && "El título es obligatorio"}
                  >
                    <input
                      value={form.titulo}
                      onChange={e => setField("titulo", e.target.value)}
                      onBlur={() => setTouched(t => ({ ...t, titulo: true }))}
                      disabled={loading}
                      className={`form-input ${invalid.titulo ? "border-red-300 focus:border-red-500 focus:ring-red-200" : ""}`}
                      placeholder="Título de la notificación"
                      maxLength={200}
                    />
                  </Field>

                  <Field
                    label="Descripción"
                    required
                    error={invalid.descripcion && "La descripción es obligatoria"}
                  >
                    <textarea
                      value={form.descripcion}
                      onChange={e => setField("descripcion", e.target.value)}
                      onBlur={() => setTouched(t => ({ ...t, descripcion: true }))}
                      disabled={loading}
                      rows={4}
                      className={`form-input resize-y ${invalid.descripcion ? "border-red-300 focus:border-red-500 focus:ring-red-200" : ""}`}
                      placeholder="Describe el contenido de la notificación..."
                    />
                  </Field>

                  <Field label="Tipo de notificación" description="Selecciona el tipo de mensaje">
                    <div className="grid grid-cols-2 gap-3">
                      {tipoOptions.map(tipo => (
                        <label key={tipo.value} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          form.tipo === tipo.value 
                            ? `border-${tipo.color}-300 bg-${tipo.color}-50` 
                            : "border-gray-200 hover:border-gray-300"
                        }`}>
                          <input
                            type="radio"
                            name="tipo"
                            value={tipo.value}
                            checked={form.tipo === tipo.value}
                            onChange={e => setField("tipo", e.target.value)}
                            disabled={loading}
                            className="w-4 h-4"
                          />
                          <span className="font-medium text-gray-700">{tipo.label}</span>
                        </label>
                      ))}
                    </div>
                  </Field>

                  <Field label="Plataforma" description="Dónde se mostrará la notificación">
                    <div className="grid grid-cols-2 gap-3">
                      {plataformaOptions.map(plataforma => (
                        <label key={plataforma.value} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          form.plataforma === plataforma.value 
                            ? "border-blue-300 bg-blue-50" 
                            : "border-gray-200 hover:border-gray-300"
                        }`}>
                          <input
                            type="radio"
                            name="plataforma"
                            value={plataforma.value}
                            checked={form.plataforma === plataforma.value}
                            onChange={e => setField("plataforma", e.target.value)}
                            disabled={loading}
                            className="w-4 h-4"
                          />
                          <span className="text-lg">{plataforma.icon}</span>
                          <span className="font-medium text-gray-700">{plataforma.label}</span>
                        </label>
                      ))}
                    </div>
                  </Field>
                </div>
              </div>

              {/* Configuración y Destinatarios */}
              <div className="space-y-6">
                <div className="border-l-4 border-green-500 pl-6 py-2">
                  <h3 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Configuración y Destinatarios
                  </h3>
                  <p className="text-gray-600">Programación y público objetivo</p>
                </div>
                
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Fecha de inicio" description="Cuándo se activará la notificación">
                      <input
                        type="datetime-local"
                        value={form.fecha_inicio}
                        onChange={e => setField("fecha_inicio", e.target.value)}
                        disabled={loading}
                        className="form-input"
                      />
                    </Field>

                    <Field label="Fecha de fin" description="Cuándo expirará (opcional)">
                      <input
                        type="datetime-local"
                        value={form.fecha_fin}
                        onChange={e => setField("fecha_fin", e.target.value)}
                        disabled={loading}
                        className="form-input"
                      />
                    </Field>
                  </div>

                  <Field label="Destinatarios">
                    <div className="p-4 border-2 border-gray-200 rounded-xl bg-blue-50 text-blue-700 font-semibold">
                      Esta notificación será enviada a <span className="font-bold">todos los clientes activos</span>.
                    </div>
                  </Field>

                  <Field label="Estado de la notificación" description="Controla si la notificación está activa">
                    <div className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl bg-gray-50/50">
                      <button
                        type="button"
                        onClick={() => setField("estado", !form.estado)}
                        disabled={loading}
                        className={`relative inline-flex h-7 w-13 items-center rounded-full transition-colors border-2 ${
                          form.estado ? "bg-green-600 border-green-600" : "bg-gray-300 border-gray-300"
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
                          {form.estado ? "Notificación activa" : "Notificación inactiva"}
                        </span>
                        <p className="text-sm text-gray-500">
                          {form.estado 
                            ? "La notificación se mostrará a los usuarios" 
                            : "La notificación no se mostrará"
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
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-lg hover:shadow-xl border-2 border-purple-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? "Guardando..." : editMode ? "Actualizar Notificación" : "Crear Notificación"}
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