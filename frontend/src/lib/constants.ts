// Standardized genres for music registry
export const MUSIC_GENRES = [
  { value: 'funk', label: 'Funk' },
  { value: 'trap', label: 'Trap' },
  { value: 'piseiro', label: 'Piseiro' },
  { value: 'arrocha', label: 'Arrocha' },
  { value: 'arrochadeira', label: 'Arrochadeira' },
  { value: 'sertanejo', label: 'Sertanejo' },
  { value: 'axe', label: 'Axé' },
  { value: 'pagode', label: 'Pagode' },
  { value: 'forro', label: 'Forró' },
  { value: 'reggaeton', label: 'Reggaeton' },
  { value: 'pop', label: 'Pop' },
  { value: 'rock', label: 'Rock' },
  { value: 'mpb', label: 'MPB' },
  { value: 'hip_hop', label: 'Hip Hop' },
  { value: 'eletronica', label: 'Eletrônica' },
  { value: 'gospel', label: 'Gospel' },
  { value: 'outro', label: 'Outro' },
] as const;

// Standardized artist profile types
export const ARTIST_PROFILE_TYPES = [
  { value: 'independente', label: 'Independente' },
  { value: 'com_empresario', label: 'Com Empresário' },
  { value: 'gravadora_propria', label: 'Gravadora Própria' },
  { value: 'gravadora_externa', label: 'Gravadora Externa' },
  { value: 'produtor', label: 'Produtor' },
  { value: 'compositor', label: 'Compositor' },
] as const;

// Music registration status options
export const MUSIC_STATUS = [
  { value: 'em_analise', label: 'Em Análise' },
  { value: 'aceita', label: 'Aceita' },
  { value: 'recusada', label: 'Recusada' },
  { value: 'pendente', label: 'Pendente' },
] as const;

// Release status options
export const RELEASE_STATUS = [
  { value: 'planning', label: 'Planejamento' },
  { value: 'em_analise', label: 'Em Análise' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'released', label: 'Lançado' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'paused', label: 'Pausado' },
] as const;

// Contract status options
export const CONTRACT_STATUS = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'pending', label: 'Pendente' },
  { value: 'active', label: 'Ativo' },
  { value: 'assinado', label: 'Assinado' },
  { value: 'expired', label: 'Expirado' },
  { value: 'cancelled', label: 'Cancelado' },
] as const;

// Contract types
export const CONTRACT_TYPES = [
  { value: 'agenciamento', label: 'Agenciamento' },
  { value: 'gestao', label: 'Gestão' },
  { value: 'empresariamento', label: 'Empresariamento' },
  { value: 'empresariamento_suporte', label: 'Empresariamento com Suporte' },
  { value: 'producao_musical', label: 'Produção Musical' },
  { value: 'edicao', label: 'Edição' },
  { value: 'distribuicao', label: 'Distribuição' },
  { value: 'producao_audiovisual', label: 'Produção Audiovisual' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'licenciamento', label: 'Licenciamento' },
  { value: 'shows', label: 'Shows' },
  { value: 'publicidade', label: 'Publicidade' },
  { value: 'parceria', label: 'Parceria' },
  { value: 'outros', label: 'Outros' },
] as const;

// Financial transaction types
export const TRANSACTION_TYPES = [
  { value: 'artista', label: 'Artista' },
  { value: 'empresa', label: 'Empresa' },
  { value: 'pessoa', label: 'Pessoa' },
  { value: 'impostos', label: 'Impostos' },
] as const;

// Financial categories for artist
export const ARTIST_CATEGORIES = [
  { value: 'caches', label: 'Cachês' },
  { value: 'suporte_financeiro', label: 'Suporte Financeiro' },
] as const;

// Payment status
export const PAYMENT_STATUS = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'Pago', label: 'Pago' },
  { value: 'pago', label: 'Pago' },
  { value: 'cancelado', label: 'Cancelado' },
  { value: 'atrasado', label: 'Atrasado' },
] as const;

// CRM contact types
export const CRM_CONTACT_TYPES = [
  { value: 'lead', label: 'Lead' },
  { value: 'cliente', label: 'Cliente' },
  { value: 'fornecedor', label: 'Fornecedor' },
  { value: 'parceiro', label: 'Parceiro' },
  { value: 'distribuidor', label: 'Distribuidor' },
  { value: 'gravadora', label: 'Gravadora' },
  { value: 'orgao_arrecadador', label: 'Órgão Arrecadador' },
] as const;

// Event types
export const EVENT_TYPES = [
  { value: 'sessoes_estudio', label: 'Sessão de Estúdio' },
  { value: 'shows', label: 'Show' },
  { value: 'sessoes_fotos', label: 'Sessão de Fotos' },
  { value: 'podcasts', label: 'Podcast' },
  { value: 'reunioes', label: 'Reunião' },
  { value: 'viagens', label: 'Viagem' },
  { value: 'meeting', label: 'Reunião' },
] as const;

// Languages
export const MUSIC_LANGUAGES = [
  { value: 'pt', label: 'Português' },
  { value: 'en', label: 'Inglês' },
  { value: 'es', label: 'Espanhol' },
  { value: 'fr', label: 'Francês' },
  { value: 'instrumental', label: 'Instrumental' },
  { value: 'outro', label: 'Outro' },
] as const;

// Release types
export const RELEASE_TYPES = [
  { value: 'single', label: 'Single' },
  { value: 'ep', label: 'EP' },
  { value: 'album', label: 'Álbum' },
] as const;

// Helper function to get label from value
export function getLabel<T extends readonly { value: string; label: string }[]>(
  options: T,
  value: string | null | undefined
): string {
  if (!value) return '-';
  const option = options.find(opt => opt.value === value);
  return option?.label || value;
}
