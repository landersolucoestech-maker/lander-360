-- Corrigir problema de schema na tabela auth.users
-- O erro indica que a coluna email_change está causando problemas

-- Atualizar o usuário existente com todas as colunas necessárias
UPDATE auth.users 
SET 
  email_change = '',
  email_change_token_current = '',
  email_change_confirm_status = 0,
  banned_until = NULL,
  deleted_at = NULL
WHERE id = '6efe296c-841a-4086-a5a4-b92b5ec0ca76';

-- Se o usuário não existir, criar com todas as colunas necessárias
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
  email_change_token_current,
  email_change,
  email_change_confirm_status,
  recovery_token,
  banned_until,
  deleted_at
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
  '',
  '',
  0,
  '',
  NULL,
  NULL
) ON CONFLICT (id) DO UPDATE SET
  encrypted_password = crypt('Admin@123456', gen_salt('bf')),
  email_confirmed_at = now(),
  updated_at = now(),
  email_change = '',
  email_change_token_current = '',
  email_change_confirm_status = 0;