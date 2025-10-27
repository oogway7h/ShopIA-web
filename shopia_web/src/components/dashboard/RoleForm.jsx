import { useState, useEffect } from "react";

export default function RoleForm({ initialRole = null, onSubmit, onCancel, loading = false }) {
  const editMode = !!initialRole;
  const [nombre, setNombre] = useState(initialRole?.nombre || "");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setNombre(initialRole?.nombre || "");
  }, [initialRole]);

  function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (!nombre.trim()) return;
    onSubmit({ id: initialRole?.id, nombre: nombre.trim() });
  }

  const invalid = touched && !nombre.trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white rounded-3xl border-2 border-blue-200 shadow-xl p-8 flex flex-col gap-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-800">
            {editMode ? "Editar Rol" : "Crear Rol"}
          </h2>
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${editMode ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-purple-50 text-purple-600 border border-purple-100"}`}>
            {editMode ? "Edición" : "Nuevo"}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-600">
            Nombre <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onBlur={() => setTouched(true)}
              disabled={loading}
              maxLength={50}
              required
              className={`w-full peer px-4 py-3 rounded-2xl border text-sm bg-white focus:outline-none focus:ring-2 transition
                ${invalid ? "border-red-400 focus:ring-red-300" : "border-blue-300 focus:ring-blue-400 focus:border-blue-400"}
              `}
              placeholder="Nombre del rol"
            />
            <div className="absolute -inset-px rounded-2xl pointer-events-none opacity-0 group-focus-within:opacity-100 transition
                            bg-gradient-to-r from-blue-400/20 to-blue-600/20"></div>
          </div>
          <div className="flex justify-between text-[11px] text-gray-400">
            <span>{nombre.length}/50</span>
            {invalid && <span className="text-red-500">Requerido</span>}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2 rounded-xl text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50
                       transition shadow-sm disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-500
                       hover:from-blue-500 hover:to-purple-600 shadow-md hover:shadow-lg transition disabled:opacity-60"
          >
            {loading ? "Guardando..." : editMode ? "Guardar Cambios" : "Crear Rol"}
          </button>
        </div>
      </form>
    </div>
  );
}