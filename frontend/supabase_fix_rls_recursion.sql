-- =====================================================
-- CORREÇÃO DE POLÍTICAS RLS COM RECURSÃO INFINITA
-- Execute no SQL Editor do Supabase
-- =====================================================

-- 1. REMOVER TODAS AS POLÍTICAS PROBLEMÁTICAS DA TABELA user_artists
DROP POLICY IF EXISTS "Users can view user_artists" ON user_artists;
DROP POLICY IF EXISTS "Users can view own user_artists" ON user_artists;
DROP POLICY IF EXISTS "Users can insert user_artists" ON user_artists;
DROP POLICY IF EXISTS "Users can update user_artists" ON user_artists;
DROP POLICY IF EXISTS "Users can delete user_artists" ON user_artists;
DROP POLICY IF EXISTS "Enable read access" ON user_artists;
DROP POLICY IF EXISTS "Enable insert access" ON user_artists;
DROP POLICY IF EXISTS "Enable update access" ON user_artists;
DROP POLICY IF EXISTS "Enable delete access" ON user_artists;

-- 2. REMOVER POLÍTICAS DE OUTRAS TABELAS QUE PODEM ESTAR CAUSANDO RECURSÃO
DROP POLICY IF EXISTS "Users can view artists" ON artists;
DROP POLICY IF EXISTS "Users can insert artists" ON artists;
DROP POLICY IF EXISTS "Users can update artists" ON artists;
DROP POLICY IF EXISTS "Users can delete artists" ON artists;
DROP POLICY IF EXISTS "Enable read access" ON artists;

DROP POLICY IF EXISTS "Users can view contracts" ON contracts;
DROP POLICY IF EXISTS "Enable read access" ON contracts;

DROP POLICY IF EXISTS "Users can view releases" ON releases;
DROP POLICY IF EXISTS "Enable read access" ON releases;

DROP POLICY IF EXISTS "Users can view music_registry" ON music_registry;
DROP POLICY IF EXISTS "Enable read access" ON music_registry;

DROP POLICY IF EXISTS "Users can view phonograms" ON phonograms;
DROP POLICY IF EXISTS "Enable read access" ON phonograms;

-- 3. DESABILITAR RLS TEMPORARIAMENTE NAS TABELAS PROBLEMÁTICAS
ALTER TABLE user_artists DISABLE ROW LEVEL SECURITY;
ALTER TABLE artists DISABLE ROW LEVEL SECURITY;
ALTER TABLE contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE releases DISABLE ROW LEVEL SECURITY;
ALTER TABLE music_registry DISABLE ROW LEVEL SECURITY;
ALTER TABLE phonograms DISABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICAS SIMPLES (SEM RECURSÃO)

-- user_artists - políticas simples
ALTER TABLE user_artists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read user_artists" 
ON user_artists FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated insert user_artists" 
ON user_artists FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow authenticated update user_artists" 
ON user_artists FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated delete user_artists" 
ON user_artists FOR DELETE 
TO authenticated 
USING (true);

-- artists - políticas simples
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read artists" 
ON artists FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated insert artists" 
ON artists FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow authenticated update artists" 
ON artists FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated delete artists" 
ON artists FOR DELETE 
TO authenticated 
USING (true);

-- contracts - políticas simples
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read contracts" 
ON contracts FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated insert contracts" 
ON contracts FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow authenticated update contracts" 
ON contracts FOR UPDATE 
TO authenticated 
USING (true);

-- releases - políticas simples
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read releases" 
ON releases FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated insert releases" 
ON releases FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow authenticated update releases" 
ON releases FOR UPDATE 
TO authenticated 
USING (true);

-- music_registry - políticas simples
ALTER TABLE music_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read music_registry" 
ON music_registry FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated insert music_registry" 
ON music_registry FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow authenticated update music_registry" 
ON music_registry FOR UPDATE 
TO authenticated 
USING (true);

-- phonograms - políticas simples
ALTER TABLE phonograms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read phonograms" 
ON phonograms FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated insert phonograms" 
ON phonograms FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow authenticated update phonograms" 
ON phonograms FOR UPDATE 
TO authenticated 
USING (true);

-- 5. VERIFICAR POLÍTICAS CRIADAS
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('user_artists', 'artists', 'contracts', 'releases', 'music_registry', 'phonograms')
ORDER BY tablename, cmd;
