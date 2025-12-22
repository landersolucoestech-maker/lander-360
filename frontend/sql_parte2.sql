-- PARTE 2: Criar tabela artist_sensitive_data

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

CREATE INDEX IF NOT EXISTS idx_artist_sensitive_data_artist_id ON artist_sensitive_data(artist_id);

ALTER TABLE artist_sensitive_data ENABLE ROW LEVEL SECURITY;

SELECT 'Parte 2 concluida - Tabela artist_sensitive_data criada' as status;
