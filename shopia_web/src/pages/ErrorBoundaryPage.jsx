import React from "react";
import { useRouteError, useNavigate } from "react-router-dom";

export default function ErrorBoundaryPage() {
  const err = useRouteError();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <h1 className="text-4xl font-bold text-gray-700">Error</h1>
      <p className="text-gray-600 text-sm">
        {(err && (err.statusText || err.message || err.status)) ||
          "Algo salió mal"}
      </p>
      <button
        onClick={() => navigate(-1)}
        className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700"
      >
        Volver
      </button>
    </div>
  );
}
