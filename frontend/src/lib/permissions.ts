import { LayoutDashboard, Users, FolderOpen, Music, Upload, FileText, DollarSign, Calendar, Receipt, Package, UserCheck, BarChart3, UserCog, Megaphone, Settings, Briefcase, FileSearch, Scale, MessageCircle, Palette, Film, Shield, LucideIcon, Eye, Lock, PieChart } from "lucide-react";

// ================================================
// SISTEMA COMPLETO DE PERMISSÕES RBAC + ABAC
// ================================================

// 8 Perfis padrão conforme especificação
export type UserRole = 
  | 'admin'              // Administrador Master (acesso total)
  | 'gestor_artistico'   // A&R / Gestão Artística
  | 'financeiro'         // Financeiro / Contábil
  | 'juridico'           // Jurídico
  | 'marketing'          // Marketing
  | 'artista'            // Artista (usuário final)
  | 'colaborador'        // Colaborador / Freelancer
  | 'leitor';            // Leitor (Read-only)

// Setores disponíveis
export type Sector = 
  | 'producao'
  | 'administrativo'
  | 'financeiro'
  | 'marketing'
  | 'comercial'
  | 'tecnico'
  | 'artistico'
  | 'eventos'
  | 'juridico'
  | 'rh'
  | 'ti';

// Permissões por módulo
export type ModulePermission = 
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'submit'
  | 'approve'
  | 'export'
  | 'connect'
  | 'revoke'
  | 'sign'
  | 'calculate'
  | 'pay'
  | 'close_period'
  | 'invite';

// Módulos do sistema
export type SystemModule = 
  | 'artistas'
  | 'projetos'
  | 'lancamentos'
  | 'contratos'
  | 'royalties'
  | 'financeiro'
  | 'marketing'
  | 'integracoes'
  | 'usuarios'
  | 'relatorios'
  | 'configuracoes'
  | 'registro_musicas'
  | 'crm'
  | 'agenda'
  | 'inventario'
  | 'servicos'
  | 'nota_fiscal'
  | 'landerzap';

// Escopo de acesso
export type AccessScope = 'all' | 'artist' | 'project';

export interface NavigationItem {
  title: string;
  url: string;
  icon: LucideIcon;
  roles: UserRole[];
  module: SystemModule;
  scope?: 'empresa' | 'artista' | 'projeto' | 'personal';
}

export interface SubMenuItem {
  title: string;
  url: string;
  roles: UserRole[];
  module: SystemModule;
}

// Permissões padrão por perfil - MATRIZ ATUALIZADA
export const defaultRolePermissions: Record<UserRole, Partial<Record<SystemModule, ModulePermission[]>>> = {
  // 🔐 ADMINISTRADOR MASTER - Acesso total a todos os módulos
  admin: {
    artistas: ['view', 'create', 'edit', 'delete', 'export'],
    projetos: ['view', 'create', 'edit', 'delete', 'export'],
    lancamentos: ['view', 'create', 'submit', 'approve', 'export'],
    contratos: ['view', 'create', 'edit', 'delete', 'sign', 'approve', 'export'],
    royalties: ['view', 'calculate', 'edit', 'pay', 'export'],
    financeiro: ['view', 'create', 'edit', 'delete', 'export', 'close_period'],
    marketing: ['view', 'create', 'edit', 'delete', 'export'],
    integracoes: ['view', 'connect', 'revoke'],
    usuarios: ['view', 'invite', 'edit', 'delete'],
    relatorios: ['view', 'export'],
    configuracoes: ['view', 'edit'],
    registro_musicas: ['view', 'create', 'edit', 'delete', 'export'],
    crm: ['view', 'create', 'edit', 'delete', 'export'],
    agenda: ['view', 'create', 'edit', 'delete', 'export'],
    inventario: ['view', 'create', 'edit', 'delete', 'export'],
    servicos: ['view', 'create', 'edit', 'delete', 'export'],
    nota_fiscal: ['view', 'create', 'edit', 'delete', 'export'],
    landerzap: ['view', 'create', 'edit', 'delete'],
  },
  // 🎯 A&R / GESTÃO ARTÍSTICA
  gestor_artistico: {
    artistas: ['view', 'create', 'edit'],
    projetos: ['view', 'create', 'edit'],
    lancamentos: ['view', 'create', 'submit'],
    contratos: ['view'], // Apenas visualização
    royalties: ['view'],
    financeiro: [],
    marketing: ['view'],
    integracoes: ['view'],
    usuarios: [],
    relatorios: ['view'], // Relatórios artísticos
    configuracoes: [],
    registro_musicas: ['view', 'create', 'edit'], // Obras & Fonogramas
    crm: ['view'],
    agenda: ['view', 'create', 'edit'],
    inventario: [],
    servicos: ['view'],
    nota_fiscal: [],
    landerzap: ['view', 'create'],
  },
  // 💰 FINANCEIRO
  financeiro: {
    artistas: ['view'],
    projetos: ['view'],
    lancamentos: ['view'],
    contratos: ['view'],
    royalties: ['view', 'calculate', 'edit', 'pay', 'export'], // Gestão de Shares
    financeiro: ['view', 'create', 'edit', 'export', 'close_period'],
    marketing: [],
    integracoes: ['view'],
    usuarios: [],
    relatorios: ['view', 'export'], // Relatórios Financeiros
    configuracoes: [],
    registro_musicas: ['view'],
    crm: ['view'],
    agenda: ['view'],
    inventario: ['view'],
    servicos: ['view', 'edit'],
    nota_fiscal: ['view', 'create', 'edit', 'export'], // Nota Fiscal
    landerzap: [],
  },
  // ⚖️ JURÍDICO
  juridico: {
    artistas: ['view'],
    projetos: ['view'],
    lancamentos: ['view'],
    contratos: ['view', 'create', 'edit', 'sign', 'approve', 'export'], // Contratos
    royalties: ['view'],
    financeiro: [],
    marketing: [],
    integracoes: [],
    usuarios: [],
    relatorios: ['view'],
    configuracoes: [],
    registro_musicas: ['view', 'create', 'edit'], // Registro de Obras e Fonogramas
    crm: [],
    agenda: ['view'],
    inventario: [],
    servicos: [],
    nota_fiscal: [],
    landerzap: [],
  },
  // 📢 MARKETING
  marketing: {
    artistas: ['view'],
    projetos: ['view'],
    lancamentos: ['view'],
    contratos: [],
    royalties: [],
    financeiro: [],
    marketing: ['view', 'create', 'edit', 'export'],
    integracoes: ['view', 'connect'],
    usuarios: [],
    relatorios: ['view'],
    configuracoes: [],
    registro_musicas: ['view'],
    crm: ['view', 'create', 'edit'],
    agenda: ['view', 'create', 'edit'],
    inventario: [],
    servicos: [],
    nota_fiscal: [],
    landerzap: ['view', 'create'],
  },
  // 🎵 ARTISTA - Visão personalizada (apenas seus dados)
  artista: {
    artistas: ['view'], // Meu Perfil
    projetos: ['view'], // Meus Projetos
    lancamentos: ['view'], // Meus Lançamentos
    contratos: ['view'], // Meus Contratos
    royalties: ['view'], // Meus Shares
    financeiro: ['view'], // Meu Financeiro (visualização)
    marketing: [],
    integracoes: [],
    usuarios: [],
    relatorios: ['view'], // Meus Relatórios
    configuracoes: [],
    registro_musicas: ['view'], // Minhas Obras & Fonogramas
    crm: [],
    agenda: ['view'], // Minha Agenda
    inventario: [],
    servicos: [],
    nota_fiscal: [],
    landerzap: ['view'],
  },
  colaborador: {
    artistas: [],
    projetos: ['view'],
    lancamentos: ['view'],
    contratos: [],
    royalties: [],
    financeiro: [],
    marketing: [],
    integracoes: [],
    usuarios: [],
    relatorios: [],
    configuracoes: [],
    registro_musicas: ['view'],
    crm: [],
    agenda: ['view'],
    inventario: [],
    servicos: [],
    nota_fiscal: [],
    landerzap: [],
  },
  leitor: {
    artistas: ['view'],
    projetos: ['view'],
    lancamentos: ['view'],
    contratos: ['view'],
    royalties: ['view'],
    financeiro: ['view'],
    marketing: ['view'],
    integracoes: [],
    usuarios: [],
    relatorios: ['view'],
    configuracoes: [],
    registro_musicas: ['view'],
    crm: ['view'],
    agenda: ['view'],
    inventario: ['view'],
    servicos: ['view'],
    nota_fiscal: ['view'],
    landerzap: [],
  },
};

// Music Registry sub-items - Editorial & Direitos
export const musicRegistryItems: SubMenuItem[] = [
  { title: "Obras & Fonogramas", url: "/registro-musicas", roles: ['admin', 'gestor_artistico', 'juridico', 'artista', 'leitor'], module: 'registro_musicas' },
  { title: "Monitoramento", url: "/monitoramento", roles: ['admin', 'gestor_artistico', 'juridico', 'leitor'], module: 'registro_musicas' },
  { title: "Licenciamento", url: "/licenciamento", roles: ['admin', 'gestor_artistico', 'juridico', 'leitor'], module: 'registro_musicas' },
  { title: "Takedowns", url: "/takedowns", roles: ['admin', 'gestor_artistico', 'juridico', 'leitor'], module: 'registro_musicas' },
];

// Distribuição sub-items - Lançamentos & Distribuição
export const distribuicaoItems: SubMenuItem[] = [
  { title: "Distribuição", url: "/lancamentos", roles: ['admin', 'gestor_artistico', 'marketing', 'artista', 'leitor'], module: 'lancamentos' },
  { title: "Gestão de Shares", url: "/gestao-shares", roles: ['admin', 'gestor_artistico', 'financeiro', 'artista', 'leitor'], module: 'royalties' },
];

// Financeiro sub-items
export const financeiroItems: SubMenuItem[] = [
  { title: "Transações", url: "/financeiro", roles: ['admin', 'financeiro', 'artista', 'leitor'], module: 'financeiro' },
  { title: "Contabilidade", url: "/contabilidade", roles: ['admin', 'financeiro', 'leitor'], module: 'financeiro' },
  { title: "Nota Fiscal", url: "/nota-fiscal", roles: ['admin', 'financeiro', 'leitor'], module: 'nota_fiscal' },
];

// Marketing sub-items
export const marketingItems: SubMenuItem[] = [
  { title: "Visão Geral", url: "/marketing/visao-geral", roles: ['admin', 'gestor_artistico', 'marketing', 'leitor'], module: 'marketing' },
  { title: "Campanhas", url: "/marketing/campanhas", roles: ['admin', 'gestor_artistico', 'marketing', 'leitor'], module: 'marketing' },
  { title: "Gestão de Tarefas", url: "/marketing/tarefas", roles: ['admin', 'gestor_artistico', 'marketing', 'leitor'], module: 'marketing' },
  { title: "Calendário de Conteúdo", url: "/marketing/calendario", roles: ['admin', 'gestor_artistico', 'marketing', 'leitor'], module: 'marketing' },
  { title: "Métricas e Resultados", url: "/marketing/metricas", roles: ['admin', 'gestor_artistico', 'marketing', 'leitor'], module: 'marketing' },
  { title: "Central de Briefing", url: "/marketing/briefing", roles: ['admin', 'gestor_artistico', 'marketing', 'leitor'], module: 'marketing' },
  { title: "IA Criativa", url: "/marketing/ia-criativa", roles: ['admin', 'gestor_artistico', 'marketing', 'leitor'], module: 'marketing' },
];

// Main navigation items with role restrictions - MATRIZ ATUALIZADA
export const navigationConfig: NavigationItem[] = [
  // 📊 CORE
  // Dashboard - Todos podem ver (artista vê "Meu Painel")
  { title: "Dashboard", url: "/", icon: LayoutDashboard, roles: ['admin', 'gestor_artistico', 'financeiro', 'juridico', 'marketing', 'artista', 'colaborador', 'leitor'], module: 'relatorios', scope: 'empresa' },
  
  // Relatórios - Todos (artista vê "Meus Relatórios")
  { title: "Relatórios", url: "/relatorios", icon: BarChart3, roles: ['admin', 'gestor_artistico', 'financeiro', 'juridico', 'marketing', 'artista', 'colaborador', 'leitor'], module: 'relatorios', scope: 'empresa' },
  
  // Agenda - Todos (artista vê "Minha Agenda")
  { title: "Agenda", url: "/agenda", icon: Calendar, roles: ['admin', 'gestor_artistico', 'financeiro', 'juridico', 'marketing', 'artista', 'colaborador', 'leitor'], module: 'agenda', scope: 'empresa' },
  
  // Usuários & Permissões - Admin only
  { title: "Usuários", url: "/usuarios", icon: UserCog, roles: ['admin'], module: 'usuarios', scope: 'empresa' },
  
  // Configurações - Admin only
  { title: "Configurações", url: "/configuracoes", icon: Settings, roles: ['admin'], module: 'configuracoes', scope: 'empresa' },
  
  // 🎵 ARTÍSTICO & PRODUÇÃO
  // Artistas - Artista vê "Meu Perfil"
  { title: "Artistas", url: "/artistas", icon: Users, roles: ['admin', 'gestor_artistico', 'financeiro', 'juridico', 'marketing', 'artista', 'leitor'], module: 'artistas', scope: 'artista' },
  
  // Projetos - Artista vê "Meus Projetos"
  { title: "Projetos", url: "/projetos", icon: FolderOpen, roles: ['admin', 'gestor_artistico', 'financeiro', 'juridico', 'marketing', 'artista', 'colaborador', 'leitor'], module: 'projetos', scope: 'projeto' },
  
  // Inventário Técnico - NÃO para artista
  { title: "Inventário", url: "/inventario", icon: Package, roles: ['admin', 'financeiro', 'gestor_artistico', 'leitor'], module: 'inventario', scope: 'empresa' },
  
  // 📚 EDITORIAL & DIREITOS (Registro de Músicas é dropdown)
  { title: "Registro de Músicas", url: "/registro-musicas", icon: Music, roles: ['admin', 'gestor_artistico', 'juridico', 'artista', 'leitor'], module: 'registro_musicas', scope: 'projeto' },
  
  // ⚖️ JURÍDICO
  // Contratos - Artista vê "Meus Contratos"
  { title: "Contratos", url: "/contratos", icon: FileText, roles: ['admin', 'gestor_artistico', 'financeiro', 'juridico', 'artista', 'leitor'], module: 'contratos', scope: 'artista' },
  
  // 💰 FINANCEIRO
  // Financeiro - Artista vê "Meu Financeiro" (visualização)
  { title: "Financeiro", url: "/financeiro", icon: DollarSign, roles: ['admin', 'financeiro', 'artista', 'leitor'], module: 'financeiro', scope: 'empresa' },
  
  // Nota Fiscal - NÃO para artista
  { title: "Nota Fiscal", url: "/nota-fiscal", icon: Receipt, roles: ['admin', 'financeiro', 'leitor'], module: 'financeiro', scope: 'empresa' },
  
  // 💼 COMERCIAL & RELACIONAMENTO
  // Serviços - NÃO para artista
  { title: "Serviços", url: "/servicos", icon: Briefcase, roles: ['admin', 'gestor_artistico', 'financeiro', 'leitor'], module: 'servicos', scope: 'empresa' },
  
  // CRM - NÃO para artista
  { title: "CRM", url: "/crm", icon: UserCheck, roles: ['admin', 'gestor_artistico', 'marketing', 'leitor'], module: 'crm', scope: 'empresa' },
  
  // LanderZap - Livre para todos
  { title: "LanderZap", url: "/lander", icon: MessageCircle, roles: ['admin', 'gestor_artistico', 'marketing', 'artista', 'colaborador', 'leitor'], module: 'landerzap', scope: 'empresa' },
];

// Mapeamento de títulos para MODO ARTISTA
export const artistModeLabels: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Meu Painel', subtitle: 'Visão geral da sua carreira' },
  '/artistas': { title: 'Meu Perfil', subtitle: 'Informações, contratos e dados da sua carreira' },
  '/projetos': { title: 'Meus Projetos', subtitle: 'EPs, álbuns, singles e projetos autorais' },
  '/registro-musicas': { title: 'Minhas Obras & Fonogramas', subtitle: 'ISRC, ISWC e registros' },
  '/lancamentos': { title: 'Meus Lançamentos', subtitle: 'Distribuição digital e status por plataforma' },
  '/gestao-shares': { title: 'Meus Shares', subtitle: 'Splits dos seus lançamentos' },
  '/contratos': { title: 'Meus Contratos', subtitle: 'Contratos fonográficos, editoriais e licenciamento' },
  '/financeiro': { title: 'Meu Financeiro', subtitle: 'Royalties, ganhos e saldo disponível' },
  '/agenda': { title: 'Minha Agenda', subtitle: 'Shows, compromissos e eventos' },
  '/relatorios': { title: 'Meus Relatórios', subtitle: 'Performance, financeiro e distribuição' },
};

// Mapeamento de títulos de navegação para MODO ARTISTA (sidebar)
export const artistModeNavTitles: Record<string, string> = {
  'Dashboard': 'Meu Painel',
  'Artistas': 'Meu Perfil',
  'Projetos': 'Meus Projetos',
  'Registro de Músicas': 'Minhas Obras & Fonogramas',
  'Contratos': 'Meus Contratos',
  'Financeiro': 'Meu Financeiro',
  'Agenda': 'Minha Agenda',
  'Relatórios': 'Meus Relatórios',
  'LanderZap': 'LanderZap',
};

// Role display names
export const roleDisplayNames: Record<UserRole, string> = {
  admin: 'Administrador Master',
  gestor_artistico: 'A&R / Gestão Artística',
  financeiro: 'Financeiro / Contábil',
  juridico: 'Jurídico',
  marketing: 'Marketing',
  artista: 'Artista',
  colaborador: 'Colaborador / Freelancer',
  leitor: 'Leitor (Read-only)',
};

// Role descriptions
export const roleDescriptions: Record<UserRole, string> = {
  admin: 'Gerenciar usuários, criar selos/artistas/contratos, acesso total aos módulos, relatórios financeiros e royalties, aprovações finais',
  gestor_artistico: 'Criar lançamentos, upload de fonogramas e capas, acompanhar performance, sem acesso financeiro sensível',
  financeiro: 'Visualizar e editar contratos, gerar relatórios financeiros, gerenciar splits de royalties, registrar pagamentos, sem permissão criativa',
  marketing: 'Gerenciar campanhas, integrações com Meta, TikTok, Google Ads e DSPs, criar links smart/pre-save, visualizar métricas não financeiras',
  artista: 'Visualizar dados próprios, métricas de streaming, royalties (somente leitura), documentos e contratos, comunicação com a equipe',
  colaborador: 'Acesso somente a projetos atribuídos, upload de arquivos, comentários, sem acesso financeiro',
  leitor: 'Somente leitura de relatórios e dashboards, sem ações no sistema',
};

// Sector display names
export const sectorDisplayNames: Record<Sector, string> = {
  producao: 'Produção',
  administrativo: 'Administrativo',
  financeiro: 'Financeiro',
  marketing: 'Marketing',
  comercial: 'Comercial',
  tecnico: 'Técnico',
  artistico: 'Artístico',
  eventos: 'Eventos',
  juridico: 'Jurídico',
  rh: 'Recursos Humanos',
  ti: 'TI',
};

// Module display names
export const moduleDisplayNames: Record<SystemModule, string> = {
  artistas: 'Artistas',
  projetos: 'Projetos',
  lancamentos: 'Lançamentos',
  contratos: 'Contratos',
  royalties: 'Royalties',
  financeiro: 'Financeiro',
  marketing: 'Marketing',
  integracoes: 'Integrações',
  usuarios: 'Usuários',
  relatorios: 'Relatórios',
  configuracoes: 'Configurações',
  registro_musicas: 'Registro de Músicas',
  crm: 'CRM',
  agenda: 'Agenda',
  inventario: 'Inventário',
  servicos: 'Serviços',
  nota_fiscal: 'Nota Fiscal',
  landerzap: 'LanderZap',
};

// Permission display names
export const permissionDisplayNames: Record<ModulePermission, string> = {
  view: 'Visualizar',
  create: 'Criar',
  edit: 'Editar',
  delete: 'Excluir',
  submit: 'Submeter',
  approve: 'Aprovar',
  export: 'Exportar',
  connect: 'Conectar',
  revoke: 'Revogar',
  sign: 'Assinar',
  calculate: 'Calcular',
  pay: 'Pagar',
  close_period: 'Fechar Período',
  invite: 'Convidar',
};

// Permissions by module (which permissions are available for each module)
export const moduleAvailablePermissions: Record<SystemModule, ModulePermission[]> = {
  artistas: ['view', 'create', 'edit', 'delete', 'export'],
  projetos: ['view', 'create', 'edit', 'delete', 'export'],
  lancamentos: ['view', 'create', 'submit', 'approve', 'export'],
  contratos: ['view', 'create', 'edit', 'delete', 'sign', 'approve', 'export'],
  royalties: ['view', 'calculate', 'edit', 'pay', 'export'],
  financeiro: ['view', 'create', 'edit', 'delete', 'export', 'close_period'],
  marketing: ['view', 'create', 'edit', 'delete', 'export'],
  integracoes: ['view', 'connect', 'revoke'],
  usuarios: ['view', 'invite', 'edit', 'delete'],
  relatorios: ['view', 'export'],
  configuracoes: ['view', 'edit'],
  registro_musicas: ['view', 'create', 'edit', 'delete', 'export'],
  crm: ['view', 'create', 'edit', 'delete', 'export'],
  agenda: ['view', 'create', 'edit', 'delete', 'export'],
  inventario: ['view', 'create', 'edit', 'delete', 'export'],
  servicos: ['view', 'create', 'edit', 'delete', 'export'],
  nota_fiscal: ['view', 'create', 'edit', 'delete', 'export'],
  landerzap: ['view', 'create', 'edit', 'delete'],
};

// Check if a role has access to a navigation item
export function hasAccess(userRoles: UserRole[], itemRoles: UserRole[]): boolean {
  // Admin always has access
  if (userRoles.includes('admin')) return true;
  
  // Check if any user role matches item roles
  return userRoles.some(role => itemRoles.includes(role));
}

// Check if user has specific permission for a module
export function hasModulePermission(
  userRole: UserRole,
  module: SystemModule,
  permission: ModulePermission
): boolean {
  // Admin always has access
  if (userRole === 'admin') return true;
  
  const rolePermissions = defaultRolePermissions[userRole]?.[module] || [];
  return rolePermissions.includes(permission);
}

// Get all permissions for a role and module
export function getRoleModulePermissions(userRole: UserRole, module: SystemModule): ModulePermission[] {
  if (userRole === 'admin') {
    return moduleAvailablePermissions[module];
  }
  return defaultRolePermissions[userRole]?.[module] || [];
}

// Filter navigation items based on user roles
export function getFilteredNavigation(userRoles: UserRole[]): NavigationItem[] {
  return navigationConfig.filter(item => hasAccess(userRoles, item.roles));
}

// Filter marketing items based on user roles
export function getFilteredMarketingItems(userRoles: UserRole[]): SubMenuItem[] {
  return marketingItems.filter(item => hasAccess(userRoles, item.roles));
}

// Filter music registry items based on user roles
export function getFilteredMusicRegistryItems(userRoles: UserRole[]): SubMenuItem[] {
  return musicRegistryItems.filter(item => hasAccess(userRoles, item.roles));
}

// Filter financeiro items based on user roles
export function getFilteredFinanceiroItems(userRoles: UserRole[]): SubMenuItem[] {
  return financeiroItems.filter(item => hasAccess(userRoles, item.roles));
}

// Filter distribuição items based on user roles
export function getFilteredDistribuicaoItems(userRoles: UserRole[]): SubMenuItem[] {
  return distribuicaoItems.filter(item => hasAccess(userRoles, item.roles));
}

// Check if user should see financeiro section
export function shouldShowFinanceiro(userRoles: UserRole[]): boolean {
  const financeiroItem = navigationConfig.find(item => item.title === 'Financeiro');
  return financeiroItem ? hasAccess(userRoles, financeiroItem.roles) : false;
}

// Check if user should see marketing section
export function shouldShowMarketing(userRoles: UserRole[]): boolean {
  return getFilteredMarketingItems(userRoles).length > 0;
}

// Check if user should see music registry section
export function shouldShowMusicRegistry(userRoles: UserRole[]): boolean {
  return getFilteredMusicRegistryItems(userRoles).length > 0;
}

// Check if user should see distribuição section
export function shouldShowDistribuicao(userRoles: UserRole[]): boolean {
  return getFilteredDistribuicaoItems(userRoles).length > 0;
}

// Get user's primary role for display
export function getPrimaryRole(userRoles: UserRole[]): UserRole {
  const priorityOrder: UserRole[] = ['admin', 'gestor_artistico', 'financeiro', 'marketing', 'artista', 'colaborador', 'leitor'];
  for (const role of priorityOrder) {
    if (userRoles.includes(role)) return role;
  }
  return 'leitor';
}

// Legacy role mapping (for backward compatibility)
export const legacyRoleMapping: Record<string, UserRole> = {
  'admin': 'admin',
  'administrador': 'admin',
  'administrador_(master)': 'admin',
  'master': 'admin',
  'empresario': 'gestor_artistico',
  'gerente': 'gestor_artistico',
  'manager': 'gestor_artistico',
  'produtor_artistico': 'gestor_artistico',
  'gestor_artistico': 'gestor_artistico',
  'financeiro': 'financeiro',
  'analista_financeiro': 'financeiro',
  'marketing': 'marketing',
  'social_media': 'marketing',
  'artista': 'artista',
  'colaborador': 'colaborador',
  'freelancer': 'colaborador',
  'leitor': 'leitor',
  'visualizador': 'leitor',
  'user': 'leitor',
  'usuario': 'leitor',
  'usuário': 'leitor',
};

// Convert legacy role to new role
export function mapLegacyRole(legacyRole: string): UserRole {
  if (!legacyRole) return 'leitor';
  
  // Normaliza: lowercase, remove acentos, espaços viram underscore
  const normalized = legacyRole
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/\s+/g, '_')
    .replace(/[()]/g, ''); // Remove parênteses
  
  const mapped = legacyRoleMapping[normalized];
  
  // Se não encontrou mapeamento direto, tenta match parcial
  if (!mapped) {
    if (normalized.includes('admin') || normalized.includes('master')) return 'admin';
    if (normalized.includes('gestor') || normalized.includes('gerente')) return 'gestor_artistico';
    if (normalized.includes('financ')) return 'financeiro';
    if (normalized.includes('market')) return 'marketing';
    if (normalized.includes('artist')) return 'artista';
  }
  
  return mapped || 'leitor';
}
