import { supabase } from '@/integrations/supabase/client';
import { Contract, ContractInsert, ContractUpdate, ContractWithDetails } from '@/types/database';
import { getTodayDateString, formatDateForDB } from '@/lib/utils';

export class ContractsService {
  // Get all contracts
  static async getAll(): Promise<Contract[]> {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
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
    // Filter active contracts based on effective dates
    const today = getTodayDateString();
    return (data || []).filter(contract => 
      contract.effective_from <= today && 
      (!contract.effective_to || contract.effective_to >= today)
    );
  }

  // Get contracts expiring soon
  static async getExpiringSoon(days: number = 30): Promise<Contract[]> {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .not('effective_to', 'is', null)
      .order('effective_to', { ascending: true });

    if (error) throw error;
    
    // Filter contracts expiring within the specified days
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const futureDateStr = formatDateForDB(futureDate) || '';
    
    return (data || []).filter(contract => 
      contract.effective_to && contract.effective_to <= futureDateStr
    );
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