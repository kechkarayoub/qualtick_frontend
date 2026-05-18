/**
 * usePermissions Hook (React Native)
 *
 * Provides permission-checking utilities derived from the authenticated user's
 * permission list, which is loaded at login and cached locally.
 */

import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useAuth from './useAuth';
import AuthenticatedApiService from '../services/AuthenticatedApiService';

const apiService = AuthenticatedApiService.getInstance();

const usePermissions = () => {
  // Pull the authenticated user object and auth state from the auth hook
  const { user, isAuthenticated } = useAuth();
  // Access the React Query cache so we can update the cached user on refresh
  const queryClient = useQueryClient();
  // Tracks whether a server refresh is in flight
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Cast to `any` because the User type may not include the permissions field
  // in its TypeScript definition; permissions are injected at login by the backend
  const userPermissions = (user as any)?.permissions;

  // Memoised so downstream components only re-render when the list actually changes
  const permissions: string[] = useMemo(
    () => userPermissions ?? [],
    [userPermissions],
  );
  // Superusers bypass all permission checks — derived from the login payload
  const isSuperuser: boolean = (user as any)?.is_superuser ?? false;

  /**
   * Returns true if the current user holds the given permission codename.
   * Superusers always return true regardless of the codename.
   */
  const hasPermission = useCallback(
    (codename: string): boolean => {
      // Superusers have implicit access to every permission
      if (isSuperuser) return true;
      return permissions.includes(codename);
    },
    [permissions, isSuperuser],
  );

  /**
   * Returns true if the user holds at least one of the supplied codenames.
   * Superusers always return true.
   */
  const hasAnyPermission = useCallback(
    (codenames: string[]): boolean => {
      if (isSuperuser) return true;
      // Pass if any single codename is in the user's granted list
      return codenames.some((c) => permissions.includes(c));
    },
    [permissions, isSuperuser],
  );

  /**
   * Returns true only if the user holds ALL of the supplied codenames.
   * Superusers always return true.
   */
  const hasAllPermissions = useCallback(
    (codenames: string[]): boolean => {
      if (isSuperuser) return true;
      // Every codename must be present
      return codenames.every((c) => permissions.includes(c));
    },
    [permissions, isSuperuser],
  );

  /**
   * Fetches the latest permission list from the server and patches the
   * cached user object so the UI reflects any changes without a full logout.
   */
  const refreshPermissions = useCallback(async () => {
    // Do nothing if the user is not logged in
    if (!isAuthenticated) return;
    setIsRefreshing(true);
    try {
      // GET /api/permissions/me/ returns { permissions: string[], is_superuser: bool }
      const response = await apiService.get('/api/permissions/me/');
      const { permissions: fresh, is_superuser } = response.data;
      // Patch only the permission-related fields; leave the rest of the cache intact
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
    isSuperuser,       // Whether the user bypasses all checks
    hasPermission,     // Single-codename check
    hasAnyPermission,  // OR-check across multiple codenames
    hasAllPermissions, // AND-check across multiple codenames
    refreshPermissions,// Pull latest permissions from server
    isRefreshing,      // True while the refresh request is pending
  };
};

export default usePermissions;
