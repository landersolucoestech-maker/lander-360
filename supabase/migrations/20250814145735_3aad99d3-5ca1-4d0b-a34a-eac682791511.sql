-- Update profiles table to support full user management
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS sector text,
ADD COLUMN IF NOT EXISTS permissions text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS roles text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_login timestamp with time zone;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_roles ON public.profiles USING GIN(roles);
CREATE INDEX IF NOT EXISTS idx_profiles_permissions ON public.profiles USING GIN(permissions);

-- Update trigger function to handle new user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        full_name, 
        phone,
        sector,
        roles,
        permissions,
        role_display
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
                ELSE ARRAY['member']
            END, 
            ARRAY['member']
        ),
        COALESCE(
            CASE 
                WHEN NEW.raw_user_meta_data ->> 'permissions' IS NOT NULL 
                THEN string_to_array(NEW.raw_user_meta_data ->> 'permissions', ',')
                ELSE ARRAY[]
            END, 
            ARRAY[]
        ),
        COALESCE(NEW.raw_user_meta_data ->> 'role_display', 'Membro')
    );
    RETURN NEW;
END;
$$;

-- Update RLS policies to allow broader access for user management
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create more flexible policies for user management
CREATE POLICY "Users can view profiles" ON public.profiles
FOR SELECT
USING (
    auth.uid() = id OR 
    is_user_admin(auth.uid()) OR
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
);

CREATE POLICY "Users can update their own profile or admins can update any" ON public.profiles
FOR UPDATE
USING (
    auth.uid() = id OR 
    is_user_admin(auth.uid()) OR
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Users can insert their own profile or admin signup" ON public.profiles
FOR INSERT
WITH CHECK (
    auth.uid() = id OR 
    is_user_admin(auth.uid()) OR
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);