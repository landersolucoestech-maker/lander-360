-- Harden access to sensitive financial data: deny direct view access and restrict function execution

-- 1) Restrict execution of the secure function to authenticated users only
REVOKE EXECUTE ON FUNCTION public.get_financial_summary_secure() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_financial_summary_secure() TO authenticated;

-- 2) Revoke any direct API access to the financial_summary_secure view (use function instead)
DO $$
BEGIN
  BEGIN
    EXECUTE 'REVOKE ALL PRIVILEGES ON VIEW public.financial_summary_secure FROM PUBLIC, anon, authenticated';
  EXCEPTION WHEN undefined_object THEN
    -- View may not exist in some environments
    NULL;
  END;
END $$;

-- Optional: document intent
COMMENT ON VIEW public.financial_summary_secure IS 'Direct access revoked. Use get_financial_summary_secure() which enforces role checks (admin/manager/finance).';