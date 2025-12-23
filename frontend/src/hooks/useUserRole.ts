import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/permissions';

interface UseUserRoleResult {
  roles: UserRole[];
  isLoading: boolean;
  primaryRole: UserRole;
  hasRole: (role: UserRole) => boolean;
  isAdmin: boolean;
}

/**
 * Hook para acessar roles do usuário.
 * Agora usa o AuthContext centralizado como fonte única de verdade.
 * Isso garante sincronização entre ProtectedRoute, Sidebar e qualquer outro componente.
 */
export function useUserRole(): UseUserRoleResult {
  const { permissions, isFullyLoaded } = useAuth();

  const hasRole = (role: UserRole): boolean => {
    if (permissions.isAdmin) return true;
    return permissions.roles.includes(role);
  };

  return {
    roles: permissions.roles,
    isLoading: !isFullyLoaded,
    primaryRole: permissions.primaryRole,
    hasRole,
    isAdmin: permissions.isAdmin,
  };
}
