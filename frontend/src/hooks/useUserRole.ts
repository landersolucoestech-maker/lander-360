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

/**
 * Hook unificado para buscar roles do usuário.
 * Fonte de verdade: tabela user_roles
 * Fallback: profiles.roles (para compatibilidade com dados legados)
 */
export function useUserRole(): UseUserRoleResult {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!user?.id) {
        setRoles([]);
        setIsLoading(false);
        return;
      }

      try {
        // FONTE PRINCIPAL: user_roles table
        const { data: userRolesData, error: userRolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (!userRolesError && userRolesData && userRolesData.length > 0) {
          // Roles encontradas na tabela user_roles - usar estas
          const mappedRoles = userRolesData.map(r => {
            const role = r.role as string;
            return mapLegacyRole(role);
          });
          // Remove duplicatas
          const uniqueRoles = [...new Set(mappedRoles)];
          setRoles(uniqueRoles);
          setIsLoading(false);
          return;
        }

        // FALLBACK: profiles.roles (dados legados)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('roles')
          .eq('id', user.id)
          .single();

        if (!profileError && profileData?.roles && profileData.roles.length > 0) {
          const mappedRoles = profileData.roles.map((r: string) => mapLegacyRole(r));
          const uniqueRoles = [...new Set(mappedRoles)];
          setRoles(uniqueRoles);
          
          // MIGRAÇÃO AUTOMÁTICA: Copia roles do profile para user_roles
          // Isso unifica os dados gradualmente
          try {
            for (const role of uniqueRoles) {
              await supabase
                .from('user_roles')
                .upsert({ user_id: user.id, role }, { onConflict: 'user_id,role' })
                .select();
            }
            console.log('Roles migradas de profiles para user_roles');
          } catch (migrationError) {
            // Falha silenciosa na migração - não afeta funcionamento
            console.warn('Falha ao migrar roles:', migrationError);
          }
        } else {
          // Nenhuma role encontrada - default para 'leitor'
          setRoles(['leitor']);
        }
      } catch (err) {
        console.error('Error in fetchUserRoles:', err);
        setRoles(['leitor']); // Default seguro
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
