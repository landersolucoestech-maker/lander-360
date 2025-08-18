-- CRITICAL SECURITY FIX: Secure financial_summary view
-- Analysis: financial_summary is a VIEW that exposes sensitive financial data
-- without any RLS protection, allowing any authenticated user to access all financial records

-- First, let's examine and secure the financial_summary view
-- Since it's a view, we need to ensure proper RLS at the view level

-- Enable RLS on the financial_summary view
ALTER TABLE public.financial_summary ENABLE ROW LEVEL SECURITY;

-- Create restrictive RLS policy for financial_summary view
-- Only admins and managers should access financial summary data
CREATE POLICY "Admins and managers can view financial summary"
ON public.financial_summary
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- Add audit logging for financial summary access
CREATE OR REPLACE FUNCTION public.log_financial_summary_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log any access to financial summary data for security monitoring
  PERFORM log_user_activity(
    auth.uid(),
    'financial_summary_view_access',
    'financial_summary',
    NULL, -- no specific record ID for views
    jsonb_build_object(
      'access_time', NOW(),
      'user_role', (SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1),
      'security_level', 'critical_financial_data'
    )
  );
  
  RETURN NULL; -- For AFTER trigger
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Note: We cannot create SELECT triggers on views directly in PostgreSQL
-- Instead, we'll create a secure function to access financial summary data

-- Create a secure function to replace direct view access
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
  -- Check if user has required permissions
  IF NOT (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)) THEN
    RAISE EXCEPTION 'Access denied: insufficient privileges to view financial data';
  END IF;
  
  -- Log the access attempt
  PERFORM log_user_activity(
    auth.uid(),
    'secure_financial_summary_access',
    'financial_summary',
    NULL,
    jsonb_build_object(
      'access_method', 'secure_function',
      'timestamp', NOW(),
      'user_permissions_verified', true
    )
  );
  
  -- Return the financial summary data
  RETURN QUERY
  SELECT 
    fs.id,
    fs.description,
    fs.type,
    fs.amount,
    fs.transaction_date,
    fs.created_at,
    fs.updated_at,
    fs.category,
    fs.payment_method,
    fs.status
  FROM public.financial_summary fs;
END;
$$;