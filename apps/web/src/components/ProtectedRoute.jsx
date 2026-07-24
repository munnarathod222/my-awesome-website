import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess.js';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser, isAuthenticated, initialLoading } = useAuth();
  const { role } = useRoleBasedAccess();
  const location = useLocation();

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Master Superuser (munnarathod222@gmail.com) always bypasses role checks
  const isMasterSuperuser = currentUser?.email?.toLowerCase() === 'munnarathod222@gmail.com' || role === 'superuser' || role === 'super_admin';

  if (allowedRoles.length > 0 && !allowedRoles.includes(role) && !isMasterSuperuser) {
    // If user is authenticated but doesn't have the right role, redirect to dashboard
    const redirectPath = (role === 'Client' || role === 'client') ? "/client-portal" : "/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;