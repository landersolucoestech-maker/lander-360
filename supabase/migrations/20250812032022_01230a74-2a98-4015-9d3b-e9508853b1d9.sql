-- Remover a política conflitante
DROP POLICY IF EXISTS "Admins and managers can create user roles" ON public.user_roles;