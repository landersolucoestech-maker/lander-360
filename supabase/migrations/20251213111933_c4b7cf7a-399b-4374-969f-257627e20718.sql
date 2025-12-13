-- Add new roles to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'empresario';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'financeiro';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'marketing';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'juridico';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'artista';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'produtor_artistico';

-- Create RLS policies for user_roles table if not exists
DO $$
BEGIN
  -- Allow users to read their own roles
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Users can view their own roles'
  ) THEN
    CREATE POLICY "Users can view their own roles"
      ON public.user_roles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Allow admins to manage all roles
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Admins can manage all roles'
  ) THEN
    CREATE POLICY "Admins can manage all roles"
      ON public.user_roles
      FOR ALL
      TO authenticated
      USING (has_role(auth.uid(), 'admin'));
  END IF;
END $$;