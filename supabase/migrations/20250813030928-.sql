-- Harden artist data exposure via secure RPC
CREATE OR REPLACE FUNCTION public.get_artists_secure()
RETURNS TABLE(
  id uuid,
  name text,
  stage_name text,
  email text,
  phone text,
  genre text,
  bio text,
  social_media jsonb,
  data_access_level text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Log access attempt
  PERFORM public.log_sensitive_data_access('artists', NULL, 'bulk_access');

  IF (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'manager'::app_role) OR 
    has_role(auth.uid(), 'master'::app_role)
  ) THEN
    -- Privileged users: full contact info
    RETURN QUERY
    SELECT 
      a.id,
      a.name,
      a.stage_name,
      a.email,
      a.phone,
      a.genre,
      a.bio,
      a.social_media,
      'full'::text AS data_access_level,
      a.created_at,
      a.updated_at
    FROM public.artists a;
  ELSE
    -- Non-privileged users: redact contact info entirely
    RETURN QUERY
    SELECT 
      a.id,
      a.name,
      a.stage_name,
      NULL::text AS email,
      NULL::text AS phone,
      a.genre,
      a.bio,
      a.social_media,
      'redacted'::text AS data_access_level,
      a.created_at,
      a.updated_at
    FROM public.artists a;
  END IF;
END;
$function$;