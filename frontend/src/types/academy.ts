// Academy Tutorial Types

export interface TutorialModule {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  order: number;
  moduleRoute: string;
  isRequired?: boolean;
  audioUrl?: string;
  screenshots: string[];
  checklist: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
}

export interface TutorialProgress {
  tutorialId: string;
  completedChecklist: string[];
  isCompleted: boolean;
  completedAt?: string;
}

// 24 Academy Tutorials Definition
export const ACADEMY_TUTORIALS: TutorialModule[] = [
  {
    id: 'start-hub',
    slug: 'start-hub',
    title: 'StartHub',
    subtitle: 'Primeiros Passos',
    description: 'Configure sua conta, personalize o sistema e dê os primeiros passos na plataforma.',
    icon: 'rocket',
    order: 1,
    moduleRoute: '/configuracoes',
    isRequired: true,
    screenshots: [],
    checklist: [
      { id: 'sh-1', label: 'Configurar perfil de usuário' },
      { id: 'sh-2', label: 'Definir preferências do sistema' },
      { id: 'sh-3', label: 'Conhecer a navegação principal' },
      { id: 'sh-4', label: 'Entender a estrutura de módulos' },
    ]
  },
  {
    id: 'control-tower',
    slug: 'control-tower',
    title: 'Control Tower',
    subtitle: 'Dashboard & Visão Geral',
    description: 'Acompanhe métricas, indicadores e tenha uma visão completa das operações.',
    icon: 'layout-dashboard',
    order: 2,
    moduleRoute: '/',
    screenshots: [],
    checklist: [
      { id: 'ct-1', label: 'Entender os cards de métricas' },
      { id: 'ct-2', label: 'Configurar widgets do dashboard' },
      { id: 'ct-3', label: 'Analisar gráficos de performance' },
      { id: 'ct-4', label: 'Acessar ações rápidas' },
    ]
  },
  {
    id: 'artist-core',
    slug: 'artist-core',
    title: 'Artist Core',
    subtitle: 'Gestão de Artistas',
    description: 'Cadastre, gerencie e acompanhe artistas com perfis completos e métricas.',
    icon: 'users',
    order: 3,
    moduleRoute: '/artistas',
    screenshots: [],
    checklist: [
      { id: 'ac-1', label: 'Cadastrar novo artista' },
      { id: 'ac-2', label: 'Configurar perfil completo' },
      { id: 'ac-3', label: 'Vincular redes sociais' },
      { id: 'ac-4', label: 'Gerenciar dados sensíveis' },
      { id: 'ac-5', label: 'Definir metas do artista' },
    ]
  },
  {
    id: 'copyright-hub',
    slug: 'copyright-hub',
    title: 'Copyright Hub',
    subtitle: 'Registro de Obras Musicais',
    description: 'Registre obras musicais, compositores, editoras e gerencie direitos autorais.',
    icon: 'file-music',
    order: 4,
    moduleRoute: '/registro-musicas',
    screenshots: [],
    checklist: [
      { id: 'ch-1', label: 'Registrar nova obra musical' },
      { id: 'ch-2', label: 'Cadastrar compositores e autores' },
      { id: 'ch-3', label: 'Vincular ISWC' },
      { id: 'ch-4', label: 'Definir splits de direitos autorais' },
    ]
  },
  {
    id: 'master-rights',
    slug: 'master-rights',
    title: 'Master Rights',
    subtitle: 'Registro de Fonogramas',
    description: 'Gerencie fonogramas, masters, ISRC e direitos conexos.',
    icon: 'disc',
    order: 5,
    moduleRoute: '/registro-musicas',
    screenshots: [],
    checklist: [
      { id: 'mr-1', label: 'Registrar fonograma' },
      { id: 'mr-2', label: 'Vincular ISRC' },
      { id: 'mr-3', label: 'Associar obra musical' },
      { id: 'mr-4', label: 'Configurar participantes' },
    ]
  },
  {
    id: 'release-factory',
    slug: 'release-factory',
    title: 'Release Factory',
    subtitle: 'Álbuns & Singles',
    description: 'Crie e gerencie lançamentos, produtos fonográficos e catálogo.',
    icon: 'album',
    order: 6,
    moduleRoute: '/lancamentos',
    screenshots: [],
    checklist: [
      { id: 'rf-1', label: 'Criar novo lançamento' },
      { id: 'rf-2', label: 'Definir tipo (single/EP/álbum)' },
      { id: 'rf-3', label: 'Adicionar faixas' },
      { id: 'rf-4', label: 'Configurar metadados' },
    ]
  },
  {
    id: 'project-flow',
    slug: 'project-flow',
    title: 'Project Flow',
    subtitle: 'Gestão de Projetos',
    description: 'Organize projetos, etapas, tarefas e acompanhe o progresso.',
    icon: 'folder-kanban',
    order: 7,
    moduleRoute: '/projetos',
    screenshots: [],
    checklist: [
      { id: 'pf-1', label: 'Criar novo projeto' },
      { id: 'pf-2', label: 'Definir etapas e milestones' },
      { id: 'pf-3', label: 'Atribuir responsáveis' },
      { id: 'pf-4', label: 'Acompanhar progresso' },
    ]
  },
  {
    id: 'launch-manager',
    slug: 'launch-manager',
    title: 'Launch Manager',
    subtitle: 'Lançamentos',
    description: 'Planeje, execute e monitore lançamentos musicais completos.',
    icon: 'rocket',
    order: 8,
    moduleRoute: '/lancamentos',
    screenshots: [],
    checklist: [
      { id: 'lm-1', label: 'Planejar cronograma de lançamento' },
      { id: 'lm-2', label: 'Configurar pré-save' },
      { id: 'lm-3', label: 'Definir data de release' },
      { id: 'lm-4', label: 'Monitorar métricas pós-lançamento' },
    ]
  },
  {
    id: 'digital-distribution',
    slug: 'digital-distribution',
    title: 'Digital Distribution',
    subtitle: 'Distribuição Digital',
    description: 'Distribua música para plataformas digitais e gerencie entregas.',
    icon: 'globe',
    order: 9,
    moduleRoute: '/lancamentos',
    screenshots: [],
    checklist: [
      { id: 'dd-1', label: 'Selecionar distribuidora' },
      { id: 'dd-2', label: 'Configurar plataformas de destino' },
      { id: 'dd-3', label: 'Enviar release para distribuição' },
      { id: 'dd-4', label: 'Acompanhar status de entrega' },
    ]
  },
  {
    id: 'royalty-watch',
    slug: 'royalty-watch',
    title: 'Royalty Watch',
    subtitle: 'Monitoramento',
    description: 'Monitore execuções, royalties e detecções em rádio e TV.',
    icon: 'radio',
    order: 10,
    moduleRoute: '/monitoramento',
    screenshots: [],
    checklist: [
      { id: 'rw-1', label: 'Visualizar detecções de rádio' },
      { id: 'rw-2', label: 'Analisar relatórios ECAD' },
      { id: 'rw-3', label: 'Identificar divergências' },
      { id: 'rw-4', label: 'Solicitar correções' },
    ]
  },
  {
    id: 'sync-licensing',
    slug: 'sync-licensing',
    title: 'Sync & Licensing',
    subtitle: 'Licenciamento',
    description: 'Gerencie licenças de sincronização para filmes, séries e publicidade.',
    icon: 'film',
    order: 11,
    moduleRoute: '/licenciamento',
    screenshots: [],
    checklist: [
      { id: 'sl-1', label: 'Cadastrar oportunidade de sync' },
      { id: 'sl-2', label: 'Definir termos de licenciamento' },
      { id: 'sl-3', label: 'Negociar valores' },
      { id: 'sl-4', label: 'Emitir contrato de licença' },
    ]
  },
  {
    id: 'rights-protection',
    slug: 'rights-protection',
    title: 'Rights Protection',
    subtitle: 'Takedowns',
    description: 'Proteja direitos autorais com ações de takedown e monitoramento.',
    icon: 'shield',
    order: 12,
    moduleRoute: '/takedowns',
    screenshots: [],
    checklist: [
      { id: 'rp-1', label: 'Identificar uso indevido' },
      { id: 'rp-2', label: 'Criar solicitação de takedown' },
      { id: 'rp-3', label: 'Acompanhar status' },
      { id: 'rp-4', label: 'Registrar resolução' },
    ]
  },
  {
    id: 'split-engine',
    slug: 'split-engine',
    title: 'Split Engine',
    subtitle: 'Gestão de Shares',
    description: 'Configure e gerencie divisão de royalties entre participantes.',
    icon: 'pie-chart',
    order: 13,
    moduleRoute: '/gestao-shares',
    screenshots: [],
    checklist: [
      { id: 'se-1', label: 'Definir splits por obra' },
      { id: 'se-2', label: 'Configurar participantes' },
      { id: 'se-3', label: 'Validar percentuais' },
      { id: 'se-4', label: 'Gerar relatórios de divisão' },
    ]
  },
  {
    id: 'contract-vault',
    slug: 'contract-vault',
    title: 'Contract Vault',
    subtitle: 'Contratos',
    description: 'Gerencie contratos, templates e assinaturas digitais.',
    icon: 'file-signature',
    order: 14,
    moduleRoute: '/contratos',
    screenshots: [],
    checklist: [
      { id: 'cv-1', label: 'Criar template de contrato' },
      { id: 'cv-2', label: 'Gerar contrato a partir do template' },
      { id: 'cv-3', label: 'Enviar para assinatura digital' },
      { id: 'cv-4', label: 'Arquivar contrato assinado' },
    ]
  },
  {
    id: 'revenue-center',
    slug: 'revenue-center',
    title: 'Revenue Center',
    subtitle: 'Financeiro',
    description: 'Controle receitas, despesas e fluxo de caixa.',
    icon: 'wallet',
    order: 15,
    moduleRoute: '/financeiro',
    screenshots: [],
    checklist: [
      { id: 'rc-1', label: 'Registrar receita' },
      { id: 'rc-2', label: 'Registrar despesa' },
      { id: 'rc-3', label: 'Categorizar transações' },
      { id: 'rc-4', label: 'Visualizar fluxo de caixa' },
    ]
  },
  {
    id: 'accounting-pro',
    slug: 'accounting-pro',
    title: 'Accounting Pro',
    subtitle: 'Contabilidade',
    description: 'Ferramentas contábeis, DRE e balanços financeiros.',
    icon: 'calculator',
    order: 16,
    moduleRoute: '/contabilidade',
    screenshots: [],
    checklist: [
      { id: 'ap-1', label: 'Configurar plano de contas' },
      { id: 'ap-2', label: 'Gerar DRE' },
      { id: 'ap-3', label: 'Exportar relatórios contábeis' },
      { id: 'ap-4', label: 'Integrar com contador' },
    ]
  },
  {
    id: 'fiscal-hub',
    slug: 'fiscal-hub',
    title: 'Fiscal Hub',
    subtitle: 'Nota Fiscal',
    description: 'Emita e gerencie notas fiscais de serviços.',
    icon: 'receipt',
    order: 17,
    moduleRoute: '/nota-fiscal',
    screenshots: [],
    checklist: [
      { id: 'fh-1', label: 'Configurar dados fiscais' },
      { id: 'fh-2', label: 'Emitir nota fiscal' },
      { id: 'fh-3', label: 'Consultar notas emitidas' },
      { id: 'fh-4', label: 'Exportar XML/PDF' },
    ]
  },
  {
    id: 'operations-hub',
    slug: 'operations-hub',
    title: 'Operations Hub',
    subtitle: 'Serviços, Agenda & Inventário',
    description: 'Gerencie serviços, agenda de eventos e inventário.',
    icon: 'briefcase',
    order: 18,
    moduleRoute: '/servicos',
    screenshots: [],
    checklist: [
      { id: 'oh-1', label: 'Cadastrar serviço' },
      { id: 'oh-2', label: 'Agendar evento' },
      { id: 'oh-3', label: 'Gerenciar inventário' },
      { id: 'oh-4', label: 'Controlar equipamentos' },
    ]
  },
  {
    id: 'relationship-manager',
    slug: 'relationship-manager',
    title: 'Relationship Manager',
    subtitle: 'CRM',
    description: 'Gerencie contatos, leads e relacionamentos comerciais.',
    icon: 'contact',
    order: 19,
    moduleRoute: '/crm',
    screenshots: [],
    checklist: [
      { id: 'rm-1', label: 'Cadastrar contato' },
      { id: 'rm-2', label: 'Registrar interações' },
      { id: 'rm-3', label: 'Classificar leads' },
      { id: 'rm-4', label: 'Acompanhar pipeline' },
    ]
  },
  {
    id: 'lander-connect',
    slug: 'lander-connect',
    title: 'Lander Connect',
    subtitle: 'Comunicação',
    description: 'Central de comunicação com WhatsApp e mensagens integradas.',
    icon: 'message-circle',
    order: 20,
    moduleRoute: '/lander',
    screenshots: [],
    checklist: [
      { id: 'lc-1', label: 'Conectar WhatsApp' },
      { id: 'lc-2', label: 'Gerenciar conversas' },
      { id: 'lc-3', label: 'Enviar mensagens' },
      { id: 'lc-4', label: 'Usar templates' },
    ]
  },
  {
    id: 'growth-studio',
    slug: 'growth-studio',
    title: 'Growth Studio',
    subtitle: 'Marketing',
    description: 'Crie campanhas, gerencie tarefas e acompanhe métricas de marketing.',
    icon: 'megaphone',
    order: 21,
    moduleRoute: '/marketing/visao-geral',
    screenshots: [],
    checklist: [
      { id: 'gs-1', label: 'Criar campanha de marketing' },
      { id: 'gs-2', label: 'Definir público-alvo' },
      { id: 'gs-3', label: 'Planejar calendário de conteúdo' },
      { id: 'gs-4', label: 'Analisar métricas' },
    ]
  },
  {
    id: 'creative-ai-lab',
    slug: 'creative-ai-lab',
    title: 'Creative AI Lab',
    subtitle: 'IA Criativa',
    description: 'Use inteligência artificial para gerar ideias e conteúdo criativo.',
    icon: 'sparkles',
    order: 22,
    moduleRoute: '/marketing/ia-criativa',
    screenshots: [],
    checklist: [
      { id: 'ca-1', label: 'Gerar ideias com IA' },
      { id: 'ca-2', label: 'Criar briefings automáticos' },
      { id: 'ca-3', label: 'Analisar tendências' },
      { id: 'ca-4', label: 'Otimizar conteúdo' },
    ]
  },
  {
    id: 'insights-audit',
    slug: 'insights-audit',
    title: 'Insights & Audit',
    subtitle: 'Relatórios & Auditoria',
    description: 'Gere relatórios, audite operações e tome decisões baseadas em dados.',
    icon: 'bar-chart-3',
    order: 23,
    moduleRoute: '/relatorios',
    screenshots: [],
    checklist: [
      { id: 'ia-1', label: 'Gerar relatório de obras' },
      { id: 'ia-2', label: 'Exportar dados para Excel' },
      { id: 'ia-3', label: 'Auditar operações' },
      { id: 'ia-4', label: 'Analisar tendências' },
    ]
  },
  {
    id: 'system-settings',
    slug: 'system-settings',
    title: 'System Settings',
    subtitle: 'Configurações',
    description: 'Configure usuários, permissões, integrações e preferências do sistema.',
    icon: 'settings',
    order: 24,
    moduleRoute: '/configuracoes',
    screenshots: [],
    checklist: [
      { id: 'ss-1', label: 'Gerenciar usuários' },
      { id: 'ss-2', label: 'Configurar permissões' },
      { id: 'ss-3', label: 'Ativar integrações' },
      { id: 'ss-4', label: 'Personalizar preferências' },
    ]
  }
];

export const getTutorialBySlug = (slug: string): TutorialModule | undefined => {
  return ACADEMY_TUTORIALS.find(t => t.slug === slug);
};

export const getNextTutorial = (currentSlug: string): TutorialModule | undefined => {
  const currentIndex = ACADEMY_TUTORIALS.findIndex(t => t.slug === currentSlug);
  if (currentIndex === -1 || currentIndex === ACADEMY_TUTORIALS.length - 1) return undefined;
  return ACADEMY_TUTORIALS[currentIndex + 1];
};

export const getPreviousTutorial = (currentSlug: string): TutorialModule | undefined => {
  const currentIndex = ACADEMY_TUTORIALS.findIndex(t => t.slug === currentSlug);
  if (currentIndex <= 0) return undefined;
  return ACADEMY_TUTORIALS[currentIndex - 1];
};
