-- CORRIGIR TODAS AS FUNÇÕES SEM search_path
DO $$
DECLARE
  func RECORD;
BEGIN
  FOR func IN
    SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
    AND NOT EXISTS (SELECT 1 FROM unnest(p.proconfig) cfg WHERE cfg LIKE 'search_path=%')
  LOOP
    BEGIN
      EXECUTE format('ALTER FUNCTION public.%I(%s) SET search_path = public', func.proname, func.args);
      RAISE NOTICE 'Fixed: %', func.proname;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipped: %', func.proname;
    END;
  END LOOP;
END $$;

-- REVOGAR ACESSO DIRETO
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY['user_roles','role_permissions','permissions','roles','artist_sensitive_data','users'];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
      EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
    END IF;
  END LOOP;
END $$;
