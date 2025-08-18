-- Fix the last remaining function search path issue
-- This must be the get_financial_statistics function

CREATE OR REPLACE FUNCTION public.get_financial_statistics()
 RETURNS TABLE(total_revenue numeric, total_expenses numeric, net_profit numeric, transaction_count bigint)
 LANGUAGE sql
 STABLE 
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;