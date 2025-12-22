-- CORREÇÃO COMPLETA: RLS para profiles, user_roles e user_artists

-- PARTE 1: FUNÇÃO HELPER
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

-- PARTE 2: LIMPAR E RECRIAR POLÍTICAS DE PROFILES
DO $$ 
DECLARE 
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY profiles_select ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_admin_or_master());
CREATE POLICY profiles_insert ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY profiles_update ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_admin_or_master()) WITH CHECK (id = auth.uid() OR public.is_admin_or_master());
CREATE POLICY profiles_delete ON public.profiles FOR DELETE TO authenticated USING (public.is_admin_or_master());
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- PARTE 3: LIMPAR E RECRIAR POLÍTICAS DE USER_ROLES
DO $$ 
DECLARE 
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_roles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_roles', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY user_roles_select ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY user_roles_modify ON public.user_roles FOR ALL TO authenticated USING (public.is_admin_or_master()) WITH CHECK (public.is_admin_or_master());
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- PARTE 4: LIMPAR E RECRIAR POLÍTICAS DE USER_ARTISTS
DO $$ 
DECLARE 
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_artists'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_artists', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY user_artists_select ON public.user_artists FOR SELECT TO authenticated USING (true);
CREATE POLICY user_artists_modify ON public.user_artists FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin_or_master()) WITH CHECK (user_id = auth.uid() OR public.is_admin_or_master());
ALTER TABLE public.user_artists ENABLE ROW LEVEL SECURITY;
