import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole, mapLegacyRole } from '@/lib/permissions';

interface UserPermissions {
  roles: UserRole[];
  primaryRole: UserRole;
  isAdmin: boolean;
  canAccess: (module: string) => boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  permissionsLoading: boolean;
  permissions: UserPermissions;
  isFullyLoaded: boolean; // Auth + Permissions carregados
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
}

// Mapeamento de rotas para módulos de permissão
const routeToModuleMap: Record<string, string[]> = {
  '/': ['dashboard'],
  '/artistas': ['artistas'],
  '/projetos': ['projetos'],
  '/registro-musicas': ['registro_musicas'],
  '/lancamentos': ['lancamentos'],
  '/contratos': ['contratos'],
  '/financeiro': ['financeiro'],
  '/contabilidade': ['financeiro'],
  '/agenda': ['agenda'],
  '/nota-fiscal': ['financeiro'],
  '/inventario': ['inventario'],
  '/usuarios': ['usuarios'],
  '/relatorios': ['relatorios'],
  '/gestao-shares': ['gestao_shares'],
  '/crm': ['crm'],
  '/servicos': ['servicos'],
  '/lander': ['landerzap'],
  '/monitoramento': ['monitoramento'],
  '/licenciamento': ['licenciamento'],
  '/takedowns': ['takedowns'],
  '/marketing': ['marketing'],
  '/configuracoes': ['configuracoes'],
  '/perfil': ['perfil'],
};

// Permissões por role - admin tem acesso a TUDO
const rolePermissions: Record<UserRole, string[]> = {
  admin: ['*', 'dashboard', 'artistas', 'projetos', 'registro_musicas', 'lancamentos', 'contratos', 'financeiro', 'agenda', 'inventario', 'usuarios', 'relatorios', 'gestao_shares', 'crm', 'servicos', 'landerzap', 'monitoramento', 'licenciamento', 'takedowns', 'marketing', 'configuracoes', 'perfil'],
  gestor_artistico: ['dashboard', 'artistas', 'projetos', 'registro_musicas', 'lancamentos', 'agenda', 'relatorios', 'perfil'],
  financeiro: ['dashboard', 'financeiro', 'contabilidade', 'contratos', 'nota_fiscal', 'relatorios', 'perfil'],
  marketing: ['dashboard', 'marketing', 'artistas', 'lancamentos', 'relatorios', 'perfil'],
  artista: ['dashboard', 'perfil', 'agenda', 'lancamentos'],
  colaborador: ['dashboard', 'perfil', 'projetos', 'agenda'],
  leitor: ['dashboard', 'perfil'],
};

const defaultPermissions: UserPermissions = {
  roles: [],
  primaryRole: 'leitor',
  isAdmin: false,
  canAccess: () => false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [permissions, setPermissions] = useState<UserPermissions>(defaultPermissions);

  // Função para verificar se pode acessar um módulo
  const canAccess = useCallback((module: string, roles: UserRole[]): boolean => {
    if (roles.length === 0) return false;
    if (roles.includes('admin')) return true;
    
    for (const role of roles) {
      const allowedModules = rolePermissions[role] || [];
      if (allowedModules.includes('*') || allowedModules.includes(module)) {
        return true;
      }
    }
    return false;
  }, []);

  // Função para verificar se pode acessar uma rota
  const canAccessRoute = useCallback((path: string, roles: UserRole[]): boolean => {
    // Rotas sempre permitidas para autenticados
    if (path === '/perfil') return true;
    
    // Encontra o módulo correspondente à rota
    const basePath = '/' + path.split('/')[1];
    const modules = routeToModuleMap[basePath] || routeToModuleMap[path];
    
    if (!modules) return true; // Rota não mapeada = permitida
    
    return modules.some(module => canAccess(module, roles));
  }, [canAccess]);

  // Buscar roles do usuário
  const fetchUserRoles = useCallback(async (userId: string): Promise<UserRole[]> => {
    try {
      // FONTE PRINCIPAL: user_roles table
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (!userRolesError && userRolesData && userRolesData.length > 0) {
        const mappedRoles = userRolesData.map(r => mapLegacyRole(r.role as string));
        console.log('[Auth] Roles from user_roles:', mappedRoles);
        return [...new Set(mappedRoles)];
      }

      // FALLBACK: profiles.roles e role_display
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('roles, role_display')
        .eq('id', userId)
        .single();

      console.log('[Auth] Profile data:', profileData);

      if (!profileError && profileData) {
        // Primeiro tenta roles array
        if (profileData.roles && Array.isArray(profileData.roles) && profileData.roles.length > 0) {
          const mappedRoles = profileData.roles.map((r: string) => mapLegacyRole(r));
          console.log('[Auth] Roles from profiles.roles:', mappedRoles);
          return [...new Set(mappedRoles)];
        }
        
        // Fallback para role_display
        if (profileData.role_display) {
          const mappedRole = mapLegacyRole(profileData.role_display);
          console.log('[Auth] Role from role_display:', profileData.role_display, '->', mappedRole);
          return [mappedRole];
        }
      }

      console.log('[Auth] No roles found, defaulting to leitor');
      return ['leitor'];
    } catch (err) {
      console.error('[Auth] Error fetching user roles:', err);
      return ['leitor'];
    }
  }, []);

  // Carregar permissões quando o usuário mudar
  useEffect(() => {
    const loadPermissions = async () => {
      if (!user?.id) {
        setPermissions(defaultPermissions);
        setPermissionsLoading(false);
        return;
      }

      setPermissionsLoading(true);
      
      try {
        const roles = await fetchUserRoles(user.id);
        
        const getPrimaryRole = (): UserRole => {
          const priorityOrder: UserRole[] = ['admin', 'gestor_artistico', 'financeiro', 'marketing', 'artista', 'colaborador', 'leitor'];
          for (const role of priorityOrder) {
            if (roles.includes(role)) return role;
          }
          return 'leitor';
        };

        setPermissions({
          roles,
          primaryRole: getPrimaryRole(),
          isAdmin: roles.includes('admin'),
          canAccess: (module: string) => canAccess(module, roles),
        });
      } catch (error) {
        console.error('Error loading permissions:', error);
        setPermissions({
          ...defaultPermissions,
          roles: ['leitor'],
          primaryRole: 'leitor',
          canAccess: (module: string) => canAccess(module, ['leitor']),
        });
      } finally {
        setPermissionsLoading(false);
      }
    };

    loadPermissions();
  }, [user?.id, fetchUserRoles, canAccess]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Se logout, limpar permissões imediatamente
        if (!session?.user) {
          setPermissions(defaultPermissions);
          setPermissionsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });
    
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    setPermissionsLoading(true); // Começar loading de permissões
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (!error && data.user) {
      recordLoginHistory(data.user.id);
    }
    
    return { error: error as Error | null };
  };

  const recordLoginHistory = async (userId: string) => {
    try {
      const userAgent = navigator.userAgent;
      const browser = getBrowserName(userAgent);
      const deviceType = getDeviceType(userAgent);
      
      await supabase.from('login_history').insert({
        user_id: userId,
        user_agent: userAgent,
        browser: browser,
        device_type: deviceType,
      });
    } catch (error) {
      console.error('Error recording login history:', error);
    }
  };

  const getBrowserName = (userAgent: string): string => {
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Edg')) return 'Microsoft Edge';
    if (userAgent.includes('Chrome')) return 'Google Chrome';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
    return 'Navegador desconhecido';
  };

  const getDeviceType = (userAgent: string): string => {
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'Tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(userAgent)) return 'Mobile';
    return 'Desktop';
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setUser(null);
      setSession(null);
      setPermissions(defaultPermissions);
    }
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/auth?mode=reset`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });
    
    return { error: error as Error | null };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    return { error: error as Error | null };
  };

  const isFullyLoaded = !loading && !permissionsLoading;

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      permissionsLoading,
      permissions,
      isFullyLoaded,
      signUp, 
      signIn, 
      signOut, 
      resetPassword, 
      updatePassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook auxiliar para verificar permissão de rota
export function useRoutePermission(path: string): boolean {
  const { permissions, isFullyLoaded } = useAuth();
  
  if (!isFullyLoaded) return false;
  
  // Rotas sempre permitidas
  if (path === '/perfil' || path === '/') return true;
  
  const basePath = '/' + path.split('/')[1];
  const modules = routeToModuleMap[basePath] || routeToModuleMap[path];
  
  if (!modules) return true;
  
  return modules.some(module => permissions.canAccess(module));
}

// Exportar mapeamentos para uso no sidebar
export { routeToModuleMap, rolePermissions };
