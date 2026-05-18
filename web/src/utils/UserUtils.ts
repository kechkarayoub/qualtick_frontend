
import { Dict } from 'styled-components/dist/types';
import HomeIcon from '../components/icons/HomeIcon';
import SettingsIcon from '../components/icons/SettingsIcon';
import ShieldIcon from '../components/icons/ShieldIcon';

/**
 * Utility function to get menu items based on user permissions
 * 
 * @param user - User object containing permissions
 * @param t - Translation function
 * @returns Array of menu items
 */
export const getMenuItems = (user: Dict, t: (key: string) => string) => {
  // Start with the items every authenticated user should see
  const menuItems = [
    {
      key: 'home',
      label: t('navigation:home'),
      path: '/',
      icon: HomeIcon,
    },
  ];

  // Extract permissions and superuser flag from the user object.
  // Both fields are embedded in the login response by the backend.
  const perms: string[] = user?.permissions ?? [];
  const isSuperuser: boolean = user?.is_superuser ?? false;

  // Only show the Permissions menu item to superusers or users who hold the
  // `manage_permissions` codename — mirrors the ProtectedRoute guard in App.tsx
  if (isSuperuser || perms.includes('manage_permissions')) {
    menuItems.push({
      key: 'permissions',
      label: t('navigation:permissions'),
      path: '/permissions',
      icon: ShieldIcon,
    });
  }

  // Settings is visible to all authenticated users
  menuItems.push({
    key: 'settings',
    label: t('navigation:settings'),
    path: '/settings',
    icon: SettingsIcon,
  });

  return menuItems;
};

