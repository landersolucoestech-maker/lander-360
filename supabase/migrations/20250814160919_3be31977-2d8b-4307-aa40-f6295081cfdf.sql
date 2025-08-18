-- Primeiro, vamos remover o trigger problemático
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Corrigir definitivamente a função handle_new_user()
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    INSERT INTO public.profiles (
        id, 
        full_name, 
        phone,
        sector,
        roles,
        permissions,
        role_display,
        is_active
    )
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Novo Usuário'),
        COALESCE(NEW.raw_user_meta_data ->> 'phone', null),
        COALESCE(NEW.raw_user_meta_data ->> 'sector', null),
        CASE 
            WHEN NEW.raw_user_meta_data ->> 'roles' IS NOT NULL 
            THEN string_to_array(NEW.raw_user_meta_data ->> 'roles', ',')
            ELSE ARRAY['member']::text[]
        END,
        CASE 
            WHEN NEW.raw_user_meta_data ->> 'permissions' IS NOT NULL 
            THEN string_to_array(NEW.raw_user_meta_data ->> 'permissions', ',')
            ELSE ARRAY[]::text[]
        END,
        COALESCE(NEW.raw_user_meta_data ->> 'role_display', 'Membro'),
        COALESCE((NEW.raw_user_meta_data ->> 'is_active')::boolean, true)
    );
    RETURN NEW;
END;
$function$;

-- Recriar o trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Agora inserir o usuário admin diretamente
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
) ON CONFLICT (email) DO UPDATE SET
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  updated_at = NOW();

-- Atualizar o perfil manualmente caso o trigger não tenha funcionado adequadamente
UPDATE public.profiles SET
  full_name = 'Deyvisson Lander Andrade',
  phone = '(33)99917-9552',
  role_display = 'Administrador (Master)',
  is_active = true,
  roles = ARRAY['admin']::text[],
  permissions = ARRAY['all']::text[]
WHERE id = '6efe296c-841a-4086-a5a4-b92b5ec0ca76';

-- Atribuir role de admin
INSERT INTO public.user_roles (user_id, role) 
VALUES ('6efe296c-841a-4086-a5a4-b92b5ec0ca76', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Criar organização
INSERT INTO public.organizations (name, slug) 
VALUES ('Lander Soluções', 'lander-solucoes')
ON CONFLICT (slug) DO NOTHING;

-- Adicionar à organização
INSERT INTO public.org_members (user_id, org_id, role)
SELECT '6efe296c-841a-4086-a5a4-b92b5ec0ca76', o.id, 'admin'
FROM public.organizations o 
WHERE o.slug = 'lander-solucoes'
ON CONFLICT (user_id, org_id) DO NOTHING;