-- AUDITORIA E CORREÇÃO DE FUNÇÕES

-- 1. LISTAR FUNÇÕES SEM search_path (EXECUTAR PRIMEIRO PARA VER QUAIS PRECISAM CORRIGIR)
SELECT n.nspname AS schema, p.proname AS function_name
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
AND NOT EXISTS (SELECT 1 FROM unnest(p.proconfig) cfg WHERE cfg LIKE 'search_path=%');

-- 2. CORRIGIR TODAS AS FUNÇÕES ADICIONANDO search_path
DO $$
DECLARE
  func RECORD;
  func_def TEXT;
  new_def TEXT;
BEGIN
  FOR func IN
    SELECT p.oid, n.nspname, p.proname, pg_get_functiondef(p.oid) AS definition
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
    AND NOT EXISTS (SELECT 1 FROM unnest(p.proconfig) cfg WHERE cfg LIKE 'search_path=%')
  LOOP
    EXECUTE format('ALTER FUNCTION public.%I SET search_path = public', func.proname);
    RAISE NOTICE 'Fixed: %', func.proname;
  END LOOP;
END $$;

-- 3. CORRIGIR FUNÇÕES ESPECÍFICAS CONHECIDAS
ALTER FUNCTION IF EXISTS public.check_user_permission SET search_path = public;
ALTER FUNCTION IF EXISTS public.get_user_permissions SET search_path = public;
ALTER FUNCTION IF EXISTS public.handle_new_user SET search_path = public;
ALTER FUNCTION IF EXISTS public.update_updated_at SET search_path = public;
ALTER FUNCTION IF EXISTS public.update_updated_at_column SET search_path = public;

-- 4. REVOGAR ACESSO DIRETO A TABELAS SENSÍVEIS
REVOKE ALL ON public.user_roles FROM anon;
REVOKE ALL ON public.role_permissions FROM anon;
REVOKE ALL ON public.permissions FROM anon;
REVOKE ALL ON public.roles FROM anon;
REVOKE ALL ON public.artist_sensitive_data FROM anon;
REVOKE ALL ON public.users FROM anon;

-- 5. GARANTIR EXECUÇÃO VIA FUNÇÕES
GRANT EXECUTE ON FUNCTION public.check_user_permission TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_permissions TO authenticated;
