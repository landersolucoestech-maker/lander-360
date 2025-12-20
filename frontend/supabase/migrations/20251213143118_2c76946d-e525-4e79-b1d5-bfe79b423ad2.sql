
-- Delete existing learning data
DELETE FROM learning_user_badges;
DELETE FROM learning_badges;
DELETE FROM learning_notes;
DELETE FROM learning_progress;
DELETE FROM learning_lessons;
DELETE FROM learning_topics;
DELETE FROM learning_stages;

-- Insert new system-focused stages (8 modules)
INSERT INTO learning_stages (stage_number, title, description, icon, color, is_active) VALUES
(1, 'Primeiros Passos', 'Configure sua conta corretamente e domine a navegação do sistema desde o primeiro clique.', 'rocket', '#3B82F6', true),
(2, 'Gestão de Obras', 'Organize e controle obras com precisão legal e administrativa.', 'music', '#8B5CF6', true),
(3, 'Gestão de Fonogramas', 'Controle preciso de gravações e lançamentos.', 'disc', '#EC4899', true),
(4, 'Gestão de Produtos Fonográficos', 'Garanta que cada produto seja lançado com controle absoluto.', 'package', '#F59E0B', true),
(5, 'Gestão de Projetos', 'Planeje e execute lançamentos com rigor profissional.', 'folder-kanban', '#10B981', true),
(6, 'CRM', 'Controle contatos, clientes e parceiros com precisão absoluta.', 'users', '#06B6D4', true),
(7, 'Autorizações e Titulares', 'Garanta segurança legal e controle financeiro.', 'shield-check', '#EF4444', true),
(8, 'Relatórios e Auditoria', 'Monitoramento de dados e tomada de decisões estratégicas.', 'bar-chart-3', '#6366F1', true);

-- Insert topics for Stage 1: Primeiros Passos
INSERT INTO learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 1, 'Configuração da Conta', 'Configure sua conta com dados pessoais e bancários corretamente.', true FROM learning_stages WHERE stage_number = 1
UNION ALL
SELECT id, 2, 'Navegação e Dashboard', 'Domine o dashboard e reduza em 50% o tempo procurando funções.', true FROM learning_stages WHERE stage_number = 1
UNION ALL
SELECT id, 3, 'Permissões e Acessos', 'Saiba exatamente quem vê e edita cada área do sistema.', true FROM learning_stages WHERE stage_number = 1
UNION ALL
SELECT id, 4, 'Atalhos e Produtividade', 'Explore atalhos para acelerar seu trabalho diário.', true FROM learning_stages WHERE stage_number = 1;

-- Insert topics for Stage 2: Gestão de Obras
INSERT INTO learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 1, 'Cadastro de Obras', 'Seu catálogo organizado é seu patrimônio. Cada campo correto evita problemas futuros.', true FROM learning_stages WHERE stage_number = 2
UNION ALL
SELECT id, 2, 'Configuração de Splits', 'Erro de split = perda financeira. Configure cada autor corretamente.', true FROM learning_stages WHERE stage_number = 2
UNION ALL
SELECT id, 3, 'Códigos Legais (ISWC/ECAD/ABRAMUS)', 'ISWC e organização legal não são burocracia: são proteção.', true FROM learning_stages WHERE stage_number = 2
UNION ALL
SELECT id, 4, 'Anexos e Arquivos', 'Gerencie arquivos MP3, WAV e PDFs corretamente.', true FROM learning_stages WHERE stage_number = 2;

-- Insert topics for Stage 3: Gestão de Fonogramas
INSERT INTO learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 1, 'Cadastro de Fonogramas', 'Fonograma é dinheiro. Cada informação correta garante registro e pagamento.', true FROM learning_stages WHERE stage_number = 3
UNION ALL
SELECT id, 2, 'ISRC e Metadados', 'Controle absoluto: quem tem direito, quanto tem direito e por quê.', true FROM learning_stages WHERE stage_number = 3
UNION ALL
SELECT id, 3, 'Direitos e Titulares', 'Configure corretamente os direitos de cada titular.', true FROM learning_stages WHERE stage_number = 3
UNION ALL
SELECT id, 4, 'Checklists de Lançamento', 'Valide todos os campos antes de liberar o fonograma.', true FROM learning_stages WHERE stage_number = 3;

-- Insert topics for Stage 4: Gestão de Produtos Fonográficos
INSERT INTO learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 1, 'Singles, EPs e Álbuns', 'Nada passa despercebido. Cada etapa do lançamento deve estar registrada.', true FROM learning_stages WHERE stage_number = 4
UNION ALL
SELECT id, 2, 'Arte e Metadados', 'Configure arte, arquivos e metadados antes de lançar.', true FROM learning_stages WHERE stage_number = 4
UNION ALL
SELECT id, 3, 'Distribuição Digital', 'Confirme integração com distribuidoras e plataformas.', true FROM learning_stages WHERE stage_number = 4
UNION ALL
SELECT id, 4, 'Checklist de Lançamento', 'O erro mais caro? Falta de controle. Use o checklist completo.', true FROM learning_stages WHERE stage_number = 4;

-- Insert topics for Stage 5: Gestão de Projetos
INSERT INTO learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 1, 'Criação de Projetos', 'Um lançamento é um projeto: sem controle, você falha.', true FROM learning_stages WHERE stage_number = 5
UNION ALL
SELECT id, 2, 'Tarefas e Responsáveis', 'Distribua responsabilidades claramente.', true FROM learning_stages WHERE stage_number = 5
UNION ALL
SELECT id, 3, 'Timeline e Prazos', 'Acompanhe cada etapa. Nada fica perdido.', true FROM learning_stages WHERE stage_number = 5
UNION ALL
SELECT id, 4, 'Acompanhamento e Alertas', 'Receba alertas de tarefas atrasadas e atualize o progresso.', true FROM learning_stages WHERE stage_number = 5;

-- Insert topics for Stage 6: CRM
INSERT INTO learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 1, 'Cadastro de Contatos', 'Networking jogado no papel não existe. Registre tudo.', true FROM learning_stages WHERE stage_number = 6
UNION ALL
SELECT id, 2, 'Categorias e Segmentação', 'Categorize corretamente: Clientes, Parceiros, Fornecedores.', true FROM learning_stages WHERE stage_number = 6
UNION ALL
SELECT id, 3, 'Histórico de Interações', 'Evite perdas ou confusões: histórico completo é obrigatório.', true FROM learning_stages WHERE stage_number = 6
UNION ALL
SELECT id, 4, 'Follow-ups e Oportunidades', 'Configure alertas de follow-up e gerencie oportunidades.', true FROM learning_stages WHERE stage_number = 6;

-- Insert topics for Stage 7: Autorizações e Titulares
INSERT INTO learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 1, 'Cadastro de Titulares', 'Controle absoluto dos direitos evita problemas legais e financeiros.', true FROM learning_stages WHERE stage_number = 7
UNION ALL
SELECT id, 2, 'Percentuais e Direitos', 'Configure corretamente percentuais e tipos de direito.', true FROM learning_stages WHERE stage_number = 7
UNION ALL
SELECT id, 3, 'Autorizações de Fixação', 'Cada autorização deve ser registrada e auditável.', true FROM learning_stages WHERE stage_number = 7
UNION ALL
SELECT id, 4, 'Documentos e Anexos', 'Anexe autorizações digitais corretas para cada titular.', true FROM learning_stages WHERE stage_number = 7;

-- Insert topics for Stage 8: Relatórios e Auditoria
INSERT INTO learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 1, 'Tipos de Relatórios', 'Informação é lucro. Relatórios claros para decisões rápidas.', true FROM learning_stages WHERE stage_number = 8
UNION ALL
SELECT id, 2, 'Filtros Avançados', 'Use filtros por módulo, período e tipo de relatório.', true FROM learning_stages WHERE stage_number = 8
UNION ALL
SELECT id, 3, 'Exportação (PDF/CSV)', 'Exporte relatórios detalhados para análise externa.', true FROM learning_stages WHERE stage_number = 8
UNION ALL
SELECT id, 4, 'Logs e Auditoria', 'Nada escapa: cada ação de cada usuário deve ser auditável.', true FROM learning_stages WHERE stage_number = 8;

-- Insert badges for each stage
INSERT INTO learning_badges (stage_id, name, description, icon, points)
SELECT id, 'Onboarding Completo', 'Concluiu o módulo Primeiros Passos', 'rocket', 100 FROM learning_stages WHERE stage_number = 1
UNION ALL
SELECT id, 'Mestre das Obras', 'Concluiu o módulo Gestão de Obras', 'music', 150 FROM learning_stages WHERE stage_number = 2
UNION ALL
SELECT id, 'Expert em Fonogramas', 'Concluiu o módulo Gestão de Fonogramas', 'disc', 150 FROM learning_stages WHERE stage_number = 3
UNION ALL
SELECT id, 'Especialista em Produtos', 'Concluiu o módulo Gestão de Produtos Fonográficos', 'package', 150 FROM learning_stages WHERE stage_number = 4
UNION ALL
SELECT id, 'Gestor de Projetos', 'Concluiu o módulo Gestão de Projetos', 'folder-kanban', 150 FROM learning_stages WHERE stage_number = 5
UNION ALL
SELECT id, 'CRM Expert', 'Concluiu o módulo CRM', 'users', 150 FROM learning_stages WHERE stage_number = 6
UNION ALL
SELECT id, 'Guardião Legal', 'Concluiu o módulo Autorizações e Titulares', 'shield-check', 200 FROM learning_stages WHERE stage_number = 7
UNION ALL
SELECT id, 'Analista de Dados', 'Concluiu o módulo Relatórios e Auditoria', 'bar-chart-3', 200 FROM learning_stages WHERE stage_number = 8;
