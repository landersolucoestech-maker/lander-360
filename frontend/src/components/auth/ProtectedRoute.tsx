import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Temporariamente desativado para permitir acesso às rotas sem exigir login.
 * (Mantemos o componente para evitar refactors grandes no roteamento.)
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  return <>{children}</>;
}

