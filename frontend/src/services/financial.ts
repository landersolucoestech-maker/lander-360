import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { 
  PaginationParams, 
  PaginatedResult, 
  calculateRange, 
  createPaginatedResult,
  normalizePaginationParams
} from '@/lib/pagination';

type FinancialTransaction = Database['public']['Tables']['financial_transactions']['Row'];
type FinancialTransactionInsert = Database['public']['Tables']['financial_transactions']['Insert'];
type FinancialTransactionUpdate = Database['public']['Tables']['financial_transactions']['Update'];

export class FinancialService {
  // Get all transactions (mantido para compatibilidade, mas limitado)
  static async getAll(): Promise<any[]> {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select(`
        *,
        artists:artist_id (id, name, stage_name),
        crm_contacts:crm_contact_id (id, name, company),
        contracts:contract_id (id, title),
        projects:project_id (id, name),
        agenda_events:event_id (id, title)
      `)
      .order('date', { ascending: false })
      .limit(100); // Limite de segurança

    if (error) throw error;
    return data || [];
  }

  // Get transactions with pagination
  static async getPaginated(params?: Partial<PaginationParams>): Promise<PaginatedResult<any>> {
    const normalizedParams = normalizePaginationParams(params);
    const { from, to } = calculateRange(normalizedParams);

    // Usa 'date' como campo de ordenação principal (sempre presente)
    const sortField = normalizedParams.sortBy === 'created_at' ? 'date' : (normalizedParams.sortBy || 'date');

    const { data, error, count } = await supabase
      .from('financial_transactions')
      .select(`
        *,
        artists:artist_id (id, name, stage_name),
        crm_contacts:crm_contact_id (id, name, company),
        contracts:contract_id (id, title),
        projects:project_id (id, name),
        agenda_events:event_id (id, title)
      `, { count: 'exact' })
      .order(sortField, { 
        ascending: normalizedParams.sortOrder === 'asc' 
      })
      .range(from, to);

    if (error) throw error;
    return createPaginatedResult(data || [], count || 0, normalizedParams);
  }

  static async getById(id: string): Promise<FinancialTransaction | null> {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async create(transaction: FinancialTransactionInsert): Promise<FinancialTransaction> {
    const { data, error } = await supabase
      .from('financial_transactions')
      .insert(transaction)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: FinancialTransactionUpdate): Promise<FinancialTransaction> {
    const { data, error } = await supabase
      .from('financial_transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('financial_transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getByType(transactionType: string): Promise<FinancialTransaction[]> {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('transaction_type', transactionType)
      .order('transaction_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getByDateRange(startDate: string, endDate: string): Promise<FinancialTransaction[]> {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .order('transaction_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getByArtist(artistId: string): Promise<FinancialTransaction[]> {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('artist_id', artistId)
      .order('transaction_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getTotalByType(): Promise<{ type: string; total: number }[]> {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('transaction_type, amount')
      .eq('status', 'Pago');

    if (error) throw error;

    const totals = data?.reduce((acc, transaction) => {
      const type = transaction.transaction_type;
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type] += Number(transaction.amount);
      return acc;
    }, {} as Record<string, number>) || {};

    return Object.entries(totals).map(([type, total]) => ({ type, total }));
  }
}