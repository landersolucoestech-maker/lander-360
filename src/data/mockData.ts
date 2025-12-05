// Mock data for the entire Gestão 360 system

export const mockArtists = [
  {
    id: "1",
    name: "João Silva",
    genre: "Sertanejo",
    status: "Ativo",
    email: "joao@email.com",
    avatar: null,
    socialMedia: { instagram: "@joaosilva", spotify: "joaosilva" },
    stats: { projetos: 3, obras: 24, lancamentos: 8 },
    profile: { nome: "João da Silva Santos", email: "joao@email.com", telefone: "(11) 99999-1111" },
    gravadora: "Gravadora 360"
  },
  {
    id: "2",
    name: "Maria Santos",
    genre: "Pop",
    status: "Ativo",
    email: "maria@email.com",
    avatar: null,
    socialMedia: { instagram: "@mariasantos", spotify: "mariasantos" },
    stats: { projetos: 2, obras: 18, lancamentos: 5 },
    profile: { nome: "Maria Santos Oliveira", email: "maria@email.com", telefone: "(11) 99999-2222" },
    gravadora: "Indie Records"
  },
  {
    id: "3",
    name: "Pedro Costa",
    genre: "Rock",
    status: "Ativo",
    email: "pedro@email.com",
    avatar: null,
    socialMedia: { instagram: "@pedrocosta", spotify: "pedrocosta" },
    stats: { projetos: 5, obras: 32, lancamentos: 12 },
    profile: { nome: "Pedro Costa Lima", email: "pedro@email.com", telefone: "(11) 99999-3333" },
    gravadora: "Gravadora 360"
  },
  {
    id: "4",
    name: "Ana Beatriz",
    genre: "MPB",
    status: "Inativo",
    email: "ana@email.com",
    avatar: null,
    socialMedia: { instagram: "@anabeatriz", spotify: "anabeatriz" },
    stats: { projetos: 1, obras: 15, lancamentos: 4 },
    profile: { nome: "Ana Beatriz Ferreira", email: "ana@email.com", telefone: "(11) 99999-4444" },
    gravadora: "Pop Music Label"
  },
  {
    id: "5",
    name: "Lucas Ferreira",
    genre: "Funk",
    status: "Ativo",
    email: "lucas@email.com",
    avatar: null,
    socialMedia: { instagram: "@lucasferreira", spotify: "lucasferreira" },
    stats: { projetos: 4, obras: 45, lancamentos: 20 },
    profile: { nome: "Lucas Ferreira da Silva", email: "lucas@email.com", telefone: "(11) 99999-5555" },
    gravadora: "Gravadora 360"
  }
];

export const mockProjects = [
  {
    id: "1",
    name: "EP Verão 2024",
    status: "Em Andamento",
    type: "EP",
    genre: "Sertanejo",
    compositors: "João Silva, Pedro Costa",
    interpreters: "João Silva",
    djProducer: "DJ Max",
    startDate: "2024-01-15",
    endDate: "2024-03-30",
    budget: "R$ 85.000,00",
    progress: 65
  },
  {
    id: "2",
    name: "Álbum Infinito",
    status: "Planejamento",
    type: "Álbum",
    genre: "Pop",
    compositors: "Maria Santos",
    interpreters: "Maria Santos",
    djProducer: "Beat Factory",
    startDate: "2024-04-01",
    endDate: "2024-08-15",
    budget: "R$ 150.000,00",
    progress: 15
  },
  {
    id: "3",
    name: "Single Noturno",
    status: "Concluído",
    type: "Single",
    genre: "Rock",
    compositors: "Pedro Costa",
    interpreters: "Pedro Costa",
    djProducer: "Rock Studio",
    startDate: "2024-01-01",
    endDate: "2024-02-15",
    budget: "R$ 25.000,00",
    progress: 100
  }
];

export const mockSongs = [
  {
    id: "1",
    title: "Verão Sem Fim",
    artist: "João Silva",
    genre: "Sertanejo",
    status: "Registrado",
    isrc: "BRXXX2401234",
    iswc: "T-123.456.789-1",
    ecad: "1234567",
    duration: "3:45",
    registrationDate: "15/01/2024",
    bpm: 128,
    key: "C Major",
    composers: ["Carlos Mendes", "Roberto Lima"],
    performers: ["João Silva"],
    producers: ["DJ Wilton"]
  },
  {
    id: "2",
    title: "Noite Perdida",
    artist: "Maria Santos",
    genre: "Pop",
    status: "Pendente",
    isrc: "BRXXX2401235",
    iswc: "T-123.456.789-2",
    ecad: "1234568",
    duration: "4:12",
    registrationDate: "20/01/2024",
    bpm: 120,
    key: "G Major",
    composers: ["Maria Santos", "Ana Paula"],
    performers: ["Maria Santos", "Pedro Costa"],
    producers: ["Lucas Produções"]
  },
  {
    id: "3",
    title: "Rock da Madrugada",
    artist: "Pedro Costa",
    genre: "Rock",
    status: "Registrado",
    isrc: "BRXXX2401236",
    iswc: "T-123.456.789-3",
    ecad: "1234569",
    duration: "5:30",
    registrationDate: "10/01/2024",
    bpm: 140,
    key: "E Minor",
    composers: ["Pedro Costa"],
    performers: ["Pedro Costa", "Banda Noturna"],
    producers: ["Rock Studio", "Fernando Beats"]
  },
  {
    id: "4",
    title: "Saudade de Você",
    artist: "Ana Beatriz",
    genre: "MPB",
    status: "Revisão",
    isrc: "BRXXX2401237",
    iswc: "T-123.456.789-4",
    ecad: "1234570",
    duration: "4:45",
    registrationDate: "25/01/2024",
    bpm: 95,
    key: "A Minor",
    composers: ["Ana Beatriz", "Tom Veloso"],
    performers: ["Ana Beatriz"],
    producers: ["MPB Records"]
  }
];

export const mockReleases = [
  {
    id: "1",
    title: "Preferida",
    artist: "DJ Wilton",
    type: "Single",
    status: "Programado",
    releaseDate: "2025-12-10",
    platforms: ["Spotify", "Apple Music", "YouTube Music", "Deezer"],
    streams: "0",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=500&fit=crop",
    approvalStatus: "pendente" as const,
    priority: "alta" as const
  },
  {
    id: "2",
    title: "Noite Perdida",
    artist: "Maria Santos",
    type: "Single",
    status: "Programado",
    releaseDate: "2025-12-20",
    platforms: ["Spotify", "Apple Music", "Deezer"],
    streams: "0",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=500&fit=crop",
    approvalStatus: "aceita" as const,
    priority: "media" as const
  },
  {
    id: "3",
    title: "Rock Sessions",
    artist: "Pedro Costa",
    type: "Álbum",
    status: "Lançado",
    releaseDate: "2024-12-20",
    platforms: ["Spotify", "Apple Music", "YouTube Music", "Deezer", "Tidal"],
    streams: "5.8M",
    cover: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400&h=500&fit=crop",
    approvalStatus: "aceita" as const,
    priority: "baixa" as const
  },
  {
    id: "4",
    title: "Funk das Antigas",
    artist: "Lucas Ferreira",
    type: "Single",
    status: "Programado",
    releaseDate: "2025-12-25",
    platforms: ["Spotify", "Apple Music"],
    streams: "0",
    cover: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=400&h=500&fit=crop",
    approvalStatus: "recusada" as const,
    priority: "alta" as const
  },
  {
    id: "5",
    title: "EP Verão Total",
    artist: "João Silva",
    type: "EP",
    status: "Lançado",
    releaseDate: "2024-01-15",
    platforms: ["Spotify", "Apple Music", "YouTube Music", "Deezer"],
    streams: "2.5M",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=500&fit=crop",
    approvalStatus: "aceita" as const,
    priority: "baixa" as const
  },
  {
    id: "6",
    title: "Infinito",
    artist: "Ana Beatriz",
    type: "Álbum",
    status: "Programado",
    releaseDate: "2025-12-15",
    platforms: ["Spotify", "Apple Music", "Deezer"],
    streams: "0",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=500&fit=crop",
    approvalStatus: "em_espera" as const,
    priority: "media" as const
  },
  {
    id: "7",
    title: "Melodia Urbana",
    artist: "DJ Wilton",
    type: "Single",
    status: "Programado",
    releaseDate: "2025-12-30",
    platforms: ["Spotify", "Apple Music", "YouTube Music"],
    streams: "0",
    cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=500&fit=crop",
    approvalStatus: "pendente" as const,
    priority: "media" as const
  },
  {
    id: "8",
    title: "Sunset Vibes",
    artist: "Maria Santos",
    type: "EP",
    status: "Programado",
    releaseDate: "2026-01-10",
    platforms: ["Spotify", "Apple Music", "Deezer", "Tidal"],
    streams: "0",
    cover: "https://images.unsplash.com/photo-1446057032654-9d8885db76c6?w=400&h=500&fit=crop",
    approvalStatus: "em_espera" as const,
    priority: "alta" as const
  }
];

export const mockContracts = [
  {
    id: "1",
    title: "Contrato de Empresariamento - João Silva",
    service_type: "empresariamento",
    status: "assinado",
    client_type: "artista",
    responsible_person: "Carlos Gerente",
    start_date: "2024-01-01",
    end_date: "2026-12-31",
    fixed_value: 50000,
    royalties_percentage: 15
  },
  {
    id: "2",
    title: "Contrato de Distribuição - Maria Santos",
    service_type: "distribuicao",
    status: "assinado",
    client_type: "artista",
    responsible_person: "Ana Coordenadora",
    start_date: "2024-02-01",
    end_date: "2025-01-31",
    fixed_value: 30000,
    royalties_percentage: 20
  },
  {
    id: "3",
    title: "Contrato de Marketing - Pedro Costa",
    service_type: "marketing",
    status: "pendente",
    client_type: "artista",
    responsible_person: "João Marketing",
    start_date: "2024-03-01",
    end_date: "2024-12-31",
    fixed_value: 25000,
    royalties_percentage: 10
  },
  {
    id: "4",
    title: "Contrato de Produção Musical - Lucas Ferreira",
    service_type: "producao_musical",
    status: "assinado",
    client_type: "artista",
    responsible_person: "Pedro Produtor",
    start_date: "2024-01-15",
    end_date: "2024-07-15",
    fixed_value: 80000,
    royalties_percentage: 12
  }
];

export const mockTransactions = [
  {
    id: "1",
    description: "Receita com Streams - Spotify",
    transaction_type: "entrada",
    amount: 15230,
    category: "streaming",
    status: "pago",
    transaction_date: "2024-01-15",
    payment_method: "Transferência"
  },
  {
    id: "2",
    description: "Show em São Paulo - Festival",
    transaction_type: "entrada",
    amount: 82500,
    category: "shows",
    status: "aprovado",
    transaction_date: "2024-01-20",
    payment_method: "Boleto"
  },
  {
    id: "3",
    description: "Produção Musical - Estúdio ABC",
    transaction_type: "saida",
    amount: 8450,
    category: "producao",
    status: "pago",
    transaction_date: "2024-01-10",
    payment_method: "PIX"
  },
  {
    id: "4",
    description: "Marketing Digital - Campanha Instagram",
    transaction_type: "saida",
    amount: 5000,
    category: "marketing",
    status: "pago",
    transaction_date: "2024-01-25",
    payment_method: "Cartão"
  },
  {
    id: "5",
    description: "Licenciamento - Trilha Novela",
    transaction_type: "entrada",
    amount: 45000,
    category: "licenciamento",
    status: "pendente",
    transaction_date: "2024-02-01",
    payment_method: "Transferência"
  }
];

export const mockEvents = [
  {
    id: "1",
    event_name: "Gravação Estúdio - João Silva",
    event_type: "sessoes_estudio",
    status: "confirmado",
    start_date: new Date().toISOString().split('T')[0],
    start_time: "14:00",
    end_time: "18:00",
    location: "Estúdio 360 - Sala A"
  },
  {
    id: "2",
    event_name: "Show - Festival de Verão",
    event_type: "shows",
    status: "confirmado",
    start_date: new Date().toISOString().split('T')[0],
    start_time: "21:00",
    end_time: "23:00",
    location: "Arena São Paulo"
  },
  {
    id: "3",
    event_name: "Sessão de Fotos - Capa EP",
    event_type: "sessoes_fotos",
    status: "agendado",
    start_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    start_time: "10:00",
    end_time: "13:00",
    location: "Estúdio Foto Arte"
  },
  {
    id: "4",
    event_name: "Entrevista - Podcast Música Brasil",
    event_type: "podcasts",
    status: "pendente",
    start_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    start_time: "15:00",
    end_time: "16:30",
    location: "Online - Zoom"
  }
];

export const mockInvoices = [
  {
    id: "1",
    number: "NF-2024-001",
    client: "Spotify Brasil",
    description: "Royalties - Janeiro 2024",
    type: "Royalties",
    status: "Paga",
    issueDate: "01/02/2024",
    dueDate: "15/02/2024",
    amount: "R$ 15.230,00"
  },
  {
    id: "2",
    number: "NF-2024-002",
    client: "Empresa XYZ Eventos",
    description: "Cachê Show São Paulo",
    type: "Apresentação",
    status: "Emitida",
    issueDate: "20/01/2024",
    dueDate: "20/02/2024",
    amount: "R$ 82.500,00"
  },
  {
    id: "3",
    number: "NF-2024-003",
    client: "TV Globo",
    description: "Licenciamento Trilha Novela",
    type: "Royalties",
    status: "Pendente",
    issueDate: "01/02/2024",
    dueDate: "01/03/2024",
    amount: "R$ 45.000,00"
  },
  {
    id: "4",
    number: "NF-2024-004",
    client: "Marketing Agency",
    description: "Produção Conteúdo Digital",
    type: "Marketing",
    status: "Paga",
    issueDate: "15/01/2024",
    dueDate: "30/01/2024",
    amount: "R$ 12.800,00"
  }
];

export const mockEquipment = [
  {
    id: "1",
    name: "Microfone Shure SM58",
    category: "Microfone",
    status: "Disponível",
    quantity: 5,
    location: "Estúdio A",
    value: "R$ 4.250,00",
    lastMaintenance: "10/01/2024"
  },
  {
    id: "2",
    name: "Fone Sony MDR-7506",
    category: "Fone",
    status: "Em Uso",
    quantity: 10,
    location: "Estúdio A",
    value: "R$ 3.500,00",
    lastMaintenance: "05/01/2024"
  },
  {
    id: "3",
    name: "Monitor Yamaha HS8",
    category: "Monitor",
    status: "Disponível",
    quantity: 4,
    location: "Estúdio B",
    value: "R$ 8.400,00",
    lastMaintenance: "20/12/2023"
  },
  {
    id: "4",
    name: "Guitarra Fender Stratocaster",
    category: "Instrumento",
    status: "Manutenção",
    quantity: 2,
    location: "Depósito",
    value: "R$ 6.400,00",
    lastMaintenance: "01/02/2024"
  },
  {
    id: "5",
    name: "Interface Focusrite Scarlett 18i20",
    category: "Interface",
    status: "Em Uso",
    quantity: 3,
    location: "Estúdio A",
    value: "R$ 7.500,00",
    lastMaintenance: "15/01/2024"
  }
];

export const mockContacts = [
  {
    id: "1",
    name: "Carlos Oliveira",
    type: "Produtor Musical",
    status: "Quente",
    priority: "Alta",
    email: "carlos@produtora.com",
    phone: "(11) 98765-4321",
    lastContact: "15/01/2024",
    nextAction: "Reunião de proposta"
  },
  {
    id: "2",
    name: "Ana Paula Silva",
    type: "Gravadora",
    status: "Negociação",
    priority: "Média",
    email: "ana@gravadora.com",
    phone: "(11) 99876-5432",
    lastContact: "20/01/2024",
    nextAction: "Enviar contrato"
  },
  {
    id: "3",
    name: "Roberto Mendes",
    type: "Promotor de Eventos",
    status: "Prospect",
    priority: "Média",
    email: "roberto@eventos.com",
    phone: "(21) 98765-1234",
    lastContact: "10/01/2024",
    nextAction: "Follow-up telefone"
  },
  {
    id: "4",
    name: "Fernanda Costa",
    type: "Mídia/Imprensa",
    status: "Quente",
    priority: "Alta",
    email: "fernanda@revista.com",
    phone: "(11) 97654-3210",
    lastContact: "25/01/2024",
    nextAction: "Entrevista agendada"
  }
];

export const mockCampaigns = [
  {
    id: "1",
    name: "Lançamento EP Verão 2024",
    type: "Lançamento",
    status: "Ativa",
    platform: "Instagram, TikTok, YouTube",
    budget: "R$ 25.000",
    reach: "2.5M",
    engagement: "8.5%",
    clicks: "45K",
    roi: "320%"
  },
  {
    id: "2",
    name: "Promoção Single Noturno",
    type: "Promoção",
    status: "Ativa",
    platform: "Spotify, Instagram",
    budget: "R$ 15.000",
    reach: "1.2M",
    engagement: "6.2%",
    clicks: "28K",
    roi: "180%"
  },
  {
    id: "3",
    name: "Divulgação Festival de Verão",
    type: "Evento",
    status: "Planejada",
    platform: "Facebook, Instagram",
    budget: "R$ 10.000",
    reach: "0",
    engagement: "0%",
    clicks: "0",
    roi: "0%"
  },
  {
    id: "4",
    name: "Branding Pedro Costa",
    type: "Branding",
    status: "Finalizada",
    platform: "YouTube, Instagram",
    budget: "R$ 30.000",
    reach: "5.8M",
    engagement: "9.1%",
    clicks: "120K",
    roi: "450%"
  }
];

export const mockTasks = [
  {
    id: "1",
    title: "Criar artes para Instagram",
    campaign: "Lançamento EP Verão 2024",
    status: "em_andamento",
    priority: "alta",
    assignee: "Design Team",
    dueDate: "28/01/2024",
    progress: 75
  },
  {
    id: "2",
    title: "Editar vídeo TikTok",
    campaign: "Lançamento EP Verão 2024",
    status: "pendente",
    priority: "média",
    assignee: "Video Team",
    dueDate: "30/01/2024",
    progress: 0
  },
  {
    id: "3",
    title: "Montar planejamento mensal",
    campaign: "Geral",
    status: "concluída",
    priority: "alta",
    assignee: "Marketing Manager",
    dueDate: "15/01/2024",
    progress: 100
  },
  {
    id: "4",
    title: "Análise de métricas semanais",
    campaign: "Promoção Single Noturno",
    status: "em_andamento",
    priority: "média",
    assignee: "Analytics Team",
    dueDate: "31/01/2024",
    progress: 50
  }
];

export const mockBriefings = [
  {
    id: "1",
    title: "Campanha Lançamento EP Verão",
    campaign: "Lançamento EP Verão 2024",
    status: "aprovado",
    priority: "alta",
    budget: 25000,
    deadline: "2024-02-15",
    target_audience: "Jovens 18-35, fãs de sertanejo",
    deliverables: ["5 posts Instagram", "3 vídeos TikTok", "1 vídeo YouTube"]
  },
  {
    id: "2",
    title: "Press Release Single",
    campaign: "Promoção Single Noturno",
    status: "pendente",
    priority: "média",
    budget: 5000,
    deadline: "2024-03-01",
    target_audience: "Mídia especializada, influenciadores",
    deliverables: ["Press release", "Kit de imprensa", "Fotos promocionais"]
  }
];

export const mockUsers = [
  {
    id: "1",
    full_name: "Carlos Gerente",
    email: "carlos@gestao360.com",
    phone: "(11) 99999-0001",
    sector: "Administração",
    roles: ["admin"],
    isActive: true,
    created_at: "2023-01-15"
  },
  {
    id: "2",
    full_name: "Ana Coordenadora",
    email: "ana@gestao360.com",
    phone: "(11) 99999-0002",
    sector: "Marketing",
    roles: ["manager"],
    isActive: true,
    created_at: "2023-03-20"
  },
  {
    id: "3",
    full_name: "Pedro Produtor",
    email: "pedro@gestao360.com",
    phone: "(11) 99999-0003",
    sector: "Produção",
    roles: ["producer"],
    isActive: true,
    created_at: "2023-06-10"
  },
  {
    id: "4",
    full_name: "Maria Assistente",
    email: "maria@gestao360.com",
    phone: "(11) 99999-0004",
    sector: "Atendimento",
    roles: ["user"],
    isActive: false,
    created_at: "2023-08-05"
  }
];

export const mockReports = [
  {
    id: "1",
    name: "Relatório Financeiro - Janeiro 2024",
    description: "Análise completa de receitas e despesas do mês",
    type: "Financeiro",
    status: "Concluído",
    author: "Carlos Gerente",
    createdAt: "2024-02-01",
    size: "2.4 MB"
  },
  {
    id: "2",
    name: "Performance de Artistas Q1",
    description: "Métricas de streaming e engajamento dos artistas",
    type: "Artistas",
    status: "Concluído",
    author: "Ana Coordenadora",
    createdAt: "2024-01-25",
    size: "1.8 MB"
  },
  {
    id: "3",
    name: "Catálogo Musical Atualizado",
    description: "Lista completa de músicas registradas",
    type: "Músicas",
    status: "Em andamento",
    author: "Pedro Produtor",
    createdAt: "2024-01-28",
    size: "3.2 MB"
  }
];

// Dashboard statistics
export const mockDashboardStats = {
  totalWorks: 134,
  activeArtists: 5,
  activeContracts: 4,
  monthlyRevenue: 142730
};
