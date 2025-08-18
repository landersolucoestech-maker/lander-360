-- Verificar se a tabela profiles já existe e criar se necessário
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        -- Criar tabela profiles para dados adicionais dos usuários
        CREATE TABLE public.profiles (
            id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            full_name TEXT,
            phone TEXT,
            avatar_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            PRIMARY KEY (id)
        );

        -- Habilitar RLS
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

        -- Criar políticas RLS
        CREATE POLICY "Users can view their own profile" 
        ON public.profiles 
        FOR SELECT 
        USING (auth.uid() = id);

        CREATE POLICY "Users can update their own profile" 
        ON public.profiles 
        FOR UPDATE 
        USING (auth.uid() = id);

        CREATE POLICY "Users can insert their own profile" 
        ON public.profiles 
        FOR INSERT 
        WITH CHECK (auth.uid() = id);

        -- Criar trigger para atualizar updated_at
        CREATE TRIGGER update_profiles_updated_at
        BEFORE UPDATE ON public.profiles
        FOR EACH ROW
        EXECUTE FUNCTION public.set_timestamp();

        -- Criar função para criar perfil automaticamente quando um usuário é criado
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER
        LANGUAGE plpgsql
        SECURITY DEFINER SET search_path = ''
        AS $$
        BEGIN
            INSERT INTO public.profiles (id, full_name)
            VALUES (
                NEW.id, 
                COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
            );
            RETURN NEW;
        END;
        $$;

        -- Criar trigger para executar a função quando um usuário é criado
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;