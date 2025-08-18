-- 1) Fix function search_path to satisfy linter
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2) Remove direct API exposure for financial_summary (matview/view/table)
DO $$
BEGIN
  -- Revoke for MATERIALIZED VIEW
  BEGIN
    EXECUTE 'REVOKE ALL PRIVILEGES ON MATERIALIZED VIEW public.financial_summary FROM anon, authenticated';
  EXCEPTION WHEN undefined_object OR syntax_error_or_access_rule_violation THEN
  END;

  -- Revoke for regular VIEW
  BEGIN
    EXECUTE 'REVOKE ALL PRIVILEGES ON VIEW public.financial_summary FROM anon, authenticated';
  EXCEPTION WHEN undefined_object OR syntax_error_or_access_rule_violation THEN
  END;

  -- Revoke for TABLE (if exists in some env)
  BEGIN
    EXECUTE 'REVOKE ALL PRIVILEGES ON TABLE public.financial_summary FROM anon, authenticated';
  EXCEPTION WHEN undefined_object THEN
  END;
END $$;