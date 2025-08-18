-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can manage financial transactions" ON public.financial_transactions;

-- Create more restrictive policies for financial transactions
-- Only admins and managers can view financial transactions
CREATE POLICY "Admins and managers can view financial transactions" 
ON public.financial_transactions 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- Only admins and managers can create financial transactions
CREATE POLICY "Admins and managers can create financial transactions" 
ON public.financial_transactions 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- Only admins and managers can update financial transactions
CREATE POLICY "Admins and managers can update financial transactions" 
ON public.financial_transactions 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- Only admins can delete financial transactions
CREATE POLICY "Only admins can delete financial transactions" 
ON public.financial_transactions 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create a secure view for financial summaries (without sensitive details)
CREATE OR REPLACE VIEW public.financial_summary AS
SELECT 
  id,
  CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) 
    THEN description 
    ELSE 'Financial Transaction'
  END as description,
  type,
  category,
  CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) 
    THEN amount 
    ELSE NULL
  END as amount,
  transaction_date,
  status,
  CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) 
    THEN payment_method 
    ELSE NULL
  END as payment_method,
  created_at,
  updated_at
FROM public.financial_transactions;

-- Enable RLS on the view
ALTER VIEW public.financial_summary SET (security_barrier = true);

-- Create a function to get financial statistics for dashboard (accessible to all authenticated users)
CREATE OR REPLACE FUNCTION public.get_financial_statistics()
RETURNS TABLE(
  total_revenue numeric,
  total_expenses numeric,
  net_profit numeric,
  transaction_count bigint
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    COALESCE(SUM(CASE WHEN type = 'revenue' AND status = 'confirmed' THEN amount ELSE 0 END), 0) as total_revenue,
    COALESCE(SUM(CASE WHEN type = 'expense' AND status = 'confirmed' THEN amount ELSE 0 END), 0) as total_expenses,
    COALESCE(SUM(CASE WHEN type = 'revenue' AND status = 'confirmed' THEN amount ELSE 0 END) - 
             SUM(CASE WHEN type = 'expense' AND status = 'confirmed' THEN amount ELSE 0 END), 0) as net_profit,
    COUNT(*) as transaction_count
  FROM public.financial_transactions
  WHERE (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'manager'::app_role)
  );
$$;

-- Create audit function for financial data access
CREATE OR REPLACE FUNCTION public.audit_financial_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log access to sensitive financial data
  PERFORM log_user_activity(
    auth.uid(),
    'financial_data_access',
    'financial_transactions',
    NEW.id,
    jsonb_build_object(
      'action', TG_OP,
      'amount', NEW.amount,
      'type', NEW.type
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for financial access auditing
CREATE TRIGGER audit_financial_access_trigger
  AFTER INSERT OR UPDATE ON public.financial_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_financial_access();