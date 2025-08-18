-- Fix remaining functions with missing search_path

-- Update is_org_member function
CREATE OR REPLACE FUNCTION public.is_org_member(p_org uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $function$
  select exists (
    select 1 from public.org_members m
    where m.org_id = p_org and m.user_id = auth.uid()
  );
$function$;

-- Update set_timestamp function
CREATE OR REPLACE FUNCTION public.set_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
begin
  new.updated_at := now();
  return new;
end
$function$;