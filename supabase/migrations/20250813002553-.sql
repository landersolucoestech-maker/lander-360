-- Step 2: Update function, revoke view access, grant execute, and assign role

-- Update secure function to include 'finance' check
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
  IF NOT (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'manager'::app_role) OR 
    has_role(auth.uid(), 'finance'::app_role)
  ) THEN
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

-- Revoke direct API access to the view
DO $$
BEGIN
  BEGIN
    EXECUTE 'REVOKE ALL PRIVILEGES ON VIEW public.financial_summary_secure FROM anon, authenticated';
  EXCEPTION WHEN undefined_object OR syntax_error_or_access_rule_violation THEN
  END;
END $$;

-- Grant execute on function to authenticated
GRANT EXECUTE ON FUNCTION public.get_financial_summary_secure() TO authenticated;

-- Assign 'finance' role to known admin user (by email)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'finance'::app_role
FROM public.profiles 
WHERE email = 'deyvisson.lander@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;