import { createContext, useContext, ReactNode, useMemo } from 'react';

// Check if we're in capture mode
export const isCaptureMode = () => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.has('__capture');
};

// Demo data for screenshots
export const demoArtists = [
  {
    id: '1',
    name: 'Marina Silva',
    full_name: 'Marina Silva',
    genre: 'Pop',
    email: 'marina@email.com',
    phone: '(11) 99999-1111',
    contract_status: 'Ativo',
    spotify_url: 'https://open.spotify.com/artist/example1',
    instagram: '@marinasilva',
    image_url: null,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Carlos Eduardo Santos',
    full_name: 'Carlos Eduardo Silva',
    genre: 'Hip Hop',
    email: 'cadu@email.com',
    phone: '(21) 98888-2222',
    contract_status: 'Ativo',
    spotify_url: 'https://open.spotify.com/artist/example2',
    instagram: '@caduhiphop',
    image_url: null,
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z',
  },
  {
    id: '3',
    name: 'Fernanda Costa',
    full_name: 'Fernanda Costa',
    genre: 'MPB',
    email: 'fer@email.com',
    phone: '(31) 97777-3333',
    contract_status: 'Em Negociação',
    spotify_url: 'https://open.spotify.com/artist/example3',
    instagram: '@fercosta',
    image_url: null,
    created_at: '2024-01-05T10:00:00Z',
    updated_at: '2024-01-05T10:00:00Z',
  },
  {
    id: '4',
    name: 'André Oliveira',
    full_name: 'André Santos',
    genre: 'Rock',
    email: 'dre@email.com',
    phone: '(41) 96666-4444',
    contract_status: 'Ativo',
    spotify_url: null,
    instagram: '@drerock',
    image_url: null,
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-01T10:00:00Z',
  },
  {
    id: '5',
    name: 'Julia Mendes',
    full_name: 'Julia Mendes',
    genre: 'Eletrônico',
    email: 'julz@email.com',
    phone: '(51) 95555-5555',
    contract_status: 'Inativo',
    spotify_url: 'https://open.spotify.com/artist/example5',
    instagram: '@julzdj',
    image_url: null,
    created_at: '2023-12-15T10:00:00Z',
    updated_at: '2023-12-15T10:00:00Z',
  },
];

export const demoProjects = [
  {
    id: '1',
    name: 'Álbum Verão 2024',
    description: 'Novo álbum de estúdio com 12 faixas',
    status: 'Em Andamento',
    start_date: '2024-01-01',
    end_date: '2024-06-30',
    artist_id: '1',
    budget: 150000,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    artist: demoArtists[0],
  },
  {
    id: '2',
    name: 'EP Trap Collection',
    description: 'EP com 5 faixas de trap',
    status: 'Concluído',
    start_date: '2023-10-01',
    end_date: '2024-01-15',
    artist_id: '2',
    budget: 80000,
    created_at: '2023-10-01T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    artist: demoArtists[1],
  },
  {
    id: '3',
    name: 'Single Primavera',
    description: 'Lançamento single promocional',
    status: 'Planejado',
    start_date: '2024-03-01',
    end_date: '2024-04-15',
    artist_id: '3',
    budget: 25000,
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-01T10:00:00Z',
    artist: demoArtists[2],
  },
];

export const demoTransactions = [
  {
    id: '1',
    description: 'Receita de Streaming - Spotify',
    amount: 45000,
    type: 'receita',
    category: 'Streaming',
    date: '2024-01-15',
    status: 'Confirmado',
    artist_id: '1',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    artist: demoArtists[0],
  },
  {
    id: '2',
    description: 'Produção Musical - Estúdio',
    amount: 12000,
    type: 'despesa',
    category: 'Produção',
    date: '2024-01-10',
    status: 'Pago',
    artist_id: '2',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z',
    artist: demoArtists[1],
  },
  {
    id: '3',
    description: 'Show ao Vivo - Festival',
    amount: 85000,
    type: 'receita',
    category: 'Shows',
    date: '2024-01-20',
    status: 'Pendente',
    artist_id: '1',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z',
    artist: demoArtists[0],
  },
  {
    id: '4',
    description: 'Marketing Digital',
    amount: 8500,
    type: 'despesa',
    category: 'Marketing',
    date: '2024-01-18',
    status: 'Pago',
    artist_id: '3',
    created_at: '2024-01-18T10:00:00Z',
    updated_at: '2024-01-18T10:00:00Z',
    artist: demoArtists[2],
  },
  {
    id: '5',
    description: 'Licenciamento para Publicidade',
    amount: 35000,
    type: 'receita',
    category: 'Licenciamento',
    date: '2024-01-25',
    status: 'Confirmado',
    artist_id: '4',
    created_at: '2024-01-25T10:00:00Z',
    updated_at: '2024-01-25T10:00:00Z',
    artist: demoArtists[3],
  },
];

export const demoContracts = [
  {
    id: '1',
    title: 'Contrato de Gravação Exclusiva',
    artist_id: '1',
    contract_type: 'Gravação',
    status: 'Ativo',
    start_date: '2024-01-01',
    end_date: '2026-12-31',
    value: 500000,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
    artist: demoArtists[0],
  },
  {
    id: '2',
    title: 'Contrato de Distribuição Digital',
    artist_id: '2',
    contract_type: 'Distribuição',
    status: 'Ativo',
    start_date: '2023-06-01',
    end_date: '2025-05-31',
    value: 200000,
    created_at: '2023-06-01T10:00:00Z',
    updated_at: '2023-06-01T10:00:00Z',
    artist: demoArtists[1],
  },
  {
    id: '3',
    title: 'Contrato de Management',
    artist_id: '3',
    contract_type: 'Management',
    status: 'Em Análise',
    start_date: '2024-03-01',
    end_date: '2027-02-28',
    value: 150000,
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-01T10:00:00Z',
    artist: demoArtists[2],
  },
];

export const demoReleases = [
  {
    id: '1',
    title: 'Noite de Verão',
    artist_id: '1',
    release_type: 'Single',
    release_date: '2024-02-14',
    status: 'Lançado',
    upc: '1234567890123',
    label: 'Lander Music',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-02-14T10:00:00Z',
    artist: demoArtists[0],
  },
  {
    id: '2',
    title: 'Trap Nation Vol. 2',
    artist_id: '2',
    release_type: 'EP',
    release_date: '2024-01-15',
    status: 'Lançado',
    upc: '9876543210987',
    label: 'Lander Music',
    created_at: '2023-12-01T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    artist: demoArtists[1],
  },
  {
    id: '3',
    title: 'Acústico Sessions',
    artist_id: '3',
    release_type: 'Álbum',
    release_date: '2024-04-01',
    status: 'Em Produção',
    upc: null,
    label: 'Lander Music',
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-01T10:00:00Z',
    artist: demoArtists[2],
  },
];

export const demoMusics = [
  {
    id: '1',
    title: 'Noite de Verão',
    artist_id: '1',
    isrc: 'BRXXX2400001',
    iswc: 'T-123.456.789-0',
    duration: 210,
    genre: 'Pop',
    bpm: 120,
    composers: ['Marina Silva', 'João Compositor'],
    publishers: ['Lander Publishing'],
    status: 'Registrado',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    artist: demoArtists[0],
  },
  {
    id: '2',
    title: 'Trap Flow',
    artist_id: '2',
    isrc: 'BRXXX2400002',
    iswc: 'T-123.456.789-1',
    duration: 185,
    genre: 'Hip Hop',
    bpm: 140,
    composers: ['Carlos Eduardo Santos'],
    publishers: ['Lander Publishing'],
    status: 'Registrado',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z',
    artist: demoArtists[1],
  },
  {
    id: '3',
    title: 'Saudade de Você',
    artist_id: '3',
    isrc: 'BRXXX2400003',
    iswc: null,
    duration: 240,
    genre: 'MPB',
    bpm: 90,
    composers: ['Fernanda Costa'],
    publishers: ['Lander Publishing'],
    status: 'Pendente',
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-01T10:00:00Z',
    artist: demoArtists[2],
  },
];

export const demoEvents = [
  {
    id: '1',
    title: 'Show Festival de Verão',
    artist_id: '1',
    start_date: '2024-02-15',
    end_date: '2024-02-15',
    start_time: '21:00',
    end_time: '23:00',
    location: 'São Paulo, SP',
    venue_name: 'Allianz Parque',
    event_type: 'Show',
    status: 'Confirmado',
    expected_audience: 45000,
    ticket_price: 250,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'Gravação Clipe',
    artist_id: '2',
    start_date: '2024-02-20',
    end_date: '2024-02-21',
    start_time: '08:00',
    end_time: '18:00',
    location: 'Rio de Janeiro, RJ',
    venue_name: 'Estúdio Lander',
    event_type: 'Gravação',
    status: 'Confirmado',
    expected_audience: null,
    ticket_price: null,
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z',
  },
  {
    id: '3',
    title: 'Entrevista Podcast',
    artist_id: '3',
    start_date: '2024-02-25',
    end_date: '2024-02-25',
    start_time: '14:00',
    end_time: '16:00',
    location: 'Online',
    venue_name: 'Spotify Studios',
    event_type: 'Entrevista',
    status: 'Pendente',
    expected_audience: null,
    ticket_price: null,
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-01T10:00:00Z',
  },
];

export const demoContacts = [
  {
    id: '1',
    name: 'Roberto Almeida',
    email: 'roberto@distribuidora.com',
    phone: '(11) 99999-0001',
    company: 'Super Distribuidora',
    position: 'Diretor Comercial',
    contact_type: 'Distribuidor',
    status: 'Ativo',
    priority: 'Alta',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Carla Fernandes',
    email: 'carla@radiobrasileira.com',
    phone: '(21) 98888-0002',
    company: 'Rádio Brasileira FM',
    position: 'Diretora de Programação',
    contact_type: 'Rádio',
    status: 'Ativo',
    priority: 'Alta',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z',
  },
  {
    id: '3',
    name: 'Felipe Torres',
    email: 'felipe@agenciamkt.com',
    phone: '(31) 97777-0003',
    company: 'Agência Marketing Digital',
    position: 'CEO',
    contact_type: 'Marketing',
    status: 'Ativo',
    priority: 'Média',
    created_at: '2024-01-05T10:00:00Z',
    updated_at: '2024-01-05T10:00:00Z',
  },
];

export const demoInventory = [
  {
    id: '1',
    name: 'Microfone Neumann U87',
    category: 'Equipamento de Áudio',
    quantity: 4,
    unit_value: 15000,
    status: 'Disponível',
    location: 'Estúdio A',
    responsible: 'João Técnico',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Controladora Pioneer DDJ-1000',
    category: 'Equipamento DJ',
    quantity: 2,
    unit_value: 8000,
    status: 'Em Uso',
    location: 'Estúdio B',
    responsible: 'Maria Produtora',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z',
  },
  {
    id: '3',
    name: 'Monitor de Referência Genelec',
    category: 'Equipamento de Áudio',
    quantity: 8,
    unit_value: 12000,
    status: 'Disponível',
    location: 'Estúdio A',
    responsible: 'João Técnico',
    created_at: '2024-01-05T10:00:00Z',
    updated_at: '2024-01-05T10:00:00Z',
  },
];

export const demoUsers = [
  {
    id: '1',
    email: 'admin@lander.com',
    name: 'Administrador',
    role: 'admin',
    status: 'Ativo',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: '2',
    email: 'gerente@lander.com',
    name: 'Maria Gerente',
    role: 'manager',
    status: 'Ativo',
    created_at: '2024-01-05T10:00:00Z',
    updated_at: '2024-01-05T10:00:00Z',
  },
  {
    id: '3',
    email: 'producao@lander.com',
    name: 'João Produtor',
    role: 'producer',
    status: 'Ativo',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z',
  },
];

export const demoDashboardStats = {
  totalWorks: 156,
  activeArtists: 23,
  activeContracts: 18,
  monthlyRevenue: 485000,
  pendingPayments: 125000,
  upcomingEvents: 8,
  totalStreams: 45000000,
  newReleases: 12,
};

export const demoActivities = [
  {
    id: '1',
    action: 'Novo contrato assinado',
    entity: 'Contrato',
    entity_name: 'Contrato de Gravação - Marina Silva',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    user_name: 'Admin',
  },
  {
    id: '2',
    action: 'Lançamento publicado',
    entity: 'Release',
    entity_name: 'Noite de Verão - Marina',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    user_name: 'Maria Gerente',
  },
  {
    id: '3',
    action: 'Pagamento recebido',
    entity: 'Financeiro',
    entity_name: 'Spotify - Janeiro 2024',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    user_name: 'Sistema',
  },
  {
    id: '4',
    action: 'Novo artista cadastrado',
    entity: 'Artista',
    entity_name: 'Julia Mendes (Julz)',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    user_name: 'Admin',
  },
];

// Context interface
interface DemoDataContextType {
  isDemo: boolean;
  artists: typeof demoArtists;
  projects: typeof demoProjects;
  transactions: typeof demoTransactions;
  contracts: typeof demoContracts;
  releases: typeof demoReleases;
  musics: typeof demoMusics;
  events: typeof demoEvents;
  contacts: typeof demoContacts;
  inventory: typeof demoInventory;
  users: typeof demoUsers;
  dashboardStats: typeof demoDashboardStats;
  activities: typeof demoActivities;
}

const DemoDataContext = createContext<DemoDataContextType | null>(null);

export const useDemoData = () => {
  const context = useContext(DemoDataContext);
  if (!context) {
    return {
      isDemo: false,
      artists: [],
      projects: [],
      transactions: [],
      contracts: [],
      releases: [],
      musics: [],
      events: [],
      contacts: [],
      inventory: [],
      users: [],
      dashboardStats: demoDashboardStats,
      activities: [],
    };
  }
  return context;
};

export const DemoDataProvider = ({ children }: { children: ReactNode }) => {
  const isDemo = isCaptureMode();

  const value = useMemo<DemoDataContextType>(() => ({
    isDemo,
    artists: isDemo ? demoArtists : [],
    projects: isDemo ? demoProjects : [],
    transactions: isDemo ? demoTransactions : [],
    contracts: isDemo ? demoContracts : [],
    releases: isDemo ? demoReleases : [],
    musics: isDemo ? demoMusics : [],
    events: isDemo ? demoEvents : [],
    contacts: isDemo ? demoContacts : [],
    inventory: isDemo ? demoInventory : [],
    users: isDemo ? demoUsers : [],
    dashboardStats: isDemo ? demoDashboardStats : { totalWorks: 0, activeArtists: 0, activeContracts: 0, monthlyRevenue: 0, pendingPayments: 0, upcomingEvents: 0, totalStreams: 0, newReleases: 0 },
    activities: isDemo ? demoActivities : [],
  }), [isDemo]);

  return (
    <DemoDataContext.Provider value={value}>
      {children}
    </DemoDataContext.Provider>
  );
};
