-- ================================================
-- CORREÇÕES CRÍTICAS DO SISTEMA LANDER 360º
-- ================================================

-- 1. CRIAR ENUMs PADRONIZADOS PARA STATUS
-- ================================================

-- Status de Projetos
DO $$ BEGIN
  CREATE TYPE public.project_status_enum AS ENUM (
    'rascunho',
    'planejamento', 
    'em_producao',
    'em_revisao',
    'aprovado',
    'finalizado',
    'cancelado',
    'pausado'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Status de Obras (Music Registry)
DO $$ BEGIN
  CREATE TYPE public.obra_status_enum AS ENUM (
    'rascunho',
    'em_analise',
    'pendente_registro',
    'registrada',
    'aprovada',
    'rejeitada',
    'arquivada'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Status de Lançamentos
DO $$ BEGIN
  CREATE TYPE public.release_status_enum AS ENUM (
    'rascunho',
    'em_analise',
    'aprovado',
    'agendado',
    'distribuindo',
    'lancado',
    'cancelado',
    'pausado'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Status de Contratos
DO $$ BEGIN
  CREATE TYPE public.contract_status_enum AS ENUM (
    'rascunho',
    'em_analise',
    'aguardando_assinatura',
    'assinado',
    'ativo',
    'vencido',
    'cancelado',
    'rescindido'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Gêneros Musicais (padronizado)
DO $$ BEGIN
  CREATE TYPE public.genre_enum AS ENUM (
    'pop',
    'rock',
    'hip_hop',
    'rap',
    'funk',
    'sertanejo',
    'pagode',
    'samba',
    'mpb',
    'forro',
    'axe',
    'reggae',
    'eletronica',
    'gospel',
    'classica',
    'jazz',
    'blues',
    'country',
    'trap',
    'drill',
    'arrocha',
    'piseiro',
    'brega',
    'indie',
    'alternativo',
    'r_and_b',
    'soul',
    'folk',
    'metal',
    'punk',
    'outro'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. ADICIONAR CAMPOS OBRIGATÓRIOS DE DATA EM RELEASES
-- ================================================
ALTER TABLE public.releases 
ADD COLUMN IF NOT EXISTS planned_release_date date,
ADD COLUMN IF NOT EXISTS actual_release_date date;

-- 3. CRIAR TABELA DE REFERÊNCIA DE GÊNEROS (para validação flexível)
-- ================================================
CREATE TABLE IF NOT EXISTS public.genre_reference (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  normalized_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

INSERT INTO public.genre_reference (name, display_name, normalized_name) VALUES
  ('pop', 'Pop', 'pop'),
  ('rock', 'Rock', 'rock'),
  ('hip_hop', 'Hip Hop', 'hip_hop'),
  ('rap', 'Rap', 'rap'),
  ('funk', 'Funk', 'funk'),
  ('sertanejo', 'Sertanejo', 'sertanejo'),
  ('pagode', 'Pagode', 'pagode'),
  ('samba', 'Samba', 'samba'),
  ('mpb', 'MPB', 'mpb'),
  ('forro', 'Forró', 'forro'),
  ('axe', 'Axé', 'axe'),
  ('reggae', 'Reggae', 'reggae'),
  ('eletronica', 'Eletrônica', 'eletronica'),
  ('gospel', 'Gospel', 'gospel'),
  ('classica', 'Clássica', 'classica'),
  ('jazz', 'Jazz', 'jazz'),
  ('blues', 'Blues', 'blues'),
  ('country', 'Country', 'country'),
  ('trap', 'Trap', 'trap'),
  ('drill', 'Drill', 'drill'),
  ('arrocha', 'Arrocha', 'arrocha'),
  ('piseiro', 'Piseiro', 'piseiro'),
  ('brega', 'Brega', 'brega'),
  ('indie', 'Indie', 'indie'),
  ('alternativo', 'Alternativo', 'alternativo'),
  ('r_and_b', 'R&B', 'r_and_b'),
  ('soul', 'Soul', 'soul'),
  ('folk', 'Folk', 'folk'),
  ('metal', 'Metal', 'metal'),
  ('punk', 'Punk', 'punk'),
  ('outro', 'Outro', 'outro')
ON CONFLICT (name) DO NOTHING;

-- 4. FUNÇÃO PARA NORMALIZAR GÊNERO
-- ================================================
CREATE OR REPLACE FUNCTION public.normalize_genre(input_genre text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  normalized text;
BEGIN
  IF input_genre IS NULL THEN
    RETURN 'outro';
  END IF;
  
  -- Normalize to lowercase and remove accents
  normalized := lower(trim(input_genre));
  normalized := regexp_replace(normalized, '[áàâã]', 'a', 'g');
  normalized := regexp_replace(normalized, '[éèê]', 'e', 'g');
  normalized := regexp_replace(normalized, '[íì]', 'i', 'g');
  normalized := regexp_replace(normalized, '[óòôõ]', 'o', 'g');
  normalized := regexp_replace(normalized, '[úù]', 'u', 'g');
  normalized := regexp_replace(normalized, '[ç]', 'c', 'g');
  normalized := regexp_replace(normalized, '[^a-z0-9_]', '_', 'g');
  normalized := regexp_replace(normalized, '_+', '_', 'g');
  normalized := trim(both '_' from normalized);
  
  -- Map common variations
  IF normalized IN ('funk_brasileiro', 'funk_carioca') THEN RETURN 'funk'; END IF;
  IF normalized IN ('hip_hop', 'hiphop') THEN RETURN 'hip_hop'; END IF;
  IF normalized IN ('r_b', 'rnb', 'r_and_b') THEN RETURN 'r_and_b'; END IF;
  IF normalized IN ('musica_eletronica', 'edm', 'electronic') THEN RETURN 'eletronica'; END IF;
  IF normalized IN ('musica_classica', 'classical') THEN RETURN 'classica'; END IF;
  IF normalized IN ('outros', 'other', '') THEN RETURN 'outro'; END IF;
  
  -- Check if it exists in reference table
  IF EXISTS (SELECT 1 FROM public.genre_reference WHERE name = normalized OR normalized_name = normalized) THEN
    RETURN normalized;
  END IF;
  
  RETURN 'outro';
END;
$$;

-- 5. TRIGGER PARA NORMALIZAR GÊNERO AUTOMATICAMENTE
-- ================================================
CREATE OR REPLACE FUNCTION public.normalize_genre_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.genre IS NOT NULL THEN
    NEW.genre := public.normalize_genre(NEW.genre);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Apply to artists
DROP TRIGGER IF EXISTS normalize_artist_genre ON public.artists;
CREATE TRIGGER normalize_artist_genre
  BEFORE INSERT OR UPDATE ON public.artists
  FOR EACH ROW EXECUTE FUNCTION public.normalize_genre_trigger();

-- Apply to music_registry
DROP TRIGGER IF EXISTS normalize_music_genre ON public.music_registry;
CREATE TRIGGER normalize_music_genre
  BEFORE INSERT OR UPDATE ON public.music_registry
  FOR EACH ROW EXECUTE FUNCTION public.normalize_genre_trigger();

-- Apply to releases
DROP TRIGGER IF EXISTS normalize_release_genre ON public.releases;
CREATE TRIGGER normalize_release_genre
  BEFORE INSERT OR UPDATE ON public.releases
  FOR EACH ROW EXECUTE FUNCTION public.normalize_genre_trigger();

-- 6. VALIDAÇÃO DE CONTRATO - VALOR OBRIGATÓRIO PARA ASSINADOS
-- ================================================
CREATE OR REPLACE FUNCTION public.validate_contract_value()
RETURNS TRIGGER AS $$
BEGIN
  -- Require value for signed/active contracts
  IF NEW.status IN ('assinado', 'ativo') AND (NEW.value IS NULL OR NEW.value <= 0) THEN
    -- Allow if royalty_rate or royalties_percentage is set (royalty-based contracts)
    IF (NEW.royalty_rate IS NULL OR NEW.royalty_rate <= 0) AND 
       (NEW.royalties_percentage IS NULL OR NEW.royalties_percentage <= 0) THEN
      RAISE EXCEPTION 'Contratos assinados/ativos devem ter valor definido ou taxa de royalties';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS validate_contract_value_trigger ON public.contracts;
CREATE TRIGGER validate_contract_value_trigger
  BEFORE INSERT OR UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.validate_contract_value();

-- 7. VALIDAÇÃO DE LANÇAMENTO - DATA OBRIGATÓRIA
-- ================================================
CREATE OR REPLACE FUNCTION public.validate_release_date()
RETURNS TRIGGER AS $$
BEGIN
  -- Require date for published/scheduled releases
  IF NEW.status IN ('lancado', 'agendado', 'distribuindo', 'aprovado', 'released') THEN
    IF NEW.release_date IS NULL AND NEW.planned_release_date IS NULL THEN
      RAISE EXCEPTION 'Lançamentos publicados devem ter data de lançamento definida';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS validate_release_date_trigger ON public.releases;
CREATE TRIGGER validate_release_date_trigger
  BEFORE INSERT OR UPDATE ON public.releases
  FOR EACH ROW EXECUTE FUNCTION public.validate_release_date();

-- 8. ÍNDICES PARA PERFORMANCE
-- ================================================
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON public.financial_transactions(date);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON public.financial_transactions(type);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_status ON public.financial_transactions(status);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON public.contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_end_date ON public.contracts(end_date);
CREATE INDEX IF NOT EXISTS idx_contracts_effective_to ON public.contracts(effective_to);
CREATE INDEX IF NOT EXISTS idx_releases_status ON public.releases(status);
CREATE INDEX IF NOT EXISTS idx_releases_release_date ON public.releases(release_date);
CREATE INDEX IF NOT EXISTS idx_music_registry_status ON public.music_registry(status);
CREATE INDEX IF NOT EXISTS idx_artists_genre ON public.artists(genre);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);

-- 9. RLS PARA GENRE_REFERENCE
-- ================================================
ALTER TABLE public.genre_reference ENABLE ROW LEVEL SECURITY;

CREATE POLICY "genre_reference_select_all" ON public.genre_reference
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "genre_reference_manage_admin" ON public.genre_reference
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 10. NORMALIZAR DADOS EXISTENTES
-- ================================================
-- Normalize existing genres in artists
UPDATE public.artists SET genre = public.normalize_genre(genre) WHERE genre IS NOT NULL;

-- Normalize existing genres in music_registry
UPDATE public.music_registry SET genre = public.normalize_genre(genre) WHERE genre IS NOT NULL;

-- Normalize existing genres in releases
UPDATE public.releases SET genre = public.normalize_genre(genre) WHERE genre IS NOT NULL;

-- Fix status inconsistencies in releases (em_analise -> em_analise normalized)
UPDATE public.releases SET status = 'em_analise' WHERE status IN ('Em Análise', 'Em análise', 'em análise');
UPDATE public.releases SET status = 'lancado' WHERE status IN ('released', 'Released', 'lançado', 'Lançado');
UPDATE public.releases SET status = 'rascunho' WHERE status IN ('draft', 'Draft', 'Rascunho');

-- Fix status inconsistencies in contracts
UPDATE public.contracts SET status = 'assinado' WHERE status IN ('signed', 'Signed', 'Assinado');
UPDATE public.contracts SET status = 'ativo' WHERE status IN ('active', 'Active', 'Ativo');
UPDATE public.contracts SET status = 'rascunho' WHERE status IN ('draft', 'Draft', 'Rascunho');

-- Fix status inconsistencies in projects
UPDATE public.projects SET status = 'em_producao' WHERE status IN ('in_production', 'In Production', 'Em Produção');
UPDATE public.projects SET status = 'finalizado' WHERE status IN ('completed', 'Completed', 'Finalizado');