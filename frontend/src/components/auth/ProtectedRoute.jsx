import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-50 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="w-12 h-12 rounded-2xl bg-terracotta-500 text-white flex items-center justify-center font-heading font-extrabold text-xl shadow-warm-md animate-pulse">
              TF
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-base text-warm-900">
              Loading TeamFlow...
            </h3>
            <p className="text-xs text-warm-500">
              Validating session and syncing workspace permissions
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
