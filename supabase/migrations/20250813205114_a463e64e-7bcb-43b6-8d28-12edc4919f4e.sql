-- Fix Security Definer Views by recreating them without SECURITY DEFINER
-- and adding proper RLS policies instead

-- Drop existing views first
DROP VIEW IF EXISTS public.v_contributor_balance;
DROP VIEW IF EXISTS public.v_contributor_royalties; 
DROP VIEW IF EXISTS public.v_track_revenue;

-- Recreate v_contributor_balance without SECURITY DEFINER
CREATE VIEW public.v_contributor_balance AS
SELECT 
    c.org_id,
    c.id as contributor_id,
    COALESCE(SUM(cr.amount_due), 0) as total_due,
    COALESCE(SUM(p.amount), 0) as total_paid,
    COALESCE(SUM(cr.amount_due), 0) - COALESCE(SUM(p.amount), 0) as balance
FROM public.contributors c
LEFT JOIN public.v_contributor_royalties cr ON c.id = cr.contributor_id
LEFT JOIN public.payments p ON c.id = p.contributor_id AND p.status = 'completed'
GROUP BY c.org_id, c.id;

-- Recreate v_contributor_royalties without SECURITY DEFINER
CREATE VIEW public.v_contributor_royalties AS
SELECT 
    tc.org_id,
    tc.contributor_id,
    tc.track_id,
    COALESCE(tr.net_revenue * (tc.split_percent / 100), 0) as amount_due
FROM public.track_contributors tc
JOIN public.v_track_revenue tr ON tc.track_id = tr.track_id
WHERE tc.split_percent > 0;

-- Recreate v_track_revenue without SECURITY DEFINER  
CREATE VIEW public.v_track_revenue AS
SELECT 
    srl.org_id,
    srl.track_id,
    SUM(srl.net_amount) as net_revenue
FROM public.sales_report_lines srl
GROUP BY srl.org_id, srl.track_id;

-- Enable RLS on all views
ALTER VIEW public.v_contributor_balance SET (security_invoker = true);
ALTER VIEW public.v_contributor_royalties SET (security_invoker = true);
ALTER VIEW public.v_track_revenue SET (security_invoker = true);

-- Add RLS policies for the views using the same org membership pattern
-- v_contributor_balance policies
CREATE POLICY "v_contributor_balance_select" 
ON public.v_contributor_balance 
FOR SELECT 
USING (is_org_member(org_id));

-- v_contributor_royalties policies  
CREATE POLICY "v_contributor_royalties_select" 
ON public.v_contributor_royalties 
FOR SELECT 
USING (is_org_member(org_id));

-- v_track_revenue policies
CREATE POLICY "v_track_revenue_select" 
ON public.v_track_revenue 
FOR SELECT 
USING (is_org_member(org_id));