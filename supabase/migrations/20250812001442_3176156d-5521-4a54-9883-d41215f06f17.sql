-- Fix security definer functions by adding SET search_path = 'public'
-- This addresses the Function Search Path Mutable warnings

-- Update functions to have secure search_path
CREATE OR REPLACE FUNCTION public.log_user_activity(p_user_id uuid, p_action text, p_resource_type text DEFAULT NULL::text, p_resource_id uuid DEFAULT NULL::uuid, p_details jsonb DEFAULT NULL::jsonb, p_ip_address inet DEFAULT NULL::inet, p_user_agent text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.user_activity_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_details,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_sensitive_data_access(p_resource_type text, p_resource_id uuid, p_access_type text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Log apenas se usuário não é admin (admins têm acesso legítimo)
  IF NOT has_role(auth.uid(), 'admin') THEN
    INSERT INTO public.user_activity_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      details,
      ip_address
    ) VALUES (
      auth.uid(),
      p_access_type,
      p_resource_type,
      p_resource_id,
      jsonb_build_object(
        'sensitive_data_access', true,
        'timestamp', NOW(),
        'warning', 'Acesso a dados sensíveis monitorado'
      ),
      inet_client_addr()
    );
  END IF;
END;
$function$;