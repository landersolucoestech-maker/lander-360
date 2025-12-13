import { LayoutDashboard, Users, FolderOpen, Music, Upload, FileText, DollarSign, Calendar, Receipt, Package, UserCheck, BarChart3, UserCog, Megaphone, Settings, Briefcase, FileSearch, Scale, MessageCircle, Palette, LucideIcon } from "lucide-react";

// User role types
export type UserRole = 'admin' | 'empresario' | 'financeiro' | 'marketing' | 'juridico' | 'artista' | 'produtor_artistico';

export interface NavigationItem {
  title: string;
  url: string;
  icon: LucideIcon;
  roles: UserRole[];
  scope?: 'empresa' | 'artista' | 'projeto' | 'personal';
}

export interface MarketingSubItem {
  title: string;
  url: string;
  roles: UserRole[];
}

// Marketing sub-items with role restrictions
export const marketingItems: MarketingSubItem[] = [
  { title: "Visão Geral", url: "/marketing/visao-geral", roles: ['admin', 'empresario', 'marketing', 'produtor_artistico'] },
  { title: "Planejamento de Campanhas", url: "/marketing/campanhas", roles: ['admin', 'empresario', 'marketing', 'produtor_artistico'] },
  { title: "Gestão de Tarefas", url: "/marketing/tarefas", roles: ['admin', 'empresario', 'marketing', 'produtor_artistico'] },
  { title: "Calendário de Conteúdo", url: "/marketing/calendario", roles: ['admin', 'empresario', 'marketing', 'produtor_artistico'] },
  { title: "Métricas e Resultados", url: "/marketing/metricas", roles: ['admin', 'empresario', 'marketing', 'produtor_artistico'] },
  { title: "Central de Briefing", url: "/marketing/briefing", roles: ['admin', 'empresario', 'marketing', 'produtor_artistico'] },
  { title: "IA Criativa", url: "/marketing/ia-criativa", roles: ['admin', 'empresario', 'marketing', 'produtor_artistico'] },
];

// Main navigation items in the specified order with role restrictions
export const navigationConfig: NavigationItem[] = [
  // Dashboard - All roles
  { title: "Dashboard", url: "/", icon: LayoutDashboard, roles: ['admin', 'empresario', 'financeiro', 'marketing', 'juridico', 'artista', 'produtor_artistico'], scope: 'empresa' },
  
  // Agenda - Most roles except financeiro
  { title: "Agenda", url: "/agenda", icon: Calendar, roles: ['admin', 'empresario', 'marketing', 'artista', 'produtor_artistico'], scope: 'empresa' },
  
  // Artistas - Strategic roles only
  { title: "Artistas", url: "/artistas", icon: Users, roles: ['admin', 'empresario', 'marketing', 'produtor_artistico'], scope: 'artista' },
  
  // Projetos - Most creative roles
  { title: "Projetos", url: "/projetos", icon: FolderOpen, roles: ['admin', 'empresario', 'marketing', 'artista', 'produtor_artistico'], scope: 'projeto' },
  
  // Registro de Músicas - Strategic and artistic
  { title: "Registro de Músicas", url: "/registro-musicas", icon: Music, roles: ['admin', 'empresario', 'produtor_artistico'], scope: 'projeto' },
  
  // Lançamentos - Creative and marketing
  { title: "Lançamentos", url: "/lancamentos", icon: Upload, roles: ['admin', 'empresario', 'marketing', 'artista', 'produtor_artistico'], scope: 'projeto' },
  
  // Serviços - Admin and financial
  { title: "Serviços", url: "/servicos", icon: Briefcase, roles: ['admin', 'empresario', 'financeiro', 'produtor_artistico'], scope: 'empresa' },
  
  // Gestão de Shares - Strategic and financial
  { title: "Gestão de Shares", url: "/gestao-shares", icon: Scale, roles: ['admin', 'empresario', 'financeiro', 'artista', 'produtor_artistico'], scope: 'empresa' },
  
  // CRM - Business development
  { title: "CRM", url: "/crm", icon: UserCheck, roles: ['admin', 'empresario', 'produtor_artistico'], scope: 'empresa' },
  
  // Contratos - Legal and strategic
  { title: "Contratos", url: "/contratos", icon: FileText, roles: ['admin', 'empresario', 'financeiro', 'juridico', 'produtor_artistico'], scope: 'artista' },
  
  // Financeiro - Financial roles only
  { title: "Financeiro", url: "/financeiro", icon: DollarSign, roles: ['admin', 'financeiro'], scope: 'empresa' },
  
  // Nota Fiscal - Financial roles only
  { title: "Nota Fiscal", url: "/nota-fiscal", icon: Receipt, roles: ['admin', 'financeiro'], scope: 'empresa' },
  
  // Inventário - Financial and admin
  { title: "Inventário", url: "/inventario", icon: Package, roles: ['admin', 'financeiro'], scope: 'empresa' },
  
  // Marketing section is handled separately as a dropdown
  
  // Relatórios - Most roles with different views
  { title: "Relatórios", url: "/relatorios", icon: BarChart3, roles: ['admin', 'empresario', 'financeiro', 'marketing', 'artista', 'produtor_artistico'], scope: 'empresa' },
  
  // Auditoria - Admin and financial
  { title: "Auditoria", url: "/relatorios-autorais", icon: FileSearch, roles: ['admin', 'financeiro'], scope: 'empresa' },
  
  // LanderZap - Communication
  { title: "LanderZap", url: "/lander", icon: MessageCircle, roles: ['admin', 'empresario', 'marketing', 'produtor_artistico'], scope: 'empresa' },
  
  // Usuários - Admin only
  { title: "Usuários", url: "/usuarios", icon: UserCog, roles: ['admin'], scope: 'empresa' },
  
  // Configurações - Admin only
  { title: "Configurações", url: "/configuracoes", icon: Settings, roles: ['admin'], scope: 'empresa' },
  
  // Aparência - All roles
  { title: "Aparência", url: "/configuracoes#aparencia", icon: Palette, roles: ['admin', 'empresario', 'financeiro', 'marketing', 'juridico', 'artista', 'produtor_artistico'], scope: 'personal' },
];

// Role display names
export const roleDisplayNames: Record<UserRole, string> = {
  admin: 'Administrador',
  empresario: 'Empresário / Gestor',
  financeiro: 'Financeiro',
  marketing: 'Marketing',
  juridico: 'Jurídico',
  artista: 'Artista',
  produtor_artistico: 'Produtor Artístico',
};

// Check if a role has access to a navigation item
export function hasAccess(userRoles: UserRole[], itemRoles: UserRole[]): boolean {
  // Admin always has access
  if (userRoles.includes('admin')) return true;
  
  // Check if any user role matches item roles
  return userRoles.some(role => itemRoles.includes(role));
}

// Filter navigation items based on user roles
export function getFilteredNavigation(userRoles: UserRole[]): NavigationItem[] {
  return navigationConfig.filter(item => hasAccess(userRoles, item.roles));
}

// Filter marketing items based on user roles
export function getFilteredMarketingItems(userRoles: UserRole[]): MarketingSubItem[] {
  return marketingItems.filter(item => hasAccess(userRoles, item.roles));
}

// Check if user should see marketing section
export function shouldShowMarketing(userRoles: UserRole[]): boolean {
  return getFilteredMarketingItems(userRoles).length > 0;
}

// Get user's primary role for display
export function getPrimaryRole(userRoles: UserRole[]): UserRole {
  const priorityOrder: UserRole[] = ['admin', 'empresario', 'produtor_artistico', 'financeiro', 'marketing', 'juridico', 'artista'];
  for (const role of priorityOrder) {
    if (userRoles.includes(role)) return role;
  }
  return 'artista';
}
