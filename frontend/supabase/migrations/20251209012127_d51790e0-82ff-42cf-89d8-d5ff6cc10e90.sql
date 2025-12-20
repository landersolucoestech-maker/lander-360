-- Update artists table RLS policies to explicitly require authentication
-- This ensures sensitive PII (CPF/CNPJ, RG, bank details, etc.) is protected

-- Drop existing policies
DROP POLICY IF EXISTS "Admins and managers can view artists" ON public.artists;
DROP POLICY IF EXISTS "Admins and managers can insert artists" ON public.artists;
DROP POLICY IF EXISTS "Admins and managers can update artists" ON public.artists;
DROP POLICY IF EXISTS "Admins can delete artists" ON public.artists;

-- Recreate with explicit authentication check for defense in depth
CREATE POLICY "Admins and managers can view artists"
ON public.artists
FOR SELECT
USING (
  auth.role() = 'authenticated' AND (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'manager'::app_role)
  )
);

CREATE POLICY "Admins and managers can insert artists"
ON public.artists
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'manager'::app_role)
  )
);

CREATE POLICY "Admins and managers can update artists"
ON public.artists
FOR UPDATE
USING (
  auth.role() = 'authenticated' AND (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'manager'::app_role)
  )
);

CREATE POLICY "Admins can delete artists"
ON public.artists
FOR DELETE
USING (
  auth.role() = 'authenticated' AND has_role(auth.uid(), 'admin'::app_role)
);