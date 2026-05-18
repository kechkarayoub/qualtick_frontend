/**
 * ProtectedRoute Component
 * 
 * Wrapper component that protects routes requiring authentication
 * Redirects to login if user is not authenticated.
 * Optionally enforces a permission check — renders a 403 page if denied.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import usePermissions from '../hooks/usePermissions';
import LoadingSpinner from './LoadingSpinner';
import useAuthenticatedWebSocket from '../hooks/useAuthenticatedWebSocket';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission?: string;
  anyOf?: string[];
  allOf?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  permission,
  anyOf,
  allOf,
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  // Destructure all three permission check helpers from the hook
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
  // Capture current path so we can redirect back after login
  const location = useLocation();

  // Establish the WebSocket connection while inside a protected layout
  useAuthenticatedWebSocket();

  // Render a full-screen overlay spinner while the auth state is resolving
  if (isLoading) {
    return <LoadingSpinner overlay />;
  }

  // Redirect unauthenticated users to the login page, storing the attempted
  // path in navigation state so login can redirect back on success
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/auth/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Evaluate the supplied permission constraint (if any).
  // Priority: single `permission` → `anyOf` (OR) → `allOf` (AND)
  let allowed = true;
  if (permission) {
    // Single required codename
    allowed = hasPermission(permission);
  } else if (anyOf && anyOf.length > 0) {
    // User must hold at least one of the listed codenames
    allowed = hasAnyPermission(anyOf);
  } else if (allOf && allOf.length > 0) {
    // User must hold every one of the listed codenames
    allowed = hasAllPermissions(allOf);
  }

  // Redirect to the forbidden page when the permission check fails
  if (!allowed) {
    return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
