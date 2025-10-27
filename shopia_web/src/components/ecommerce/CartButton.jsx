import React from 'react';

export default function CartButton({ itemCount = 0, className = "" }) {
  return (
    <a 
      href="/carrito" 
      className={`relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 ${className}`}
      aria-label="Ver carrito de compras"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        className="w-6 h-6 text-gray-700"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c.621-1.62 1.3-3.223 1.9-4.897a2.25 2.25 0 0 0-2.16-3.103H5.166c-1.121 0-2.126.666-2.583 1.681L2.25 3Z" 
        />
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M7.5 14.25 6 20.25m0 0a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm11.25 0a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" 
        />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center bg-red-500 text-white text-xs font-semibold rounded-full h-5 w-5 animate-pulse">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </a>
  );
}