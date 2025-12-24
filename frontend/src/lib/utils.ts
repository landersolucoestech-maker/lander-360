import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { formatInTimeZone, toZonedTime } from "date-fns-tz"

// Fuso horário padrão do sistema (EST - Eastern Standard Time)
const BRAZIL_TIMEZONE = 'America/New_York'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converte uma string de data do banco (yyyy-MM-dd) para um objeto Date
 * Adiciona horário ao meio-dia para evitar problemas de fuso horário
 * que causam a data voltar um dia (ex: 23/12 -> 22/12)
 */
export function parseDateFromDB(dateString: string | null | undefined): Date | undefined {
  if (!dateString) return undefined
  try {
    // Se a string já contém horário (ISO completo), usa parseISO normal
    if (dateString.includes('T') || dateString.includes(' ')) {
      return parseISO(dateString)
    }
    // Se é apenas data (yyyy-MM-dd), adiciona horário ao meio-dia
    // para evitar problemas de conversão de fuso horário
    return parseISO(`${dateString}T12:00:00`)
  } catch {
    return undefined
  }
}

/**
 * Converte uma data para o fuso horário de Brasília
 */
export function toBrazilTime(date: Date | string | null | undefined): Date | null {
  if (!date) return null
  const dateObj = typeof date === "string" ? parseISO(date) : date
  return toZonedTime(dateObj, BRAZIL_TIMEZONE)
}

/**
 * Formata uma data para o padrão brasileiro (dd/MM/yyyy)
 * Usa o fuso horário de Brasília (America/Sao_Paulo)
 */
export function formatDateBR(date: Date | string | null | undefined): string {
  if (!date) return "N/A"
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date
    return formatInTimeZone(dateObj, BRAZIL_TIMEZONE, "dd/MM/yyyy", { locale: ptBR })
  } catch {
    return "N/A"
  }
}

/**
 * Formata uma data e hora para o padrão brasileiro (dd/MM/yyyy 'às' HH:mm)
 * Usa o fuso horário de Brasília
 */
export function formatDateTimeBR(date: Date | string | null | undefined): string {
  if (!date) return "N/A"
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date
    return formatInTimeZone(dateObj, BRAZIL_TIMEZONE, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  } catch {
    return "N/A"
  }
}

/**
 * Formata apenas o horário no padrão brasileiro (HH:mm)
 * Usa o fuso horário de Brasília
 */
export function formatTimeBR(date: Date | string | null | undefined): string {
  if (!date) return "N/A"
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date
    return formatInTimeZone(dateObj, BRAZIL_TIMEZONE, "HH:mm", { locale: ptBR })
  } catch {
    return "N/A"
  }
}

/**
 * Formata uma data por extenso em português (dd 'de' MMMM 'de' yyyy)
 * Usa o fuso horário de Brasília
 */
export function formatDateFullBR(date: Date | string | null | undefined): string {
  if (!date) return "N/A"
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date
    return formatInTimeZone(dateObj, BRAZIL_TIMEZONE, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  } catch {
    return "N/A"
  }
}

/**
 * Formata uma data para salvar no banco de dados (yyyy-MM-dd)
 * Mantém o dia correto no fuso horário de Brasília
 */
export function formatDateForDB(date: Date | null | undefined): string | null {
  if (!date) return null
  try {
    // Converte para o fuso de Brasília antes de extrair dia/mês/ano
    const brazilDate = toZonedTime(date, BRAZIL_TIMEZONE)
    const year = brazilDate.getFullYear()
    const month = String(brazilDate.getMonth() + 1).padStart(2, '0')
    const day = String(brazilDate.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch {
    return null
  }
}

/**
 * Retorna a data de hoje no formato yyyy-MM-dd (fuso de Brasília)
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
    'new': 'Novo',
    'open': 'Aberto',
    'closed': 'Fechado',
    'archived': 'Arquivado',
    
    // Status de projetos
    'planning': 'Planejando',
    'in_progress': 'Em Andamento',
    'in-progress': 'Em Andamento',
    'inprogress': 'Em Andamento',
    'on_hold': 'Em Espera',
    'on-hold': 'Em Espera',
    'onhold': 'Em Espera',
    
    // Status de lançamentos
    'released': 'Lançado',
    'scheduled': 'Agendado',
    'published': 'Publicado',
    'unpublished': 'Não Publicado',
    
    // Status financeiro
    'paid': 'Pago',
    'overdue': 'Atrasado',
    'received': 'Recebido',
    'refunded': 'Reembolsado',
    
    // Status de campanhas
    'paused': 'Pausado',
    'running': 'Em Execução',
    'stopped': 'Parado',
    
    // Status de tarefas
    'todo': 'A Fazer',
    'doing': 'Fazendo',
    'done': 'Feito',
    'blocked': 'Bloqueado',
    
    // Status de briefings
    'in_review': 'Em Revisão',
    'in-review': 'Em Revisão',
    'review': 'Revisão',
    
    // Status de fonogramas/músicas
    'registrado': 'Registrado',
    'em_analise': 'Em Análise',
    'em análise': 'Em Análise',
    'pendente': 'Pendente',
    'pendente de registro': 'Pendente de Registro',
    'pendente_de_registro': 'Pendente de Registro',
    'aceita': 'Aprovada',
    'aprovada': 'Aprovada',
    'recusada': 'Recusada',
    'cancelado': 'Cancelado',
    
    // Status de contratos
    'signed': 'Assinado',
    'negotiation': 'Negociação',
    'terminated': 'Encerrado',
    'renewed': 'Renovado',
    
    // Status de inventário
    'available': 'Disponível',
    'unavailable': 'Indisponível',
    'maintenance': 'Manutenção',
    'loaned': 'Emprestado',
    'reserved': 'Reservado',
    'damaged': 'Danificado',
    'disposed': 'Descartado',
    
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
    'lead': 'Lead',
    'prospect': 'Prospecto',
    'customer': 'Cliente',
    'partner': 'Parceiro',
    
    // Status de notas fiscais
    'issued': 'Emitida',
    'sent': 'Enviada',
    'voided': 'Cancelada',
  }
  
  const normalizedStatus = status.toLowerCase().trim()
  
  // Check for em_analise variations in fallback
  if (normalizedStatus.includes('analise') || normalizedStatus.includes('análise')) {
    return 'Em Análise'
  }
  
  return statusMap[normalizedStatus] || status.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
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
    'highest': 'Altíssima',
    'lowest': 'Baixíssima',
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
    'transfer': 'Transferência',
    'refund': 'Reembolso',
    'payment': 'Pagamento',
    'deposit': 'Depósito',
    'withdrawal': 'Saque',
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
    'production': 'Produção',
    'marketing': 'Marketing',
    'royalties': 'Royalties',
    'equipment': 'Equipamentos',
    'travel': 'Viagem',
    'studio': 'Estúdio',
    'legal': 'Jurídico',
    'administrative': 'Administrativo',
    'personnel': 'Pessoal',
    'utilities': 'Utilidades',
    'rent': 'Aluguel',
    'software': 'Software',
    'hardware': 'Hardware',
    'consulting': 'Consultoria',
    'training': 'Treinamento',
    'insurance': 'Seguro',
    'taxes': 'Impostos',
    'fees': 'Taxas',
    'supplies': 'Suprimentos',
    'maintenance': 'Manutenção',
    'other': 'Outros',
  }
  
  const normalizedCategory = category.toLowerCase().trim()
  return categoryMap[normalizedCategory] || category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * Traduz tipo de contrato para português
 */
export function translateContractType(type: string | null | undefined): string {
  if (!type) return "Contrato"
  
  const typeMap: Record<string, string> = {
    'recording': 'Gravação',
    'publishing': 'Edição',
    'distribution': 'Distribuição',
    'management': 'Gestão',
    'agency': 'Agenciamento',
    'license': 'Licenciamento',
    'licensing': 'Licenciamento',
    'sync': 'Sincronização',
    'synchronization': 'Sincronização',
    'production': 'Produção',
    'audiovisual': 'Audiovisual',
    'marketing': 'Marketing',
    'partnership': 'Parceria',
    'shows': 'Shows',
    'touring': 'Turnê',
    'sponsorship': 'Patrocínio',
    'endorsement': 'Endorsement',
    'merchandising': 'Merchandising',
    'other': 'Outro',
  }
  
  const normalizedType = type.toLowerCase().trim()
  return typeMap[normalizedType] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * Traduz tipo de evento para português
 */
export function translateEventType(type: string | null | undefined): string {
  if (!type) return "Evento"
  
  const typeMap: Record<string, string> = {
    'meeting': 'Reunião',
    'show': 'Show',
    'concert': 'Concerto',
    'recording': 'Gravação',
    'rehearsal': 'Ensaio',
    'interview': 'Entrevista',
    'photoshoot': 'Ensaio Fotográfico',
    'video': 'Vídeo',
    'release': 'Lançamento',
    'press': 'Imprensa',
    'travel': 'Viagem',
    'deadline': 'Prazo',
    'reminder': 'Lembrete',
    'task': 'Tarefa',
    'other': 'Outro',
  }
  
  const normalizedType = type.toLowerCase().trim()
  return typeMap[normalizedType] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * Traduz tipo de lançamento para português
 */
export function translateReleaseType(type: string | null | undefined): string {
  if (!type) return "Lançamento"
  
  const typeMap: Record<string, string> = {
    'single': 'Single',
    'ep': 'EP',
    'album': 'Álbum',
    'compilation': 'Compilação',
    'remix': 'Remix',
    'live': 'Ao Vivo',
    'deluxe': 'Deluxe',
    'remaster': 'Remasterizado',
    'acoustic': 'Acústico',
    'instrumental': 'Instrumental',
  }
  
  const normalizedType = type.toLowerCase().trim()
  return typeMap[normalizedType] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * Traduz método de pagamento para português
 */
export function translatePaymentMethod(method: string | null | undefined): string {
  if (!method) return "N/A"
  
  const methodMap: Record<string, string> = {
    'pix': 'Pix',
    'ted': 'TED',
    'doc': 'DOC',
    'boleto': 'Boleto',
    'credit_card': 'Cartão de Crédito',
    'credit-card': 'Cartão de Crédito',
    'creditcard': 'Cartão de Crédito',
    'debit_card': 'Cartão de Débito',
    'debit-card': 'Cartão de Débito',
    'debitcard': 'Cartão de Débito',
    'cash': 'Dinheiro',
    'dinheiro': 'Dinheiro',
    'cartao': 'Cartão',
    'check': 'Cheque',
    'cheque': 'Cheque',
    'transfer': 'Transferência',
    'wire': 'Transferência Bancária',
    'paypal': 'PayPal',
    'other': 'Outro',
  }
  
  const normalizedMethod = method.toLowerCase().trim()
  return methodMap[normalizedMethod] || method.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * Traduz papel/função para português
 */
export function translateRole(role: string | null | undefined): string {
  if (!role) return "N/A"
  
  const roleMap: Record<string, string> = {
    'admin': 'Administrador',
    'administrator': 'Administrador',
    'manager': 'Gerente',
    'user': 'Usuário',
    'editor': 'Editor',
    'viewer': 'Visualizador',
    'owner': 'Proprietário',
    'member': 'Membro',
    'guest': 'Convidado',
    'composer': 'Compositor',
    'author': 'Autor',
    'writer': 'Escritor',
    'producer': 'Produtor',
    'performer': 'Intérprete',
    'artist': 'Artista',
    'musician': 'Músico',
    'engineer': 'Engenheiro',
    'mixer': 'Mixador',
    'master': 'Masterizador',
    'arranger': 'Arranjador',
    'lyricist': 'Letrista',
    'translator': 'Tradutor',
  }
  
  const normalizedRole = role.toLowerCase().trim()
  return roleMap[normalizedRole] || role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * Traduz gênero musical para português
 */
export function translateGenre(genre: string | null | undefined): string {
  if (!genre) return "N/A"
  
  const genreMap: Record<string, string> = {
    'pop': 'Pop',
    'rock': 'Rock',
    'hip-hop': 'Hip-Hop',
    'hiphop': 'Hip-Hop',
    'rap': 'Rap',
    'r&b': 'R&B',
    'rnb': 'R&B',
    'soul': 'Soul',
    'jazz': 'Jazz',
    'blues': 'Blues',
    'country': 'Country',
    'electronic': 'Eletrônica',
    'eletronica': 'Eletrônica',
    'dance': 'Dance',
    'house': 'House',
    'techno': 'Techno',
    'reggae': 'Reggae',
    'reggaeton': 'Reggaeton',
    'latin': 'Latino',
    'sertanejo': 'Sertanejo',
    'samba': 'Samba',
    'pagode': 'Pagode',
    'forro': 'Forró',
    'axe': 'Axé',
    'mpb': 'MPB',
    'bossa-nova': 'Bossa Nova',
    'bossanova': 'Bossa Nova',
    'funk': 'Funk',
    'gospel': 'Gospel',
    'classical': 'Clássica',
    'classica': 'Clássica',
    'metal': 'Metal',
    'punk': 'Punk',
    'indie': 'Indie',
    'alternative': 'Alternativo',
    'folk': 'Folk',
    'acoustic': 'Acústico',
    'instrumental': 'Instrumental',
    'soundtrack': 'Trilha Sonora',
    'world': 'World Music',
    'other': 'Outro',
  }
  
  const normalizedGenre = genre.toLowerCase().trim()
  return genreMap[normalizedGenre] || genre.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * Limita um valor de porcentagem a um máximo de 100%
 * Útil para exibição de KPIs e indicadores
 */
export function capPercentage(value: number, max: number = 100): number {
  return Math.min(Math.max(value, 0), max)
}

/**
 * Formata uma porcentagem limitando a 100% e adicionando sufixo %
 */
export function formatPercentageCapped(value: number, decimals: number = 0): string {
  const capped = capPercentage(value)
  return `${capped.toFixed(decimals)}%`
}

/**
 * Formata um valor monetário em Real brasileiro
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "R$ 0,00"
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}
