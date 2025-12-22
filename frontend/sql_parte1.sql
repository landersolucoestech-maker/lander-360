-- PARTE 1: Adicionar colunas nas tabelas existentes

-- Colunas para artists
ALTER TABLE artists ADD COLUMN IF NOT EXISTS observations TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS contract_status VARCHAR(50) DEFAULT 'Pré-cadastro';
ALTER TABLE artists ADD COLUMN IF NOT EXISTS instagram_url TEXT;

-- Colunas para music_registry
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS observations TEXT;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS participants JSONB DEFAULT '[]'::jsonb;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS language VARCHAR(50);

-- Colunas para phonograms
ALTER TABLE phonograms ADD COLUMN IF NOT EXISTS master_owner VARCHAR(255);
ALTER TABLE phonograms ADD COLUMN IF NOT EXISTS version_type VARCHAR(50);

SELECT 'Parte 1 concluida - Colunas adicionadas' as status;
