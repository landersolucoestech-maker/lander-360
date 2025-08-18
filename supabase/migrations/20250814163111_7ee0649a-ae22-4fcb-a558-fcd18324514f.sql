-- Criar usuário administrador diretamente no banco
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token,
  email_change_token_new,
  recovery_token
) VALUES (
  '6efe296c-841a-4086-a5a4-b92b5ec0ca76',
  '00000000-0000-0000-0000-000000000000',
  'deyvisson.lander@gmail.com',
  crypt('Admin@123456', gen_salt('bf')),
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated',
  '',
  '',
  ''
) ON CONFLICT (id) DO UPDATE SET
  encrypted_password = crypt('Admin@123456', gen_salt('bf')),
  email_confirmed_at = now(),
  updated_at = now();

-- Criar perfil do usuário
INSERT INTO public.profiles (
  id,
  full_name,
  phone,
  role_display,
  is_active
) VALUES (
  '6efe296c-841a-4086-a5a4-b92b5ec0ca76',
  'Deyvisson Lander Andrade',
  '(33)99917-9552',
  'Administrador (Master)',
  true
) ON CONFLICT (id) DO UPDATE SET
  full_name = 'Deyvisson Lander Andrade',
  phone = '(33)99917-9552',
  role_display = 'Administrador (Master)',
  is_active = true;

-- Atribuir role de admin
INSERT INTO public.user_roles (
  user_id,
  role
) VALUES (
  '6efe296c-841a-4086-a5a4-b92b5ec0ca76',
  'admin'
) ON CONFLICT (user_id, role) DO NOTHING;