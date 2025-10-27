import { useState, useEffect } from 'react';
import { getToken, getUser, removeToken, removeUser } from '../services/auth';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const userData = getUser();
    
    if (token && userData) {
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const logout = () => {
    removeToken();
    removeUser();
    setUser(null);
    window.location.href = '/';
  };

  const isClient = () => {
    if (!user || !user.roles) return false;
    return user.roles.some(role => role.nombre.toLowerCase() === 'cliente');
  };

  const isAdmin = () => {
    if (!user || !user.roles) return false;
    return user.roles.some(role => 
      role.nombre.toLowerCase() === 'admin' || 
      role.nombre.toLowerCase() === 'administrador'
    );
  };

  return {
    user,
    loading,
    logout,
    isClient,
    isAdmin,
    isAuthenticated: !!user
  };
}