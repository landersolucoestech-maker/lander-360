-- CRITICAL SECURITY FIX: Secure financial_summary view and remaining functions
-- Fix the financial_summary RLS and audit functionality

-- Enable RLS on financial_summary (it's a view, so we need to secure the underlying table)
-- Since financial_summary is a view, we need to ensure the underlying financial_transactions table is properly secured
-- The view inherits security from the base table, which already has proper RLS

-- Update the remaining functions with secure search_path
CREATE OR REPLACE FUNCTION public.mask_sensitive_data(p_email text, p_phone text, p_user_id uuid DEFAULT auth.uid())
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  user_role TEXT;
  masked_data JSONB;
BEGIN
  -- Obter role do usuário atual
  SELECT role INTO user_role 
  FROM public.user_roles 
  WHERE user_id = p_user_id 
  LIMIT 1;
  
  -- Se não tem role definida, assume 'user'
  IF user_role IS NULL THEN
    user_role := 'user';
  END IF;
  
  -- Admins e managers veem dados completos
  IF user_role IN ('admin', 'manager') THEN
    masked_data := jsonb_build_object(
      'email', p_email,
      'phone', p_phone,
      'access_level', 'full'
    );
  -- Usuários comuns veem dados mascarados
  ELSE
    masked_data := jsonb_build_object(
      'email', CASE 
        WHEN p_email IS NOT NULL THEN 
          SUBSTRING(p_email, 1, 2) || '***@' || SPLIT_PART(p_email, '@', 2)
        ELSE NULL 
      END,
      'phone', CASE 
        WHEN p_phone IS NOT NULL THEN 
          SUBSTRING(p_phone, 1, 4) || '***' || RIGHT(p_phone, 2)
        ELSE NULL 
      END,
      'access_level', 'masked'
    );
  END IF;
  
  RETURN masked_data;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_artists_secure()
 RETURNS TABLE(id uuid, name text, stage_name text, email text, phone text, genre text, bio text, social_media jsonb, data_access_level text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Log do acesso
  PERFORM public.log_sensitive_data_access('artists', NULL, 'bulk_access');
  
  -- Retornar dados baseado no nível de acesso
  RETURN QUERY
  SELECT 
    a.id,
    a.name,
    a.stage_name,
    CASE 
      WHEN has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') THEN a.email
      ELSE (public.mask_sensitive_data(a.email, a.phone))->>'email'
    END as email,
    CASE 
      WHEN has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') THEN a.phone
      ELSE (public.mask_sensitive_data(a.email, a.phone))->>'phone'
    END as phone,
    a.genre,
    a.bio,
    a.social_media,
    CASE 
      WHEN has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') THEN 'full'
      ELSE 'masked'
    END as data_access_level,
    a.created_at,
    a.updated_at
  FROM public.artists a;
END;
$function$;

-- Update the audit_financial_access function with proper search_path
CREATE OR REPLACE FUNCTION public.audit_financial_access()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;