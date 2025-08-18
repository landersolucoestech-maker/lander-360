-- Criar usuário administrador diretamente na tabela auth.users
-- Primeiro vamos usar a abordagem mais direta possível

-- Inserir o usuário na tabela auth.users (este é o usuário master)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  phone,
  phone_confirmed_at,
  is_super_admin
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '6efe296c-841a-4086-a5a4-b92b5ec0ca76',
  'authenticated',
  'authenticated',
  'deyvisson.lander@gmail.com',
  crypt('Admin@123456', gen_salt('bf')), -- Hash da senha Admin@123456
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"email_verified": true, "full_name": "Deyvisson Lander Andrade", "phone": "(33)99917-9552"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  '',
  '(33)99917-9552',
  NOW(),
  false
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  phone = EXCLUDED.phone,
  phone_confirmed_at = EXCLUDED.phone_confirmed_at,
  updated_at = NOW();

-- Criar o perfil através do trigger ou manualmente
INSERT INTO public.profiles (
  id,
  full_name,
  phone,
  role_display,
  is_active,
  roles,
  permissions,
  created_at,
  updated_at
) VALUES (
  '6efe296c-841a-4086-a5a4-b92b5ec0ca76',
  'Deyvisson Lander Andrade',
  '(33)99917-9552',
  'Administrador (Master)',
  true,
  ARRAY['admin']::text[],
  ARRAY['all']::text[],
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role_display = EXCLUDED.role_display,
  is_active = EXCLUDED.is_active,
  roles = EXCLUDED.roles,
  permissions = EXCLUDED.permissions,
  updated_at = NOW();

-- Atribuir role de admin ao usuário
INSERT INTO public.user_roles (
  user_id,
  role,
  created_at,
  updated_at
) VALUES (
  '6efe296c-841a-4086-a5a4-b92b5ec0ca76',
  'admin',
  NOW(),
  NOW()
) ON CONFLICT (user_id, role) DO NOTHING;

-- Criar organização se não existir
INSERT INTO public.organizations (
  id,
  name,
  slug,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Lander Soluções',
  'lander-solucoes',
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Adicionar usuário à organização como admin
INSERT INTO public.org_members (
  user_id,
  org_id,
  role,
  created_at
) SELECT 
  '6efe296c-841a-4086-a5a4-b92b5ec0ca76',
  o.id,
  'admin',
  NOW()
FROM public.organizations o 
WHERE o.slug = 'lander-solucoes'
ON CONFLICT (user_id, org_id) DO UPDATE SET
  role = EXCLUDED.role;