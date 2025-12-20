
-- Remove overly permissive RLS policies from financial_transactions (using 'true' qual)
DROP POLICY IF EXISTS "Authenticated users can delete financial_transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Authenticated users can insert financial_transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Authenticated users can update financial_transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Authenticated users can view financial_transactions" ON public.financial_transactions;

-- Remove duplicate financial_transactions policies (keeping the named ones)
DROP POLICY IF EXISTS "financial_delete_admin" ON public.financial_transactions;
DROP POLICY IF EXISTS "financial_insert_admin_financeiro" ON public.financial_transactions;
DROP POLICY IF EXISTS "financial_select_admin_financeiro" ON public.financial_transactions;
DROP POLICY IF EXISTS "financial_update_admin_financeiro" ON public.financial_transactions;

-- Remove overly permissive policies from compositions
DROP POLICY IF EXISTS "Authenticated users can delete compositions" ON public.compositions;
DROP POLICY IF EXISTS "Authenticated users can insert compositions" ON public.compositions;
DROP POLICY IF EXISTS "Authenticated users can update compositions" ON public.compositions;
DROP POLICY IF EXISTS "Authenticated users can view compositions" ON public.compositions;

-- Remove overly permissive policies from contributors
DROP POLICY IF EXISTS "Authenticated users can delete contributors" ON public.contributors;
DROP POLICY IF EXISTS "Authenticated users can insert contributors" ON public.contributors;
DROP POLICY IF EXISTS "Authenticated users can update contributors" ON public.contributors;
DROP POLICY IF EXISTS "Authenticated users can view contributors" ON public.contributors;

-- Remove overly permissive policies from crm_contacts
DROP POLICY IF EXISTS "Authenticated users can delete crm_contacts" ON public.crm_contacts;
DROP POLICY IF EXISTS "Authenticated users can insert crm_contacts" ON public.crm_contacts;
DROP POLICY IF EXISTS "Authenticated users can update crm_contacts" ON public.crm_contacts;
DROP POLICY IF EXISTS "Authenticated users can view crm_contacts" ON public.crm_contacts;

-- Remove overly permissive policies from distributions
DROP POLICY IF EXISTS "Authenticated users can delete distributions" ON public.distributions;
DROP POLICY IF EXISTS "Authenticated users can insert distributions" ON public.distributions;
DROP POLICY IF EXISTS "Authenticated users can update distributions" ON public.distributions;
DROP POLICY IF EXISTS "Authenticated users can view distributions" ON public.distributions;

-- Remove overly permissive policies from inventory
DROP POLICY IF EXISTS "Authenticated users can delete inventory" ON public.inventory;
DROP POLICY IF EXISTS "Authenticated users can insert inventory" ON public.inventory;
DROP POLICY IF EXISTS "Authenticated users can update inventory" ON public.inventory;
DROP POLICY IF EXISTS "Authenticated users can view inventory" ON public.inventory;

-- Remove overly permissive policies from invoices
DROP POLICY IF EXISTS "Authenticated users can delete invoices" ON public.invoices;
DROP POLICY IF EXISTS "Authenticated users can insert invoices" ON public.invoices;
DROP POLICY IF EXISTS "Authenticated users can update invoices" ON public.invoices;
DROP POLICY IF EXISTS "Authenticated users can view invoices" ON public.invoices;

-- Remove overly permissive policies from marketing_briefings
DROP POLICY IF EXISTS "Authenticated users can delete marketing_briefings" ON public.marketing_briefings;
DROP POLICY IF EXISTS "Authenticated users can insert marketing_briefings" ON public.marketing_briefings;
DROP POLICY IF EXISTS "Authenticated users can update marketing_briefings" ON public.marketing_briefings;
DROP POLICY IF EXISTS "Authenticated users can view marketing_briefings" ON public.marketing_briefings;

-- Remove overly permissive policies from marketing_campaigns
DROP POLICY IF EXISTS "Authenticated users can delete marketing_campaigns" ON public.marketing_campaigns;
DROP POLICY IF EXISTS "Authenticated users can insert marketing_campaigns" ON public.marketing_campaigns;
DROP POLICY IF EXISTS "Authenticated users can update marketing_campaigns" ON public.marketing_campaigns;
DROP POLICY IF EXISTS "Authenticated users can view marketing_campaigns" ON public.marketing_campaigns;

-- Remove overly permissive policies from marketing_content
DROP POLICY IF EXISTS "Authenticated users can delete marketing_content" ON public.marketing_content;
DROP POLICY IF EXISTS "Authenticated users can insert marketing_content" ON public.marketing_content;
DROP POLICY IF EXISTS "Authenticated users can update marketing_content" ON public.marketing_content;
DROP POLICY IF EXISTS "Authenticated users can view marketing_content" ON public.marketing_content;

-- Remove overly permissive policies from marketing_tasks
DROP POLICY IF EXISTS "Authenticated users can delete marketing_tasks" ON public.marketing_tasks;
DROP POLICY IF EXISTS "Authenticated users can insert marketing_tasks" ON public.marketing_tasks;
DROP POLICY IF EXISTS "Authenticated users can update marketing_tasks" ON public.marketing_tasks;
DROP POLICY IF EXISTS "Authenticated users can view marketing_tasks" ON public.marketing_tasks;

-- Add proper role-based RLS policies for tables that need them

-- compositions policies (admin/manager)
CREATE POLICY "compositions_select_admin_manager" ON public.compositions
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "compositions_insert_admin_manager" ON public.compositions
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "compositions_update_admin_manager" ON public.compositions
FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "compositions_delete_admin" ON public.compositions
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- contributors policies (admin/manager)
CREATE POLICY "contributors_select_admin_manager" ON public.contributors
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "contributors_insert_admin_manager" ON public.contributors
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "contributors_update_admin_manager" ON public.contributors
FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "contributors_delete_admin" ON public.contributors
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- crm_contacts policies (admin/manager)
CREATE POLICY "crm_contacts_select_admin_manager" ON public.crm_contacts
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "crm_contacts_insert_admin_manager" ON public.crm_contacts
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "crm_contacts_update_admin_manager" ON public.crm_contacts
FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "crm_contacts_delete_admin" ON public.crm_contacts
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- distributions policies (admin/manager)
CREATE POLICY "distributions_select_admin_manager" ON public.distributions
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "distributions_insert_admin_manager" ON public.distributions
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "distributions_update_admin_manager" ON public.distributions
FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "distributions_delete_admin" ON public.distributions
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- inventory policies (admin/manager/financeiro)
CREATE POLICY "inventory_select_admin_manager" ON public.inventory
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role));

CREATE POLICY "inventory_insert_admin_manager" ON public.inventory
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "inventory_update_admin_manager" ON public.inventory
FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "inventory_delete_admin" ON public.inventory
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- invoices policies (admin/financeiro)
CREATE POLICY "invoices_select_admin_financeiro" ON public.invoices
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role));

CREATE POLICY "invoices_insert_admin_financeiro" ON public.invoices
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role));

CREATE POLICY "invoices_update_admin_financeiro" ON public.invoices
FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role));

CREATE POLICY "invoices_delete_admin" ON public.invoices
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- marketing_briefings policies (admin/manager/marketing)
CREATE POLICY "marketing_briefings_select_team" ON public.marketing_briefings
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'marketing'::app_role));

CREATE POLICY "marketing_briefings_insert_team" ON public.marketing_briefings
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'marketing'::app_role));

CREATE POLICY "marketing_briefings_update_team" ON public.marketing_briefings
FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'marketing'::app_role));

CREATE POLICY "marketing_briefings_delete_admin" ON public.marketing_briefings
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- marketing_campaigns policies (admin/manager/marketing)
CREATE POLICY "marketing_campaigns_select_team" ON public.marketing_campaigns
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'marketing'::app_role));

CREATE POLICY "marketing_campaigns_insert_team" ON public.marketing_campaigns
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'marketing'::app_role));

CREATE POLICY "marketing_campaigns_update_team" ON public.marketing_campaigns
FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'marketing'::app_role));

CREATE POLICY "marketing_campaigns_delete_admin" ON public.marketing_campaigns
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- marketing_content policies (admin/manager/marketing)
CREATE POLICY "marketing_content_select_team" ON public.marketing_content
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'marketing'::app_role));

CREATE POLICY "marketing_content_insert_team" ON public.marketing_content
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'marketing'::app_role));

CREATE POLICY "marketing_content_update_team" ON public.marketing_content
FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'marketing'::app_role));

CREATE POLICY "marketing_content_delete_admin" ON public.marketing_content
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- marketing_tasks policies (admin/manager/marketing)
CREATE POLICY "marketing_tasks_select_team" ON public.marketing_tasks
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'marketing'::app_role));

CREATE POLICY "marketing_tasks_insert_team" ON public.marketing_tasks
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'marketing'::app_role));

CREATE POLICY "marketing_tasks_update_team" ON public.marketing_tasks
FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'marketing'::app_role));

CREATE POLICY "marketing_tasks_delete_admin" ON public.marketing_tasks
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
