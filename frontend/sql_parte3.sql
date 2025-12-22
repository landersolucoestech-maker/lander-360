-- PARTE 3: Criar policies RLS para cadastro publico

-- Policies para artist_sensitive_data
DROP POLICY IF EXISTS artist_sensitive_data_select ON artist_sensitive_data;
DROP POLICY IF EXISTS artist_sensitive_data_insert ON artist_sensitive_data;
DROP POLICY IF EXISTS artist_sensitive_data_update ON artist_sensitive_data;

CREATE POLICY artist_sensitive_data_select ON artist_sensitive_data FOR SELECT TO authenticated USING (true);
CREATE POLICY artist_sensitive_data_insert ON artist_sensitive_data FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY artist_sensitive_data_update ON artist_sensitive_data FOR UPDATE TO authenticated USING (true);

-- Policies para permitir insercao anonima nas tabelas principais
DROP POLICY IF EXISTS artists_anon_insert ON artists;
DROP POLICY IF EXISTS music_registry_anon_insert ON music_registry;
DROP POLICY IF EXISTS phonograms_anon_insert ON phonograms;

CREATE POLICY artists_anon_insert ON artists FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY music_registry_anon_insert ON music_registry FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY phonograms_anon_insert ON phonograms FOR INSERT TO anon WITH CHECK (true);

SELECT 'Parte 3 concluida - Policies RLS criadas' as status;
