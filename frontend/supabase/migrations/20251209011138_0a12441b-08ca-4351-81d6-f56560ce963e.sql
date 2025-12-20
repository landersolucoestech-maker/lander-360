-- Update profiles table RLS policies to explicitly require authentication

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile or admins can update all" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Recreate with explicit authentication check
CREATE POLICY "Users can view own profile or admins can view all"
ON public.profiles
FOR SELECT
USING (
  auth.role() = 'authenticated' AND (
    auth.uid() = id 
    OR has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Users can update own profile or admins can update all"
ON public.profiles
FOR UPDATE
USING (
  auth.role() = 'authenticated' AND (
    auth.uid() = id 
    OR has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND auth.uid() = id
);