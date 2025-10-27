import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ClienteLayout() {
  const { user, loading, isClient, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirect if not authenticated or not client
  if (!isAuthenticated || !isClient()) {
    return <Navigate to="/login" replace />;
  }

  const menuItems = [
    {
      path: '/cliente/perfil',
      name: 'Mi Perfil',
      icon: <UserIcon />,
      description: 'Información personal y configuración'
    },
    {
      path: '/cliente/notificaciones',
      name: 'Notificaciones',
      icon: <BellIcon />,
      description: 'Mensajes y alertas importantes'
    },
    {
      path: '/cliente/compras',
      name: 'Mis Compras',
      icon: <ShoppingBagIcon />,
      description: 'Historial de pedidos y facturas'
    },
    
  ];

  return (
    // CAMBIO 1: Agregado 'flex flex-col' para que el layout principal se estire verticalmente
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header (Sin cambios) */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y menú móvil */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <MenuIcon />
              </button>
              
              <Link to="/" className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Shopia</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Mi Cuenta</p>
                </div>
              </Link>
            </div>

            {/* Usuario y logout */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.nombre_completo || `${user?.nombre || ''} ${user?.apellido || ''}`.trim() || 'Usuario'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.correo}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  logout();
                  window.location.href = '/';
                }}
                className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
              >
                <LogoutIcon />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* CAMBIO 2: Agregado 'flex-1' para que este div ocupe el espacio restante */}
      <div className="flex flex-1">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-64">
            {/* CAMBIO 3: 
              - Se cambió 'h-screen' por 'h-[calc(100vh-4rem)]' (alto de la pantalla menos el header)
              - Se agregó 'sticky top-16' para que se "pegue" debajo del header
            */}
            <div className="flex flex-col h-[calc(100vh-4rem)] sticky top-16 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 pt-4">
              
              {/* CAMBIO 4 (Limpieza):
                Se eliminó el bloque 'Información del usuario - Solo móvil' que estaba aquí.
                Era un bloque 'lg:hidden' dentro de un 'lg:flex', por lo que nunca se mostraba.
                Era código duplicado del sidebar móvil.
              */}

              {/* Navigation */}
              <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <span className={`mr-3 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-500'}`}>
                        {item.icon}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {item.description}
                        </div>
                      </div>
                      {isActive && (
                        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Back to Shop */}
              <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  to="/"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <ArrowLeftIcon />
                  <span>Volver a la tienda</span>
                </Link>
              </div>
            </div>
          </div>
        </aside>

        {/* Sidebar - Móvil */}
        <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative flex flex-col h-screen max-w-xs w-full bg-white dark:bg-gray-800">
            {/* Usuario y botón cerrar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {user?.nombre_completo || `${user?.nombre || ''} ${user?.apellido || ''}`.trim() || 'Usuario'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.correo}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 ml-2"
                aria-label="Cerrar menú"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Opciones del menú con scroll */}
            <div className="flex-1 overflow-y-auto">
              <nav className="mt-5 px-2 space-y-1">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <span className={`mr-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-500'}`}>
                        {item.icon}
                      </span>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Volver a la tienda SIEMPRE abajo */}
            <div className="px-2 py-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
              <Link
                to="/"
                onClick={() => setSidebarOpen(false)}
                className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ArrowLeftIcon />
                <span className="ml-3">Volver a la tienda</span>
              </Link>
            </div>
          </div>
        </div>
        <main className="flex-1 flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8 min-h-[calc(100vh-4rem)]">
          <div className="w-full max-w-2xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

// Iconos SVG (sin cambios)
const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const BellIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V9a6 6 0 10-12 0v3l-5 5h5m7 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const ShoppingBagIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const MenuIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);