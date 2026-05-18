/**
 * PermissionGate Component Tests
 *
 * Covers:
 *   - renders children when no permission constraint is supplied
 *   - renders children when user holds the required `permission` codename
 *   - renders fallback when user lacks the required `permission` codename
 *   - anyOf: renders children when user holds at least one codename
 *   - anyOf: renders fallback when user holds none of the codenames
 *   - allOf: renders children when user holds all codenames
 *   - allOf: renders fallback when user is missing a codename
 *   - superuser always sees children regardless of constraints
 *   - default fallback is null (renders nothing)
 *   - custom fallback node is rendered when access is denied
 *
 * Run with: yarn test --testPathPattern=PermissionGate.test.tsx --watchAll=false
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import PermissionGate from './PermissionGate';

// ---------------------------------------------------------------------------
// Mock usePermissions so each test controls the permission state
// ---------------------------------------------------------------------------

// Mutable state shared with the mock implementation
const mockPermissionState = {
  isSuperuser: false,
  permissions: [] as string[],
};

jest.mock('../hooks/usePermissions', () => ({
  __esModule: true,
  default: () => ({
    hasPermission: (codename: string) =>
      mockPermissionState.isSuperuser || mockPermissionState.permissions.includes(codename),
    hasAnyPermission: (codenames: string[]) =>
      mockPermissionState.isSuperuser || codenames.some((c) => mockPermissionState.permissions.includes(c)),
    hasAllPermissions: (codenames: string[]) =>
      mockPermissionState.isSuperuser || codenames.every((c) => mockPermissionState.permissions.includes(c)),
  }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const ProtectedContent = () => <div data-testid="protected">Protected</div>;
const FallbackContent = () => <div data-testid="fallback">No Access</div>;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PermissionGate', () => {
  beforeEach(() => {
    // Reset to a clean regular-user state before each test
    mockPermissionState.isSuperuser = false;
    mockPermissionState.permissions = [];
  });

  // ---- No constraints -----------------------------------------------------

  describe('No permission constraints', () => {
    it('renders children when no constraint is given', () => {
      render(
        <PermissionGate>
          <ProtectedContent />
        </PermissionGate>,
      );

      expect(screen.getByTestId('protected')).toBeInTheDocument();
    });
  });

  // ---- single `permission` prop -------------------------------------------

  describe('permission prop (single codename)', () => {
    it('renders children when user holds the codename', () => {
      mockPermissionState.permissions = ['view_audit_logs'];

      render(
        <PermissionGate permission="view_audit_logs">
          <ProtectedContent />
        </PermissionGate>,
      );

      expect(screen.getByTestId('protected')).toBeInTheDocument();
    });

    it('renders nothing by default when user lacks the codename', () => {
      render(
        <PermissionGate permission="manage_permissions">
          <ProtectedContent />
        </PermissionGate>,
      );

      expect(screen.queryByTestId('protected')).not.toBeInTheDocument();
    });

    it('renders custom fallback when user lacks the codename', () => {
      render(
        <PermissionGate permission="manage_permissions" fallback={<FallbackContent />}>
          <ProtectedContent />
        </PermissionGate>,
      );

      expect(screen.queryByTestId('protected')).not.toBeInTheDocument();
      expect(screen.getByTestId('fallback')).toBeInTheDocument();
    });

    it('superuser sees children even without explicit permission', () => {
      mockPermissionState.isSuperuser = true;
      mockPermissionState.permissions = [];

      render(
        <PermissionGate permission="manage_permissions">
          <ProtectedContent />
        </PermissionGate>,
      );

      expect(screen.getByTestId('protected')).toBeInTheDocument();
    });
  });

  // ---- anyOf prop ---------------------------------------------------------

  describe('anyOf prop (OR-check)', () => {
    it('renders children when user holds at least one codename', () => {
      mockPermissionState.permissions = ['view_dashboard'];

      render(
        <PermissionGate anyOf={['manage_permissions', 'view_dashboard']}>
          <ProtectedContent />
        </PermissionGate>,
      );

      expect(screen.getByTestId('protected')).toBeInTheDocument();
    });

    it('renders fallback when user holds none of the codenames', () => {
      render(
        <PermissionGate anyOf={['manage_permissions', 'manage_users']} fallback={<FallbackContent />}>
          <ProtectedContent />
        </PermissionGate>,
      );

      expect(screen.queryByTestId('protected')).not.toBeInTheDocument();
      expect(screen.getByTestId('fallback')).toBeInTheDocument();
    });

    it('superuser always passes the anyOf check', () => {
      mockPermissionState.isSuperuser = true;

      render(
        <PermissionGate anyOf={['manage_permissions']}>
          <ProtectedContent />
        </PermissionGate>,
      );

      expect(screen.getByTestId('protected')).toBeInTheDocument();
    });

    it('renders children when user holds all codenames in anyOf', () => {
      mockPermissionState.permissions = ['manage_permissions', 'view_dashboard'];

      render(
        <PermissionGate anyOf={['manage_permissions', 'view_dashboard']}>
          <ProtectedContent />
        </PermissionGate>,
      );

      expect(screen.getByTestId('protected')).toBeInTheDocument();
    });
  });

  // ---- allOf prop ---------------------------------------------------------

  describe('allOf prop (AND-check)', () => {
    it('renders children when user holds all codenames', () => {
      mockPermissionState.permissions = ['view_audit_logs', 'view_dashboard'];

      render(
        <PermissionGate allOf={['view_audit_logs', 'view_dashboard']}>
          <ProtectedContent />
        </PermissionGate>,
      );

      expect(screen.getByTestId('protected')).toBeInTheDocument();
    });

    it('renders fallback when user is missing one codename', () => {
      mockPermissionState.permissions = ['view_audit_logs'];

      render(
        <PermissionGate allOf={['view_audit_logs', 'manage_permissions']} fallback={<FallbackContent />}>
          <ProtectedContent />
        </PermissionGate>,
      );

      expect(screen.queryByTestId('protected')).not.toBeInTheDocument();
      expect(screen.getByTestId('fallback')).toBeInTheDocument();
    });

    it('superuser always passes the allOf check', () => {
      mockPermissionState.isSuperuser = true;

      render(
        <PermissionGate allOf={['manage_permissions', 'manage_users']}>
          <ProtectedContent />
        </PermissionGate>,
      );

      expect(screen.getByTestId('protected')).toBeInTheDocument();
    });
  });

  // ---- fallback behaviour -------------------------------------------------

  describe('fallback behaviour', () => {
    it('renders null (nothing) by default when access is denied', () => {
      const { container } = render(
        <PermissionGate permission="manage_permissions">
          <ProtectedContent />
        </PermissionGate>,
      );

      // Fragment with no children renders an empty container
      expect(container).toBeEmptyDOMElement();
    });

    it('renders a string fallback', () => {
      render(
        <PermissionGate permission="manage_permissions" fallback="Access denied">
          <ProtectedContent />
        </PermissionGate>,
      );

      expect(screen.getByText('Access denied')).toBeInTheDocument();
    });
  });
});
