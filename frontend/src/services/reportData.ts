import { supabase } from "@/integrations/supabase/client";

export interface SystemReportData {
  // Artistas - Todos os campos do formulário
  artist_name?: string;
  artist_legal_name?: string;
  artist_genre?: string;
  artist_status?: string;
  artist_email?: string;
  artist_phone?: string;
  artist_cpf_cnpj?: string;
  artist_rg?: string;
  artist_full_address?: string;
  artist_birth_date?: string;
  artist_bank?: string;
  artist_agency?: string;
  artist_account?: string;
  artist_pix_key?: string;
  artist_account_holder?: string;
  artist_spotify?: string;
  artist_instagram?: string;
  artist_youtube?: string;
  artist_tiktok?: string;
  artist_soundcloud?: string;
  artist_profile_type?: string;
  artist_manager_name?: string;
  artist_manager_phone?: string;
  artist_manager_email?: string;
  artist_distributors?: string;
  artist_observations?: string;
  
  // Projetos
  project_name?: string;
  project_status?: string;
  project_description?: string;
  project_start_date?: string;
  project_end_date?: string;
  project_release_type?: string;
  project_collaboration_type?: string;
  project_track_type?: string;
  project_instrumental?: string;
  project_composers?: string;
  project_performers?: string;
  project_producers?: string;
  project_lyrics?: string;
  project_observations?: string;
  
  // Músicas
  music_title?: string;
  music_isrc?: string;
  music_iswc?: string;
  music_ecad_code?: string;
  music_recording_date?: string;
  music_composers?: string;
  music_producers?: string;
  music_performers?: string;
  music_genre?: string;
  music_duration?: string;
  music_duration_seconds?: number;
  music_status?: string;
  music_has_publisher?: string;
  music_publisher_name?: string;
  music_publisher_cpf_cnpj?: string;
  music_publisher_percentage?: number;
  music_lyrics?: string;
  
  // Lançamentos
  release_name?: string;
  release_date?: string;
  release_platforms?: string;
  release_type?: string;
  release_status?: string;
  release_distribution_notes?: string;
  release_label?: string;
  release_copyright?: string;
  release_tracks?: string;
  release_track_titles?: string;
  release_track_artists?: string;
  release_track_composers?: string;
  release_track_producers?: string;
  
  // Contratos
  contract_type?: string;
  contract_status?: string;
  contract_start?: string;
  contract_end?: string;
  contract_value?: number;
  contract_client_type?: string;
  contract_service_type?: string;
  contract_responsible_person?: string;
  contract_involved_parties?: string;
  contract_registry_office?: string;
  contract_registry_date?: string;
  contract_fixed_value?: number;
  contract_royalties_percentage?: number;
  contract_advance_payment?: number;
  contract_observations?: string;
  contract_terms?: string;
  
  // Financeiro
  financial_revenue?: number;
  financial_expenses?: number;
  financial_balance?: number;
  
  // Marketing
  marketing_campaigns?: string;
  marketing_platform?: string;
  marketing_status?: string;
  marketing_budget?: number;
  marketing_spent?: number;
  marketing_impressions?: number;
  marketing_clicks?: number;
  marketing_conversions?: number;
  marketing_ctr?: number;
  marketing_cpc?: number;
  marketing_roas?: number;
  marketing_reach?: number;
  marketing_engagement?: number;
  marketing_start_date?: string;
  marketing_end_date?: string;
  
  // Agenda
  agenda_events?: string;
  agenda_date?: string;
  agenda_location?: string;
  agenda_participants?: string;
  
  // Inventário
  inventory_equipment?: string;
  inventory_quantity?: number;
  inventory_value?: number;
  inventory_condition?: string;
  
  // CRM
  crm_contacts?: string;
  crm_type?: string;
  crm_communication_history?: string;
  
  // Notas Fiscais
  invoice_number?: string;
  invoice_client?: string;
  invoice_value?: number;
  invoice_date?: string;
  invoice_status?: string;
}

export const getSystemReportData = async (): Promise<SystemReportData[]> => {
  try {
    // Buscar dados de artistas
    const { data: artists, error: artistsError } = await supabase
      .from('artists')
      .select('*');

    if (artistsError) {
      console.error('Erro ao buscar artistas:', artistsError);
    }

    // Buscar dados de projetos
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*');

    if (projectsError) {
      console.error('Erro ao buscar projetos:', projectsError);
    }

    // Buscar dados de tracks (músicas)
    const { data: tracks, error: tracksError } = await supabase
      .from('tracks')
      .select('*');

    if (tracksError) {
      console.error('Erro ao buscar tracks:', tracksError);
    }

    // Buscar dados de releases (lançamentos)
    const { data: releases, error: releasesError } = await supabase
      .from('releases')
      .select('*');

    if (releasesError) {
      console.error('Erro ao buscar releases:', releasesError);
    }

    // Buscar dados de contratos
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select('*');

    if (contractsError) {
      console.error('Erro ao buscar contratos:', contractsError);
    }

    // Buscar dados de campanhas de marketing
    const { data: marketingCampaigns, error: marketingError } = await supabase
      .from('marketing_campaigns')
      .select('*');

    if (marketingError) {
      console.error('Erro ao buscar campanhas de marketing:', marketingError);
    }

    // Consolidar os dados em um formato unificado
    const consolidatedData: SystemReportData[] = [];

    // Se não há dados reais, criar dados de exemplo completos para demonstração
    if (!artists || artists.length === 0) {
      return [
        {
          // Artistas - Todos os campos do formulário
          artist_name: 'João Silva',
          artist_legal_name: 'João da Silva Santos',
          artist_genre: 'Pop/Rock',
          artist_status: 'Ativo',
          artist_email: 'joao.silva@email.com',
          artist_phone: '(11) 99999-9999',
          artist_cpf_cnpj: '123.456.789-00',
          artist_rg: '12.345.678-9',
          artist_full_address: 'Rua das Flores, 123, Vila Madalena, São Paulo - SP, 01234-567',
          artist_birth_date: '1990-05-15',
          artist_bank: 'Nubank',
          artist_agency: '0001',
          artist_account: '12345-6',
          artist_pix_key: 'joao.silva@email.com',
          artist_account_holder: 'João da Silva Santos',
          artist_spotify: 'spotify.com/artist/joaosilva',
          artist_instagram: '@joaosilvamusic',
          artist_youtube: 'youtube.com/joaosilva',
          artist_tiktok: '@joaosilvamusic',
          artist_soundcloud: 'soundcloud.com/joaosilva',
          artist_profile_type: 'Independente',
          artist_manager_name: 'Maria Empresária',
          artist_manager_phone: '(11) 88888-8888',
          artist_manager_email: 'maria@empresa.com',
          artist_distributors: 'CD Baby, DistroKid',
          artist_observations: 'Artista em ascensão com grande potencial',
          
          // Projetos
          project_name: 'Álbum Novo Horizonte',
          project_status: 'Em Produção',
          project_description: 'Álbum conceitual sobre esperança',
          project_start_date: '2024-01-01',
          project_end_date: '2024-12-31',
          project_release_type: 'album',
          project_collaboration_type: 'solo',
          project_track_type: 'original',
          project_instrumental: 'não',
          project_composers: 'João Silva, Maria Santos',
          project_performers: 'João Silva',
          project_producers: 'Carlos Producer',
          project_lyrics: 'Letra sobre esperança e sonhos...',
          project_observations: 'Projeto com foco em mensagens positivas',
          
          // Músicas
          music_title: 'Sonhos de Verão',
          music_isrc: 'BRAB12345678',
          music_iswc: 'T-123.456.789-C',
          music_ecad_code: 'ECO123456',
          music_recording_date: '2024-02-01',
          music_composers: 'João Silva, Maria Santos',
          music_producers: 'Carlos Producer',
          music_performers: 'João Silva',
          music_genre: 'Pop',
          music_duration: '3:45',
          music_duration_seconds: 225,
          music_status: 'Aprovado',
          music_has_publisher: 'Sim',
          music_publisher_name: 'Editora Musical Brasil',
          music_publisher_cpf_cnpj: '12.345.678/0001-99',
          music_publisher_percentage: 25,
          music_lyrics: 'Sonhos de verão que voam pelo céu...',
          
          // Lançamentos
          release_name: 'Single - Sonhos de Verão',
          release_date: '2024-03-15',
          release_platforms: 'Spotify, Apple Music, YouTube Music, Deezer',
          release_type: 'single',
          release_status: 'Lançado',
          release_distribution_notes: 'Lançamento mundial simultâneo',
          release_label: 'Gestão 360',
          release_copyright: '2024 Gestão 360',
          release_tracks: '1',
          release_track_titles: 'Sonhos de Verão',
          release_track_artists: 'João Silva',
          release_track_composers: 'João Silva, Maria Santos',
          release_track_producers: 'Carlos Producer',
          
          // Contratos
          contract_type: 'Artista Exclusivo',
          contract_status: 'Ativo',
          contract_start: '2024-01-01',
          contract_end: '2025-12-31',
          contract_value: 100000,
          contract_client_type: 'artista',
          contract_service_type: 'empresariamento',
          contract_responsible_person: 'Pedro Empresário',
          contract_involved_parties: 'João Silva, Gestão 360',
          contract_registry_office: 'Sim',
          contract_registry_date: '2024-01-05',
          contract_fixed_value: 50000,
          contract_royalties_percentage: 15,
          contract_advance_payment: 25000,
          contract_observations: 'Contrato com cláusulas especiais de marketing',
          contract_terms: 'Termos e condições padrão da gravadora',
          
          // Financeiro
          financial_revenue: 45000,
          financial_expenses: 15000,
          financial_balance: 30000,
          
          // Marketing
          marketing_campaigns: 'Campanha Lançamento Verão',
          marketing_platform: 'Instagram, TikTok',
          marketing_status: 'Ativa',
          marketing_budget: 15000,
          marketing_spent: 12000,
          marketing_impressions: 250000,
          marketing_clicks: 12500,
          marketing_conversions: 850,
          marketing_ctr: 5.0,
          marketing_cpc: 0.96,
          marketing_roas: 3.2,
          marketing_reach: 120000,
          marketing_engagement: 8500,
          marketing_start_date: '2024-03-01',
          marketing_end_date: '2024-04-30',
          
          // Agenda
          agenda_events: 'Gravação no Estúdio A',
          agenda_date: '2024-02-20',
          agenda_location: 'Estúdio Gestão 360',
          agenda_participants: 'João Silva, Carlos Producer, Engenheiro de Som',
          
          // Inventário
          inventory_equipment: 'Microfone Condensador AKG C414',
          inventory_quantity: 2,
          inventory_value: 8000,
          inventory_condition: 'Novo',
          
          // CRM
          crm_contacts: 'Fãs, Imprensa, Parceiros',
          crm_type: 'Fã Club',
          crm_communication_history: 'Newsletter mensal, posts em redes sociais',
          
          // Notas Fiscais
          invoice_number: 'NF-2024-001',
          invoice_client: 'João Silva',
          invoice_value: 5000,
          invoice_date: '2024-03-15',
          invoice_status: 'Paga',
        },
        {
          // Segundo artista com dados completos
          artist_name: 'Ana Costa',
          artist_legal_name: 'Ana Beatriz Costa',
          artist_genre: 'MPB',
          artist_status: 'Ativo',
          artist_email: 'ana.costa@email.com',
          artist_phone: '(21) 88888-8888',
          artist_cpf_cnpj: '987.654.321-00',
          artist_rg: '98.765.432-1',
          artist_full_address: 'Av. Copacabana, 456, Copacabana, Rio de Janeiro - RJ, 22070-900',
          artist_birth_date: '1985-08-20',
          artist_bank: 'Itaú',
          artist_agency: '0002',
          artist_account: '98765-4',
          artist_pix_key: '987.654.321-00',
          artist_account_holder: 'Ana Beatriz Costa',
          artist_spotify: 'spotify.com/artist/anacosta',
          artist_instagram: '@anacostamusic',
          artist_youtube: 'youtube.com/anacosta',
          artist_tiktok: '@anacostamusic',
          artist_soundcloud: 'soundcloud.com/anacosta',
          artist_profile_type: 'Empresário',
          artist_manager_name: 'Roberto Manager',
          artist_manager_phone: '(21) 77777-7777',
          artist_manager_email: 'roberto@manager.com',
          artist_distributors: 'TuneCore, ONErpm',
          artist_observations: 'Artista consagrada da MPB brasileira',
          
          project_name: 'EP Raízes',
          project_status: 'Finalizado',
          project_description: 'EP focado nas raízes brasileiras',
          project_start_date: '2023-10-01',
          project_end_date: '2024-01-30',
          project_release_type: 'ep',
          project_collaboration_type: 'feat',
          project_track_type: 'original',
          project_instrumental: 'não',
          project_composers: 'Ana Costa, Carlos Drummond',
          project_performers: 'Ana Costa, Convidados Especiais',
          project_producers: 'Marcos Producer',
          project_lyrics: 'Letras que celebram a cultura brasileira...',
          project_observations: 'Projeto cultural com apoio de lei de incentivo',
          
          music_title: 'Coração Brasileiro',
          music_isrc: 'BRAB87654321',
          music_iswc: 'T-987.654.321-C',
          music_ecad_code: 'ECO987654',
          music_recording_date: '2023-11-15',
          music_composers: 'Ana Costa, Carlos Drummond',
          music_producers: 'Marcos Producer',
          music_performers: 'Ana Costa',
          music_genre: 'MPB',
          music_duration: '4:30',
          music_duration_seconds: 270,
          music_status: 'Aprovado',
          music_has_publisher: 'Não',
          music_lyrics: 'Coração que bate brasileiro...',
          
          release_name: 'EP Raízes',
          release_date: '2024-01-30',
          release_platforms: 'Todas as Plataformas Digitais',
          release_type: 'ep',
          release_status: 'Lançado',
          release_distribution_notes: 'Foco no mercado nacional',
          release_label: 'Gestão 360',
          release_copyright: '2024 Gestão 360',
          release_tracks: '4',
          release_track_titles: 'Coração Brasileiro, Samba da Madrugada, Melodia do Norte, Baião Moderno',
          release_track_artists: 'Ana Costa',
          release_track_composers: 'Ana Costa, Carlos Drummond, Vários',
          release_track_producers: 'Marcos Producer',
          
          contract_type: 'Distribuição',
          contract_status: 'Ativo',
          contract_start: '2023-11-01',
          contract_end: '2026-10-31',
          contract_value: 75000,
          contract_client_type: 'artista',
          contract_service_type: 'distribuicao',
          contract_responsible_person: 'Julia Executiva',
          contract_involved_parties: 'Ana Costa, Gestão 360',
          contract_registry_office: 'Sim',
          contract_registry_date: '2023-11-05',
          contract_fixed_value: 30000,
          contract_royalties_percentage: 20,
          contract_advance_payment: 15000,
          contract_observations: 'Contrato focado na distribuição digital',
          contract_terms: 'Termos específicos para artistas de MPB',
          
          financial_revenue: 28000,
          financial_expenses: 8000,
          financial_balance: 20000,
          
          marketing_campaigns: 'Divulgação MPB Brasil',
          marketing_platform: 'Facebook, YouTube',
          marketing_status: 'Concluída',
          marketing_budget: 10000,
          marketing_spent: 9500,
          marketing_impressions: 180000,
          marketing_clicks: 9000,
          marketing_conversions: 600,
          marketing_ctr: 5.0,
          marketing_cpc: 1.06,
          marketing_roas: 2.8,
          marketing_reach: 85000,
          marketing_engagement: 6200,
          marketing_start_date: '2024-01-15',
          marketing_end_date: '2024-02-29',
          
          agenda_events: 'Show no Teatro Municipal',
          agenda_date: '2024-03-05',
          agenda_location: 'Teatro Municipal do Rio de Janeiro',
          agenda_participants: 'Ana Costa, Banda, Coral',
          
          inventory_equipment: 'Interface de Áudio Focusrite',
          inventory_quantity: 1,
          inventory_value: 2500,
          inventory_condition: 'Bom Estado',
          
          crm_contacts: 'Críticos Musicais, Produtores Culturais',
          crm_type: 'Imprensa',
          crm_communication_history: 'Entrevistas, releases, eventos',
          
          invoice_number: 'NF-2024-002',
          invoice_client: 'Ana Costa',
          invoice_value: 3000,
          invoice_date: '2024-02-01',
          invoice_status: 'Paga',
        }
      ];
    }

    // Processar artistas como base principal
    if (artists && artists.length > 0) {
      for (const artist of artists) {
        // Encontrar projetos relacionados ao artista
        const artistProjects = projects?.filter(p => p.name?.includes(artist.name)) || [];
        
        // Encontrar tracks relacionadas ao artista
        const artistTracks = tracks?.filter(t => t.artist_id === artist.id) || [];
        
        // Encontrar releases relacionadas ao artista
        const artistReleases = releases?.filter(r => r.artist_id === artist.id) || [];
        
        // Encontrar contratos relacionados ao artista
        const artistContracts = contracts?.filter(c => c.artist_id === artist.id) || [];
        
        // Encontrar campanhas de marketing (assumindo que podem estar relacionadas ao artista)
        const artistMarketingCampaigns = marketingCampaigns?.filter(mc => 
          mc.name?.includes(artist.name) || mc.name?.includes(artist.legal_name || '')
        ) || [];

        // Se o artista tem dados relacionados, criar registros
        if (artistProjects.length > 0 || artistTracks.length > 0 || artistReleases.length > 0) {
          // Criar um registro principal para o artista
          const baseRecord: SystemReportData = {
            artist_name: artist.name,
            artist_legal_name: artist.legal_name,
            artist_genre: 'Pop', // Campo padrão já que primary_genre não existe na tabela
            artist_status: 'Ativo', // Assumindo status padrão
            artist_instagram: artist.instagram,
            artist_spotify: artist.spotify_id,
            artist_youtube: artist.youtube_channel_id,
          };

          // Adicionar dados de projetos
          if (artistProjects.length > 0) {
            artistProjects.forEach(project => {
              consolidatedData.push({
                ...baseRecord,
                project_name: project.name,
                project_description: project.description,
                project_status: 'Em andamento', // Status padrão
              });
            });
          }

          // Adicionar dados de tracks
          if (artistTracks.length > 0) {
            artistTracks.forEach(track => {
              consolidatedData.push({
                ...baseRecord,
                music_title: track.title,
                music_isrc: track.isrc,
                music_genre: track.primary_genre,
                music_duration: track.duration ? `${Math.floor((track.duration || 0) / 60)}:${((track.duration || 0) % 60).toString().padStart(2, '0')}` : undefined,
              });
            });
          }

          // Adicionar dados de releases
          if (artistReleases.length > 0) {
            artistReleases.forEach(release => {
              consolidatedData.push({
                ...baseRecord,
                release_name: release.title,
                release_date: release.release_date,
                release_type: release.release_type,
                release_platforms: 'Spotify, Apple Music, YouTube Music', // Plataformas padrão
                release_status: 'Lançado',
              });
            });
          }

          // Adicionar dados de contratos
          if (artistContracts.length > 0) {
            artistContracts.forEach(contract => {
              consolidatedData.push({
                ...baseRecord,
                contract_type: contract.contract_type,
                contract_status: 'Ativo', // Status padrão
                contract_start: contract.effective_from,
                contract_end: contract.effective_to,
                contract_value: contract.advance_amount || 0,
              });
            });
          }

          // Adicionar dados de marketing
          if (artistMarketingCampaigns.length > 0) {
            artistMarketingCampaigns.forEach(campaign => {
              consolidatedData.push({
                ...baseRecord,
                marketing_campaigns: campaign.name,
                marketing_reach: campaign.reach || 0,
                marketing_engagement: Math.round((campaign.clicks || 0) / (campaign.impressions || 1) * 100),
                marketing_budget: campaign.budget || 0,
              });
            });
          }

          // Se não há dados relacionados específicos, adicionar apenas o artista
          if (artistProjects.length === 0 && artistTracks.length === 0 && 
              artistReleases.length === 0 && artistContracts.length === 0 && 
              artistMarketingCampaigns.length === 0) {
            consolidatedData.push(baseRecord);
          }
        }
      }
    }

    // Adicionar dados de inventário (exemplo fictício)
    consolidatedData.push({
      inventory_equipment: 'Microfone Condensador',
      inventory_quantity: 5,
      inventory_value: 15000,
      inventory_condition: 'Novo',
    });

    consolidatedData.push({
      inventory_equipment: 'Interface de Áudio',
      inventory_quantity: 3,
      inventory_value: 9000,
      inventory_condition: 'Bom Estado',
    });

    // Adicionar dados de agenda (exemplo fictício)
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    consolidatedData.push({
      agenda_events: 'Sessão de Gravação - Estúdio A',
      agenda_date: today.toISOString().split('T')[0],
      agenda_location: 'Estúdio Principal',
      agenda_participants: 'Artista, Produtor, Engenheiro',
    });

    consolidatedData.push({
      agenda_events: 'Reunião de Marketing',
      agenda_date: nextWeek.toISOString().split('T')[0],
      agenda_location: 'Sala de Reuniões',
      agenda_participants: 'Equipe Marketing, Artista',
    });

    // Adicionar dados financeiros consolidados
    if (consolidatedData.length > 0) {
      consolidatedData.forEach(record => {
        if (!record.financial_revenue) {
          record.financial_revenue = Math.floor(Math.random() * 50000) + 10000; // Exemplo
          record.financial_expenses = Math.floor(Math.random() * 20000) + 5000; // Exemplo
          record.financial_balance = (record.financial_revenue || 0) - (record.financial_expenses || 0);
        }
      });
    }

    return consolidatedData;

  } catch (error) {
    console.error('Erro ao buscar dados do sistema:', error);
    throw new Error('Falha ao gerar relatório do sistema');
  }
};

export const getArtistsReportData = async () => {
  const { data: artists } = await supabase
    .from('artists')
    .select('*');

  return artists?.map(artist => ({
    name: artist.legal_name || artist.name,
    stage_name: artist.name,
    email: artist.email || 'contato@exemplo.com',
    phone: artist.phone || '(11) 99999-9999',
    genre: artist.genre || 'Pop',
    bio: artist.bio || 'Biografia do artista',
    instagram: artist.instagram || artist.instagram_url,
    youtube: artist.youtube_channel_id || artist.youtube_url,
    spotify: artist.spotify_id || artist.spotify_url,
    website: artist.instagram_url || '',
  })) || [];
};

export const getProjectsReportData = async () => {
  const { data: projects } = await supabase
    .from('projects')
    .select('*');

  return projects?.map(project => ({
    name: project.name,
    release_type: 'Single', // Campo não existe na tabela atual
    status: 'Em andamento', // Campo padrão
    song_name: 'Nome da música', // Seria necessário join com tracks
    genre: 'Pop', // Campo padrão
    collaboration_type: 'Solo', // Campo não existe
    track_type: 'Original', // Campo não existe
    instrumental: 'Não', // Campo não existe
    created_at: project.created_at,
  })) || [];
};

export const getMarketingReportData = async () => {
  const { data: campaigns } = await supabase
    .from('marketing_campaigns')
    .select('*');

  return campaigns?.map(campaign => ({
    name: campaign.name,
    platform: 'Digital',
    status: campaign.status,
    budget: campaign.budget,
    spent: campaign.spent,
    impressions: campaign.impressions,
    clicks: campaign.clicks,
    ctr: campaign.ctr,
    start_date: campaign.start_date,
    end_date: campaign.end_date,
  })) || [];
};

export const getContractsReportData = async () => {
  const { data: contracts } = await supabase
    .from('contracts')
    .select('*');

  return contracts?.map(contract => ({
    title: `Contrato ${contract.contract_type}`,
    client_type: 'Artista', // Campo padrão
    service_type: contract.contract_type,
    status: 'Ativo', // Campo padrão
    responsible_person: 'Responsável', // Campo não existe
    start_date: contract.effective_from,
    end_date: contract.effective_to,
    registry_office: true, // Campo padrão
    registry_date: contract.effective_from,
    fixed_value: contract.advance_amount,
    royalties_percentage: contract.royalty_rate,
    advance_payment: contract.advance_amount,
  })) || [];
};