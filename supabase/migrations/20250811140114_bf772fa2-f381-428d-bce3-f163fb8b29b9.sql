-- Create inventory table
CREATE TABLE public.inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sector TEXT NOT NULL,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  location TEXT NOT NULL,
  responsible_person TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  purchase_location TEXT,
  invoice_number TEXT,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  unit_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_value NUMERIC(10,2) GENERATED ALWAYS AS (quantity * unit_value) STORED,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Create policies for inventory
CREATE POLICY "Authenticated users can view inventory" 
ON public.inventory 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create inventory items" 
ON public.inventory 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update inventory items" 
ON public.inventory 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete inventory items" 
ON public.inventory 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Update invoices table for complete NF-e support
ALTER TABLE public.invoices 
ADD COLUMN nfe_series TEXT,
ADD COLUMN nfe_model TEXT DEFAULT '55',
ADD COLUMN nfe_access_key TEXT,
ADD COLUMN cfop TEXT,
ADD COLUMN nature_of_operation TEXT,
ADD COLUMN emission_type TEXT DEFAULT 'normal',
ADD COLUMN operation_type TEXT DEFAULT 'saida',
ADD COLUMN payment_method TEXT,
ADD COLUMN payment_condition TEXT,
ADD COLUMN emitter_cnpj TEXT,
ADD COLUMN emitter_name TEXT,
ADD COLUMN emitter_fantasy_name TEXT,
ADD COLUMN emitter_ie TEXT,
ADD COLUMN emitter_address JSONB,
ADD COLUMN items JSONB,
ADD COLUMN icms_base NUMERIC(10,2) DEFAULT 0,
ADD COLUMN icms_value NUMERIC(10,2) DEFAULT 0,
ADD COLUMN icms_rate NUMERIC(5,2) DEFAULT 0,
ADD COLUMN ipi_base NUMERIC(10,2) DEFAULT 0,
ADD COLUMN ipi_value NUMERIC(10,2) DEFAULT 0,
ADD COLUMN ipi_rate NUMERIC(5,2) DEFAULT 0,
ADD COLUMN pis_base NUMERIC(10,2) DEFAULT 0,
ADD COLUMN pis_value NUMERIC(10,2) DEFAULT 0,
ADD COLUMN pis_rate NUMERIC(5,2) DEFAULT 0,
ADD COLUMN cofins_base NUMERIC(10,2) DEFAULT 0,
ADD COLUMN cofins_value NUMERIC(10,2) DEFAULT 0,
ADD COLUMN cofins_rate NUMERIC(5,2) DEFAULT 0,
ADD COLUMN products_total NUMERIC(10,2) DEFAULT 0,
ADD COLUMN services_total NUMERIC(10,2) DEFAULT 0,
ADD COLUMN discount_total NUMERIC(10,2) DEFAULT 0,
ADD COLUMN freight_total NUMERIC(10,2) DEFAULT 0,
ADD COLUMN insurance_total NUMERIC(10,2) DEFAULT 0,
ADD COLUMN other_expenses NUMERIC(10,2) DEFAULT 0,
ADD COLUMN additional_info TEXT,
ADD COLUMN observations_nfe TEXT,
ADD COLUMN authorization_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN authorization_protocol TEXT,
ADD COLUMN qr_code TEXT,
ADD COLUMN xml_file_url TEXT,
ADD COLUMN pdf_file_url TEXT;