import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function CategoriasForm({
  initialCategoria = null,
  onSubmit,
  onCancel,
  loading = false
}) {
  const editMode = !!initialCategoria;
  const [form, setForm] = useState({
    nombre: "",
    descripcion: ""
  });

  useEffect(() => {
    if (initialCategoria) {
      setForm({
        nombre: initialCategoria.nombre || "",
        descripcion: initialCategoria.descripcion || ""
      });
    }
  }, [initialCategoria]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    onSubmit({
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim()
    });
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        {editMode ? "Editar Categoría" : "Crear Categoría"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
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
            placeholder="Ej. Electrónica"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            value={form.descripcion}
            onChange={e => setForm({ ...form, descripcion: e.target.value })}
            disabled={loading}
            rows={3}
            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="Descripción breve..."
          ></textarea>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium"
          >
            {loading ? "Guardando..." : editMode ? "Actualizar" : "Guardar"}
          </button>
        </div>
      </form>
      
    </div>
  );
}
