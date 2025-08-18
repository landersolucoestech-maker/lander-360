-- Harden access: restrict function execution and revoke direct view access

-- Restrict function execution
REVOKE EXECUTE ON FUNCTION public.get_financial_summary_secure() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_financial_summary_secure() TO authenticated;

-- Revoke direct access to the view (use TABLE keyword for views)
REVOKE ALL PRIVILEGES ON TABLE public.financial_summary_secure FROM PUBLIC, anon, authenticated;

-- Document intent
COMMENT ON VIEW public.financial_summary_secure IS 'Direct access revoked. Use get_financial_summary_secure() which enforces role checks (admin/manager/finance).';