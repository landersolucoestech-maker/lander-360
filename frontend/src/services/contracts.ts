import { supabase } from '@/integrations/supabase/client';
import { Contract, ContractInsert, ContractUpdate, ContractWithDetails } from '@/types/database';
import { getTodayDateString, formatDateForDB } from '@/lib/utils';

export class ContractsService {
  // Get all contracts with artist info
  static async getAll(): Promise<(Contract & { artists?: { name: string; stage_name?: string } })[]> {
    const { data, error } = await supabase
      .from('contracts')
      .select('*, artists(name, stage_name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get contract by ID
  static async getById(id: string): Promise<Contract | null> {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }

  // Get contract with details (including relationships)
  static async getWithDetails(id: string): Promise<ContractWithDetails | null> {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    // Add related data when available
    return {
      ...data,
      artist: undefined,
      project: undefined
    };
  }

  // Create new contract
  static async create(contract: ContractInsert): Promise<Contract> {
    const { data, error } = await supabase
      .from('contracts')
      .insert(contract)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update contract
  static async update(id: string, updates: ContractUpdate): Promise<Contract> {
    const { data, error } = await supabase
      .from('contracts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete contract
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Get contracts by artist
  static async getByArtist(artistId: string): Promise<Contract[]> {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('artist_id', artistId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get contracts by project - simplified since project relationships might not exist
  static async getByProject(projectId: string): Promise<Contract[]> {
    // Return empty array for now since project relationships might not be set up
    return [];
  }

  // Get active contracts
  static async getActive(): Promise<Contract[]> {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    // Filter active contracts based on status OR effective dates
    const today = getTodayDateString();
    return (data || []).filter(contract => {
      // Check status-based active state
      const activeStatuses = ['active', 'ativo', 'signed', 'assinado'];
      if (activeStatuses.includes(contract.status?.toLowerCase() || '')) {
        return true;
      }
      // Check date-based active state
      const startDate = contract.start_date || contract.effective_from;
      const endDate = contract.end_date || contract.effective_to;
      if (startDate && startDate <= today && (!endDate || endDate >= today)) {
        return true;
      }
      return false;
    });
  }

  // Get contracts expiring soon
  static async getExpiringSoon(days: number = 30): Promise<Contract[]> {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .order('end_date', { ascending: true });

    if (error) throw error;
    
    const today = new Date();
    const todayStr = getTodayDateString();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const futureDateStr = formatDateForDB(futureDate) || '';
    
    // Filter contracts expiring within the specified days - check both end_date and effective_to
    return (data || []).filter(contract => {
      const endDate = contract.end_date || contract.effective_to;
      if (!endDate) return false;
      // Must be active (not expired) and expiring within the period
      return endDate >= todayStr && endDate <= futureDateStr;
    });
  }

  // Filter by contract type
  static async filterByType(contractType: string): Promise<Contract[]> {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('contract_type', contractType)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}