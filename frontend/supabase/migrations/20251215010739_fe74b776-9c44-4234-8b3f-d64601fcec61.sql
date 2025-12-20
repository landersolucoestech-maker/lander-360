
-- Drop all existing profiles policies to start fresh
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile or admins can update all" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile or admin all" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON public.profiles;

-- Create clean, strict RLS policies for profiles table

-- SELECT: Users see only their own profile, admins see all
CREATE POLICY "profiles_select_own_or_admin"
ON public.profiles
FOR SELECT
USING (
  (auth.uid() = id) OR has_role(auth.uid(), 'admin'::app_role)
);

-- INSERT: Users can only insert their own profile (id must match auth.uid)
CREATE POLICY "profiles_insert_own_only"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- UPDATE: Users can only update their own profile, admins can update all
CREATE POLICY "profiles_update_own_or_admin"
ON public.profiles
FOR UPDATE
USING (
  (auth.uid() = id) OR has_role(auth.uid(), 'admin'::app_role)
);

-- DELETE: Only admins can delete profiles
CREATE POLICY "profiles_delete_admin_only"
ON public.profiles
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
