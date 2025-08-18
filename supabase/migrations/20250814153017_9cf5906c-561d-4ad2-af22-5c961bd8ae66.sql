-- Create the master admin user directly in the backend
-- This will be the "user zero" that creates other users through the interface

DO $$
DECLARE
    admin_user_id UUID := '550e8400-e29b-41d4-a716-446655440000'; -- Fixed UUID for admin
    org_id UUID;
BEGIN
    -- First, insert a record to simulate auth.users entry (this is just for profile reference)
    -- Note: In production, this user would be created through Supabase Auth
    
    -- Create organization first
    INSERT INTO public.organizations (
        id,
        name,
        slug,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        'Lander Records',
        'lander-records',
        now(),
        now()
    ) ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        updated_at = now()
    RETURNING id INTO org_id;

    -- If organization already exists, get its ID
    IF org_id IS NULL THEN
        SELECT id INTO org_id FROM public.organizations WHERE slug = 'lander-records';
    END IF;

    -- Temporarily disable RLS for profiles to allow direct insert
    ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
    
    -- Insert admin profile directly (bypassing auth.users constraint temporarily)
    INSERT INTO public.profiles (
        id, 
        full_name, 
        phone, 
        role_display, 
        roles,
        permissions,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        admin_user_id,
        'Deyvisson Lander Andrade',
        '(33)99917-9552',
        'Administrador (Master)',
        ARRAY['admin', 'master'],
        ARRAY['admin:all', 'users:create', 'users:edit', 'users:delete', 'system:admin'],
        true,
        now(),
        now()
    ) ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        role_display = EXCLUDED.role_display,
        roles = EXCLUDED.roles,
        permissions = EXCLUDED.permissions,
        is_active = EXCLUDED.is_active,
        updated_at = now();

    -- Re-enable RLS
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    -- Insert admin role in user_roles table
    INSERT INTO public.user_roles (
        user_id,
        role,
        created_at,
        updated_at
    ) VALUES (
        admin_user_id,
        'admin',
        now(),
        now()
    ) ON CONFLICT (user_id, role) DO NOTHING;

    -- Add user to organization as admin
    INSERT INTO public.org_members (
        user_id,
        org_id,
        role,
        created_at
    ) VALUES (
        admin_user_id,
        org_id,
        'admin',
        now()
    ) ON CONFLICT (user_id, org_id) DO UPDATE SET
        role = EXCLUDED.role;

    RAISE NOTICE 'Backend admin user created: Deyvisson Lander Andrade (ID: %)', admin_user_id;
END $$;