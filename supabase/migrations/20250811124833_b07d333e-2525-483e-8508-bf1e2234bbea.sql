-- Drop the overly permissive existing policy
DROP POLICY IF EXISTS "Authenticated users can manage artists" ON public.artists;

-- Create more restrictive policies based on user roles
-- Admins and managers can view all artist information including sensitive data
CREATE POLICY "Admins and managers can view all artists"
ON public.artists
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);

-- Admins and managers can create artists
CREATE POLICY "Admins and managers can create artists"
ON public.artists
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);

-- Admins and managers can update artists
CREATE POLICY "Admins and managers can update artists"
ON public.artists
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);

-- Only admins can delete artists
CREATE POLICY "Only admins can delete artists"
ON public.artists
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));