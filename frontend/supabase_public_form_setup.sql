-- ==============================================
-- SCRIPT: Preparação do Banco de Dados para Formulário Público
-- Lander 360 - Cadastro Público de Artistas, Obras e Fonogramas
-- Data: 2025-01-22
-- ==============================================

-- Garantir que as colunas necessárias existam na tabela artists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'observations') THEN
        ALTER TABLE artists ADD COLUMN observations TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'contract_status') THEN
        ALTER TABLE artists ADD COLUMN contract_status VARCHAR(50) DEFAULT 'Pré-cadastro';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'instagram_url') THEN
        ALTER TABLE artists ADD COLUMN instagram_url TEXT;
    END IF;
END $$;

-- Garantir que as colunas necessárias existam na tabela music_registry
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'music_registry' AND column_name = 'observations') THEN
        ALTER TABLE music_registry ADD COLUMN observations TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'music_registry' AND column_name = 'participants') THEN
        ALTER TABLE music_registry ADD COLUMN participants JSONB DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'music_registry' AND column_name = 'language') THEN
        ALTER TABLE music_registry ADD COLUMN language VARCHAR(50);
    END IF;
END $$;

-- Garantir que as colunas necessárias existam na tabela phonograms
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'phonograms' AND column_name = 'master_owner') THEN
        ALTER TABLE phonograms ADD COLUMN master_owner VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'phonograms' AND column_name = 'version_type') THEN
        ALTER TABLE phonograms ADD COLUMN version_type VARCHAR(50);
    END IF;
END $$;

-- Garantir que a tabela artist_sensitive_data existe
CREATE TABLE IF NOT EXISTS artist_sensitive_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    cpf_cnpj VARCHAR(20),
    rg VARCHAR(20),
    full_address TEXT,
    bank VARCHAR(100),
    agency VARCHAR(20),
    account VARCHAR(30),
    pix_key VARCHAR(255),
    account_holder VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(artist_id)
);

-- Índice para busca rápida por artist_id
CREATE INDEX IF NOT EXISTS idx_artist_sensitive_data_artist_id ON artist_sensitive_data(artist_id);

-- RLS para artist_sensitive_data
ALTER TABLE artist_sensitive_data ENABLE ROW LEVEL SECURITY;

-- Remover policies antigas se existirem
DROP POLICY IF EXISTS "artist_sensitive_data_select" ON artist_sensitive_data;
DROP POLICY IF EXISTS "artist_sensitive_data_insert" ON artist_sensitive_data;
DROP POLICY IF EXISTS "artist_sensitive_data_update" ON artist_sensitive_data;

-- Criar novas policies
CREATE POLICY "artist_sensitive_data_select"
    ON artist_sensitive_data FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "artist_sensitive_data_insert"
    ON artist_sensitive_data FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

CREATE POLICY "artist_sensitive_data_update"
    ON artist_sensitive_data FOR UPDATE
    TO authenticated
    USING (true);

-- ==============================================
-- POLÍTICAS RLS PARA CADASTRO PÚBLICO
-- Permitir que usuários anônimos possam inserir registros
-- ==============================================

-- Remover policies antigas
DROP POLICY IF EXISTS "artists_anon_insert" ON artists;
DROP POLICY IF EXISTS "music_registry_anon_insert" ON music_registry;
DROP POLICY IF EXISTS "phonograms_anon_insert" ON phonograms;

-- Política para artists (permitir inserção anônima)
CREATE POLICY "artists_anon_insert"
    ON artists FOR INSERT
    TO anon
    WITH CHECK (true);

-- Política para music_registry (permitir inserção anônima)
CREATE POLICY "music_registry_anon_insert"
    ON music_registry FOR INSERT
    TO anon
    WITH CHECK (true);

-- Política para phonograms (permitir inserção anônima)
CREATE POLICY "phonograms_anon_insert"
    ON phonograms FOR INSERT
    TO anon
    WITH CHECK (true);

-- ==============================================
-- VERIFICAÇÃO FINAL
-- ==============================================
SELECT 'Configuracao concluida com sucesso!' as status;
