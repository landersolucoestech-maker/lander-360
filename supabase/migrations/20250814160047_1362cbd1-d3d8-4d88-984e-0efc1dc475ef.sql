-- Corrigir o trigger handle_new_user() para resolver problema dos arrays
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
        COALESCE(
            CASE 
                WHEN NEW.raw_user_meta_data ->> 'roles' IS NOT NULL 
                THEN string_to_array(NEW.raw_user_meta_data ->> 'roles', ',')
                ELSE ARRAY['member']::text[]
            END, 
            ARRAY['member']::text[]
        ),
        COALESCE(
            CASE 
                WHEN NEW.raw_user_meta_data ->> 'permissions' IS NOT NULL 
                THEN string_to_array(NEW.raw_user_meta_data ->> 'permissions', ',')
                ELSE ARRAY[]::text[]
            END, 
            ARRAY[]::text[]
        ),
        COALESCE(NEW.raw_user_meta_data ->> 'role_display', 'Membro'),
        COALESCE((NEW.raw_user_meta_data ->> 'is_active')::boolean, true)
    );
    RETURN NEW;
END;
$function$;

-- Agora criar o usuário administrador usando abordagem mais simples
-- Primeiro vamos deletar possíveis registros existentes para evitar conflitos
DELETE FROM public.org_members WHERE user_id = '6efe296c-841a-4086-a5a4-b92b5ec0ca76';
DELETE FROM public.user_roles WHERE user_id = '6efe296c-841a-4086-a5a4-b92b5ec0ca76';
DELETE FROM public.profiles WHERE id = '6efe296c-841a-4086-a5a4-b92b5ec0ca76';

-- Criar usuário administrador usando a função admin
DO $$
DECLARE
  admin_user_id UUID := '6efe296c-841a-4086-a5a4-b92b5ec0ca76';
  org_uuid UUID;
BEGIN
  -- Inserir o usuário diretamente na tabela profiles
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
    admin_user_id,
    'Deyvisson Lander Andrade',
    '(33)99917-9552',
    'Administrador (Master)',
    true,
    ARRAY['admin']::text[],
    ARRAY['all']::text[],
    NOW(),
    NOW()
  );

  -- Atribuir role de admin ao usuário
  INSERT INTO public.user_roles (
    user_id,
    role,
    created_at,
    updated_at
  ) VALUES (
    admin_user_id,
    'admin',
    NOW(),
    NOW()
  );

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

  -- Obter o ID da organização
  SELECT id INTO org_uuid FROM public.organizations WHERE slug = 'lander-solucoes';

  -- Adicionar usuário à organização como admin
  INSERT INTO public.org_members (
    user_id,
    org_id,
    role,
    created_at
  ) VALUES (
    admin_user_id,
    org_uuid,
    'admin',
    NOW()
  );

END $$;