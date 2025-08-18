-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = is_user_admin.user_id
      AND role = 'admin'
  )
$$;

-- Create helper function for organization admin check
CREATE OR REPLACE FUNCTION public.is_org_admin(org_id uuid, user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.org_members
    WHERE org_members.org_id = is_org_admin.org_id
      AND org_members.user_id = is_org_admin.user_id
      AND org_members.role = 'admin'
  )
$$;

-- Drop existing RLS policies for sensitive tables and create stricter ones
-- Contributors table - contains sensitive personal/financial data
DROP POLICY IF EXISTS "contributors_select_select" ON public.contributors;
DROP POLICY IF EXISTS "contributors_insert_insert" ON public.contributors;
DROP POLICY IF EXISTS "contributors_update_update" ON public.contributors;
DROP POLICY IF EXISTS "contributors_delete_delete" ON public.contributors;

-- Admins can do everything with contributors
CREATE POLICY "contributors_admin_all"
ON public.contributors
FOR ALL
TO authenticated
USING (is_org_admin(org_id));

-- Regular members can only view basic info (display_name, country - no email/tax_id)
CREATE POLICY "contributors_member_select_limited"
ON public.contributors
FOR SELECT
TO authenticated
USING (
  is_org_member(org_id) AND NOT is_org_admin(org_id)
);

-- Contracts table - sensitive financial agreements
DROP POLICY IF EXISTS "contracts_select_select" ON public.contracts;
DROP POLICY IF EXISTS "contracts_insert_insert" ON public.contracts;
DROP POLICY IF EXISTS "contracts_update_update" ON public.contracts;
DROP POLICY IF EXISTS "contracts_delete_delete" ON public.contracts;

CREATE POLICY "contracts_admin_all"
ON public.contracts
FOR ALL
TO authenticated
USING (is_org_admin(org_id));

-- Invoices table - financial data (admin only)
DROP POLICY IF EXISTS "invoices_select_select" ON public.invoices;
DROP POLICY IF EXISTS "invoices_insert_insert" ON public.invoices;
DROP POLICY IF EXISTS "invoices_update_update" ON public.invoices;
DROP POLICY IF EXISTS "invoices_delete_delete" ON public.invoices;

CREATE POLICY "invoices_admin_all"
ON public.invoices
FOR ALL
TO authenticated
USING (is_org_admin(org_id));

-- Payments table - sensitive financial transactions (admin only)
DROP POLICY IF EXISTS "payments_select_select" ON public.payments;
DROP POLICY IF EXISTS "payments_insert_insert" ON public.payments;
DROP POLICY IF EXISTS "payments_update_update" ON public.payments;
DROP POLICY IF EXISTS "payments_delete_delete" ON public.payments;

CREATE POLICY "payments_admin_all"
ON public.payments
FOR ALL
TO authenticated
USING (is_org_admin(org_id));

-- Sales reports and lines - financial data (admin only)
DROP POLICY IF EXISTS "sales_reports_select_select" ON public.sales_reports;
DROP POLICY IF EXISTS "sales_reports_insert_insert" ON public.sales_reports;
DROP POLICY IF EXISTS "sales_reports_update_update" ON public.sales_reports;
DROP POLICY IF EXISTS "sales_reports_delete_delete" ON public.sales_reports;

CREATE POLICY "sales_reports_admin_all"
ON public.sales_reports
FOR ALL
TO authenticated
USING (is_org_admin(org_id));

DROP POLICY IF EXISTS "sales_report_lines_select_select" ON public.sales_report_lines;
DROP POLICY IF EXISTS "sales_report_lines_insert_insert" ON public.sales_report_lines;
DROP POLICY IF EXISTS "sales_report_lines_update_update" ON public.sales_report_lines;
DROP POLICY IF EXISTS "sales_report_lines_delete_delete" ON public.sales_report_lines;

CREATE POLICY "sales_report_lines_admin_all"
ON public.sales_report_lines
FOR ALL
TO authenticated
USING (is_org_admin(org_id));