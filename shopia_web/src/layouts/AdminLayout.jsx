import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { clearAuth, getUser } from "../services/auth.js";

const menu = [
  {
    grupo: "Gestión de Usuarios",
    icono: "👥",
    opciones: [
      { nombre: "Usuarios", ruta: "/dashboard/usuarios" },
	  { nombre: "Clientes", ruta: "/dashboard/clientes" },
      { nombre: "Roles", ruta: "/dashboard/usuarios/roles" },
      { nombre: "Bitácora", ruta: "/dashboard/usuarios/bitacora" },
      { nombre: "Notificaciones", ruta: "/dashboard/notificaciones" },
    ],
  },
  {
    grupo:"Gestion de Productos",
    icono:"🧐",
    opciones:[
      {nombre:"Categorias", ruta:"categorias"},
      {nombre:"Productos", ruta:"productos"},
    ]
  },

  {
    grupo:"Gestion de Ventas",
    icono:"💰",
    opciones:[
      {nombre:"Pagos",ruta:"/dashboard/pagos"},
      {nombre:"Ventas", ruta:"/dashboard/ventas"}
    ]
  },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);
  const location = useLocation();
  const user = getUser(); // se usa abajo

  // Cierra sidebar al cambiar de ruta en móvil
  useEffect(() => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, [location.pathname]);

  // Bloquea scroll body al abrir en móvil
  useEffect(() => {
    if (sidebarOpen && window.innerWidth < 1024) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => (document.body.style.overflow = "");
  }, [sidebarOpen]);

  // ESC para cerrar
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && setSidebarOpen(false);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  function handleLogout() {
    clearAuth();
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen flex overflow-x-hidden bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white shadow-xl transform transition-transform duration-300
        ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Header del sidebar */}
          <div className="px-6 py-5 border-b border-blue-700/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-xl font-bold">Shopia</h1>
                <p className="text-blue-200 text-xs">Panel de Control</p>
              </div>
            </div>
            <button
              className="lg:hidden text-2xl leading-none text-blue-200 hover:text-white"
              aria-label="Cerrar menú"
              onClick={() => setSidebarOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* Navegación */}
          <nav className="flex-1 overflow-y-auto px-4 py-6">
            <ul className="space-y-2">
              <li>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 font-medium ${
                    location.pathname === "/dashboard"
                      ? "bg-white/20 shadow-lg border border-white/20"
                      : ""
                  }`}
                >
                  <span className="text-xl">📊</span>
                  <span>Dashboard</span>
                </Link>
              </li>
              {menu.map((grupo, idx) => {
                const abierto = openGroup === idx;
                return (
                  <li key={grupo.grupo}>
                    <button
                      type="button"
                      onClick={() => setOpenGroup(abierto ? null : idx)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 font-medium"
                      aria-expanded={abierto}
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-xl">{grupo.icono}</span>
                        {grupo.grupo}
                      </span>
                      <span
                        className={`text-sm transition-transform duration-200 ${
                          abierto ? "rotate-180" : ""
                        }`}
                      >
                        ▼
                      </span>
                    </button>
                    {abierto && (
                      <ul className="mt-2 ml-6 space-y-1">
                        {grupo.opciones.map((op) => (
                          <li key={op.ruta}>
                            <Link
                              to={op.ruta}
                              className={`block px-4 py-2 rounded-lg hover:bg-white/10 text-sm transition-all duration-200 ${
                                location.pathname === op.ruta
                                  ? "bg-white/15 text-blue-100 font-medium"
                                  : "text-blue-200"
                              }`}
                            >
                              {op.nombre}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer del sidebar */}
          <div className="px-4 py-4 border-t border-blue-700/50 space-y-3">
            <Link
              to="/"
              onClick={() => setSidebarOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700 text-white text-sm font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span>🏪</span>
              <span>Ver Tienda</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 rounded-xl text-sm font-medium bg-red-500/90 text-white hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Cerrar Sesión
            </button>
            <div className="text-[11px] text-blue-300 pt-1 text-center select-none">
              © {new Date().getFullYear()} Shopia - Ecommerce IA
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Contenido principal */}
      <div className="flex flex-col lg:pl-72 min-h-screen w-full">
        {/* Topbar móvil */}
        <header className="sticky top-0 z-30 flex items-center justify-between bg-white shadow-sm border-b px-4 py-4 lg:hidden">
          <button
            className="text-2xl text-blue-600 hover:text-blue-700"
            aria-label="Abrir menú"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🛒</span>
            <span className="font-bold text-blue-800">Shopia Admin</span>
          </div>
          <div className="w-6" />
        </header>

        {/* Área de contenido */}
        <main className="flex-1 flex flex-col w-full bg-gray-50">
          <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
            {/* Breadcrumb y info usuario */}
            {user && (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>🏪</span>
                  <span>Panel de Administración</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white shadow-sm border">
                    <span className="text-blue-600">👤</span>
                    <span className="font-medium text-gray-700">
                      {user.nombre} {user.apellido}
                    </span>
                  </div>
                  {user.roles && user.roles.length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm">
                      <span>🎯</span>
                      <span className="font-medium text-xs uppercase tracking-wide">
                        {user.roles[0].nombre}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contenido principal */}
            <div className="w-full min-w-0 bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="w-full overflow-x-auto">
                <Outlet />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
