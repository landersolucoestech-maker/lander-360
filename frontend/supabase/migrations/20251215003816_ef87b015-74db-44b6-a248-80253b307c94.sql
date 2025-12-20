-- Performance indexes for common queries
CREATE INDEX IF NOT EXISTS idx_financial_transactions_status ON public.financial_transactions(status);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON public.financial_transactions(type);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_transaction_type ON public.financial_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON public.financial_transactions(date);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_transaction_date ON public.financial_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_artist ON public.financial_transactions(artist_id);

CREATE INDEX IF NOT EXISTS idx_contracts_status ON public.contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_artist ON public.contracts(artist_id);
CREATE INDEX IF NOT EXISTS idx_contracts_end_date ON public.contracts(end_date);
CREATE INDEX IF NOT EXISTS idx_contracts_effective_to ON public.contracts(effective_to);

CREATE INDEX IF NOT EXISTS idx_releases_status ON public.releases(status);
CREATE INDEX IF NOT EXISTS idx_releases_release_date ON public.releases(release_date);
CREATE INDEX IF NOT EXISTS idx_releases_artist ON public.releases(artist_id);

CREATE INDEX IF NOT EXISTS idx_music_registry_status ON public.music_registry(status);
CREATE INDEX IF NOT EXISTS idx_music_registry_artist ON public.music_registry(artist_id);
CREATE INDEX IF NOT EXISTS idx_music_registry_genre ON public.music_registry(genre);

CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_artist ON public.projects(artist_id);

CREATE INDEX IF NOT EXISTS idx_agenda_events_start_date ON public.agenda_events(start_date);
CREATE INDEX IF NOT EXISTS idx_agenda_events_artist ON public.agenda_events(artist_id);
CREATE INDEX IF NOT EXISTS idx_agenda_events_status ON public.agenda_events(status);

-- Create enum for standardized genres
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'music_genre') THEN
    CREATE TYPE public.music_genre AS ENUM (
      'funk', 'trap', 'piseiro', 'arrocha', 'arrochadeira', 'sertanejo', 
      'axe', 'pagode', 'forro', 'reggaeton', 'pop', 'rock', 'mpb', 
      'hip_hop', 'eletronica', 'gospel', 'outro'
    );
  END IF;
END $$;

-- Create enum for standardized artist profile types
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'artist_profile_type') THEN
    CREATE TYPE public.artist_profile_type AS ENUM (
      'independente', 'com_empresario', 'gravadora_propria', 'gravadora_externa', 'produtor', 'compositor'
    );
  END IF;
END $$;

-- Add standardized genre column to music_registry (keep old for migration)
ALTER TABLE public.music_registry 
ADD COLUMN IF NOT EXISTS genre_normalized text;

-- Normalize existing genres
UPDATE public.music_registry SET genre_normalized = LOWER(TRIM(genre)) WHERE genre IS NOT NULL;
UPDATE public.music_registry SET genre_normalized = 'axe' WHERE genre_normalized = 'axe music';
UPDATE public.music_registry SET genre_normalized = 'outro' WHERE genre_normalized NOT IN ('funk', 'trap', 'piseiro', 'arrocha', 'arrochadeira', 'sertanejo', 'axe', 'pagode', 'forro', 'reggaeton', 'pop', 'rock', 'mpb', 'hip_hop', 'eletronica', 'gospel', 'outro') AND genre_normalized IS NOT NULL;