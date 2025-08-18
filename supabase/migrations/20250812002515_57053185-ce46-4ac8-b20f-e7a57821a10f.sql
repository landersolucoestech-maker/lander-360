-- CRITICAL SECURITY FIX: Secure financial_summary view (Corrected Approach)
-- Analysis: financial_summary is a VIEW based on financial_transactions table
-- Views inherit RLS from underlying tables, but we need additional security controls

-- The financial_summary view is based on financial_transactions table
-- which already has proper RLS policies for admins/managers
-- However, we need to ensure the view itself is properly protected

-- Create a secure function to access financial summary data with enhanced security
CREATE OR REPLACE FUNCTION public.get_financial_summary_secure()
RETURNS TABLE(
  id uuid,
  description text,
  type text,
  amount numeric,
  transaction_date date,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  category text,
  payment_method text,
  status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Strict permission check - only admins and managers
  IF NOT (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)) THEN
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
  
  -- Return the financial summary data securely
  -- Note: The underlying financial_transactions table already has RLS
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
  WHERE ft.status = 'confirmed'; -- Only show confirmed transactions in summary
END;
$$;

-- Create a view wrapper that enforces security
CREATE OR REPLACE VIEW public.financial_summary_secure AS
SELECT 
  id,
  CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) 
    THEN description 
    ELSE 'Restricted Access'::text 
  END as description,
  type,
  CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) 
    THEN amount 
    ELSE NULL::numeric 
  END as amount,
  transaction_date,
  created_at,
  updated_at,
  CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) 
    THEN category 
    ELSE NULL::text 
  END as category,
  CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) 
    THEN payment_method 
    ELSE NULL::text 
  END as payment_method,
  status
FROM public.financial_transactions
WHERE 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role);

-- Add comment explaining the security implementation
COMMENT ON FUNCTION public.get_financial_summary_secure() IS 
'Secure function to access financial summary data. Restricts access to admins and managers only, with comprehensive audit logging.';

COMMENT ON VIEW public.financial_summary_secure IS 
'Secure view for financial summary data with role-based access control and data masking for unauthorized users.';