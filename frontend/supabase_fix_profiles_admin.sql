-- CORREÇÃO: Política de profiles para permitir que administradores vejam todos os usuários
-- Problema: A política anterior só permitia ver o próprio perfil

-- Primeiro, remover a política atual restritiva
DROP POLICY IF EXISTS profiles_all ON public.profiles;
DROP POLICY IF EXISTS profiles_select ON public.profiles;
DROP POLICY IF EXISTS profiles_update ON public.profiles;
DROP POLICY IF EXISTS profiles_insert ON public.profiles;

-- Criar função helper para verificar se o usuário é admin/master
-- Esta função evita recursão infinita
CREATE OR REPLACE FUNCTION public.is_admin_or_master()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
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

-- Política para SELECT: 
-- - Usuário pode ver seu próprio perfil
-- - Administradores/Masters podem ver todos os perfis
CREATE POLICY profiles_select ON public.profiles
FOR SELECT TO authenticated
USING (
  id = auth.uid() 
  OR public.is_admin_or_master()
);

-- Política para INSERT: 
-- - Qualquer usuário autenticado pode inserir seu próprio perfil
CREATE POLICY profiles_insert ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

-- Política para UPDATE: 
-- - Usuário pode atualizar seu próprio perfil
-- - Administradores podem atualizar qualquer perfil
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

-- Política para DELETE: 
-- - Apenas administradores podem deletar perfis
CREATE POLICY profiles_delete ON public.profiles
FOR DELETE TO authenticated
USING (public.is_admin_or_master());

-- Garantir que RLS está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
