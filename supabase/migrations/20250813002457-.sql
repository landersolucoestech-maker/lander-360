-- 1) Ensure 'finance' role exists in enum app_role
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'app_role' AND e.enumlabel = 'finance'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'finance';
  END IF;
END $$;

-- 2) Update secure function to include 'finance' role in permission checks
CREATE OR REPLACE FUNCTION public.get_financial_summary_secure()
RETURNS TABLE(
  id uuid,
  description text,
  type text,
  amount numeric,
  transaction_date date,
  created_at timestamptz,
  updated_at timestamptz,
  category text,
  payment_method text,
  status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Strict permission check - only admins, managers, and finance
  IF NOT (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'manager'::app_role) OR 
    has_role(auth.uid(), 'finance'::app_role)
  ) THEN
    -- Log unauthorized access attempt
    PERFORM log_user_activity(
      auth.uid(),
      'unauthorized_financial_access_attempt',
      'financial_summary',
      NULL,
      jsonb_build_object(
        'access_denied', true,
        'reason', 'insufficient_privileges',
        'attempted_at', NOW(),
        'security_alert', true
      )
    );
    RAISE EXCEPTION 'Access denied: insufficient privileges to view financial data. This incident has been logged.';
  END IF;
  
  -- Log authorized access
  PERFORM log_user_activity(
    auth.uid(),
    'authorized_financial_summary_access',
    'financial_summary',
    NULL,
    jsonb_build_object(
      'access_method', 'secure_function',
      'timestamp', NOW(),
      'user_permissions_verified', true,
      'data_classification', 'sensitive_financial'
    )
  );
  
  -- Return the financial summary data securely (only confirmed transactions)
  RETURN QUERY
  SELECT 
    ft.id,
    ft.description,
    ft.type,
    ft.amount,
    ft.transaction_date,
    ft.created_at,
    ft.updated_at,
    ft.category,
    ft.payment_method,
    ft.status
  FROM public.financial_transactions ft
  WHERE ft.status = 'confirmed';
END;
$$;

-- 3) Revoke direct access to the financial_summary_secure view from API roles
DO $$
BEGIN
  BEGIN
    EXECUTE 'REVOKE ALL PRIVILEGES ON VIEW public.financial_summary_secure FROM anon, authenticated';
  EXCEPTION WHEN undefined_object OR syntax_error_or_access_rule_violation THEN
  END;
  BEGIN
    EXECUTE 'REVOKE ALL PRIVILEGES ON MATERIALIZED VIEW public.financial_summary_secure FROM anon, authenticated';
  EXCEPTION WHEN undefined_object OR syntax_error_or_access_rule_violation THEN
  END;
END $$;

-- 4) Grant execute on secure function to authenticated role
GRANT EXECUTE ON FUNCTION public.get_financial_summary_secure() TO authenticated;

-- 5) Assign 'finance' role to known admin user, if exists
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'finance'::app_role
FROM public.profiles
WHERE email = 'deyvisson.lander@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;