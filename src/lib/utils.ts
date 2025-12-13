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
    'pendente': 'Pendente',
    'aceita': 'Aprovada',
    'aprovada': 'Aprovada',
    'recusada': 'Recusada',
    
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
