-- Create admin user directly in auth.users and setup profile
DO $$
DECLARE
    new_user_id UUID;
BEGIN
    -- Generate UUID for the user
    new_user_id := gen_random_uuid();
    
    -- Insert into auth.users (simulating user creation)
    -- Note: In production, this would be done through Supabase Auth API
    -- But we'll create the profile and role directly
    
    -- Insert into profiles table
    INSERT INTO public.profiles (id, full_name, phone, role_display, is_active)
    VALUES (
        new_user_id, 
        'Deyvisson Lander Andrade', 
        '(33)99917-9552', 
        'Administrador (Master)',
        true
    );
    
    -- Assign admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new_user_id, 'admin');
    
    -- Create organization for the admin
    INSERT INTO public.organizations (id, name, slug)
    VALUES (gen_random_uuid(), 'Lander Soluções', 'lander-solucoes');
    
    -- Add admin to organization
    INSERT INTO public.org_members (user_id, org_id, role)
    SELECT new_user_id, id, 'admin'::user_role
    FROM public.organizations 
    WHERE slug = 'lander-solucoes';
    
    -- Output the user ID for reference
    RAISE NOTICE 'Admin user created with ID: %', new_user_id;
    RAISE NOTICE 'Email: deyvisson.lander@gmail.com';
    RAISE NOTICE 'Please create this user through Supabase Auth Dashboard and use this ID: %', new_user_id;
END $$;

-- Create a function to finalize user setup after auth creation
CREATE OR REPLACE FUNCTION public.setup_admin_user(auth_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    profile_exists BOOLEAN;
    org_id UUID;
BEGIN
    -- Check if profile already exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = auth_user_id) INTO profile_exists;
    
    IF NOT profile_exists THEN
        -- Insert profile
        INSERT INTO public.profiles (id, full_name, phone, role_display, is_active)
        VALUES (
            auth_user_id, 
            'Deyvisson Lander Andrade', 
            '(33)99917-9552', 
            'Administrador (Master)',
            true
        );
        
        -- Assign admin role
        INSERT INTO public.user_roles (user_id, role)
        VALUES (auth_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        -- Get or create organization
        SELECT id INTO org_id FROM public.organizations WHERE slug = 'lander-solucoes';
        
        IF org_id IS NULL THEN
            INSERT INTO public.organizations (name, slug) 
            VALUES ('Lander Soluções', 'lander-solucoes')
            RETURNING id INTO org_id;
        END IF;
        
        -- Add admin to organization
        INSERT INTO public.org_members (user_id, org_id, role)
        VALUES (auth_user_id, org_id, 'admin'::user_role)
        ON CONFLICT DO NOTHING;
        
        RETURN 'Admin user setup completed successfully';
    ELSE
        RETURN 'Profile already exists for this user';
    END IF;
END;
$$;