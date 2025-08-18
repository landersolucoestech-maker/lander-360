-- Drop the overly permissive existing policy
DROP POLICY IF EXISTS "Authenticated users can manage artists" ON public.artists;

-- Create more restrictive policies based on user roles
-- Admins and managers can view all artist information
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

-- Create a public view for non-sensitive artist information
CREATE OR REPLACE VIEW public.artists_public AS
SELECT 
  id,
  name,
  stage_name,
  genre,
  bio,
  created_at,
  updated_at
FROM public.artists;

-- Grant access to the public view for all authenticated users
GRANT SELECT ON public.artists_public TO authenticated;

-- Create RLS policy for the public view
ALTER VIEW public.artists_public OWNER TO postgres;
CREATE POLICY "All authenticated users can view public artist info"
ON public.artists_public
FOR SELECT
USING (auth.uid() IS NOT NULL);