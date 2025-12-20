
-- ============================================
-- COMPREHENSIVE SECURITY FIX MIGRATION (v2)
-- ============================================

-- 1. PROFILES TABLE - Drop ALL existing policies first
DROP POLICY IF EXISTS "profiles_select_own_only" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;

-- Recreate strict policies for profiles
CREATE POLICY "profiles_select_own_only"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "profiles_insert_own"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "profiles_update_admin"
ON public.profiles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "profiles_delete_admin"
ON public.profiles FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. FINANCIAL_TRANSACTIONS - Drop all existing and create role-based only
DROP POLICY IF EXISTS "financial_select_admin_financeiro" ON public.financial_transactions;
DROP POLICY IF EXISTS "financial_insert_admin_financeiro" ON public.financial_transactions;
DROP POLICY IF EXISTS "financial_update_admin_financeiro" ON public.financial_transactions;
DROP POLICY IF EXISTS "financial_delete_admin" ON public.financial_transactions;

CREATE POLICY "financial_select_admin_financeiro"
ON public.financial_transactions FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'financeiro'::app_role)
);

CREATE POLICY "financial_insert_admin_financeiro"
ON public.financial_transactions FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'financeiro'::app_role)
);

CREATE POLICY "financial_update_admin_financeiro"
ON public.financial_transactions FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'financeiro'::app_role)
);

CREATE POLICY "financial_delete_admin"
ON public.financial_transactions FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. CONTRACTS TABLE - Drop existing and add artist-based filtering
DROP POLICY IF EXISTS "contracts_select_admin" ON public.contracts;
DROP POLICY IF EXISTS "contracts_select_manager_managed_artists" ON public.contracts;
DROP POLICY IF EXISTS "contracts_insert_admin" ON public.contracts;
DROP POLICY IF EXISTS "contracts_insert_manager_managed_artists" ON public.contracts;
DROP POLICY IF EXISTS "contracts_update_admin" ON public.contracts;
DROP POLICY IF EXISTS "contracts_update_manager_managed_artists" ON public.contracts;
DROP POLICY IF EXISTS "contracts_delete_admin" ON public.contracts;

CREATE POLICY "contracts_select_admin"
ON public.contracts FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "contracts_select_manager_managed_artists"
ON public.contracts FOR SELECT
USING (
  public.has_role(auth.uid(), 'manager'::app_role)
  AND (artist_id IS NULL OR public.user_can_access_artist(auth.uid(), artist_id))
);

CREATE POLICY "contracts_insert_admin"
ON public.contracts FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "contracts_insert_manager_managed_artists"
ON public.contracts FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'manager'::app_role)
  AND (artist_id IS NULL OR public.user_can_access_artist(auth.uid(), artist_id))
);

CREATE POLICY "contracts_update_admin"
ON public.contracts FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "contracts_update_manager_managed_artists"
ON public.contracts FOR UPDATE
USING (
  public.has_role(auth.uid(), 'manager'::app_role)
  AND (artist_id IS NULL OR public.user_can_access_artist(auth.uid(), artist_id))
);

CREATE POLICY "contracts_delete_admin"
ON public.contracts FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. SPOTIFY_ARTIST_TOKENS - Restrict to service_role only (no user policies)
DROP POLICY IF EXISTS "Service role can manage spotify tokens" ON public.spotify_artist_tokens;
DROP POLICY IF EXISTS "Authenticated users can manage spotify_artist_tokens" ON public.spotify_artist_tokens;

-- Enable RLS if not already
ALTER TABLE IF EXISTS public.spotify_artist_tokens ENABLE ROW LEVEL SECURITY;

-- No user-facing policies = only service_role can access
COMMENT ON TABLE public.spotify_artist_tokens IS 'OAuth tokens - service_role access only. Never expose to clients.';

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contracts_artist_id ON public.contracts(artist_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_artist_id ON public.financial_transactions(artist_id);
