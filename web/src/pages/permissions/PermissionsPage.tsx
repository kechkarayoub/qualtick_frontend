import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import AuthenticatedApiService from '../../services/AuthenticatedApiService';
import LoadingSpinner from '../../components/LoadingSpinner';
import './PermissionsPage.css';

const apiService = AuthenticatedApiService.getInstance();

interface UserRow {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_superuser: boolean;
  permissions: string[];
}

interface AvailablePermission {
  codename: string;
  label: string;
}

const PermissionsPage: React.FC = () => {
  const { t } = useTranslation();

  const [users, setUsers] = useState<UserRow[]>([]);
  const [available, setAvailable] = useState<AvailablePermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [edited, setEdited] = useState<Record<number, string[]>>({});
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersRes, availableRes] = await Promise.all([
        apiService.get('/api/permissions/users/'),
        apiService.get('/api/permissions/available/'),
      ]);
      setUsers(usersRes.data.users);
      setAvailable(availableRes.data.permissions);
    } catch {
      toast.error(t('errors:general.serverError', 'Failed to load permissions'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getPermissions = (user: UserRow): string[] =>
    edited[user.id] !== undefined ? edited[user.id] : user.permissions;

  const togglePermission = (userId: number, codename: string) => {
    const user = users.find((u) => u.id === userId)!;
    const current = getPermissions(user);
    const next = current.includes(codename)
      ? current.filter((c) => c !== codename)
      : [...current, codename];
    setEdited((prev) => ({ ...prev, [userId]: next }));
  };

  const savePermissions = async (userId: number) => {
    const user = users.find((u) => u.id === userId)!;
    const perms = getPermissions(user);
    setSaving(userId);
    try {
      await apiService.put(`/api/permissions/users/${userId}/`, { permissions: perms });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, permissions: perms } : u)),
      );
      setEdited((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      toast.success(t('permissions:saved', 'Permissions saved'));
    } catch {
      toast.error(t('errors:general.serverError', 'Failed to save permissions'));
    } finally {
      setSaving(null);
    }
  };

  const cancelEdit = (userId: number) => {
    setEdited((prev) => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  };

  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading) return <LoadingSpinner overlay />;

  return (
    <div className="permissions-page">
      <div className="permissions-page__header">
        <h1 className="permissions-page__title">
          {t('permissions:title', 'User Permissions')}
        </h1>
        <p className="permissions-page__subtitle">
          {t('permissions:subtitle', 'Manage access rights for each user.')}
        </p>
      </div>

      <div className="permissions-page__search-row">
        <input
          type="text"
          className="permissions-page__search"
          placeholder={t('common:search', 'Search users…')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="permissions-page__table-wrap">
        <table className="permissions-page__table">
          <thead>
            <tr>
              <th className="permissions-page__th permissions-page__th--user">
                {t('permissions:user', 'User')}
              </th>
              {available.map((p) => (
                <th key={p.codename} className="permissions-page__th permissions-page__th--perm">
                  <span className="permissions-page__perm-label" title={p.label}>
                    {p.label}
                  </span>
                </th>
              ))}
              <th className="permissions-page__th permissions-page__th--actions">
                {t('common:actions', 'Actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => {
              const perms = getPermissions(user);
              const isDirty = edited[user.id] !== undefined;
              return (
                <tr
                  key={user.id}
                  className={`permissions-page__row ${isDirty ? 'permissions-page__row--dirty' : ''}`}
                >
                  <td className="permissions-page__td permissions-page__td--user">
                    <div className="permissions-page__user-name">
                      {user.first_name} {user.last_name}
                      {user.is_superuser && (
                        <span className="permissions-page__badge permissions-page__badge--super">
                          {t('permissions:superuser', 'Superuser')}
                        </span>
                      )}
                    </div>
                    <div className="permissions-page__user-meta">{user.email}</div>
                  </td>
                  {available.map((p) => (
                    <td key={p.codename} className="permissions-page__td permissions-page__td--check">
                      <input
                        type="checkbox"
                        className="permissions-page__checkbox"
                        checked={user.is_superuser || perms.includes(p.codename)}
                        disabled={user.is_superuser || saving === user.id}
                        onChange={() => togglePermission(user.id, p.codename)}
                        aria-label={p.label}
                      />
                    </td>
                  ))}
                  <td className="permissions-page__td permissions-page__td--actions">
                    {isDirty && (
                      <>
                        <button
                          className="permissions-page__btn permissions-page__btn--save"
                          onClick={() => savePermissions(user.id)}
                          disabled={saving === user.id}
                        >
                          {saving === user.id
                            ? t('common:saving', 'Saving…')
                            : t('common:save', 'Save')}
                        </button>
                        <button
                          className="permissions-page__btn permissions-page__btn--cancel"
                          onClick={() => cancelEdit(user.id)}
                          disabled={saving === user.id}
                        >
                          {t('common:cancel', 'Cancel')}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={available.length + 2}
                  className="permissions-page__td permissions-page__td--empty"
                >
                  {t('common:noResults', 'No users found.')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PermissionsPage;
