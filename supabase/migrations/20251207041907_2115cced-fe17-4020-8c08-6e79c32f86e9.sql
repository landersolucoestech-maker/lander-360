-- Add new fields to financial_transactions table
ALTER TABLE public.financial_transactions
ADD COLUMN IF NOT EXISTS payment_method text,
ADD COLUMN IF NOT EXISTS contract_id uuid REFERENCES public.contracts(id),
ADD COLUMN IF NOT EXISTS crm_contact_id uuid REFERENCES public.crm_contacts(id),
ADD COLUMN IF NOT EXISTS attachment_url text,
ADD COLUMN IF NOT EXISTS responsible_by text,
ADD COLUMN IF NOT EXISTS authorized_by text,
ADD COLUMN IF NOT EXISTS observations text;

-- Create index for contract lookup
CREATE INDEX IF NOT EXISTS idx_financial_transactions_contract_id ON public.financial_transactions(contract_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_crm_contact_id ON public.financial_transactions(crm_contact_id);