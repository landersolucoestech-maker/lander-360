-- Ensure 'master' exists in enum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typname = 'app_role' AND e.enumlabel = 'master'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'master';
  END IF;
END $$;

-- Grant MASTER to the current account (by auth user id)
INSERT INTO public.user_roles (user_id, role)
SELECT '7a5899f7-5e7e-4b3f-bf34-64bdfb599b6d'::uuid, 'master'::app_role
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = '7a5899f7-5e7e-4b3f-bf34-64bdfb599b6d' AND role = 'master'
);

-- Restrict user management to MASTER only (keep self updates allowed)
-- PROFILES
DROP POLICY IF EXISTS "Allow users to delete their own profile and admins to delete an" ON public.profiles;
CREATE POLICY "Allow users to delete their own profile and master to delete others"
ON public.profiles
FOR DELETE
USING ((auth.uid() = id) OR has_role(auth.uid(), 'master'::app_role));

DROP POLICY IF EXISTS "Allow users to insert their own profile and admins to insert fo" ON public.profiles;
CREATE POLICY "Allow users to insert their own profile and master to insert others"
ON public.profiles
FOR INSERT
WITH CHECK ((auth.uid() = id) OR has_role(auth.uid(), 'master'::app_role));

DROP POLICY IF EXISTS "Allow users to update their own profile and admins to update an" ON public.profiles;
CREATE POLICY "Allow users to update their own profile and master to update others"
ON public.profiles
FOR UPDATE
USING ((auth.uid() = id) OR has_role(auth.uid(), 'master'::app_role))
WITH CHECK ((auth.uid() = id) OR has_role(auth.uid(), 'master'::app_role));

-- USER ROLES
DROP POLICY IF EXISTS "Admins and managers can delete user roles" ON public.user_roles;
CREATE POLICY "Only master can delete user roles"
ON public.user_roles
FOR DELETE
USING (has_role(auth.uid(), 'master'::app_role));

DROP POLICY IF EXISTS "Admins and managers can update user roles" ON public.user_roles;
CREATE POLICY "Only master can update user roles"
ON public.user_roles
FOR UPDATE
USING (has_role(auth.uid(), 'master'::app_role))
WITH CHECK (has_role(auth.uid(), 'master'::app_role));

-- Allow only master (or bootstrap first admin) to INSERT roles
CREATE POLICY IF NOT EXISTS "Only master can insert user roles"
ON public.user_roles
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'master'::app_role) OR is_first_admin());

-- USER PERMISSIONS
DROP POLICY IF EXISTS "Admins podem atualizar permissões" ON public.user_permissions;
CREATE POLICY "Somente master pode atualizar permissões"
ON public.user_permissions
FOR UPDATE
USING (has_role(auth.uid(), 'master'::app_role))
WITH CHECK (has_role(auth.uid(), 'master'::app_role));

DROP POLICY IF EXISTS "Admins podem deletar permissões" ON public.user_permissions;
CREATE POLICY "Somente master pode deletar permissões"
ON public.user_permissions
FOR DELETE
USING (has_role(auth.uid(), 'master'::app_role));

DROP POLICY IF EXISTS "Admins podem inserir permissões" ON public.user_permissions;
CREATE POLICY "Somente master pode inserir permissões"
ON public.user_permissions
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'master'::app_role));
