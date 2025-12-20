import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, mapLegacyRole } from '@/lib/permissions';

interface UseUserRoleResult {
  roles: UserRole[];
  isLoading: boolean;
  primaryRole: UserRole;
  hasRole: (role: UserRole) => boolean;
  isAdmin: boolean;
}

export function useUserRole(): UseUserRoleResult {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileRoles = async () => {
      if (!user?.id) return;
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('roles')
        .eq('id', user.id)
        .single();
      
      if (profileData?.roles && profileData.roles.length > 0) {
        // Map legacy roles to new role system
        const mappedRoles = profileData.roles.map((r: string) => mapLegacyRole(r));
        setRoles(mappedRoles);
      } else {
        // Default for new users without roles
        setRoles(['leitor']);
      }
    };

    const fetchUserRoles = async () => {
      if (!user?.id) {
        setRoles([]);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching user roles:', error);
          // Fallback to profile roles
          await fetchProfileRoles();
        } else if (data && data.length > 0) {
          // Map DB roles to frontend roles
          const mappedRoles = data.map(r => {
            const role = r.role as string;
            return mapLegacyRole(role);
          });
          setRoles(mappedRoles);
        } else {
          // No roles in user_roles table - check profile
          await fetchProfileRoles();
        }
      
      } catch (err) {
        console.error('Error in fetchUserRoles:', err);
        setRoles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRoles();
  }, [user?.id]);

  const hasRole = (role: UserRole): boolean => {
    if (roles.includes('admin')) return true;
    return roles.includes(role);
  };

  const getPrimaryRole = (): UserRole => {
    const priorityOrder: UserRole[] = ['admin', 'gestor_artistico', 'financeiro', 'marketing', 'artista', 'colaborador', 'leitor'];
    for (const role of priorityOrder) {
      if (roles.includes(role)) return role;
    }
    return 'leitor';
  };

  return {
    roles,
    isLoading,
    primaryRole: getPrimaryRole(),
    hasRole,
    isAdmin: roles.includes('admin'),
  };
}
