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
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS 
  nfe_series TEXT,
  nfe_model TEXT DEFAULT '55',
  nfe_access_key TEXT,
  cfop TEXT,
  nature_of_operation TEXT,
  emission_type TEXT DEFAULT 'normal',
  operation_type TEXT DEFAULT 'saida',
  payment_method TEXT,
  payment_condition TEXT,
  
  -- Emitter information
  emitter_cnpj TEXT,
  emitter_name TEXT,
  emitter_fantasy_name TEXT,
  emitter_ie TEXT,
  emitter_address JSONB,
  
  -- Recipient information (already exists as recipient_info)
  
  -- Product/Service details
  items JSONB,
  
  -- Tax information
  icms_base NUMERIC(10,2) DEFAULT 0,
  icms_value NUMERIC(10,2) DEFAULT 0,
  icms_rate NUMERIC(5,2) DEFAULT 0,
  ipi_base NUMERIC(10,2) DEFAULT 0,
  ipi_value NUMERIC(10,2) DEFAULT 0,
  ipi_rate NUMERIC(5,2) DEFAULT 0,
  pis_base NUMERIC(10,2) DEFAULT 0,
  pis_value NUMERIC(10,2) DEFAULT 0,
  pis_rate NUMERIC(5,2) DEFAULT 0,
  cofins_base NUMERIC(10,2) DEFAULT 0,
  cofins_value NUMERIC(10,2) DEFAULT 0,
  cofins_rate NUMERIC(5,2) DEFAULT 0,
  
  -- Totals
  products_total NUMERIC(10,2) DEFAULT 0,
  services_total NUMERIC(10,2) DEFAULT 0,
  discount_total NUMERIC(10,2) DEFAULT 0,
  freight_total NUMERIC(10,2) DEFAULT 0,
  insurance_total NUMERIC(10,2) DEFAULT 0,
  other_expenses NUMERIC(10,2) DEFAULT 0,
  
  -- Additional information
  additional_info TEXT,
  observations_nfe TEXT,
  
  -- Control fields
  authorization_date TIMESTAMP WITH TIME ZONE,
  authorization_protocol TEXT,
  qr_code TEXT,
  xml_file_url TEXT,
  pdf_file_url TEXT;

-- Create trigger for inventory updated_at
CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_inventory_category ON public.inventory(category);
CREATE INDEX idx_inventory_status ON public.inventory(status);
CREATE INDEX idx_inventory_responsible ON public.inventory(responsible_person);
CREATE INDEX idx_invoices_nfe_series ON public.invoices(nfe_series);
CREATE INDEX idx_invoices_nfe_access_key ON public.invoices(nfe_access_key);
CREATE INDEX idx_invoices_emitter_cnpj ON public.invoices(emitter_cnpj);