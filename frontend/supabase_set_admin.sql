-- =====================================================
-- DEFINIR ADMINISTRADOR DO SISTEMA
-- Execute no SQL Editor do Supabase
-- =====================================================

-- 1. Encontra o ID do usuário pelo email
DO $$
DECLARE
    v_user_id uuid;
BEGIN
    -- Busca o ID do usuário na tabela auth.users
    SELECT id INTO v_user_id 
    FROM auth.users 
    WHERE email = 'deyvisson.lander@gmail.com';
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário com email deyvisson.lander@gmail.com não encontrado';
    END IF;
    
    RAISE NOTICE 'Usuário encontrado: %', v_user_id;
    
    -- 2. Atualiza a tabela profiles com role de admin
    UPDATE profiles 
    SET 
        roles = ARRAY['admin'],
        role_display = 'Administrador',
        is_active = true
    WHERE id = v_user_id;
    
    RAISE NOTICE 'Profile atualizado com role admin';
    
    -- 3. Insere na tabela user_roles (se não existir)
    INSERT INTO user_roles (user_id, role)
    VALUES (v_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Role admin adicionada na tabela user_roles';
    
END $$;

-- Verifica se foi configurado corretamente
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.roles,
    p.role_display,
    p.is_active,
    ur.role as user_role
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
WHERE p.email = 'deyvisson.lander@gmail.com';
