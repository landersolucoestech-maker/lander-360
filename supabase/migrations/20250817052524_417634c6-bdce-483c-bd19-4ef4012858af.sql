-- Create inventory table for equipment and assets management
CREATE TABLE public.inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  sector TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  location TEXT NOT NULL,
  responsible TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Disponível',
  purchase_location TEXT,
  invoice_number TEXT,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  unit_value NUMERIC(10,2),
  total_value NUMERIC(10,2) GENERATED ALWAYS AS (quantity * unit_value) STORED,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agenda events table
CREATE TABLE public.agenda_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  attendees TEXT[],
  artist_id UUID,
  project_id UUID,
  status TEXT NOT NULL DEFAULT 'Agendado',
  priority TEXT NOT NULL DEFAULT 'Média',
  created_by_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create CRM contacts table (enhanced from existing contributors)
CREATE TABLE public.crm_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  contact_type TEXT NOT NULL, -- contratante, colaborador, parceiro, fornecedor, investidor, influenciador
  status TEXT NOT NULL DEFAULT 'Ativo',
  priority TEXT NOT NULL DEFAULT 'Média',
  company TEXT, -- empresa/cliente
  position TEXT, -- cargo
  next_action TEXT,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create financial transactions table
CREATE TABLE public.financial_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  transaction_type TEXT NOT NULL, -- receita, despesa, investimento, pagamento
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'Pendente',
  payment_method TEXT,
  reference_number TEXT,
  artist_id UUID,
  project_id UUID,
  contact_id UUID,
  attachments TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create music registry table (enhanced from existing tracks/compositions)
CREATE TABLE public.music_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  title TEXT NOT NULL,
  artist_id UUID,
  composers TEXT[],
  lyricists TEXT[],
  producers TEXT[],
  genre TEXT,
  duration_seconds INTEGER,
  recording_date DATE,
  studio TEXT,
  isrc TEXT UNIQUE,
  iswc TEXT,
  publishing_percentage NUMERIC(5,2),
  master_rights_owner TEXT,
  copyright_year INTEGER,
  registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'Registrado',
  file_path TEXT,
  lyrics TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_registry ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for inventory
CREATE POLICY "inventory_select" ON public.inventory FOR SELECT USING (is_org_member(org_id));
CREATE POLICY "inventory_insert" ON public.inventory FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY "inventory_update" ON public.inventory FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY "inventory_delete" ON public.inventory FOR DELETE USING (is_org_member(org_id));

-- Create RLS policies for agenda_events
CREATE POLICY "agenda_events_select" ON public.agenda_events FOR SELECT USING (is_org_member(org_id));
CREATE POLICY "agenda_events_insert" ON public.agenda_events FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY "agenda_events_update" ON public.agenda_events FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY "agenda_events_delete" ON public.agenda_events FOR DELETE USING (is_org_member(org_id));

-- Create RLS policies for crm_contacts
CREATE POLICY "crm_contacts_select" ON public.crm_contacts FOR SELECT USING (is_org_member(org_id));
CREATE POLICY "crm_contacts_insert" ON public.crm_contacts FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY "crm_contacts_update" ON public.crm_contacts FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY "crm_contacts_delete" ON public.crm_contacts FOR DELETE USING (is_org_member(org_id));

-- Create RLS policies for financial_transactions
CREATE POLICY "financial_transactions_select" ON public.financial_transactions FOR SELECT USING (is_org_member(org_id));
CREATE POLICY "financial_transactions_insert" ON public.financial_transactions FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY "financial_transactions_update" ON public.financial_transactions FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY "financial_transactions_delete" ON public.financial_transactions FOR DELETE USING (is_org_member(org_id));

-- Create RLS policies for music_registry
CREATE POLICY "music_registry_select" ON public.music_registry FOR SELECT USING (is_org_member(org_id));
CREATE POLICY "music_registry_insert" ON public.music_registry FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY "music_registry_update" ON public.music_registry FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY "music_registry_delete" ON public.music_registry FOR DELETE USING (is_org_member(org_id));

-- Create triggers for updated_at
CREATE TRIGGER update_inventory_updated_at
    BEFORE UPDATE ON public.inventory
    FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();

CREATE TRIGGER update_agenda_events_updated_at
    BEFORE UPDATE ON public.agenda_events
    FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();

CREATE TRIGGER update_crm_contacts_updated_at
    BEFORE UPDATE ON public.crm_contacts
    FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();

CREATE TRIGGER update_financial_transactions_updated_at
    BEFORE UPDATE ON public.financial_transactions
    FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();

CREATE TRIGGER update_music_registry_updated_at
    BEFORE UPDATE ON public.music_registry
    FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();