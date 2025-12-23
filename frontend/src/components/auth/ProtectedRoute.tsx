import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, routeToModuleMap } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredModule?: string; // Módulo específico necessário (opcional)
}

/**
 * Route Guard que bloqueia renderização até autenticação E permissões serem validadas.
 * 
 * IMPORTANTE: Este componente NUNCA renderiza os children até que:
 * 1. Autenticação seja verificada
 * 2. Permissões sejam carregadas
 * 3. Usuário tenha permissão para acessar a rota
 * 
 * Isso elimina completamente o "piscar" de módulos não autorizados.
 */
export function ProtectedRoute({ children, requiredModule }: ProtectedRouteProps) {
  const { user, loading, permissionsLoading, permissions, isFullyLoaded } = useAuth();
  const location = useLocation();

  // FASE 1: Loading de autenticação
  if (loading) {
    return <LoadingScreen message="Verificando autenticação..." />;
  }

  // FASE 2: Não autenticado - redireciona imediatamente
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // FASE 3: Loading de permissões (usuário autenticado, mas permissões ainda carregando)
  if (permissionsLoading || !isFullyLoaded) {
    return <LoadingScreen message="Carregando permissões..." />;
  }

  // FASE 4: Verificar permissão da rota
  const hasPermission = checkRoutePermission(location.pathname, permissions, requiredModule);

  if (!hasPermission) {
    // Usuário não tem permissão - redireciona para dashboard ou página de acesso negado
    return <Navigate to="/" state={{ accessDenied: true, from: location }} replace />;
  }

  // FASE 5: Tudo OK - renderiza o conteúdo
  return <>{children}</>;
}

/**
 * Verifica se o usuário tem permissão para acessar a rota
 */
function checkRoutePermission(
  pathname: string, 
  permissions: { canAccess: (module: string) => boolean; isAdmin: boolean },
  requiredModule?: string
): boolean {
  // Admin tem acesso a tudo
  if (permissions.isAdmin) return true;

  // Se módulo específico foi passado, verificar ele
  if (requiredModule) {
    return permissions.canAccess(requiredModule);
  }

  // Rotas sempre permitidas para usuários autenticados
  const alwaysAllowed = ['/perfil', '/'];
  if (alwaysAllowed.includes(pathname)) return true;

  // Encontrar módulo pela rota
  const basePath = '/' + pathname.split('/')[1];
  const modules = routeToModuleMap[basePath] || routeToModuleMap[pathname];

  // Rota não mapeada = permitida (para não quebrar rotas não configuradas)
  if (!modules || modules.length === 0) return true;

  // Verificar se tem permissão em pelo menos um dos módulos da rota
  return modules.some(module => permissions.canAccess(module));
}

/**
 * Tela de loading neutra - aparece durante verificação de auth/permissões
 */
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
