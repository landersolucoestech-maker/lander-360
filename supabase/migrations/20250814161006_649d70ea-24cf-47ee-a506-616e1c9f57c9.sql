-- Inserir o usuário admin diretamente sem conflitos
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
) 
SELECT 
  '00000000-0000-0000-0000-000000000000',
  '6efe296c-841a-4086-a5a4-b92b5ec0ca76',
  'authenticated',
  'authenticated',
  'deyvisson.lander@gmail.com',
  crypt('Admin@123456', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"email_verified": true, "full_name": "Deyvisson Lander Andrade", "phone": "(33)99917-9552", "role_display": "Administrador (Master)", "roles": "admin", "permissions": "all"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  '',
  '(33)99917-9552',
  NOW(),
  false
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'deyvisson.lander@gmail.com'
);

-- Atualizar perfil se já existir o usuário
UPDATE public.profiles SET
  full_name = 'Deyvisson Lander Andrade',
  phone = '(33)99917-9552',
  role_display = 'Administrador (Master)',
  is_active = true,
  roles = ARRAY['admin']::text[],
  permissions = ARRAY['all']::text[]
WHERE id = '6efe296c-841a-4086-a5a4-b92b5ec0ca76';

-- Inserir role de admin
INSERT INTO public.user_roles (user_id, role) 
SELECT '6efe296c-841a-4086-a5a4-b92b5ec0ca76', 'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = '6efe296c-841a-4086-a5a4-b92b5ec0ca76' AND role = 'admin'
);

-- Criar organização
INSERT INTO public.organizations (name, slug) 
SELECT 'Lander Soluções', 'lander-solucoes'
WHERE NOT EXISTS (
  SELECT 1 FROM public.organizations WHERE slug = 'lander-solucoes'
);

-- Adicionar à organização
INSERT INTO public.org_members (user_id, org_id, role)
SELECT '6efe296c-841a-4086-a5a4-b92b5ec0ca76', o.id, 'admin'
FROM public.organizations o 
WHERE o.slug = 'lander-solucoes'
AND NOT EXISTS (
  SELECT 1 FROM public.org_members 
  WHERE user_id = '6efe296c-841a-4086-a5a4-b92b5ec0ca76' 
  AND org_id = o.id
);