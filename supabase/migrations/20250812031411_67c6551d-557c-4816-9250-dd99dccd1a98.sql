-- Adicionar campo setor à tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS sector text;