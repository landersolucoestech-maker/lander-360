-- Fix critical financial data exposure by adding RLS policies
-- Add RLS policies to financial_summary table
ALTER TABLE public.financial_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins and managers can view financial summary"
ON public.financial_summary
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- Add RLS policies to financial_summary_secure table  
ALTER TABLE public.financial_summary_secure ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins and managers can view secure financial summary"
ON public.financial_summary_secure
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- Create a secure function to get users for admin interface
CREATE OR REPLACE FUNCTION public.get_users_secure()
RETURNS TABLE(
  id uuid,
  email text,
  full_name text,
  email_confirmed_at timestamp with time zone,
  last_sign_in_at timestamp with time zone,
  created_at timestamp with time zone,
  roles text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only admins and managers can access user data
  IF NOT (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)) THEN
    RAISE EXCEPTION 'Access denied: insufficient privileges to view user data';
  END IF;
  
  -- Log the access
  PERFORM log_user_activity(
    auth.uid(),
    'secure_user_list_access',
    'users',
    NULL,
    jsonb_build_object(
      'access_method', 'secure_function',
      'timestamp', NOW()
    )
  );
  
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    NULL::timestamp with time zone as email_confirmed_at,
    NULL::timestamp with time zone as last_sign_in_at,
    p.created_at,
    ARRAY(
      SELECT ur.role::text 
      FROM public.user_roles ur 
      WHERE ur.user_id = p.id
    ) as roles
  FROM public.profiles p;
END;
$$;

-- Fix database function security by adding proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.email
  );
  
  -- If this is the first user, make them admin
  IF is_first_admin() THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role);
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;