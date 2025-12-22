-- CORREÇÃO COMPLETA: RLS para profiles, user_roles e user_artists
-- Problema: Políticas restritivas e recursão em user_roles

-- ============================================
-- PARTE 1: FUNÇÃO HELPER (EVITA RECURSÃO)
-- ============================================

-- Criar função para verificar se usuário é admin/master
-- Usa SECURITY DEFINER para bypassar RLS e evitar recursão
CREATE OR REPLACE FUNCTION public.is_admin_or_master()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (
      role_display IN ('Administrador (Master)', 'Administrador', 'Master')
      OR 'master' = ANY(roles)
      OR 'admin' = ANY(roles)
      OR 'administrador' = ANY(roles)
    )
  );
$$;

-- ============================================
-- PARTE 2: POLÍTICAS PARA PROFILES
-- ============================================

-- Remover políticas antigas
DROP POLICY IF EXISTS profiles_all ON public.profiles;
DROP POLICY IF EXISTS profiles_select ON public.profiles;
DROP POLICY IF EXISTS profiles_update ON public.profiles;
DROP POLICY IF EXISTS profiles_insert ON public.profiles;
DROP POLICY IF EXISTS profiles_delete ON public.profiles;

-- SELECT: Usuário vê seu perfil OU admin vê todos
CREATE POLICY profiles_select ON public.profiles
FOR SELECT TO authenticated
USING (
  id = auth.uid() 
  OR public.is_admin_or_master()
);

-- INSERT: Qualquer usuário autenticado pode inserir seu próprio perfil
CREATE POLICY profiles_insert ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

-- UPDATE: Usuário edita seu perfil OU admin edita todos
CREATE POLICY profiles_update ON public.profiles
FOR UPDATE TO authenticated
USING (
  id = auth.uid() 
  OR public.is_admin_or_master()
)
WITH CHECK (
  id = auth.uid() 
  OR public.is_admin_or_master()
);

-- DELETE: Apenas admins podem deletar
CREATE POLICY profiles_delete ON public.profiles
FOR DELETE TO authenticated
USING (public.is_admin_or_master());

-- Garantir RLS habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PARTE 3: POLÍTICAS PARA USER_ROLES (SEM RECURSÃO)
-- ============================================

-- Remover políticas antigas
DROP POLICY IF EXISTS user_roles_unified ON public.user_roles;
DROP POLICY IF EXISTS user_roles_all ON public.user_roles;
DROP POLICY IF EXISTS user_roles_select ON public.user_roles;

-- SELECT: Todos autenticados podem ler user_roles (necessário para verificar permissões)
CREATE POLICY user_roles_select ON public.user_roles
FOR SELECT TO authenticated
USING (true);

-- INSERT/UPDATE/DELETE: Apenas admins podem modificar
CREATE POLICY user_roles_modify ON public.user_roles
FOR ALL TO authenticated
USING (public.is_admin_or_master())
WITH CHECK (public.is_admin_or_master());

-- Garantir RLS habilitado
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PARTE 4: POLÍTICAS PARA USER_ARTISTS
-- ============================================

-- Remover políticas antigas
DROP POLICY IF EXISTS user_artists_all ON public.user_artists;
DROP POLICY IF EXISTS user_artists_select ON public.user_artists;

-- SELECT: Todos autenticados podem ler (necessário para carregar artista vinculado)
CREATE POLICY user_artists_select ON public.user_artists
FOR SELECT TO authenticated
USING (true);

-- Modificações: Usuário pode modificar seus próprios vínculos OU admin pode modificar todos
CREATE POLICY user_artists_modify ON public.user_artists
FOR ALL TO authenticated
USING (
  user_id = auth.uid() 
  OR public.is_admin_or_master()
)
WITH CHECK (
  user_id = auth.uid() 
  OR public.is_admin_or_master()
);

-- Garantir RLS habilitado
ALTER TABLE public.user_artists ENABLE ROW LEVEL SECURITY;
