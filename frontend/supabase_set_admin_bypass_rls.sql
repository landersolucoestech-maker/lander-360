-- =====================================================
-- DEFINIR ADMINISTRADOR - BYPASS RLS
-- Execute no SQL Editor do Supabase
-- =====================================================

-- Primeiro, vamos verificar o ID do usuário
SELECT id, email FROM auth.users WHERE email = 'deyvisson.lander@gmail.com';

-- Agora execute este bloco com SECURITY DEFINER para bypass RLS
-- Substitua o UUID abaixo pelo ID retornado na query acima

-- PASSO 1: Desabilitar RLS temporariamente nas tabelas
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- PASSO 2: Inserir/Atualizar os dados
-- (Substitua 'SEU_USER_ID_AQUI' pelo UUID do usuário)

-- Se o profile não existir, cria
INSERT INTO profiles (id, email, full_name, roles, role_display, is_active)
SELECT 
    id,
    email,
    raw_user_meta_data->>'full_name',
    ARRAY['admin'],
    'Administrador',
    true
FROM auth.users 
WHERE email = 'deyvisson.lander@gmail.com'
ON CONFLICT (id) DO UPDATE SET
    roles = ARRAY['admin'],
    role_display = 'Administrador',
    is_active = true;

-- Adiciona role de admin
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users 
WHERE email = 'deyvisson.lander@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- PASSO 3: Reabilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- PASSO 4: Verificar resultado
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.roles,
    p.role_display,
    ur.role
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
WHERE p.email = 'deyvisson.lander@gmail.com';
