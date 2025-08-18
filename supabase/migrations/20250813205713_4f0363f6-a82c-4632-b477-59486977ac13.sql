-- Fix all remaining security issues

-- 1. Fix Function Search Path Mutable warnings by updating functions to set search_path
-- This prevents SQL injection attacks through search path manipulation

-- Update handle_new_user function 
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
    );
    RETURN NEW;
END;
$function$;

-- Update create_admin_user function
CREATE OR REPLACE FUNCTION public.create_admin_user(user_email text, user_password text, user_full_name text, user_phone text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  new_user_id UUID;
BEGIN
  -- Note: This function is for demonstration only
  -- In production, users should be created through Supabase Auth UI
  -- This will create a profile entry that can be updated manually
  
  -- Generate a UUID for the user (this would normally come from auth.users)
  new_user_id := gen_random_uuid();
  
  -- Insert into profiles table
  INSERT INTO public.profiles (id, full_name, phone, role_display)
  VALUES (new_user_id, user_full_name, user_phone, 'Administrador (Master)');
  
  -- Assign admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_user_id, 'admin');
  
  RETURN new_user_id;
END;
$function$;