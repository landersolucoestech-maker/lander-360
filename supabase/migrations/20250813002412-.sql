-- 1) Add 'finance' role to enum app_role if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'app_role' AND e.enumlabel = 'finance'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'finance';
  END IF;
END $$;

-- 2) Enable RLS on financial_summary_secure (it's a table per schema)
ALTER TABLE public.financial_summary_secure ENABLE ROW LEVEL SECURITY;

-- 3) Create SELECT policy for admin/manager/finance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'financial_summary_secure' 
      AND policyname = 'Admins, managers and finance can view financial summary secure'
  ) THEN
    CREATE POLICY "Admins, managers and finance can view financial summary secure"
    ON public.financial_summary_secure
    FOR SELECT
    USING (
      has_role(auth.uid(), 'admin'::app_role) OR 
      has_role(auth.uid(), 'manager'::app_role) OR 
      has_role(auth.uid(), 'finance'::app_role)
    );
  END IF;
END $$;

-- 4) Tighten privileges: no broad access, only SELECT for authenticated (RLS still applies)
REVOKE ALL ON public.financial_summary_secure FROM anon, authenticated;
GRANT SELECT ON public.financial_summary_secure TO authenticated;

-- 5) Assign 'finance' role to known admin user (by email) if present
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'finance'::app_role
FROM public.profiles 
WHERE email = 'deyvisson.lander@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;