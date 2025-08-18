-- Secure financial_summary table with proper RLS and permissions
-- 1) Enable RLS on table (only applies to tables, not materialized views)
ALTER TABLE public.financial_summary ENABLE ROW LEVEL SECURITY;

-- 2) Create SELECT policy restricted to admin/manager roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'financial_summary' 
      AND policyname = 'Admins and managers can view financial summary'
  ) THEN
    CREATE POLICY "Admins and managers can view financial summary"
    ON public.financial_summary
    FOR SELECT
    USING (
      has_role(auth.uid(), 'admin'::app_role) OR 
      has_role(auth.uid(), 'manager'::app_role)
    );
  END IF;
END $$;

-- 3) Ensure no direct write operations are allowed (no policies -> denied by RLS). Revoke broad grants just in case
REVOKE ALL ON public.financial_summary FROM anon, authenticated;

-- 4) Grant SELECT to authenticated so connections can attempt reads, but access is still gated by RLS policy above
GRANT SELECT ON public.financial_summary TO authenticated;