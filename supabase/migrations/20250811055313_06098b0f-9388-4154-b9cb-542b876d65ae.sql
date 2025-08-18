-- Update financial_transactions table with all requested fields
ALTER TABLE public.financial_transactions 
ADD COLUMN IF NOT EXISTS transaction_type TEXT CHECK (transaction_type IN ('entrada', 'saida')),
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS artist_id UUID REFERENCES public.artists(id),
ADD COLUMN IF NOT EXISTS subcategory TEXT,
ADD COLUMN IF NOT EXISTS repasse_percentage NUMERIC;

-- Update category constraint to include all financial categories
ALTER TABLE public.financial_transactions DROP CONSTRAINT IF EXISTS financial_transactions_category_check;
ALTER TABLE public.financial_transactions ADD CONSTRAINT financial_transactions_category_check 
CHECK (category IN (
  -- Receitas
  'venda_musicas', 'streaming', 'shows', 'licenciamento', 'merchandising', 
  'publicidade', 'producao', 'distribuicao', 'gestao',
  -- Despesas
  'produtores', 'caches', 'marketing', 'equipe', 'infraestrutura', 
  'registros', 'juridicos', 'salarios', 'aluguel', 'manutencao', 
  'viagens', 'licencas', 'contabilidade', 'estudio', 'equipamentos', 'servicos',
  -- Outros
  'investimentos', 'outros'
));

-- Update status constraint
ALTER TABLE public.financial_transactions DROP CONSTRAINT IF EXISTS financial_transactions_status_check;
ALTER TABLE public.financial_transactions ADD CONSTRAINT financial_transactions_status_check 
CHECK (status IN ('pendente', 'aprovado', 'pago', 'cancelado'));

-- Create function to calculate repasse amounts
CREATE OR REPLACE FUNCTION public.calculate_repasse(
  transaction_id UUID,
  percentage NUMERIC
) RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
  transaction_amount NUMERIC;
  repasse_amount NUMERIC;
BEGIN
  SELECT amount INTO transaction_amount 
  FROM public.financial_transactions 
  WHERE id = transaction_id;
  
  IF transaction_amount IS NULL THEN
    RETURN 0;
  END IF;
  
  repasse_amount := transaction_amount * (percentage / 100);
  RETURN repasse_amount;
END;
$$;