-- Create the admin user Deyvisson Lander Andrade
-- First, we need to generate a UUID for the user (simulating what would come from auth.users)
DO $$
DECLARE
    admin_user_id UUID := '550e8400-e29b-41d4-a716-446655440000'; -- Fixed UUID for consistency
    admin_org_id UUID;
BEGIN
    -- Insert into profiles table (simulating the user profile)
    INSERT INTO public.profiles (
        id, 
        full_name, 
        phone, 
        role_display, 
        is_active,
        created_at,
        updated_at
    ) VALUES (
        admin_user_id,
        'Deyvisson Lander Andrade',
        '(33)99917-9552',
        'Administrador (Master)',
        true,
        now(),
        now()
    ) ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        role_display = EXCLUDED.role_display,
        is_active = EXCLUDED.is_active,
        updated_at = now();

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

    -- Create or get organization
    INSERT INTO public.organizations (
        name,
        slug,
        created_at,
        updated_at
    ) VALUES (
        'Lander Records',
        'lander-records',
        now(),
        now()
    ) ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        updated_at = now()
    RETURNING id INTO admin_org_id;

    -- If organization already exists, get its ID
    IF admin_org_id IS NULL THEN
        SELECT id INTO admin_org_id FROM public.organizations WHERE slug = 'lander-records';
    END IF;

    -- Add user to organization as admin
    INSERT INTO public.org_members (
        user_id,
        org_id,
        role,
        created_at
    ) VALUES (
        admin_user_id,
        admin_org_id,
        'admin',
        now()
    ) ON CONFLICT (user_id, org_id) DO UPDATE SET
        role = EXCLUDED.role;

    RAISE NOTICE 'Admin user Deyvisson Lander Andrade created successfully with ID: %', admin_user_id;
END $$;