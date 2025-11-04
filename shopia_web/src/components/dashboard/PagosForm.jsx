import React, { useEffect, useState } from "react";

export default function MetodosPagoForm({
  initialMetodoPago = null, 
  onSubmit,
  onCancel,
  loading = false
}) {
  const editMode = !!initialMetodoPago;
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    activo: true 
  });

  useEffect(() => {
    if (initialMetodoPago) {
      setForm({
        nombre: initialMetodoPago.nombre || "",
        descripcion: initialMetodoPago.descripcion || "",
        activo: initialMetodoPago.activo !== undefined ? initialMetodoPago.activo : true
      });
    } else {
        setForm({ nombre: "", descripcion: "", activo: true });
    }
  }, [initialMetodoPago]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre.trim()) return; 
    onSubmit({
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      activo: form.activo
    });
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        {editMode ? "Editar Método de Pago" : "Crear Método de Pago"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campo Nombre */}
        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
            disabled={loading}
            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="Ej. Tarjeta de Crédito"
            required 
          />
        </div>

        {/* descripcion por si despues se le quiere poner 
        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Descripción <span className="text-sm text-gray-500">(Opcional)</span>
          </label>
          <textarea
            value={form.descripcion}
            onChange={e => setForm({ ...form, descripcion: e.target.value })}
            disabled={loading}
            rows={3}
            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="Detalles adicionales sobre el método de pago..."
          ></textarea>
        </div>*/}

        {/*boton para activar o desactivar */}
        <div>
           <label className="block font-medium text-gray-700 mb-2">
             Estado
           </label>
           <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl bg-gray-50/50">
             <button
               type="button"
               onClick={() => setForm(f => ({ ...f, activo: !f.activo }))}
               disabled={loading}
               className={`relative inline-flex h-7 w-13 items-center rounded-full transition-colors border-2 ${
                 form.activo ? "bg-green-600 border-green-600" : "bg-gray-300 border-gray-300"
               }`}
               aria-pressed={form.activo}
             >
               <span className="sr-only">Activar/Desactivar Método de Pago</span>
               <span
                 className={`inline-block h-5 w-5 transform rounded-full bg-white transition border-2 border-gray-200 ${
                   form.activo ? "translate-x-6" : "translate-x-1"
                 }`}
               />
             </button>
             <div>
               <span className="font-semibold text-gray-700">
                 {form.activo ? "Método Activo" : "Método Inactivo"}
               </span>
               <p className="text-sm text-gray-500">
                 {form.activo 
                   ? "Los clientes podrán usar este método." 
                   : "Este método no estará disponible para los clientes."
                 }
               </p>
             </div>
           </div>
        </div>


        
        <div className="flex justify-end gap-4 mt-8">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading} 
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center gap-2 disabled:opacity-50"
          >
             {loading && (
               <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
             )}
            {loading ? "Guardando..." : editMode ? "Actualizar" : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
