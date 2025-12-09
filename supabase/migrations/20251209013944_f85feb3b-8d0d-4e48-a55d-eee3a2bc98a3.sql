-- Update contracts table RLS policies to restrict access to admins and managers
-- This protects sensitive financial data like royalty rates, advance amounts, and payment terms

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can view contracts" ON public.contracts;
DROP POLICY IF EXISTS "Authenticated users can insert contracts" ON public.contracts;
DROP POLICY IF EXISTS "Authenticated users can update contracts" ON public.contracts;
DROP POLICY IF EXISTS "Authenticated users can delete contracts" ON public.contracts;

-- Create restrictive policies using role-based access control
CREATE POLICY "Admins and managers can view contracts"
ON public.contracts
FOR SELECT
USING (
  auth.role() = 'authenticated' AND (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'manager'::app_role)
  )
);

CREATE POLICY "Admins and managers can insert contracts"
ON public.contracts
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'manager'::app_role)
  )
);

CREATE POLICY "Admins and managers can update contracts"
ON public.contracts
FOR UPDATE
USING (
  auth.role() = 'authenticated' AND (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'manager'::app_role)
  )
);

CREATE POLICY "Admins can delete contracts"
ON public.contracts
FOR DELETE
USING (
  auth.role() = 'authenticated' AND has_role(auth.uid(), 'admin'::app_role)
);