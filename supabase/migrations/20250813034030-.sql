-- Secure financial_summary_secure with RLS restricted to finance roles

-- Enable RLS
ALTER TABLE public.financial_summary_secure ENABLE ROW LEVEL SECURITY;

-- Drop existing permissive policies if any (none expected)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='financial_summary_secure' AND policyname='Financial summary: open access'
  ) THEN
    DROP POLICY "Financial summary: open access" ON public.financial_summary_secure;
  END IF;
END$$;

-- Create strict SELECT policy: only admin, manager, finance, master
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='financial_summary_secure' AND policyname='Financial summary select: finance roles only'
  ) THEN
    CREATE POLICY "Financial summary select: finance roles only" ON public.financial_summary_secure
    FOR SELECT
    USING (
      has_role(auth.uid(), 'admin'::app_role) OR
      has_role(auth.uid(), 'manager'::app_role) OR
      has_role(auth.uid(), 'finance'::app_role) OR
      has_role(auth.uid(), 'master'::app_role)
    );
  END IF;
END$$;

-- Do NOT create INSERT/UPDATE/DELETE policies => writes are blocked by default under RLS

COMMENT ON TABLE public.financial_summary_secure IS 'Aggregated/secure financial summary; access restricted by RLS to finance-authorized roles.';