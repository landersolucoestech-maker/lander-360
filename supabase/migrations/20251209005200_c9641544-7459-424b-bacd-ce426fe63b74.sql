-- Drop the current overly permissive SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view artists" ON public.artists;

-- Create new restrictive SELECT policy for admins and managers only
CREATE POLICY "Admins and managers can view artists"
ON public.artists
FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));