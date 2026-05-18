/**
 * usePermissions Hook Tests (Web)
 *
 * Covers:
 *   - permissions list derived from user object
 *   - isSuperuser flag derived from user object
 *   - hasPermission  — single codename check (regular user & superuser)
 *   - hasAnyPermission — OR-check (regular user & superuser)
 *   - hasAllPermissions — AND-check (regular user & superuser)
 *   - refreshPermissions — server fetch + cache patch
 *   - refreshPermissions when unauthenticated (no-op)
 *   - isRefreshing state transitions
 *
 * Run with: yarn test --testPathPattern=usePermissions.test.tsx --watchAll=false
 */

import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import usePermissions from './usePermissions';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Control authenticated user from each test
const mockUser: Record<string, any> = {
  id: 1,
  is_superuser: false,
  permissions: ['view_audit_logs', 'view_dashboard'],
};
const mockIsAuthenticated = jest.fn(() => true);

jest.mock('./useAuth', () => ({
  __esModule: true,
  default: () => ({
    user: mockUser,
    isAuthenticated: mockIsAuthenticated(),
  }),
}));

// Mock the API service.
// The factory runs before variable declarations (jest hoisting), so we capture
// the mock function *inside* the factory and expose it on the module object for
// test access via `require()`.
jest.mock('../services/AuthenticatedApiService', () => {
  const mockGet = jest.fn();
  return {
    getInstance: jest.fn().mockReturnValue({ get: mockGet }),
    _mockGet: mockGet, // exposed so tests can control the response
  };
});

// Retrieve the already-created mock function after jest.mock has run
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockApiGet: jest.Mock = require('../services/AuthenticatedApiService')._mockGet;

// ---------------------------------------------------------------------------
// Test wrapper providing React Query context
// ---------------------------------------------------------------------------
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { Wrapper, queryClient };
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('usePermissions (web)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset user to a known state before each test
    mockUser.is_superuser = false;
    mockUser.permissions = ['view_audit_logs', 'view_dashboard'];
    mockIsAuthenticated.mockReturnValue(true);
  });

  // ---- permissions list ---------------------------------------------------

  describe('permissions list', () => {
    it('returns permissions from user object', () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => usePermissions(), { wrapper: Wrapper });

      expect(result.current.permissions).toEqual(['view_audit_logs', 'view_dashboard']);
    });

    it('returns empty array when user has no permissions', () => {
      mockUser.permissions = undefined;
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => usePermissions(), { wrapper: Wrapper });

      expect(result.current.permissions).toEqual([]);
    });
  });

  // ---- isSuperuser --------------------------------------------------------

  describe('isSuperuser', () => {
    it('reflects false for regular user', () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => usePermissions(), { wrapper: Wrapper });

      expect(result.current.isSuperuser).toBe(false);
    });

    it('reflects true for superuser', () => {
      mockUser.is_superuser = true;
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => usePermissions(), { wrapper: Wrapper });

      expect(result.current.isSuperuser).toBe(true);
    });
  });

  // ---- hasPermission -------------------------------------------------------

  describe('hasPermission', () => {
    it('returns true when user has the codename', () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => usePermissions(), { wrapper: Wrapper });

      expect(result.current.hasPermission('view_audit_logs')).toBe(true);
    });

    it('returns false when user lacks the codename', () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => usePermissions(), { wrapper: Wrapper });

      expect(result.current.hasPermission('manage_permissions')).toBe(false);
    });

    it('superuser returns true for any codename', () => {
      mockUser.is_superuser = true;
      mockUser.permissions = []; // no explicit grants
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => usePermissions(), { wrapper: Wrapper });

      expect(result.current.hasPermission('manage_permissions')).toBe(true);
    });
  });

  // ---- hasAnyPermission ---------------------------------------------------

  describe('hasAnyPermission', () => {
    it('returns true when user holds at least one codename', () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => usePermissions(), { wrapper: Wrapper });

      expect(result.current.hasAnyPermission(['manage_permissions', 'view_audit_logs'])).toBe(true);
    });

    it('returns false when user holds none of the codenames', () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => usePermissions(), { wrapper: Wrapper });

      expect(result.current.hasAnyPermission(['manage_permissions', 'manage_users'])).toBe(false);
    });

    it('superuser returns true regardless', () => {
      mockUser.is_superuser = true;
      mockUser.permissions = [];
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => usePermissions(), { wrapper: Wrapper });

      expect(result.current.hasAnyPermission(['manage_permissions'])).toBe(true);
    });
  });

  // ---- hasAllPermissions --------------------------------------------------

  describe('hasAllPermissions', () => {
    it('returns true when user holds all codenames', () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => usePermissions(), { wrapper: Wrapper });

      expect(result.current.hasAllPermissions(['view_audit_logs', 'view_dashboard'])).toBe(true);
    });

    it('returns false when user is missing at least one codename', () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => usePermissions(), { wrapper: Wrapper });

      expect(result.current.hasAllPermissions(['view_audit_logs', 'manage_permissions'])).toBe(false);
    });

    it('superuser returns true regardless', () => {
      mockUser.is_superuser = true;
      mockUser.permissions = [];
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => usePermissions(), { wrapper: Wrapper });

      expect(result.current.hasAllPermissions(['manage_permissions', 'manage_users'])).toBe(true);
    });
  });

  // ---- refreshPermissions -------------------------------------------------

  describe('refreshPermissions', () => {
    it('fetches from server and updates cached permissions', async () => {
      // Simulate server returning updated permission list
      mockApiGet.mockResolvedValueOnce({
        data: { permissions: ['manage_permissions'], is_superuser: false },
      });

      const { Wrapper, queryClient } = createWrapper();
      // Pre-seed the cache with initial user data
      queryClient.setQueryData(['user', 'profile'], mockUser);

      const { result } = renderHook(() => usePermissions(), { wrapper: Wrapper });

      await act(async () => {
        await result.current.refreshPermissions();
      });

      // The cache should have been patched with the fresh permission list
      const cached = queryClient.getQueryData<any>(['user', 'profile']);
      expect(cached?.permissions).toEqual(['manage_permissions']);
      expect(mockApiGet).toHaveBeenCalledWith('/api/permissions/me/');
    });

    it('does nothing when the user is not authenticated', async () => {
      mockIsAuthenticated.mockReturnValue(false);

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => usePermissions(), { wrapper: Wrapper });

      await act(async () => {
        await result.current.refreshPermissions();
      });

      // No API call should have been made
      expect(mockApiGet).not.toHaveBeenCalled();
    });

    it('sets isRefreshing to true during the request', async () => {
      // Delay the API response so we can observe the in-flight state
      let resolveApi!: (v: any) => void;
      mockApiGet.mockReturnValueOnce(
        new Promise((res) => { resolveApi = res; }),
      );

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => usePermissions(), { wrapper: Wrapper });

      // Start the refresh but do not await it yet
      act(() => {
        result.current.refreshPermissions();
      });

      expect(result.current.isRefreshing).toBe(true);

      // Resolve the pending API call
      await act(async () => {
        resolveApi({ data: { permissions: [], is_superuser: false } });
      });

      expect(result.current.isRefreshing).toBe(false);
    });

    it('resets isRefreshing to false even when the server call fails', async () => {
      mockApiGet.mockRejectedValueOnce(new Error('network error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => usePermissions(), { wrapper: Wrapper });

      await act(async () => {
        await result.current.refreshPermissions();
      });

      expect(result.current.isRefreshing).toBe(false);
      consoleSpy.mockRestore();
    });
  });
});
