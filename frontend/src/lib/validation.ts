import { z } from 'zod';

/**
 * Contract validation schema with required fields
 */
export const contractValidationSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  contract_type: z.string().min(1, 'Tipo de contrato é obrigatório'),
  artist_id: z.string().optional(),
  status: z.string().default('draft'),
  // At least one value field must be present for non-draft contracts
  value: z.number().nullable().optional(),
  fixed_value: z.number().nullable().optional(),
  royalties_percentage: z.number().nullable().optional(),
  // Dates
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  effective_from: z.string().nullable().optional(),
  effective_to: z.string().nullable().optional(),
}).refine((data) => {
  // Skip validation for draft contracts
  if (data.status === 'draft' || data.status === 'rascunho') {
    return true;
  }
  // For signed/active contracts, at least one value should be present
  return data.value !== null || data.fixed_value !== null || data.royalties_percentage !== null;
}, {
  message: 'Contratos ativos devem ter pelo menos um valor definido (valor fixo ou royalties)',
  path: ['value'],
});

/**
 * Release validation schema with required fields
 */
export const releaseValidationSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  artist_id: z.string().optional(),
  status: z.string().default('planning'),
  release_date: z.string().nullable().optional(),
  release_type: z.enum(['single', 'ep', 'album']).default('single'),
  platforms: z.array(z.string()).optional(),
}).refine((data) => {
  // Approved/released items must have a release date
  if (data.status === 'aprovado' || data.status === 'released') {
    return data.release_date !== null && data.release_date !== undefined;
  }
  return true;
}, {
  message: 'Lançamentos aprovados devem ter uma data de lançamento definida',
  path: ['release_date'],
});

/**
 * Financial transaction validation schema
 */
export const financialTransactionSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.number().positive('Valor deve ser maior que zero'),
  type: z.string().min(1, 'Tipo é obrigatório'),
  date: z.string().min(1, 'Data é obrigatória'),
  status: z.string().default('pendente'),
  category: z.string().optional(),
  transaction_type: z.string().optional(),
  artist_id: z.string().optional(),
  contract_id: z.string().optional(),
  project_id: z.string().optional(),
  event_id: z.string().optional(),
  crm_contact_id: z.string().optional(),
  payment_method: z.string().optional(),
  observations: z.string().optional(),
});

/**
 * Music registration validation schema
 */
export const musicRegistrationSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  genre: z.string().min(1, 'Gênero é obrigatório'),
  artist_id: z.string().optional(),
  status: z.enum(['em_analise', 'aceita', 'recusada', 'pendente']).default('em_analise'),
  isrc: z.string().optional(),
  iswc: z.string().optional(),
  abramus_code: z.string().optional(),
  ecad_code: z.string().optional(),
  participants: z.array(z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    role: z.string().min(1, 'Função é obrigatória'),
    percentage: z.number().min(0).max(100),
    link: z.string().optional(),
  })).optional(),
});

/**
 * Artist validation schema
 */
export const artistValidationSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  full_name: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  genre: z.string().optional(),
  profile_type: z.string().optional(),
  cpf_cnpj: z.string().optional(),
  full_address: z.string().optional(),
});

/**
 * Agenda event validation schema
 */
export const agendaEventSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  start_date: z.string().min(1, 'Data de início é obrigatória'),
  event_type: z.string().default('meeting'),
  status: z.string().default('agendado'),
  artist_id: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
});

/**
 * Validate data completeness for audit
 */
export function validateDataCompleteness<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): { isComplete: boolean; missingFields: string[] } {
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    const value = data[field];
    if (value === null || value === undefined || value === '') {
      missingFields.push(String(field));
    }
  }
  
  return {
    isComplete: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Format field name for display
 */
export function formatFieldName(field: string): string {
  const translations: Record<string, string> = {
    title: 'Título',
    name: 'Nome',
    value: 'Valor',
    fixed_value: 'Valor Fixo',
    royalties_percentage: 'Royalties (%)',
    start_date: 'Data de Início',
    end_date: 'Data de Término',
    release_date: 'Data de Lançamento',
    status: 'Status',
    genre: 'Gênero',
    artist_id: 'Artista',
    contract_type: 'Tipo de Contrato',
    description: 'Descrição',
    amount: 'Valor',
    date: 'Data',
    category: 'Categoria',
    email: 'Email',
    phone: 'Telefone',
    cpf_cnpj: 'CPF/CNPJ',
    full_address: 'Endereço',
    location: 'Local',
    isrc: 'ISRC',
    iswc: 'ISWC',
  };
  
  return translations[field] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
