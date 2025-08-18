-- Fix Security Definer Views by recreating them without SECURITY DEFINER
-- Views will automatically use SECURITY INVOKER (caller permissions) by default

-- Drop existing views first (in reverse dependency order)  
DROP VIEW IF EXISTS public.v_contributor_balance;
DROP VIEW IF EXISTS public.v_contributor_royalties; 
DROP VIEW IF EXISTS public.v_track_revenue;

-- 1. Create v_track_revenue (no dependencies) - uses caller permissions by default
CREATE VIEW public.v_track_revenue AS
SELECT 
    srl.org_id,
    srl.track_id,
    SUM(srl.net_amount) as net_revenue
FROM public.sales_report_lines srl
GROUP BY srl.org_id, srl.track_id;

-- 2. Create v_contributor_royalties (depends on v_track_revenue)  
CREATE VIEW public.v_contributor_royalties AS
SELECT 
    tc.org_id,
    tc.contributor_id,
    tc.track_id,
    COALESCE(tr.net_revenue * (tc.split_percent / 100), 0) as amount_due
FROM public.track_contributors tc
JOIN public.v_track_revenue tr ON tc.track_id = tr.track_id
WHERE tc.split_percent > 0;

-- 3. Create v_contributor_balance (depends on v_contributor_royalties)
CREATE VIEW public.v_contributor_balance AS
SELECT 
    c.org_id,
    c.id as contributor_id,
    COALESCE(SUM(cr.amount_due), 0) as total_due,
    COALESCE(SUM(p.amount), 0) as total_paid,
    COALESCE(SUM(cr.amount_due), 0) - COALESCE(SUM(p.amount), 0) as balance
FROM public.contributors c
LEFT JOIN public.v_contributor_royalties cr ON c.id = cr.contributor_id
LEFT JOIN public.payments p ON c.id = p.contributor_id AND p.status = 'paid'
GROUP BY c.org_id, c.id;