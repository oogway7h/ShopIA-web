import React from "react";
import { Navigate } from "react-router-dom";
import { getToken, getUser } from "../../services/auth.js";

export default function ProtectedRoute({ children, roles=[] }) {
  const token = getToken();
  if(!token) return <Navigate to="/login" replace />;
  
  const user = getUser();
  if(!user) return <Navigate to="/login" replace />;
  
  // Adaptación: el backend devuelve roles como array de objetos
  if(roles.length > 0) {
    const userRoles = user.roles?.map(r => r.nombre.toLowerCase()) || [];
    const requiredRoles = roles.map(r => r.toLowerCase());
    
    if(!requiredRoles.some(role => userRoles.includes(role))) {
      return <Navigate to="/" replace />;
    }
  }
  
  return children;
}