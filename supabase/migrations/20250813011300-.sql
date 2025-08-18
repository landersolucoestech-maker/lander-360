-- Add 'master' to app_role enum if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'app_role' AND e.enumlabel = 'master'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'master';
  END IF;
END $$;

-- Update RLS policies to include 'master' wherever 'admin' has access

-- artists
DROP POLICY IF EXISTS "Admins and managers can create artists" ON public.artists;
CREATE POLICY "Admins and managers can create artists"
ON public.artists
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'master'::app_role)
);

DROP POLICY IF EXISTS "Admins and managers can update artists" ON public.artists;
CREATE POLICY "Admins and managers can update artists"
ON public.artists
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'master'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'master'::app_role)
);

DROP POLICY IF EXISTS "Only admins can delete artists" ON public.artists;
CREATE POLICY "Only admins can delete artists"
ON public.artists
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'master'::app_role)
);

DROP POLICY IF EXISTS "Secure artist data access" ON public.artists;
CREATE POLICY "Secure artist data access"
ON public.artists
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'master'::app_role)
);

-- financial_transactions
DROP POLICY IF EXISTS "Admins and managers can create financial transactions" ON public.financial_transactions;
CREATE POLICY "Admins and managers can create financial transactions"
ON public.financial_transactions
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'master'::app_role)
);

DROP POLICY IF EXISTS "Admins and managers can update financial transactions" ON public.financial_transactions;
CREATE POLICY "Admins and managers can update financial transactions"
ON public.financial_transactions
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'master'::app_role)
);

DROP POLICY IF EXISTS "Admins and managers can view financial transactions" ON public.financial_transactions;
CREATE POLICY "Admins and managers can view financial transactions"
ON public.financial_transactions
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'master'::app_role)
);

DROP POLICY IF EXISTS "Only admins can delete financial transactions" ON public.financial_transactions;
CREATE POLICY "Only admins can delete financial transactions"
ON public.financial_transactions
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'master'::app_role)
);

-- projects
DROP POLICY IF EXISTS "Project creators and managers can update projects" ON public.projects;
CREATE POLICY "Project creators and managers can update projects"
ON public.projects
FOR UPDATE
USING (
  (auth.uid() = created_by) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'master'::app_role)
);

DROP POLICY IF EXISTS "Users can view projects they created or are assigned to" ON public.projects;
CREATE POLICY "Users can view projects they created or are assigned to"
ON public.projects
FOR SELECT
USING (
  (auth.uid() = created_by) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'master'::app_role)
);

-- profiles
DROP POLICY IF EXISTS "Allow users to delete their own profile and admins to delete an" ON public.profiles;
CREATE POLICY "Allow users to delete their own profile and admins to delete an"
ON public.profiles
FOR DELETE
USING (
  (auth.uid() = id) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'master'::app_role)
);

DROP POLICY IF EXISTS "Allow users to insert their own profile and admins to insert fo" ON public.profiles;
CREATE POLICY "Allow users to insert their own profile and admins to insert fo"
ON public.profiles
FOR INSERT
WITH CHECK (
  (auth.uid() = id) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'master'::app_role)
);

DROP POLICY IF EXISTS "Allow users to update their own profile and admins to update an" ON public.profiles;
CREATE POLICY "Allow users to update their own profile and admins to update an"
ON public.profiles
FOR UPDATE
USING (
  (auth.uid() = id) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'master'::app_role)
)
WITH CHECK (
  (auth.uid() = id) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'master'::app_role)
);

DROP POLICY IF EXISTS "Allow users to view their own profile and admins to view all" ON public.profiles;
CREATE POLICY "Allow users to view their own profile and admins to view all"
ON public.profiles
FOR SELECT
USING (
  (auth.uid() = id) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'master'::app_role)
);

-- user_activity_logs
DROP POLICY IF EXISTS "Admins can view all activity logs" ON public.user_activity_logs;
CREATE POLICY "Admins can view all activity logs"
ON public.user_activity_logs
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'master'::app_role)
);

-- user_permissions
DROP POLICY IF EXISTS "Admins podem atualizar permissões" ON public.user_permissions;
CREATE POLICY "Admins podem atualizar permissões"
ON public.user_permissions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master'::app_role));

DROP POLICY IF EXISTS "Admins podem deletar permissões" ON public.user_permissions;
CREATE POLICY "Admins podem deletar permissões"
ON public.user_permissions
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master'::app_role));

DROP POLICY IF EXISTS "Admins podem inserir permissões" ON public.user_permissions;
CREATE POLICY "Admins podem inserir permissões"
ON public.user_permissions
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master'::app_role));

DROP POLICY IF EXISTS "Usuários podem ver suas próprias permissões" ON public.user_permissions;
CREATE POLICY "Usuários podem ver suas próprias permissões"
ON public.user_permissions
FOR SELECT
USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master'::app_role));

-- user_roles
DROP POLICY IF EXISTS "Admins and managers can delete user roles" ON public.user_roles;
CREATE POLICY "Admins and managers can delete user roles"
ON public.user_roles
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'master'::app_role)
);

DROP POLICY IF EXISTS "Admins and managers can update user roles" ON public.user_roles;
CREATE POLICY "Admins and managers can update user roles"
ON public.user_roles
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'master'::app_role)
);

DROP POLICY IF EXISTS "Allow first admin creation" ON public.user_roles;
CREATE POLICY "Allow first admin creation"
ON public.user_roles
FOR INSERT
WITH CHECK (
  is_first_admin() OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'master'::app_role)
);

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own roles and admins can view all" ON public.user_roles;
CREATE POLICY "Users can view their own roles and admins can view all"
ON public.user_roles
FOR SELECT
USING (
  (auth.uid() = user_id) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'master'::app_role)
);

-- Update get_artists_secure to grant full access to 'master' as well
CREATE OR REPLACE FUNCTION public.get_artists_secure()
RETURNS TABLE(
  id uuid, 
  name text, 
  stage_name text, 
  email text, 
  phone text, 
  genre text, 
  bio text, 
  social_media jsonb, 
  data_access_level text, 
  created_at timestamptz, 
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Log do acesso
  PERFORM public.log_sensitive_data_access('artists', NULL, 'bulk_access');
  
  -- Retornar dados baseado no nível de acesso
  RETURN QUERY
  SELECT 
    a.id,
    a.name,
    a.stage_name,
    CASE 
      WHEN has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'master') THEN a.email
      ELSE (public.mask_sensitive_data(a.email, a.phone))->>'email'
    END as email,
    CASE 
      WHEN has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'master') THEN a.phone
      ELSE (public.mask_sensitive_data(a.email, a.phone))->>'phone'
    END as phone,
    a.genre,
    a.bio,
    a.social_media,
    CASE 
      WHEN has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'master') THEN 'full'
      ELSE 'masked'
    END as data_access_level,
    a.created_at,
    a.updated_at
  FROM public.artists a;
END;
$function$;