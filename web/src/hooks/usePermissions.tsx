/**
 * usePermissions Hook
 *
 * Provides permission-checking utilities derived from the authenticated user's
 * permission list. Permissions are loaded at login and cached locally.
 * An optional refresh from the server is also exposed.
 */

import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useAuth from './useAuth';
import AuthenticatedApiService from '../services/AuthenticatedApiService';

const apiService = AuthenticatedApiService.getInstance();

const usePermissions = () => {
  // Pull the authenticated user object and auth state from the auth hook
  const { user, isAuthenticated } = useAuth();
  // Access the React Query cache so we can update the cached user on refresh
  const queryClient = useQueryClient();
  // Tracks whether a server refresh request is in flight
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Permissions are embedded in the user object at login time by the backend
  const permissions: string[] = user?.permissions ?? [];
  // Superusers bypass all per-codename checks
  const isSuperuser: boolean = user?.is_superuser ?? false;

  /**
   * Returns true if the user holds the given permission codename.
   * Superusers implicitly pass every check.
   */
  const hasPermission = useCallback(
    (codename: string): boolean => {
      // Superuser shortcut — no need to inspect the permission list
      if (isSuperuser) return true;
      return permissions.includes(codename);
    },
    [permissions, isSuperuser],
  );

  /**
   * Returns true if the user holds at least one of the given codenames.
   * Superusers always return true.
   */
  const hasAnyPermission = useCallback(
    (codenames: string[]): boolean => {
      if (isSuperuser) return true;
      // OR-semantics: any single match is enough
      return codenames.some((c) => permissions.includes(c));
    },
    [permissions, isSuperuser],
  );

  /**
   * Returns true only if the user holds ALL of the given codenames.
   * Superusers always return true.
   */
  const hasAllPermissions = useCallback(
    (codenames: string[]): boolean => {
      if (isSuperuser) return true;
      // AND-semantics: every codename must be present
      return codenames.every((c) => permissions.includes(c));
    },
    [permissions, isSuperuser],
  );

  /**
   * Refresh permissions from the server and update the cached user object.
   * Useful after an admin changes a user's grants without forcing re-login.
   */
  const refreshPermissions = useCallback(async () => {
    // Skip if the user is not authenticated
    if (!isAuthenticated) return;
    setIsRefreshing(true);
    try {
      // GET /api/permissions/me/ returns { permissions: string[], is_superuser: bool }
      const response = await apiService.get('/api/permissions/me/');
      const { permissions: fresh, is_superuser } = response.data;
      // Merge updated permissions into the cached user profile without a full refetch
      queryClient.setQueryData(['user', 'profile'], (prev: any) => ({
        ...prev,
        permissions: fresh,
        is_superuser,
      }));
    } catch (err) {
      console.error('Failed to refresh permissions', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [isAuthenticated, queryClient]);

  return {
    permissions,       // Full list of granted codenames
    isSuperuser,       // Whether the user bypasses all permission checks
    hasPermission,     // Single-codename check
    hasAnyPermission,  // OR-check across multiple codenames
    hasAllPermissions, // AND-check across multiple codenames
    refreshPermissions,// Pull latest permissions from the server
    isRefreshing,      // True while the refresh request is in flight
  };
};

export default usePermissions;
