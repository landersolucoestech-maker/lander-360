-- Add 'artista' to app_role enum if not exists (safe check via exception handling)
DO $$ 
BEGIN
  ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'artista';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Artists can view their own artist record via user_artists link
DROP POLICY IF EXISTS artists_select_linked_artist ON artists;
CREATE POLICY artists_select_linked_artist ON artists
  FOR SELECT
  USING (user_can_access_artist(auth.uid(), id));

-- Artists can view their own projects
DROP POLICY IF EXISTS projects_select_linked_artist ON projects;
CREATE POLICY projects_select_linked_artist ON projects
  FOR SELECT
  USING (user_can_access_artist(auth.uid(), artist_id));

-- Artists can view their own releases
DROP POLICY IF EXISTS releases_select_linked_artist ON releases;
CREATE POLICY releases_select_linked_artist ON releases
  FOR SELECT
  USING (user_can_access_artist(auth.uid(), artist_id));

-- Artists can view their own music registry
DROP POLICY IF EXISTS music_registry_select_linked_artist ON music_registry;
CREATE POLICY music_registry_select_linked_artist ON music_registry
  FOR SELECT
  USING (user_can_access_artist(auth.uid(), artist_id));

-- Artists can view their own contracts
DROP POLICY IF EXISTS contracts_select_linked_artist ON contracts;
CREATE POLICY contracts_select_linked_artist ON contracts
  FOR SELECT
  USING (user_can_access_artist(auth.uid(), artist_id));

-- Artists can view their own financial transactions
DROP POLICY IF EXISTS financial_transactions_select_linked_artist ON financial_transactions;
CREATE POLICY financial_transactions_select_linked_artist ON financial_transactions
  FOR SELECT
  USING (user_can_access_artist(auth.uid(), artist_id));

-- Artists can view their own marketing campaigns
DROP POLICY IF EXISTS marketing_campaigns_select_linked_artist ON marketing_campaigns;
CREATE POLICY marketing_campaigns_select_linked_artist ON marketing_campaigns
  FOR SELECT
  USING (user_can_access_artist(auth.uid(), artist_id));

-- Artists can view creative ideas for their artist profile
DROP POLICY IF EXISTS creative_ideas_select_linked_artist ON creative_ideas;
CREATE POLICY creative_ideas_select_linked_artist ON creative_ideas
  FOR SELECT
  USING (user_can_access_artist(auth.uid(), artist_id));

-- Artists can view their own goals
DROP POLICY IF EXISTS artist_goals_select_linked_artist ON artist_goals;
CREATE POLICY artist_goals_select_linked_artist ON artist_goals
  FOR SELECT
  USING (user_can_access_artist(auth.uid(), artist_id));

-- RLS for user_artists table - users can only see their own links
ALTER TABLE user_artists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_artists_select_own ON user_artists;
CREATE POLICY user_artists_select_own ON user_artists
  FOR SELECT
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

DROP POLICY IF EXISTS user_artists_insert_admin ON user_artists;
CREATE POLICY user_artists_insert_admin ON user_artists
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

DROP POLICY IF EXISTS user_artists_delete_admin ON user_artists;
CREATE POLICY user_artists_delete_admin ON user_artists
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Grant user role to artist profile type users
COMMENT ON TABLE user_artists IS 'Links users to artist profiles they can access. Used for artist-specific data visibility.';