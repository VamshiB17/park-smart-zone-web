import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  redirectTo = '/auth' 
}: ProtectedRouteProps) {
  const { currentUser } = useAuth();

  // Not authenticated - redirect to auth page
  if (!currentUser) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role requirement
  if (requiredRole && currentUser.role !== requiredRole) {
    // If user is admin but trying to access user route, redirect to admin dashboard
    if (currentUser.role === 'admin' && requiredRole === 'user') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    // If user is regular user but trying to access admin route, redirect to user dashboard
    if (currentUser.role === 'user' && requiredRole === 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}