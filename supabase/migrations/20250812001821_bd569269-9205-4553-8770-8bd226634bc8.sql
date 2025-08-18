-- CRITICAL SECURITY FIX: Secure financial_summary view
-- This view currently has NO RLS policies and exposes all financial data

-- Enable RLS on financial_summary view (if it's a table)
-- Note: Views inherit RLS from underlying tables, but we need to ensure proper access control

-- Create RLS policies for financial_summary to restrict access to admin/manager roles only
CREATE POLICY "Admins and managers can view financial summary" 
ON public.financial_summary 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- Add audit trigger for financial data access
CREATE OR REPLACE FUNCTION public.audit_financial_summary_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log access to financial summary data
  PERFORM log_user_activity(
    auth.uid(),
    'financial_summary_access',
    'financial_summary',
    NEW.id,
    jsonb_build_object(
      'action', TG_OP,
      'amount', NEW.amount,
      'type', NEW.type,
      'category', NEW.category
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Create trigger for financial summary access logging
CREATE TRIGGER audit_financial_summary_access_trigger
  AFTER SELECT ON public.financial_summary
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_financial_summary_access();

-- Update remaining functions with secure search_path
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