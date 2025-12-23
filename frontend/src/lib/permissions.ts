import { LayoutDashboard, Users, FolderOpen, Music, Upload, FileText, DollarSign, Calendar, Receipt, Package, UserCheck, BarChart3, UserCog, Megaphone, Settings, Briefcase, FileSearch, Scale, MessageCircle, Palette, Film, Shield, LucideIcon, Eye, Lock, PieChart } from "lucide-react";

// ================================================
// SISTEMA COMPLETO DE PERMISSÕES RBAC + ABAC
// ================================================

// 7 Perfis padrão conforme especificação
export type UserRole = 
  | 'admin'              // Administrador da Empresa
  | 'gestor_artistico'   // Gestor Artístico (A&R / Manager)
  | 'financeiro'         // Financeiro / Contábil
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

// Permissões padrão por perfil
export const defaultRolePermissions: Record<UserRole, Partial<Record<SystemModule, ModulePermission[]>>> = {
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
  gestor_artistico: {
    artistas: ['view', 'create', 'edit'],
    projetos: ['view', 'create', 'edit'],
    lancamentos: ['view', 'create', 'submit'],
    contratos: ['view'],
    royalties: ['view'],
    financeiro: [],
    marketing: ['view'],
    integracoes: ['view'],
    usuarios: [],
    relatorios: ['view'],
    configuracoes: [],
    registro_musicas: ['view', 'create', 'edit'],
    crm: ['view', 'create', 'edit'],
    agenda: ['view', 'create', 'edit'],
    inventario: [],
    servicos: ['view'],
    nota_fiscal: [],
    landerzap: ['view', 'create'],
  },
  financeiro: {
    artistas: ['view'],
    projetos: ['view'],
    lancamentos: ['view'],
    contratos: ['view', 'edit', 'export'],
    royalties: ['view', 'calculate', 'edit', 'pay', 'export'],
    financeiro: ['view', 'create', 'edit', 'export', 'close_period'],
    marketing: [],
    integracoes: ['view'],
    usuarios: [],
    relatorios: ['view', 'export'],
    configuracoes: [],
    registro_musicas: ['view'],
    crm: ['view'],
    agenda: ['view'],
    inventario: ['view'],
    servicos: ['view', 'edit'],
    nota_fiscal: ['view', 'create', 'edit', 'export'],
    landerzap: [],
  },
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
  artista: {
    artistas: ['view'],
    projetos: ['view'],
    lancamentos: ['view'],
    contratos: ['view'],
    royalties: ['view'],
    financeiro: [],
    marketing: ['view'],
    integracoes: [],
    usuarios: [],
    relatorios: ['view'],
    configuracoes: [],
    registro_musicas: ['view'],
    crm: [],
    agenda: ['view'],
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

// Music Registry sub-items
export const musicRegistryItems: SubMenuItem[] = [
  { title: "Obras & Fonogramas", url: "/registro-musicas", roles: ['admin', 'gestor_artistico'], module: 'registro_musicas' },
  { title: "Monitoramento", url: "/monitoramento", roles: ['admin', 'gestor_artistico'], module: 'registro_musicas' },
  { title: "Licenciamento", url: "/licenciamento", roles: ['admin', 'gestor_artistico'], module: 'registro_musicas' },
  { title: "Takedowns", url: "/takedowns", roles: ['admin', 'gestor_artistico'], module: 'registro_musicas' },
];

// Distribuição sub-items
export const distribuicaoItems: SubMenuItem[] = [
  { title: "Distribuição", url: "/lancamentos", roles: ['admin', 'gestor_artistico', 'marketing', 'artista'], module: 'lancamentos' },
  { title: "Gestão de Shares", url: "/gestao-shares", roles: ['admin', 'gestor_artistico', 'financeiro', 'artista'], module: 'royalties' },
];

// Financeiro sub-items
export const financeiroItems: SubMenuItem[] = [
  { title: "Transações", url: "/financeiro", roles: ['admin', 'financeiro'], module: 'financeiro' },
  { title: "Contabilidade", url: "/contabilidade", roles: ['admin', 'financeiro'], module: 'financeiro' },
  { title: "Nota Fiscal", url: "/nota-fiscal", roles: ['admin', 'financeiro'], module: 'nota_fiscal' },
];

// Marketing sub-items with role restrictions
export const marketingItems: SubMenuItem[] = [
  { title: "Visão Geral", url: "/marketing/visao-geral", roles: ['admin', 'gestor_artistico', 'marketing', 'artista'], module: 'marketing' },
  { title: "Campanhas", url: "/marketing/campanhas", roles: ['admin', 'gestor_artistico', 'marketing'], module: 'marketing' },
  { title: "Gestão de Tarefas", url: "/marketing/tarefas", roles: ['admin', 'gestor_artistico', 'marketing'], module: 'marketing' },
  { title: "Calendário de Conteúdo", url: "/marketing/calendario", roles: ['admin', 'gestor_artistico', 'marketing'], module: 'marketing' },
  { title: "Métricas e Resultados", url: "/marketing/metricas", roles: ['admin', 'gestor_artistico', 'marketing', 'artista'], module: 'marketing' },
  { title: "Central de Briefing", url: "/marketing/briefing", roles: ['admin', 'gestor_artistico', 'marketing'], module: 'marketing' },
  { title: "IA Criativa", url: "/marketing/ia-criativa", roles: ['admin', 'gestor_artistico', 'marketing'], module: 'marketing' },
];

// Main navigation items with role restrictions
export const navigationConfig: NavigationItem[] = [
  // Dashboard - All roles
  { title: "Dashboard", url: "/", icon: LayoutDashboard, roles: ['admin', 'gestor_artistico', 'financeiro', 'marketing', 'artista', 'colaborador', 'leitor'], module: 'relatorios', scope: 'empresa' },
  
  // Artistas - All roles can view
  { title: "Artistas", url: "/artistas", icon: Users, roles: ['admin', 'gestor_artistico', 'financeiro', 'marketing', 'artista', 'colaborador', 'leitor'], module: 'artistas', scope: 'artista' },
  
  // Projetos - All roles can view
  { title: "Projetos", url: "/projetos", icon: FolderOpen, roles: ['admin', 'gestor_artistico', 'financeiro', 'marketing', 'artista', 'colaborador', 'leitor'], module: 'projetos', scope: 'projeto' },
  
  // Registro de Músicas - Strategic and artistic
  { title: "Registro de Músicas", url: "/registro-musicas", icon: Music, roles: ['admin', 'gestor_artistico', 'leitor'], module: 'registro_musicas', scope: 'projeto' },
  
  // Gestão de Shares - Strategic and financial
  { title: "Gestão de Shares", url: "/gestao-shares", icon: PieChart, roles: ['admin', 'gestor_artistico', 'financeiro', 'leitor'], module: 'gestao_shares', scope: 'projeto' },
  
  // Contratos - All roles can view
  { title: "Contratos", url: "/contratos", icon: FileText, roles: ['admin', 'gestor_artistico', 'financeiro', 'artista', 'colaborador', 'leitor'], module: 'contratos', scope: 'artista' },
  
  // Financeiro - Financial and admin
  { title: "Financeiro", url: "/financeiro", icon: DollarSign, roles: ['admin', 'financeiro', 'leitor'], module: 'financeiro', scope: 'empresa' },
  
  // Serviços - Admin and financial
  { title: "Serviços", url: "/servicos", icon: Briefcase, roles: ['admin', 'gestor_artistico', 'financeiro', 'leitor'], module: 'servicos', scope: 'empresa' },
  
  // Agenda - All roles
  { title: "Agenda", url: "/agenda", icon: Calendar, roles: ['admin', 'gestor_artistico', 'financeiro', 'marketing', 'artista', 'colaborador', 'leitor'], module: 'agenda', scope: 'empresa' },
  
  // Nota Fiscal - Financial
  { title: "Nota Fiscal", url: "/nota-fiscal", icon: Receipt, roles: ['admin', 'financeiro', 'leitor'], module: 'financeiro', scope: 'empresa' },
  
  // Inventário - All roles can view
  { title: "Inventário", url: "/inventario", icon: Package, roles: ['admin', 'financeiro', 'gestor_artistico', 'leitor'], module: 'inventario', scope: 'empresa' },
  
  // LanderZap - Communication
  { title: "LanderZap", url: "/lander", icon: MessageCircle, roles: ['admin', 'gestor_artistico', 'marketing', 'leitor'], module: 'landerzap', scope: 'empresa' },
  
  // Usuários - Admin only
  { title: "Usuários", url: "/usuarios", icon: UserCog, roles: ['admin'], module: 'usuarios', scope: 'empresa' },
  
  // CRM - Business development
  { title: "CRM", url: "/crm", icon: UserCheck, roles: ['admin', 'gestor_artistico', 'marketing', 'leitor'], module: 'crm', scope: 'empresa' },
  
  // Relatórios - All roles
  { title: "Relatórios", url: "/relatorios", icon: BarChart3, roles: ['admin', 'gestor_artistico', 'financeiro', 'marketing', 'artista', 'colaborador', 'leitor'], module: 'relatorios', scope: 'empresa' },
  
  // Configurações - Admin only
  { title: "Configurações", url: "/configuracoes", icon: Settings, roles: ['admin'], module: 'configuracoes', scope: 'empresa' },
];

// Role display names
export const roleDisplayNames: Record<UserRole, string> = {
  admin: 'Administrador da Empresa',
  gestor_artistico: 'Gestor Artístico (A&R / Manager)',
  financeiro: 'Financeiro / Contábil',
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
