import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

export default function UserMenu({ user, onLogout, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      {/* Avatar/Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Menú de usuario"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
        </div>
        <span className="hidden md:block text-gray-700 font-medium text-sm max-w-24 truncate">
          {user?.nombre || 'Usuario'}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.nombre_completo || `${user?.nombre || ''} ${user?.apellido || ''}`.trim() || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.correo || 'usuario@ejemplo.com'}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <MenuItem 
              icon={<UserIcon />}
              text="Mi Perfil"
              onClick={() => { setIsOpen(false); navigate("/cliente/perfil"); }}
            />
            <MenuItem 
              icon={<ShoppingBagIcon />}
              text="Mis Compras"
              onClick={() => { setIsOpen(false); navigate("/cliente/compras"); }}
            />
            <MenuItem 
              icon={<BellIcon />}
              text="Notificaciones"
              onClick={() => { setIsOpen(false); navigate("/cliente/notificaciones"); }}
              badge={
                <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
              }
            />
            
            
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
            >
              <LogoutIcon />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente helper para items del menú
function MenuItem({ icon, text, href, badge, onClick }) {
  const Component = onClick ? 'button' : 'a';
  return (
    <Component
      href={href}
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 justify-start text-left"
    >
      <span className="text-gray-400">{icon}</span>
      <span className="flex-1 text-left">{text}</span>
      {badge && (
        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
          {badge}
        </span>
      )}
    </Component>
  );
}

// Iconos SVG
const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const ShoppingBagIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const BellIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V9a6 6 0 10-12 0v3l-5 5h5m7 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

export function UserProfile({ user, onUpdate }) {
  const [edit, setEdit] = useState(false);
  const [formData, setFormData] = useState({
    nombre: user.nombre || '',
    apellido: user.apellido || '',
    correo: user.correo || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
    setEdit(false);
  };

  return (
    <div className="p-4 rounded-lg bg-white shadow-md">
      <h2 className="text-lg font-semibold mb-4">Perfil de Usuario</h2>
      {!edit ? (
        <div>
          <p className="text-gray-700">
            <strong>Nombre:</strong> {user.nombre}
          </p>
          <p className="text-gray-700">
            <strong>Apellido:</strong> {user.apellido}
          </p>
          <p className="text-gray-700">
            <strong>Correo:</strong> {user.correo}
          </p>
          <button
            type="button"
            onClick={() => setEdit(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition-colors duration-200"
          >
            Editar Perfil
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Apellido
              </label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Correo
              </label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700 transition-colors duration-200"
            >
              Guardar Cambios
            </button>
            <button
              type="button"
              onClick={() => setEdit(false)}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition-colors duration-200"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}