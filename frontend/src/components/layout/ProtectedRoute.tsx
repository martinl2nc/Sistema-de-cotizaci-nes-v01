import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  requiredRole?: 'admin' | 'vendedor';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F1115] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si no hay usuario activo, mandar al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si se requiere un rol especifico y el usuario no lo tiene
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />; // O se puede crear un /unauthorized
  }

  // Si todo esta bien, renderizar las rutas anidadas
  return <Outlet />;
};
