-- Remove the old CHECK constraint and add a new one with empresariamento_suporte
ALTER TABLE public.contract_templates DROP CONSTRAINT IF EXISTS contract_templates_template_type_check;

ALTER TABLE public.contract_templates ADD CONSTRAINT contract_templates_template_type_check 
CHECK (template_type IN (
  'agenciamento', 'gestao', 'empresariamento', 'empresariamento_suporte', 'producao_musical', 
  'producao_audiovisual', 'edicao', 'distribuicao', 'marketing', 
  'licenciamento', 'termo_fonograma', 'colaborador', 'shows'
));