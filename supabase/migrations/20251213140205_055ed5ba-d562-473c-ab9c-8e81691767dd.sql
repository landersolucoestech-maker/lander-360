
-- Remove all existing learning data to start fresh with system-focused content
DELETE FROM public.learning_user_badges;
DELETE FROM public.learning_badges;
DELETE FROM public.learning_notes;
DELETE FROM public.learning_progress;
DELETE FROM public.learning_lessons;
DELETE FROM public.learning_topics;
DELETE FROM public.learning_stages;

-- Insert new system-focused learning stages
INSERT INTO public.learning_stages (stage_number, title, description, icon, color, is_active) VALUES
(1, 'Fundamentos do Sistema', 'Introdução ao sistema, navegação, login, permissões e configurações iniciais', 'BookOpen', 'blue', true),
(2, 'Gestão de Artistas e Obras', 'Cadastro de artistas, registro de obras e fonogramas, splits e responsáveis', 'Users', 'purple', true),
(3, 'Lançamentos e Marketing', 'Criar lançamentos, calendário de marketing, IA Criativa e campanhas', 'Rocket', 'orange', true),
(4, 'Contratos e Financeiro', 'Gestão de contratos, financeiro, entradas, saídas e conferência de royalties', 'FileText', 'green', true),
(5, 'Agenda, CRM e Inventário', 'Agendamento de eventos, gestão de contatos e inventário', 'Calendar', 'pink', true),
(6, 'Relatórios e Auditoria', 'Criação de relatórios, logs, auditoria e controle de permissões', 'BarChart3', 'cyan', true),
(7, 'Avançado e Recursos Extras', 'Templates inteligentes, workflows, alertas e ferramentas de produtividade', 'Zap', 'amber', true);

-- Insert topics for Stage 1: Fundamentos do Sistema
INSERT INTO public.learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 1, 'Introdução ao Sistema', 'Visão geral do sistema e seus principais recursos', true
FROM public.learning_stages WHERE stage_number = 1;

INSERT INTO public.learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 2, 'Navegação e Layout', 'Como navegar pelo sistema e entender a interface', true
FROM public.learning_stages WHERE stage_number = 1;

INSERT INTO public.learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 3, 'Login e Permissões', 'Sistema de autenticação, perfis e níveis de acesso', true
FROM public.learning_stages WHERE stage_number = 1;

INSERT INTO public.learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 4, 'Configurações Iniciais', 'Configurar preferências, tema e opções do sistema', true
FROM public.learning_stages WHERE stage_number = 1;

-- Insert topics for Stage 2: Gestão de Artistas e Obras
INSERT INTO public.learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 1, 'Cadastro de Artistas', 'Como cadastrar e gerenciar artistas no sistema', true
FROM public.learning_stages WHERE stage_number = 2;

INSERT INTO public.learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 2, 'Registro de Obras', 'Registrar obras musicais com todos os metadados', true
FROM public.learning_stages WHERE stage_number = 2;

INSERT INTO public.learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 3, 'Registro de Fonogramas', 'Cadastrar fonogramas e vincular a obras', true
FROM public.learning_stages WHERE stage_number = 2;

INSERT INTO public.learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 4, 'Splits e Participantes', 'Gerenciar divisões de royalties e responsáveis', true
FROM public.learning_stages WHERE stage_number = 2;

-- Insert topics for Stage 3: Lançamentos e Marketing
INSERT INTO public.learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 1, 'Criar Lançamentos', 'Como criar e configurar novos lançamentos', true
FROM public.learning_stages WHERE stage_number = 3;

INSERT INTO public.learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 2, 'Calendário de Marketing', 'Usar o calendário para planejar campanhas', true
FROM public.learning_stages WHERE stage_number = 3;

INSERT INTO public.learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 3, 'IA Criativa', 'Gerar estratégias e ideias com inteligência artificial', true
FROM public.learning_stages WHERE stage_number = 3;

INSERT INTO public.learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 4, 'Campanhas e Métricas', 'Gerenciar campanhas e analisar resultados', true
FROM public.learning_stages WHERE stage_number = 3;

-- Insert topics for Stage 4: Contratos e Financeiro
INSERT INTO public.learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 1, 'Gestão de Contratos', 'Cadastrar e gerenciar contratos no sistema', true
FROM public.learning_stages WHERE stage_number = 4;

INSERT INTO public.learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 2, 'Tipos de Contratos', 'Entender os diferentes tipos e templates', true
FROM public.learning_stages WHERE stage_number = 4;

INSERT INTO public.learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 3, 'Financeiro', 'Gerenciar entradas, saídas e relatórios financeiros', true
FROM public.learning_stages WHERE stage_number = 4;

INSERT INTO public.learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 4, 'Conferência de Royalties', 'Verificar e conferir dados de royalties', true
FROM public.learning_stages WHERE stage_number = 4;

-- Insert topics for Stage 5: Agenda, CRM e Inventário
INSERT INTO public.learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 1, 'Agenda de Eventos', 'Agendar e gerenciar eventos e compromissos', true
FROM public.learning_stages WHERE stage_number = 5;

INSERT INTO public.learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 2, 'Gestão de Contatos (CRM)', 'Gerenciar contatos e histórico de interações', true
FROM public.learning_stages WHERE stage_number = 5;

INSERT INTO public.learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 3, 'Inventário', 'Controlar equipamentos e itens do inventário', true
FROM public.learning_stages WHERE stage_number = 5;

INSERT INTO public.learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 4, 'Notas Fiscais', 'Emitir e gerenciar notas fiscais', true
FROM public.learning_stages WHERE stage_number = 5;

-- Insert topics for Stage 6: Relatórios e Auditoria
INSERT INTO public.learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 1, 'Relatórios Personalizados', 'Criar e exportar relatórios do sistema', true
FROM public.learning_stages WHERE stage_number = 6;

INSERT INTO public.learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 2, 'Logs e Auditoria', 'Visualizar logs e histórico de ações', true
FROM public.learning_stages WHERE stage_number = 6;

INSERT INTO public.learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 3, 'Controle de Permissões', 'Gerenciar permissões e acessos de usuários', true
FROM public.learning_stages WHERE stage_number = 6;

INSERT INTO public.learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 4, 'Exportação de Dados', 'Exportar dados em PDF, Excel e CSV', true
FROM public.learning_stages WHERE stage_number = 6;

-- Insert topics for Stage 7: Avançado e Recursos Extras
INSERT INTO public.learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 1, 'Templates Inteligentes', 'Usar e criar templates para documentos', true
FROM public.learning_stages WHERE stage_number = 7;

INSERT INTO public.learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 2, 'Workflows e Automações', 'Configurar fluxos de trabalho automatizados', true
FROM public.learning_stages WHERE stage_number = 7;

INSERT INTO public.learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 3, 'Alertas e Notificações', 'Configurar alertas e lembretes do sistema', true
FROM public.learning_stages WHERE stage_number = 7;

INSERT INTO public.learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 4, 'Ferramentas de Produtividade', 'Recursos avançados para otimizar o trabalho', true
FROM public.learning_stages WHERE stage_number = 7;

-- Insert new system-focused badges
INSERT INTO public.learning_badges (stage_id, name, description, icon, points)
SELECT id, 'Iniciante no Sistema', 'Completou os fundamentos do sistema', 'BookOpen', 100
FROM public.learning_stages WHERE stage_number = 1;

INSERT INTO public.learning_badges (stage_id, name, description, icon, points)
SELECT id, 'Gestor de Artistas', 'Dominou a gestão de artistas e obras', 'Users', 150
FROM public.learning_stages WHERE stage_number = 2;

INSERT INTO public.learning_badges (stage_id, name, description, icon, points)
SELECT id, 'Especialista em Marketing', 'Concluiu o módulo de lançamentos e marketing', 'Rocket', 150
FROM public.learning_stages WHERE stage_number = 3;

INSERT INTO public.learning_badges (stage_id, name, description, icon, points)
SELECT id, 'Mestre em Contratos', 'Dominou contratos e financeiro', 'FileText', 200
FROM public.learning_stages WHERE stage_number = 4;

INSERT INTO public.learning_badges (stage_id, name, description, icon, points)
SELECT id, 'Organizador Master', 'Completou agenda, CRM e inventário', 'Calendar', 150
FROM public.learning_stages WHERE stage_number = 5;

INSERT INTO public.learning_badges (stage_id, name, description, icon, points)
SELECT id, 'Analista de Dados', 'Concluiu relatórios e auditoria', 'BarChart3', 200
FROM public.learning_stages WHERE stage_number = 6;

INSERT INTO public.learning_badges (stage_id, name, description, icon, points)
SELECT id, 'Usuário Avançado', 'Dominou todos os recursos avançados', 'Zap', 250
FROM public.learning_stages WHERE stage_number = 7;
