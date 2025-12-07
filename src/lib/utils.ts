import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata uma data para o padrão brasileiro (dd/MM/yyyy)
 * Usa o fuso horário local (America/Sao_Paulo quando no Brasil)
 */
export function formatDateBR(date: Date | string | null | undefined): string {
  if (!date) return "N/A"
  const dateObj = typeof date === "string" ? new Date(date) : date
  return format(dateObj, "dd/MM/yyyy", { locale: ptBR })
}

/**
 * Formata uma data e hora para o padrão brasileiro (dd/MM/yyyy 'às' HH:mm)
 */
export function formatDateTimeBR(date: Date | string | null | undefined): string {
  if (!date) return "N/A"
  const dateObj = typeof date === "string" ? new Date(date) : date
  return format(dateObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

/**
 * Formata apenas o horário no padrão brasileiro (HH:mm)
 */
export function formatTimeBR(date: Date | string | null | undefined): string {
  if (!date) return "N/A"
  const dateObj = typeof date === "string" ? new Date(date) : date
  return format(dateObj, "HH:mm", { locale: ptBR })
}

/**
 * Formata uma data por extenso em português (dd 'de' MMMM 'de' yyyy)
 */
export function formatDateFullBR(date: Date | string | null | undefined): string {
  if (!date) return "N/A"
  const dateObj = typeof date === "string" ? new Date(date) : date
  return format(dateObj, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
}

/**
 * Formata uma data para salvar no banco de dados (yyyy-MM-dd)
 * Mantém o dia correto sem conversão de timezone
 */
export function formatDateForDB(date: Date | null | undefined): string | null {
  if (!date) return null
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Retorna a data de hoje no formato yyyy-MM-dd
 */
export function getTodayDateString(): string {
  const today = new Date()
  return formatDateForDB(today) || ""
}

/**
 * Traduz status em inglês para português
 */
export function translateStatus(status: string | null | undefined): string {
  if (!status) return "N/A"
  
  const statusMap: Record<string, string> = {
    // Status gerais
    'active': 'Ativo',
    'inactive': 'Inativo',
    'pending': 'Pendente',
    'completed': 'Concluído',
    'cancelled': 'Cancelado',
    'canceled': 'Cancelado',
    'approved': 'Aprovado',
    'rejected': 'Rejeitado',
    'draft': 'Rascunho',
    'expired': 'Vencido',
    'current': 'Atual',
    
    // Status de projetos
    'planning': 'Planejando',
    'in_progress': 'Em Andamento',
    'on_hold': 'Em Espera',
    
    // Status de lançamentos
    'released': 'Lançado',
    'scheduled': 'Agendado',
    
    // Status financeiro
    'paid': 'Pago',
    'overdue': 'Atrasado',
    'received': 'Recebido',
    
    // Status de campanhas
    'paused': 'Pausado',
    'running': 'Em Execução',
    
    // Status de tarefas
    'todo': 'A Fazer',
    'doing': 'Fazendo',
    'done': 'Feito',
    
    // Status de briefings
    'in_review': 'Em Revisão',
    
    // Status de fonogramas/músicas
    'registrado': 'Registrado',
    'em_analise': 'Em Análise',
    
    // Status de contratos
    'signed': 'Assinado',
    'negotiation': 'Negociação',
    
    // Status de inventário
    'available': 'Disponível',
    'unavailable': 'Indisponível',
    'maintenance': 'Manutenção',
    'loaned': 'Emprestado',
    
    // Status de agenda
    'agendado': 'Agendado',
    'confirmado': 'Confirmado',
    'realizado': 'Realizado',
    
    // Status CRM
    'quente': 'Quente',
    'morno': 'Morno',
    'frio': 'Frio',
    'fechado': 'Fechado',
    'negociacao': 'Negociação',
  }
  
  const normalizedStatus = status.toLowerCase().trim()
  return statusMap[normalizedStatus] || status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * Traduz prioridade em inglês para português
 */
export function translatePriority(priority: string | null | undefined): string {
  if (!priority) return "N/A"
  
  const priorityMap: Record<string, string> = {
    'high': 'Alta',
    'medium': 'Média',
    'low': 'Baixa',
    'urgent': 'Urgente',
    'critical': 'Crítica',
    'normal': 'Normal',
  }
  
  const normalizedPriority = priority.toLowerCase().trim()
  return priorityMap[normalizedPriority] || priority.replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * Traduz tipo de transação para português
 */
export function translateTransactionType(type: string | null | undefined): string {
  if (!type) return "N/A"
  
  const typeMap: Record<string, string> = {
    'income': 'Receita',
    'expense': 'Despesa',
    'receitas': 'Receitas',
    'despesas': 'Despesas',
    'investimentos': 'Investimentos',
    'impostos': 'Impostos',
    'transferencias': 'Transferências',
  }
  
  const normalizedType = type.toLowerCase().trim()
  return typeMap[normalizedType] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * Traduz categoria para português
 */
export function translateCategory(category: string | null | undefined): string {
  if (!category) return "N/A"
  
  const categoryMap: Record<string, string> = {
    'streaming': 'Streaming',
    'shows': 'Shows',
    'producao': 'Produção',
    'marketing': 'Marketing',
    'royalties': 'Royalties',
    'equipment': 'Equipamentos',
    'travel': 'Viagem',
    'studio': 'Estúdio',
    'legal': 'Jurídico',
    'administrative': 'Administrativo',
  }
  
  const normalizedCategory = category.toLowerCase().trim()
  return categoryMap[normalizedCategory] || category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}
