-- =====================================================
-- CORREÇÃO DA TABELA PROFILES
-- Adiciona colunas que estão faltando
-- Execute no SQL Editor do Supabase
-- =====================================================

-- Adiciona coluna sector se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'sector'
    ) THEN
        ALTER TABLE profiles ADD COLUMN sector text;
        RAISE NOTICE 'Coluna sector adicionada';
    ELSE
        RAISE NOTICE 'Coluna sector já existe';
    END IF;
END $$;

-- Adiciona coluna sector_id se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'sector_id'
    ) THEN
        ALTER TABLE profiles ADD COLUMN sector_id uuid;
        RAISE NOTICE 'Coluna sector_id adicionada';
    ELSE
        RAISE NOTICE 'Coluna sector_id já existe';
    END IF;
END $$;

-- Adiciona coluna role_display se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'role_display'
    ) THEN
        ALTER TABLE profiles ADD COLUMN role_display text;
        RAISE NOTICE 'Coluna role_display adicionada';
    ELSE
        RAISE NOTICE 'Coluna role_display já existe';
    END IF;
END $$;

-- Adiciona coluna permissions se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'permissions'
    ) THEN
        ALTER TABLE profiles ADD COLUMN permissions text[];
        RAISE NOTICE 'Coluna permissions adicionada';
    ELSE
        RAISE NOTICE 'Coluna permissions já existe';
    END IF;
END $$;

-- Adiciona coluna roles se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'roles'
    ) THEN
        ALTER TABLE profiles ADD COLUMN roles text[];
        RAISE NOTICE 'Coluna roles adicionada';
    ELSE
        RAISE NOTICE 'Coluna roles já existe';
    END IF;
END $$;

-- Adiciona coluna phone se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'phone'
    ) THEN
        ALTER TABLE profiles ADD COLUMN phone text;
        RAISE NOTICE 'Coluna phone adicionada';
    ELSE
        RAISE NOTICE 'Coluna phone já existe';
    END IF;
END $$;

-- Adiciona coluna is_active se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_active boolean DEFAULT true;
        RAISE NOTICE 'Coluna is_active adicionada';
    ELSE
        RAISE NOTICE 'Coluna is_active já existe';
    END IF;
END $$;

-- Adiciona coluna avatar_url se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE profiles ADD COLUMN avatar_url text;
        RAISE NOTICE 'Coluna avatar_url adicionada';
    ELSE
        RAISE NOTICE 'Coluna avatar_url já existe';
    END IF;
END $$;

-- Verifica estrutura final
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;
