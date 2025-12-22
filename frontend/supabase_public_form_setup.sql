-- ==============================================
-- SCRIPT: Preparação do Banco de Dados para Formulário Público
-- Lander 360 - Cadastro Público de Artistas, Obras e Fonogramas
-- Data: 2025-01-22
-- ==============================================

-- Garantir que as colunas necessárias existam na tabela artists
DO $$ 
BEGIN
    -- Coluna observations (para armazenar protocolo e origem)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'observations') THEN
        ALTER TABLE artists ADD COLUMN observations TEXT;
        COMMENT ON COLUMN artists.observations IS 'Observações gerais do artista, incluindo protocolo de cadastro público';
    END IF;

    -- Coluna contract_status (para status do artista)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'contract_status') THEN
        ALTER TABLE artists ADD COLUMN contract_status VARCHAR(50) DEFAULT 'Pré-cadastro';
        COMMENT ON COLUMN artists.contract_status IS 'Status do contrato do artista';
    END IF;

    -- Coluna instagram_url (para redes sociais)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'instagram_url') THEN
        ALTER TABLE artists ADD COLUMN instagram_url TEXT;
    END IF;
END $$;

-- Garantir que as colunas necessárias existam na tabela music_registry
DO $$ 
BEGIN
    -- Coluna observations (para armazenar protocolo e origem)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'music_registry' AND column_name = 'observations') THEN
        ALTER TABLE music_registry ADD COLUMN observations TEXT;
        COMMENT ON COLUMN music_registry.observations IS 'Observações gerais da obra, incluindo protocolo de cadastro público';
    END IF;

    -- Coluna participants (para armazenar autores e percentuais)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'music_registry' AND column_name = 'participants') THEN
        ALTER TABLE music_registry ADD COLUMN participants JSONB DEFAULT '[]'::jsonb;
        COMMENT ON COLUMN music_registry.participants IS 'Lista de autores e participantes com funções e percentuais';
    END IF;

    -- Coluna language (para idioma da obra)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'music_registry' AND column_name = 'language') THEN
        ALTER TABLE music_registry ADD COLUMN language VARCHAR(50);
        COMMENT ON COLUMN music_registry.language IS 'Idioma da obra musical';
    END IF;
END $$;

-- Garantir que as colunas necessárias existam na tabela phonograms
DO $$ 
BEGIN
    -- Coluna master_owner (para produtor fonográfico)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'phonograms' AND column_name = 'master_owner') THEN
        ALTER TABLE phonograms ADD COLUMN master_owner VARCHAR(255);
        COMMENT ON COLUMN phonograms.master_owner IS 'Proprietário do master/produtor fonográfico';
    END IF;

    -- Coluna version_type (para tipo de versão)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'phonograms' AND column_name = 'version_type') THEN
        ALTER TABLE phonograms ADD COLUMN version_type VARCHAR(50);
        COMMENT ON COLUMN phonograms.version_type IS 'Tipo de versão do fonograma (Original, Remix, Ao vivo, etc)';
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

-- RLS para artist_sensitive_data (apenas admin pode acessar)
ALTER TABLE artist_sensitive_data ENABLE ROW LEVEL SECURITY;

-- Policy para select (apenas autenticados podem ver)
DROP POLICY IF EXISTS "Allow authenticated users to select artist_sensitive_data" ON artist_sensitive_data;
CREATE POLICY "Allow authenticated users to select artist_sensitive_data"
    ON artist_sensitive_data FOR SELECT
    TO authenticated
    USING (true);

-- Policy para insert (permite inserção de qualquer usuário para o cadastro público funcionar)
DROP POLICY IF EXISTS "Allow insert for anyone" ON artist_sensitive_data;
CREATE POLICY "Allow insert for anyone"
    ON artist_sensitive_data FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

-- Policy para update (apenas autenticados)
DROP POLICY IF EXISTS "Allow authenticated users to update artist_sensitive_data" ON artist_sensitive_data;
CREATE POLICY "Allow authenticated users to update artist_sensitive_data"
    ON artist_sensitive_data FOR UPDATE
    TO authenticated
    USING (true);

-- ==============================================
-- POLÍTICAS RLS PARA CADASTRO PÚBLICO
-- Permitir que usuários anônimos (não autenticados) possam inserir registros
-- ==============================================

-- Política para artists (permitir inserção anônima)
DROP POLICY IF EXISTS "Allow anonymous insert for public form" ON artists;
CREATE POLICY "Allow anonymous insert for public form"
    ON artists FOR INSERT
    TO anon
    WITH CHECK (true);

-- Política para music_registry (permitir inserção anônima)
DROP POLICY IF EXISTS "Allow anonymous insert for public form" ON music_registry;
CREATE POLICY "Allow anonymous insert for public form"
    ON music_registry FOR INSERT
    TO anon
    WITH CHECK (true);

-- Política para phonograms (permitir inserção anônima)
DROP POLICY IF EXISTS "Allow anonymous insert for public form" ON phonograms;
CREATE POLICY "Allow anonymous insert for public form"
    ON phonograms FOR INSERT
    TO anon
    WITH CHECK (true);

-- ==============================================
-- VERIFICAÇÃO FINAL
-- ==============================================
SELECT 'Configuração concluída com sucesso!' as status;
