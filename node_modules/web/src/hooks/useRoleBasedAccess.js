import { useAuth } from '@/contexts/AuthContext.jsx';

export const useRoleBasedAccess = () => {
  const { currentUser } = useAuth();
  const role = currentUser?.role || 'guest';

  const isSuperAdmin = role === 'super_admin';
  const isAdmin = role === 'admin' || isSuperAdmin;
  const isManager = role === 'manager' || isAdmin;
  const isDispatcher = role === 'dispatcher' || isAdmin;

  const canManageUsers = isSuperAdmin || isAdmin;
  const canViewAllShipments = isAdmin || isManager;
  const canEditCashbook = isAdmin || isDispatcher;

  return {
    role,
    isSuperAdmin,
    isAdmin,
    isManager,
    isDispatcher,
    canManageUsers,
    canViewAllShipments,
    canEditCashbook
  };
};