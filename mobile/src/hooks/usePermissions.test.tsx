/**
 * usePermissions Hook Tests (React Native)
 *
 * Covers:
 *   - permissions list derived from user object
 *   - isSuperuser flag
 *   - hasPermission  — single codename (regular user & superuser)
 *   - hasAnyPermission — OR-check (regular user & superuser)
 *   - hasAllPermissions — AND-check (regular user & superuser)
 *   - refreshPermissions — server fetch + cache patch
 *   - refreshPermissions when unauthenticated (no-op)
 *   - isRefreshing resets to false after failure
 *
 * Uses a wrapper component pattern because @testing-library/react-native
 * is not installed; hook state is captured via a React ref.
 *
 * Run with: yarn test --testPathPattern="src/hooks/usePermissions" --watchAll=false
 */

import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import usePermissions from './usePermissions';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mutable state controlled per-test; read by the useAuth mock
const mockUser: Record<string, any> = {
  id: 1,
  is_superuser: false,
  permissions: ['view_audit_logs', 'view_dashboard'],
};
const mockIsAuthenticated = jest.fn(() => true);

jest.mock('./useAuth', () => ({
  __esModule: true,
  // Evaluated at call time, so mockUser mutations are visible
  default: () => ({
    user: mockUser,
    isAuthenticated: mockIsAuthenticated(),
  }),
}));

// Mock the API service — factory runs before variable declarations (hoisting),
// so we expose the mock `get` function on the module object for test access.
jest.mock('../services/AuthenticatedApiService', () => {
  const mockGet = jest.fn();
  return {
    getInstance: jest.fn().mockReturnValue({ get: mockGet }),
    _mockGet: mockGet,
  };
});

// Retrieve the already-created mock function after jest.mock has run
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockApiGet: jest.Mock = require('../services/AuthenticatedApiService')._mockGet;

// ---------------------------------------------------------------------------
// Helper: render the hook inside a QueryClientProvider and capture its result
// ---------------------------------------------------------------------------
type HookResult = ReturnType<typeof usePermissions>;

const createHookWrapper = (queryClient: QueryClient) => {
  // Mutable ref updated on every render so tests always see the latest value
  const resultRef = { current: null as unknown as HookResult };

  const HookCapture = () => {
    const result = usePermissions();
    resultRef.current = result;
    return null;
  };

  const Wrapper = () => (
    <QueryClientProvider client={queryClient}>
      <HookCapture />
    </QueryClientProvider>
  );

  return { resultRef, Wrapper };
};

const makeQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('usePermissions (mobile)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset to a known regular-user state before each test
    mockUser.is_superuser = false;
    mockUser.permissions = ['view_audit_logs', 'view_dashboard'];
    mockIsAuthenticated.mockReturnValue(true);
  });

  // ---- permissions list ---------------------------------------------------

  describe('permissions list', () => {
    it('returns permissions from user object', () => {
      const queryClient = makeQueryClient();
      const { resultRef, Wrapper } = createHookWrapper(queryClient);
      act(() => { ReactTestRenderer.create(<Wrapper />); });

      expect(resultRef.current.permissions).toEqual(['view_audit_logs', 'view_dashboard']);
    });

    it('returns empty array when user has no permissions', () => {
      mockUser.permissions = undefined;
      const queryClient = makeQueryClient();
      const { resultRef, Wrapper } = createHookWrapper(queryClient);
      act(() => { ReactTestRenderer.create(<Wrapper />); });

      expect(resultRef.current.permissions).toEqual([]);
    });
  });

  // ---- isSuperuser --------------------------------------------------------

  describe('isSuperuser', () => {
    it('is false for a regular user', () => {
      const queryClient = makeQueryClient();
      const { resultRef, Wrapper } = createHookWrapper(queryClient);
      act(() => { ReactTestRenderer.create(<Wrapper />); });

      expect(resultRef.current.isSuperuser).toBe(false);
    });

    it('is true for a superuser', () => {
      mockUser.is_superuser = true;
      const queryClient = makeQueryClient();
      const { resultRef, Wrapper } = createHookWrapper(queryClient);
      act(() => { ReactTestRenderer.create(<Wrapper />); });

      expect(resultRef.current.isSuperuser).toBe(true);
    });
  });

  // ---- hasPermission -------------------------------------------------------

  describe('hasPermission', () => {
    it('returns true when the user holds the codename', () => {
      const queryClient = makeQueryClient();
      const { resultRef, Wrapper } = createHookWrapper(queryClient);
      act(() => { ReactTestRenderer.create(<Wrapper />); });

      expect(resultRef.current.hasPermission('view_audit_logs')).toBe(true);
    });

    it('returns false when the user lacks the codename', () => {
      const queryClient = makeQueryClient();
      const { resultRef, Wrapper } = createHookWrapper(queryClient);
      act(() => { ReactTestRenderer.create(<Wrapper />); });

      expect(resultRef.current.hasPermission('manage_permissions')).toBe(false);
    });

    it('superuser returns true for any codename', () => {
      mockUser.is_superuser = true;
      mockUser.permissions = [];
      const queryClient = makeQueryClient();
      const { resultRef, Wrapper } = createHookWrapper(queryClient);
      act(() => { ReactTestRenderer.create(<Wrapper />); });

      expect(resultRef.current.hasPermission('manage_permissions')).toBe(true);
    });
  });

  // ---- hasAnyPermission ---------------------------------------------------

  describe('hasAnyPermission', () => {
    it('returns true when the user holds at least one codename', () => {
      const queryClient = makeQueryClient();
      const { resultRef, Wrapper } = createHookWrapper(queryClient);
      act(() => { ReactTestRenderer.create(<Wrapper />); });

      expect(resultRef.current.hasAnyPermission(['manage_permissions', 'view_audit_logs'])).toBe(true);
    });

    it('returns false when the user holds none of the codenames', () => {
      const queryClient = makeQueryClient();
      const { resultRef, Wrapper } = createHookWrapper(queryClient);
      act(() => { ReactTestRenderer.create(<Wrapper />); });

      expect(resultRef.current.hasAnyPermission(['manage_permissions', 'manage_users'])).toBe(false);
    });

    it('superuser returns true regardless', () => {
      mockUser.is_superuser = true;
      mockUser.permissions = [];
      const queryClient = makeQueryClient();
      const { resultRef, Wrapper } = createHookWrapper(queryClient);
      act(() => { ReactTestRenderer.create(<Wrapper />); });

      expect(resultRef.current.hasAnyPermission(['manage_permissions'])).toBe(true);
    });
  });

  // ---- hasAllPermissions --------------------------------------------------

  describe('hasAllPermissions', () => {
    it('returns true when the user holds all codenames', () => {
      const queryClient = makeQueryClient();
      const { resultRef, Wrapper } = createHookWrapper(queryClient);
      act(() => { ReactTestRenderer.create(<Wrapper />); });

      expect(resultRef.current.hasAllPermissions(['view_audit_logs', 'view_dashboard'])).toBe(true);
    });

    it('returns false when the user is missing one codename', () => {
      const queryClient = makeQueryClient();
      const { resultRef, Wrapper } = createHookWrapper(queryClient);
      act(() => { ReactTestRenderer.create(<Wrapper />); });

      expect(resultRef.current.hasAllPermissions(['view_audit_logs', 'manage_permissions'])).toBe(false);
    });

    it('superuser returns true regardless', () => {
      mockUser.is_superuser = true;
      mockUser.permissions = [];
      const queryClient = makeQueryClient();
      const { resultRef, Wrapper } = createHookWrapper(queryClient);
      act(() => { ReactTestRenderer.create(<Wrapper />); });

      expect(resultRef.current.hasAllPermissions(['manage_permissions', 'manage_users'])).toBe(true);
    });
  });

  // ---- refreshPermissions -------------------------------------------------

  describe('refreshPermissions', () => {
    it('fetches from server and patches the cached user', async () => {
      mockApiGet.mockResolvedValueOnce({
        data: { permissions: ['manage_permissions'], is_superuser: false },
      });
      const queryClient = makeQueryClient();
      // Pre-seed the cache so the setQueryData patch has something to merge into
      queryClient.setQueryData(['user', 'profile'], { ...mockUser });
      const { resultRef, Wrapper } = createHookWrapper(queryClient);
      act(() => { ReactTestRenderer.create(<Wrapper />); });

      await act(async () => {
        await resultRef.current.refreshPermissions();
      });

      const cached = queryClient.getQueryData<any>(['user', 'profile']);
      expect(cached?.permissions).toEqual(['manage_permissions']);
      expect(mockApiGet).toHaveBeenCalledWith('/api/permissions/me/');
    });

    it('does nothing when the user is not authenticated', async () => {
      mockIsAuthenticated.mockReturnValue(false);
      const queryClient = makeQueryClient();
      const { resultRef, Wrapper } = createHookWrapper(queryClient);
      act(() => { ReactTestRenderer.create(<Wrapper />); });

      await act(async () => {
        await resultRef.current.refreshPermissions();
      });

      // No API call because user is not authenticated
      expect(mockApiGet).not.toHaveBeenCalled();
    });

    it('resets isRefreshing to false even when the server call fails', async () => {
      mockApiGet.mockRejectedValueOnce(new Error('network error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const queryClient = makeQueryClient();
      const { resultRef, Wrapper } = createHookWrapper(queryClient);
      act(() => { ReactTestRenderer.create(<Wrapper />); });

      await act(async () => {
        await resultRef.current.refreshPermissions();
      });

      expect(resultRef.current.isRefreshing).toBe(false);
      consoleSpy.mockRestore();
    });
  });
});
