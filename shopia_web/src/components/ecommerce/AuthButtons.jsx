import React from 'react';
import { Link } from 'react-router-dom';

export default function AuthButtons({ className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Link 
        to="/login" 
        className="px-4 py-2 rounded-lg text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 font-medium text-sm"
      >
        Ingresar
      </Link>
      <Link 
        to="/register" 
        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg"
      >
        Registrarse
      </Link>
    </div>
  );
}