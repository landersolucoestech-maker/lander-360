-- Drop the current SELECT policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create improved policy: users see own profile, admins see all
CREATE POLICY "Users can view own profile or admins can view all"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id 
  OR has_role(auth.uid(), 'admin')
);

-- Also allow admins to update any profile for user management
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update own profile or admins can update all"
ON public.profiles
FOR UPDATE
USING (
  auth.uid() = id 
  OR has_role(auth.uid(), 'admin')
);