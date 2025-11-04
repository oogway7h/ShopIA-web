import React, { useState, useEffect } from 'react';
import { api } from '../../services/apiClient';
import { useAuth } from '../../hooks/useAuth';

export default function CartButton({ className = '', onClick, reload }) {
  const [totalItems, setTotalItems] = useState(0);
  const { isAuthenticated, isClient } = useAuth();

  useEffect(() => {
    if (isAuthenticated && isClient()) {
      api.get('/api/ventas/carrito/')
        .then(data => setTotalItems(data.total_items || 0))
        .catch(() => setTotalItems(0));
    } else {
      setTotalItems(0);
    }
  }, [isAuthenticated, isClient, reload]);

  return (
    <button
      onClick={onClick}
      className={`relative p-2 text-gray-600 hover:text-blue-600 transition-colors ${className}`}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a1 1 0 11-2 0v-6m2 0V9a1 1 0 112 0v4m-6 0h4" />
      </svg>
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </button>
  );
}