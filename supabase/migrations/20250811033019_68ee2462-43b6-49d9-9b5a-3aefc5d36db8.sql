-- Inserir dados de exemplo para demonstrar o fluxo
-- Inserir um projeto exemplo
INSERT INTO public.projects (name, description, status, created_by) VALUES 
('Álbum Debut - João Silva', 'Primeiro álbum do artista João Silva', 'in_progress', '00000000-0000-0000-0000-000000000000');

-- Inserir artistas exemplo
INSERT INTO public.artists (name, stage_name, email, genre, bio) VALUES 
('João Silva', 'JS Music', 'joao@example.com', 'Pop', 'Artista emergente da cena pop brasileira'),
('Maria Santos', 'MS Soul', 'maria@example.com', 'Soul/R&B', 'Cantora soul com influências clássicas'),
('Ana Costa', 'Ana C', 'ana@example.com', 'Pop Rock', 'Artista independente de pop rock');

-- Inserir registros de música
INSERT INTO public.music_registrations (project_id, title, artist_id, genre, duration, status) VALUES 
((SELECT id FROM public.projects LIMIT 1), 'Primeiro Single', (SELECT id FROM public.artists WHERE name = 'João Silva'), 'Pop', 240, 'approved'),
((SELECT id FROM public.projects LIMIT 1), 'Segundo Single', (SELECT id FROM public.artists WHERE name = 'João Silva'), 'Pop', 210, 'registered');

-- Inserir lançamentos
INSERT INTO public.releases (registration_id, release_title, release_type, release_date, status) VALUES 
((SELECT id FROM public.music_registrations WHERE title = 'Primeiro Single'), 'João Silva - Primeiro Single', 'single', '2024-02-15', 'live'),
((SELECT id FROM public.music_registrations WHERE title = 'Segundo Single'), 'João Silva - Segundo Single', 'single', '2024-03-01', 'planned');

-- Inserir campanhas de marketing
INSERT INTO public.marketing_campaigns (release_id, campaign_name, objective, budget, start_date, end_date, status, platforms) VALUES 
((SELECT id FROM public.releases WHERE release_title = 'João Silva - Primeiro Single'), 'Campanha Lançamento - Primeiro Single', 'awareness', 5000.00, '2024-02-01', '2024-02-28', 'completed', ARRAY['instagram', 'tiktok', 'facebook']),
((SELECT id FROM public.releases WHERE release_title = 'João Silva - Segundo Single'), 'Campanha Lançamento - Segundo Single', 'conversion', 3500.00, '2024-02-20', '2024-03-15', 'active', ARRAY['instagram', 'spotify', 'youtube']);

-- Inserir contratos
INSERT INTO public.contracts (project_id, artist_id, contract_type, title, value, start_date, end_date, status) VALUES 
((SELECT id FROM public.projects LIMIT 1), (SELECT id FROM public.artists WHERE name = 'João Silva'), 'recording', 'Contrato de Gravação - João Silva', 25000.00, '2024-01-01', '2024-12-31', 'active'),
((SELECT id FROM public.projects LIMIT 1), (SELECT id FROM public.artists WHERE name = 'Maria Santos'), 'distribution', 'Contrato de Distribuição - Maria Santos', 15000.00, '2024-02-01', '2025-02-01', 'active');

-- Inserir transações financeiras
INSERT INTO public.financial_transactions (type, category, amount, description, transaction_date, release_id, status) VALUES 
('revenue', 'streaming', 1250.50, 'Royalties Spotify - Janeiro 2024', '2024-01-31', (SELECT id FROM public.releases WHERE release_title = 'João Silva - Primeiro Single'), 'confirmed'),
('revenue', 'streaming', 890.25, 'Royalties Apple Music - Janeiro 2024', '2024-01-31', (SELECT id FROM public.releases WHERE release_title = 'João Silva - Primeiro Single'), 'confirmed'),
('expense', 'marketing', 2500.00, 'Investimento em Ads - Instagram', '2024-02-15', (SELECT id FROM public.releases WHERE release_title = 'João Silva - Primeiro Single'), 'confirmed'),
('expense', 'production', 8500.00, 'Produção musical e mixagem', '2024-01-15', NULL, 'confirmed');

-- Inserir notas fiscais
INSERT INTO public.invoices (invoice_number, transaction_id, issue_date, due_date, total_amount, status) VALUES 
('NF-2024-001', (SELECT id FROM public.financial_transactions WHERE description = 'Royalties Spotify - Janeiro 2024'), '2024-02-01', '2024-02-15', 1250.50, 'paid'),
('NF-2024-002', (SELECT id FROM public.financial_transactions WHERE description = 'Investimento em Ads - Instagram'), '2024-02-15', '2024-03-01', 2500.00, 'issued');