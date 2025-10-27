import React from "react";

export default function ConfirmDialog({
  open,
  title = "Confirmar",
  message = "¿Seguro?",
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  loading = false
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-200 p-6
                      animate-[fadeIn_.25s_ease]">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            disabled={loading}
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            disabled={loading}
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 shadow
                       disabled:opacity-50"
          >
            {loading ? "..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
