-- =====================================================
-- CORRIGIR POLÍTICAS RLS DA TABELA PROFILES
-- Execute no SQL Editor do Supabase
-- =====================================================

-- 1. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

-- 2. Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas corretas

-- Política para SELECT: usuário pode ver seu próprio perfil
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Política para INSERT: usuário pode criar seu próprio perfil
CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Política para UPDATE: usuário pode atualizar seu próprio perfil
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. Também corrigir user_roles
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Users can insert own roles" ON user_roles;

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Política para SELECT em user_roles
CREATE POLICY "Users can view own roles" 
ON user_roles FOR SELECT 
USING (auth.uid() = user_id);

-- 5. Verificar se as políticas foram criadas
SELECT tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('profiles', 'user_roles');
