-- Fix remaining function search path issues
-- These are likely the calculate_repasse and update_updated_at_column functions

CREATE OR REPLACE FUNCTION public.calculate_repasse(transaction_id uuid, percentage numeric)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  transaction_amount NUMERIC;
  repasse_amount NUMERIC;
BEGIN
  SELECT amount INTO transaction_amount 
  FROM public.financial_transactions 
  WHERE id = transaction_id;
  
  IF transaction_amount IS NULL THEN
    RETURN 0;
  END IF;
  
  repasse_amount := transaction_amount * (percentage / 100);
  RETURN repasse_amount;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;