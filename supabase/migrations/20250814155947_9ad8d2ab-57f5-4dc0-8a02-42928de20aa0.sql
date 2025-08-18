-- Criar usuário administrador diretamente no banco
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '6efe296c-841a-4086-a5a4-b92b5ec0ca76',
  'authenticated',
  'authenticated',
  'deyvisson.lander@gmail.com',
  '$2a$10$7A8Dg4YQfD/lO1Cq8KCqY.Lv8vKHCODZFEyqq1H9EkqRlGUwZKkx.', -- Senha: Admin@123456
  NOW(),
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  NULL,
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"email_verified": true, "full_name": "Deyvisson Lander Andrade", "phone": "(33)99917-9552"}',
  false,
  NOW(),
  NOW(),
  '(33)99917-9552',
  NOW(),
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL,
  false,
  NULL
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  phone = EXCLUDED.phone,
  phone_confirmed_at = EXCLUDED.phone_confirmed_at,
  updated_at = NOW();

-- Criar perfil do usuário administrador
INSERT INTO public.profiles (
  id,
  full_name,
  phone,
  role_display,
  is_active,
  created_at,
  updated_at
) VALUES (
  '6efe296c-841a-4086-a5a4-b92b5ec0ca76',
  'Deyvisson Lander Andrade',
  '(33)99917-9552',
  'Administrador (Master)',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role_display = EXCLUDED.role_display,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Atribuir role de admin ao usuário
INSERT INTO public.user_roles (
  user_id,
  role
) VALUES (
  '6efe296c-841a-4086-a5a4-b92b5ec0ca76',
  'admin'
) ON CONFLICT (user_id, role) DO NOTHING;

-- Criar organização
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
  created_at,
  updated_at
) SELECT 
  '6efe296c-841a-4086-a5a4-b92b5ec0ca76',
  o.id,
  'admin',
  NOW(),
  NOW()
FROM public.organizations o 
WHERE o.slug = 'lander-solucoes'
ON CONFLICT (user_id, org_id) DO UPDATE SET
  role = EXCLUDED.role,
  updated_at = NOW();