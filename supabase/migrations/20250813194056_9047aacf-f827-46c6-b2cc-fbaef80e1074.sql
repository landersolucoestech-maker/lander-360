-- Criar tabela de artistas
CREATE TABLE public.artists (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    genre TEXT,
    email TEXT,
    phone TEXT,
    birth_date DATE,
    country TEXT,
    city TEXT,
    bio TEXT,
    social_media JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de projetos
CREATE TABLE public.projects (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'planning',
    start_date DATE,
    end_date DATE,
    budget DECIMAL(10,2),
    artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de contratos
CREATE TABLE public.contracts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
    contract_type TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    value DECIMAL(12,2),
    commission_percentage DECIMAL(5,2),
    status TEXT DEFAULT 'draft',
    terms TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de lançamentos
CREATE TABLE public.releases (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
    release_type TEXT NOT NULL,
    release_date DATE,
    status TEXT DEFAULT 'planning',
    platforms TEXT[],
    budget DECIMAL(10,2),
    description TEXT,
    cover_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de transações financeiras
CREATE TABLE public.financial_transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    transaction_type TEXT NOT NULL, -- 'income' ou 'expense'
    category TEXT,
    artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
    contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de registro de músicas
CREATE TABLE public.music_registrations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
    composer TEXT NOT NULL,
    genre TEXT,
    duration INTEGER, -- em segundos
    registration_number TEXT,
    status TEXT DEFAULT 'pending',
    registration_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_registrations ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para artists
CREATE POLICY "Users can view their own artists" ON public.artists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own artists" ON public.artists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own artists" ON public.artists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own artists" ON public.artists FOR DELETE USING (auth.uid() = user_id);

-- Criar políticas RLS para projects
CREATE POLICY "Users can view their own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- Criar políticas RLS para contracts
CREATE POLICY "Users can view their own contracts" ON public.contracts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own contracts" ON public.contracts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own contracts" ON public.contracts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own contracts" ON public.contracts FOR DELETE USING (auth.uid() = user_id);

-- Criar políticas RLS para releases
CREATE POLICY "Users can view their own releases" ON public.releases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own releases" ON public.releases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own releases" ON public.releases FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own releases" ON public.releases FOR DELETE USING (auth.uid() = user_id);

-- Criar políticas RLS para financial_transactions
CREATE POLICY "Users can view their own transactions" ON public.financial_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own transactions" ON public.financial_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON public.financial_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON public.financial_transactions FOR DELETE USING (auth.uid() = user_id);

-- Criar políticas RLS para music_registrations
CREATE POLICY "Users can view their own music registrations" ON public.music_registrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own music registrations" ON public.music_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own music registrations" ON public.music_registrations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own music registrations" ON public.music_registrations FOR DELETE USING (auth.uid() = user_id);

-- Criar triggers para updated_at
CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON public.artists FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
CREATE TRIGGER update_releases_updated_at BEFORE UPDATE ON public.releases FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE ON public.financial_transactions FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();
CREATE TRIGGER update_music_registrations_updated_at BEFORE UPDATE ON public.music_registrations FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();