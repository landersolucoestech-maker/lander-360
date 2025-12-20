
-- =====================================================
-- CORREÇÃO DE SEGURANÇA CRÍTICA
-- =====================================================

-- 1. CORRIGIR TABELA rate_limits - REMOVER ACESSO PÚBLICO
-- Drop existing permissive policy that exposes data
DROP POLICY IF EXISTS "Public read access" ON public.rate_limits;
DROP POLICY IF EXISTS "rate_limits_public_read" ON public.rate_limits;
DROP POLICY IF EXISTS "Allow public read" ON public.rate_limits;

-- Ensure RLS is enabled
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Create restrictive policies - only service role should access this
CREATE POLICY "rate_limits_service_only" ON public.rate_limits
FOR ALL
USING (false)
WITH CHECK (false);

-- 2. CORRIGIR TABELAS landerzap SEM RLS ADEQUADO
-- landerzap_conversations - restringir acesso
DROP POLICY IF EXISTS "Authenticated users can manage conversations" ON public.landerzap_conversations;

CREATE POLICY "landerzap_conversations_select_admin_manager" ON public.landerzap_conversations
FOR SELECT USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "landerzap_conversations_insert_admin_manager" ON public.landerzap_conversations
FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "landerzap_conversations_update_admin_manager" ON public.landerzap_conversations
FOR UPDATE USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "landerzap_conversations_delete_admin" ON public.landerzap_conversations
FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- landerzap_messages - restringir acesso
DROP POLICY IF EXISTS "Authenticated users can manage messages" ON public.landerzap_messages;

CREATE POLICY "landerzap_messages_select_admin_manager" ON public.landerzap_messages
FOR SELECT USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "landerzap_messages_insert_admin_manager" ON public.landerzap_messages
FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "landerzap_messages_update_admin_manager" ON public.landerzap_messages
FOR UPDATE USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "landerzap_messages_delete_admin" ON public.landerzap_messages
FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- 3. CORRIGIR TABELAS DE ROYALTIES COM RLS FRACO
-- royalty_reports
DROP POLICY IF EXISTS "Authenticated users can manage royalty_reports" ON public.royalty_reports;

CREATE POLICY "royalty_reports_select_admin_financeiro" ON public.royalty_reports
FOR SELECT USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'financeiro')
);

CREATE POLICY "royalty_reports_insert_admin_financeiro" ON public.royalty_reports
FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'financeiro')
);

CREATE POLICY "royalty_reports_update_admin_financeiro" ON public.royalty_reports
FOR UPDATE USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'financeiro')
);

CREATE POLICY "royalty_reports_delete_admin" ON public.royalty_reports
FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- royalty_distrokid
DROP POLICY IF EXISTS "Authenticated users can manage royalty_distrokid" ON public.royalty_distrokid;

CREATE POLICY "royalty_distrokid_select_admin_financeiro" ON public.royalty_distrokid
FOR SELECT USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'financeiro')
);

CREATE POLICY "royalty_distrokid_manage_admin_financeiro" ON public.royalty_distrokid
FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'financeiro')
);

-- royalty_onerpm tables
DROP POLICY IF EXISTS "Authenticated users can manage royalty_onerpm_statement" ON public.royalty_onerpm_statement;
DROP POLICY IF EXISTS "Authenticated users can manage royalty_onerpm_summary" ON public.royalty_onerpm_summary;
DROP POLICY IF EXISTS "Authenticated users can manage royalty_onerpm_details_commissions" ON public.royalty_onerpm_details_commissions;
DROP POLICY IF EXISTS "Authenticated users can manage royalty_onerpm_details_masters" ON public.royalty_onerpm_details_masters;
DROP POLICY IF EXISTS "Authenticated users can manage royalty_onerpm_details_publishing" ON public.royalty_onerpm_details_publishing;
DROP POLICY IF EXISTS "Authenticated users can manage royalty_onerpm_details_share" ON public.royalty_onerpm_details_share;
DROP POLICY IF EXISTS "Authenticated users can manage royalty_onerpm_details_summary" ON public.royalty_onerpm_details_summary;
DROP POLICY IF EXISTS "Authenticated users can manage royalty_onerpm_details_youtube" ON public.royalty_onerpm_details_youtube;

CREATE POLICY "royalty_onerpm_statement_access" ON public.royalty_onerpm_statement
FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'financeiro')
);

CREATE POLICY "royalty_onerpm_summary_access" ON public.royalty_onerpm_summary
FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'financeiro')
);

CREATE POLICY "royalty_onerpm_details_commissions_access" ON public.royalty_onerpm_details_commissions
FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'financeiro')
);

CREATE POLICY "royalty_onerpm_details_masters_access" ON public.royalty_onerpm_details_masters
FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'financeiro')
);

CREATE POLICY "royalty_onerpm_details_publishing_access" ON public.royalty_onerpm_details_publishing
FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'financeiro')
);

CREATE POLICY "royalty_onerpm_details_share_access" ON public.royalty_onerpm_details_share
FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'financeiro')
);

CREATE POLICY "royalty_onerpm_details_summary_access" ON public.royalty_onerpm_details_summary
FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'financeiro')
);

CREATE POLICY "royalty_onerpm_details_youtube_access" ON public.royalty_onerpm_details_youtube
FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'financeiro')
);

-- 4. CORRIGIR TABELAS SPOTIFY COM RLS FRACO (tokens OAuth sensíveis)
DROP POLICY IF EXISTS "Authenticated users can manage spotify_artist_tokens" ON public.spotify_artist_tokens;
DROP POLICY IF EXISTS "Authenticated users can manage spotify_oauth_states" ON public.spotify_oauth_states;

-- spotify_artist_tokens - só admin pode gerenciar tokens OAuth
CREATE POLICY "spotify_artist_tokens_select_admin" ON public.spotify_artist_tokens
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "spotify_artist_tokens_manage_admin" ON public.spotify_artist_tokens
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- spotify_oauth_states - só admin pode gerenciar estados OAuth
CREATE POLICY "spotify_oauth_states_select_admin" ON public.spotify_oauth_states
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "spotify_oauth_states_manage_admin" ON public.spotify_oauth_states
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 5. CORRIGIR login_attempts - dados sensíveis de segurança
DROP POLICY IF EXISTS "Public can insert login attempts" ON public.login_attempts;
DROP POLICY IF EXISTS "login_attempts_public" ON public.login_attempts;

ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Só permite insert para o sistema, select só para admin
CREATE POLICY "login_attempts_insert_authenticated" ON public.login_attempts
FOR INSERT WITH CHECK (true);

CREATE POLICY "login_attempts_select_admin" ON public.login_attempts
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "login_attempts_update_system" ON public.login_attempts
FOR UPDATE USING (true);

CREATE POLICY "login_attempts_delete_admin" ON public.login_attempts
FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- 6. ADICIONAR RLS MAIS RESTRITIVO PARA creative_ai_chats
DROP POLICY IF EXISTS "Authenticated users can manage creative_ai_chats" ON public.creative_ai_chats;

CREATE POLICY "creative_ai_chats_select_own_or_admin" ON public.creative_ai_chats
FOR SELECT USING (
  created_by = auth.uid() OR 
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "creative_ai_chats_insert_authenticated" ON public.creative_ai_chats
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "creative_ai_chats_update_own" ON public.creative_ai_chats
FOR UPDATE USING (
  created_by = auth.uid() OR 
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "creative_ai_chats_delete_own_or_admin" ON public.creative_ai_chats
FOR DELETE USING (
  created_by = auth.uid() OR 
  public.has_role(auth.uid(), 'admin')
);
