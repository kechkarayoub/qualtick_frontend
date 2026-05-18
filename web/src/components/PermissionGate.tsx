/**
 * PermissionGate Component
 *
 * Conditionally renders children only if the authenticated user holds
 * the required permission(s).
 *
 * Props:
 *   permission        — single codename that must be granted
 *   anyOf             — array: user must have at least one
 *   allOf             — array: user must have all
 *   fallback          — rendered when permission check fails (default: null)
 */

import React from 'react';
import usePermissions from '../hooks/usePermissions';

interface PermissionGateProps {
  permission?: string;
  anyOf?: string[];
  allOf?: string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  anyOf,
  allOf,
  fallback = null,
  children,
}) => {
  // Retrieve permission check helpers from the auth-aware hook
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  // Default to allowed; tighten based on supplied props
  let allowed = true;

  if (permission) {
    // Single required codename — simplest case
    allowed = hasPermission(permission);
  } else if (anyOf && anyOf.length > 0) {
    // OR-semantics: at least one codename must be granted
    allowed = hasAnyPermission(anyOf);
  } else if (allOf && allOf.length > 0) {
    // AND-semantics: every codename must be granted
    allowed = hasAllPermissions(allOf);
  }

  // Render children when allowed, otherwise render the fallback (default: nothing)
  return <>{allowed ? children : fallback}</>;
};

export default PermissionGate;
