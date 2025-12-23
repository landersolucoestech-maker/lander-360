import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, routeToModuleMap } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredModule?: string;
}

/**
 * Route Guard que protege rotas.
 * 
 * Comportamento:
 * 1. Se não autenticado -> redireciona para /auth
 * 2. Se autenticado mas permissões carregando -> mostra loading
 * 3. Se autenticado e tem permissão -> renderiza children
 * 4. Se autenticado mas SEM permissão -> redireciona para dashboard
 */
export function ProtectedRoute({ children, requiredModule }: ProtectedRouteProps) {
  const { user, loading, permissionsLoading, permissions, isFullyLoaded } = useAuth();
  const location = useLocation();

  console.log('[ProtectedRoute] ===== DEBUG =====');
  console.log('[ProtectedRoute] pathname:', location.pathname);
  console.log('[ProtectedRoute] loading:', loading);
  console.log('[ProtectedRoute] permissionsLoading:', permissionsLoading);
  console.log('[ProtectedRoute] isFullyLoaded:', isFullyLoaded);
  console.log('[ProtectedRoute] hasUser:', !!user);
  console.log('[ProtectedRoute] isAdmin:', permissions?.isAdmin);
  console.log('[ProtectedRoute] ==================');

  // Loading de autenticação
  if (loading) {
    console.log('[ProtectedRoute] Showing auth loading...');
    return <LoadingScreen message="Verificando autenticação..." />;
  }

  // Não autenticado
  if (!user) {
    console.log('[ProtectedRoute] No user, redirecting to /auth');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Loading de permissões
  if (permissionsLoading || !isFullyLoaded) {
    console.log('[ProtectedRoute] Loading permissions...');
    return <LoadingScreen message="Carregando..." />;
  }

  // Verificar permissão
  const hasPermission = checkPermission(location.pathname, permissions, requiredModule);
  console.log('[ProtectedRoute] Permission check:', { pathname: location.pathname, hasPermission });

  if (!hasPermission) {
    console.log('[ProtectedRoute] Access denied for:', location.pathname);
    return <Navigate to="/" state={{ accessDenied: true }} replace />;
  }

  // Tudo OK - renderiza
  console.log('[ProtectedRoute] Rendering children for:', location.pathname);
  return <>{children}</>;
}

/**
 * Verifica permissão de acesso
 */
function checkPermission(
  pathname: string, 
  permissions: { canAccess: (module: string) => boolean; isAdmin: boolean },
  requiredModule?: string
): boolean {
  // Admin SEMPRE passa
  if (permissions.isAdmin) {
    return true;
  }

  // Módulo específico requerido
  if (requiredModule) {
    return permissions.canAccess(requiredModule);
  }

  // Rotas sempre permitidas
  if (['/', '/perfil'].includes(pathname)) {
    return true;
  }

  // Encontrar módulo pela rota
  const basePath = '/' + pathname.split('/')[1];
  const modules = routeToModuleMap[basePath] || routeToModuleMap[pathname];

  // Rota não mapeada = permitida
  if (!modules || modules.length === 0) {
    return true;
  }

  // Verificar permissão em pelo menos um módulo
  return modules.some(module => permissions.canAccess(module));
}

function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

export default ProtectedRoute;
