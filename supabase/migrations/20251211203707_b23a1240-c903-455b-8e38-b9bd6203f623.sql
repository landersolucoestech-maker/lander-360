-- Create contract_templates table for storing contract templates
CREATE TABLE public.contract_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN (
    'agenciamento', 'gestao', 'empresariamento', 'producao_musical', 
    'producao_audiovisual', 'edicao', 'distribuicao', 'marketing', 
    'licenciamento', 'termo_fonograma'
  )),
  description TEXT,
  header_html TEXT,
  footer_html TEXT,
  clauses JSONB DEFAULT '[]'::jsonb,
  default_fields JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies - only admin/manager can manage templates
CREATE POLICY "Templates viewable by authenticated users" 
ON public.contract_templates 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Templates manageable by admin/manager" 
ON public.contract_templates 
FOR ALL 
USING ((auth.role() = 'authenticated') AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager')));

-- Create trigger for updated_at
CREATE TRIGGER update_contract_templates_updated_at
BEFORE UPDATE ON public.contract_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add template_id and generated_document columns to contracts table
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.contract_templates(id),
ADD COLUMN IF NOT EXISTS generated_document_content TEXT,
ADD COLUMN IF NOT EXISTS signature_request_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS signed_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS autentique_document_id TEXT;

-- Insert default templates
INSERT INTO public.contract_templates (name, template_type, description, clauses, default_fields) VALUES
(
  'Contrato de Agenciamento Artístico',
  'agenciamento',
  'Template padrão para contratos de agenciamento artístico',
  '[
    {"id": "1", "title": "DO OBJETO", "content": "O presente contrato tem por objeto a prestação de serviços de agenciamento artístico do CONTRATADO pela CONTRATANTE, visando a promoção, divulgação e negociação de oportunidades profissionais."},
    {"id": "2", "title": "DAS OBRIGAÇÕES DA CONTRATANTE", "content": "A CONTRATANTE se obriga a: a) Representar o CONTRATADO perante terceiros; b) Negociar cachês e contratos em nome do CONTRATADO; c) Promover a imagem e carreira do CONTRATADO."},
    {"id": "3", "title": "DAS OBRIGAÇÕES DO CONTRATADO", "content": "O CONTRATADO se obriga a: a) Comunicar previamente à CONTRATANTE sobre propostas recebidas; b) Manter postura profissional; c) Cumprir os compromissos agendados."},
    {"id": "4", "title": "DA REMUNERAÇÃO", "content": "A CONTRATANTE receberá o percentual de {{royalties_percentage}}% ({{royalties_percentage_extenso}}) sobre os valores brutos recebidos pelo CONTRATADO."},
    {"id": "5", "title": "DO PRAZO", "content": "O presente contrato terá vigência de {{start_date}} a {{end_date}}, podendo ser renovado mediante acordo entre as partes."},
    {"id": "6", "title": "DA RESCISÃO", "content": "O contrato poderá ser rescindido por qualquer das partes, mediante aviso prévio de 30 (trinta) dias."},
    {"id": "7", "title": "DO FORO", "content": "Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer questões oriundas deste contrato."}
  ]'::jsonb,
  '{"company_name": "LANDER RECORDS LTDA", "company_cnpj": "XX.XXX.XXX/0001-XX", "company_address": "São Paulo/SP"}'::jsonb
),
(
  'Contrato de Gestão de Carreira',
  'gestao',
  'Template padrão para contratos de gestão de carreira artística',
  '[
    {"id": "1", "title": "DO OBJETO", "content": "O presente contrato tem por objeto a prestação de serviços de gestão de carreira artística do CONTRATADO pela CONTRATANTE."},
    {"id": "2", "title": "DOS SERVIÇOS", "content": "Os serviços de gestão incluem: planejamento estratégico de carreira, orientação profissional, acompanhamento de projetos e desenvolvimento artístico."},
    {"id": "3", "title": "DA EXCLUSIVIDADE", "content": "Durante a vigência deste contrato, o CONTRATADO concede exclusividade à CONTRATANTE para gestão de sua carreira artística."},
    {"id": "4", "title": "DA REMUNERAÇÃO", "content": "A CONTRATANTE receberá o percentual de {{royalties_percentage}}% sobre os rendimentos do CONTRATADO, além de adiantamento de R$ {{advance_amount}}."},
    {"id": "5", "title": "DO PRAZO", "content": "O presente contrato terá vigência de {{start_date}} a {{end_date}}."},
    {"id": "6", "title": "DO FORO", "content": "Fica eleito o foro da Comarca de São Paulo/SP."}
  ]'::jsonb,
  '{"company_name": "LANDER RECORDS LTDA"}'::jsonb
),
(
  'Contrato de Empresariamento',
  'empresariamento',
  'Template padrão para contratos de empresariamento artístico',
  '[
    {"id": "1", "title": "DO OBJETO", "content": "O presente contrato tem por objeto o empresariamento artístico exclusivo do CONTRATADO pela CONTRATANTE."},
    {"id": "2", "title": "DA EXCLUSIVIDADE", "content": "O CONTRATADO confere à CONTRATANTE poderes exclusivos para representá-lo em todas as atividades artísticas."},
    {"id": "3", "title": "DAS ATIVIDADES", "content": "A CONTRATANTE atuará na: negociação de contratos, shows, licenciamentos, endorsements e todas as oportunidades comerciais."},
    {"id": "4", "title": "DA REMUNERAÇÃO", "content": "A CONTRATANTE receberá {{royalties_percentage}}% de todos os valores recebidos pelo CONTRATADO."},
    {"id": "5", "title": "DO ADIANTAMENTO", "content": "A CONTRATANTE pagará ao CONTRATADO o valor de R$ {{advance_amount}} a título de adiantamento."},
    {"id": "6", "title": "DO PRAZO", "content": "Vigência de {{start_date}} a {{end_date}}."},
    {"id": "7", "title": "DO FORO", "content": "Foro de São Paulo/SP."}
  ]'::jsonb,
  '{"company_name": "LANDER RECORDS LTDA"}'::jsonb
),
(
  'Contrato de Produção Musical',
  'producao_musical',
  'Template padrão para contratos de produção musical',
  '[
    {"id": "1", "title": "DO OBJETO", "content": "O presente contrato tem por objeto a produção musical de {{work_title}} para o CONTRATADO."},
    {"id": "2", "title": "DOS SERVIÇOS", "content": "Os serviços incluem: arranjo musical, gravação, mixagem e masterização."},
    {"id": "3", "title": "DOS DIREITOS", "content": "Os direitos da produção pertencem integralmente ao CONTRATADO após quitação total dos valores."},
    {"id": "4", "title": "DO VALOR", "content": "O valor total da produção é de R$ {{fixed_value}}, a ser pago conforme acordado."},
    {"id": "5", "title": "DO PRAZO", "content": "A produção será entregue até {{end_date}}."},
    {"id": "6", "title": "DO FORO", "content": "Foro de São Paulo/SP."}
  ]'::jsonb,
  '{"company_name": "LANDER RECORDS LTDA"}'::jsonb
),
(
  'Contrato de Produção Audiovisual',
  'producao_audiovisual',
  'Template padrão para contratos de produção audiovisual',
  '[
    {"id": "1", "title": "DO OBJETO", "content": "Produção audiovisual (videoclipe/conteúdo) para o CONTRATADO."},
    {"id": "2", "title": "DOS SERVIÇOS", "content": "Serviços incluem: roteiro, filmagem, edição e entrega final em formatos acordados."},
    {"id": "3", "title": "DOS DIREITOS DE IMAGEM", "content": "O CONTRATADO autoriza uso de sua imagem no material produzido."},
    {"id": "4", "title": "DO VALOR", "content": "Valor total: R$ {{fixed_value}}."},
    {"id": "5", "title": "DO PRAZO", "content": "Entrega até {{end_date}}."},
    {"id": "6", "title": "DO FORO", "content": "Foro de São Paulo/SP."}
  ]'::jsonb,
  '{"company_name": "LANDER RECORDS LTDA"}'::jsonb
),
(
  'Contrato de Edição Musical',
  'edicao',
  'Template padrão para contratos de edição musical',
  '[
    {"id": "1", "title": "DO OBJETO", "content": "O presente contrato tem por objeto a edição musical da obra \"{{work_title}}\"."},
    {"id": "2", "title": "DA CESSÃO", "content": "O CONTRATADO cede à CONTRATANTE o percentual de {{royalties_percentage}}% dos direitos autorais patrimoniais da obra."},
    {"id": "3", "title": "DAS OBRIGAÇÕES DA EDITORA", "content": "A CONTRATANTE se obriga a: registrar a obra, administrar os direitos e recolher os valores devidos."},
    {"id": "4", "title": "DA DISTRIBUIÇÃO", "content": "Os valores arrecadados serão distribuídos conforme os percentuais acordados."},
    {"id": "5", "title": "DO PRAZO", "content": "Vigência de {{start_date}} a {{end_date}}."},
    {"id": "6", "title": "DO FORO", "content": "Foro de São Paulo/SP."}
  ]'::jsonb,
  '{"company_name": "LANDER RECORDS LTDA"}'::jsonb
),
(
  'Contrato de Distribuição Digital',
  'distribuicao',
  'Template padrão para contratos de distribuição digital',
  '[
    {"id": "1", "title": "DO OBJETO", "content": "Distribuição digital do fonograma/álbum do CONTRATADO em plataformas de streaming."},
    {"id": "2", "title": "DAS PLATAFORMAS", "content": "A distribuição será feita em: Spotify, Apple Music, Deezer, Amazon Music e demais plataformas."},
    {"id": "3", "title": "DOS DIREITOS", "content": "O CONTRATADO mantém todos os direitos sobre o fonograma."},
    {"id": "4", "title": "DA REMUNERAÇÃO", "content": "A CONTRATANTE reterá {{royalties_percentage}}% dos valores arrecadados a título de taxa de distribuição."},
    {"id": "5", "title": "DO PRAZO", "content": "Vigência de {{start_date}} a {{end_date}}."},
    {"id": "6", "title": "DO FORO", "content": "Foro de São Paulo/SP."}
  ]'::jsonb,
  '{"company_name": "LANDER RECORDS LTDA"}'::jsonb
),
(
  'Contrato de Marketing',
  'marketing',
  'Template padrão para contratos de marketing e divulgação',
  '[
    {"id": "1", "title": "DO OBJETO", "content": "Prestação de serviços de marketing e divulgação para o CONTRATADO."},
    {"id": "2", "title": "DOS SERVIÇOS", "content": "Serviços incluem: gestão de redes sociais, campanhas publicitárias, assessoria de imprensa."},
    {"id": "3", "title": "DO VALOR", "content": "Valor mensal: R$ {{fixed_value}}."},
    {"id": "4", "title": "DO PRAZO", "content": "Vigência de {{start_date}} a {{end_date}}."},
    {"id": "5", "title": "DO FORO", "content": "Foro de São Paulo/SP."}
  ]'::jsonb,
  '{"company_name": "LANDER RECORDS LTDA"}'::jsonb
),
(
  'Contrato de Licenciamento',
  'licenciamento',
  'Template padrão para contratos de licenciamento de obras',
  '[
    {"id": "1", "title": "DO OBJETO", "content": "Licenciamento da obra \"{{work_title}}\" para uso em {{license_purpose}}."},
    {"id": "2", "title": "DA LICENÇA", "content": "A licença concedida é {{license_type}} para o território {{territory}}."},
    {"id": "3", "title": "DO VALOR", "content": "Valor da licença: R$ {{fixed_value}}."},
    {"id": "4", "title": "DO PRAZO", "content": "Licença válida de {{start_date}} a {{end_date}}."},
    {"id": "5", "title": "DO FORO", "content": "Foro de São Paulo/SP."}
  ]'::jsonb,
  '{"company_name": "LANDER RECORDS LTDA"}'::jsonb
),
(
  'Termo de Autorização de Uso de Fonograma',
  'termo_fonograma',
  'Template padrão para termo de autorização de uso de fonograma e distribuição',
  '[
    {"id": "1", "title": "DA AUTORIZAÇÃO", "content": "O AUTORIZANTE, na qualidade de titular dos direitos sobre o fonograma \"{{phonogram_title}}\", AUTORIZA a LANDER RECORDS a distribuir e comercializar o referido fonograma."},
    {"id": "2", "title": "DAS PLATAFORMAS", "content": "A autorização abrange distribuição em todas as plataformas digitais e físicas."},
    {"id": "3", "title": "DOS DIREITOS", "content": "O AUTORIZANTE declara ser o legítimo detentor dos direitos e isenta a LANDER RECORDS de quaisquer reclamações de terceiros."},
    {"id": "4", "title": "DA REMUNERAÇÃO", "content": "O AUTORIZANTE receberá {{artist_percentage}}% dos valores líquidos arrecadados."},
    {"id": "5", "title": "DO PRAZO", "content": "Autorização válida de {{start_date}} a {{end_date}}."},
    {"id": "6", "title": "DO FORO", "content": "Foro de São Paulo/SP."}
  ]'::jsonb,
  '{"company_name": "LANDER RECORDS LTDA"}'::jsonb
);