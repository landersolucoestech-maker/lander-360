/**
 * LicenseProposalService & LicenseActivationService
 * 
 * Serviços para gerenciamento de licenciamento sync:
 * - Criação e gestão de propostas
 * - Cálculo de valores
 * - Ativação de licenças
 * - Controle de exclusividade e conflitos
 */

import { supabase } from '@/integrations/supabase/client';

// Status de proposta
export type ProposalStatus = 'draft' | 'sent' | 'negotiation' | 'accepted' | 'rejected' | 'expired';

// Tipos de licença
export type LicenseType = 'sync' | 'master' | 'publishing' | 'mechanical' | 'performance';

// Tipos de mídia
export type MediaType = 'film' | 'tv' | 'commercial' | 'game' | 'web' | 'podcast' | 'other';

// Interface para proposta de licença
export interface LicenseProposal {
  id: string;
  title: string;
  description?: string;
  musicRegistryId: string;
  artistId?: string;
  contactId?: string;
  licenseType: LicenseType;
  mediaType: MediaType;
  territory: string;
  duration: string;
  exclusivity: boolean;
  licenseFee: number;
  advancePayment?: number;
  royaltyPercentage?: number;
  status: ProposalStatus;
  proposalDate: string;
  expiryDate?: string;
  projectName?: string;
  clientName: string;
  clientCompany?: string;
  usageDescription?: string;
  notes?: string;
}

// Interface para cálculo de valor
export interface LicenseFeeCalculation {
  baseFee: number;
  territoryMultiplier: number;
  durationMultiplier: number;
  exclusivityMultiplier: number;
  mediaTypeMultiplier: number;
  totalFee: number;
  breakdown: {
    component: string;
    value: number;
    multiplier: number;
  }[];
}

/**
 * Serviço de propostas de licença
 */
export class LicenseProposalService {
  
  // Tabela de multiplicadores por território
  private static TERRITORY_MULTIPLIERS: Record<string, number> = {
    'worldwide': 3.0,
    'north_america': 2.0,
    'europe': 1.8,
    'latin_america': 1.5,
    'brazil': 1.0,
    'asia': 1.7,
    'other': 1.2
  };

  // Tabela de multiplicadores por duração
  private static DURATION_MULTIPLIERS: Record<string, number> = {
    '1_month': 0.5,
    '3_months': 0.7,
    '6_months': 0.85,
    '1_year': 1.0,
    '2_years': 1.5,
    '3_years': 2.0,
    '5_years': 2.5,
    'perpetual': 4.0
  };

  // Tabela de multiplicadores por tipo de mídia
  private static MEDIA_MULTIPLIERS: Record<MediaType, number> = {
    'film': 2.5,
    'commercial': 2.0,
    'tv': 1.5,
    'game': 1.8,
    'web': 0.8,
    'podcast': 0.6,
    'other': 1.0
  };

  /**
   * Calcula valor sugerido para licença
   */
  static calculateLicenseFee(params: {
    baseFee: number;
    territory: string;
    duration: string;
    mediaType: MediaType;
    exclusivity: boolean;
  }): LicenseFeeCalculation {
    const territoryMultiplier = this.TERRITORY_MULTIPLIERS[params.territory] || 1.0;
    const durationMultiplier = this.DURATION_MULTIPLIERS[params.duration] || 1.0;
    const mediaTypeMultiplier = this.MEDIA_MULTIPLIERS[params.mediaType] || 1.0;
    const exclusivityMultiplier = params.exclusivity ? 2.0 : 1.0;

    const totalFee = params.baseFee * territoryMultiplier * durationMultiplier * mediaTypeMultiplier * exclusivityMultiplier;

    return {
      baseFee: params.baseFee,
      territoryMultiplier,
      durationMultiplier,
      exclusivityMultiplier,
      mediaTypeMultiplier,
      totalFee: Math.round(totalFee * 100) / 100,
      breakdown: [
        { component: 'Base', value: params.baseFee, multiplier: 1 },
        { component: 'Território', value: params.baseFee * territoryMultiplier, multiplier: territoryMultiplier },
        { component: 'Duração', value: params.baseFee * durationMultiplier, multiplier: durationMultiplier },
        { component: 'Tipo de Mídia', value: params.baseFee * mediaTypeMultiplier, multiplier: mediaTypeMultiplier },
        { component: 'Exclusividade', value: params.baseFee * exclusivityMultiplier, multiplier: exclusivityMultiplier }
      ]
    };
  }

  /**
   * Cria nova proposta de licença
   */
  static async createProposal(proposal: Omit<LicenseProposal, 'id'>): Promise<{ success: boolean; proposalId?: string; error?: string }> {
    try {
      console.log(`[LicenseProposal] Criando proposta: ${proposal.title}`);

      // Verifica conflitos de exclusividade
      if (proposal.exclusivity) {
        const hasConflict = await this.checkExclusivityConflict(
          proposal.musicRegistryId,
          proposal.territory,
          proposal.mediaType
        );

        if (hasConflict) {
          return {
            success: false,
            error: 'Existe uma licença exclusiva ativa para este território/mídia'
          };
        }
      }

      const { data, error } = await supabase
        .from('sync_licenses')
        .insert({
          title: proposal.title,
          description: proposal.description,
          music_registry_id: proposal.musicRegistryId,
          artist_id: proposal.artistId,
          contact_id: proposal.contactId,
          license_type: proposal.licenseType,
          media_type: proposal.mediaType,
          territory: proposal.territory,
          duration: proposal.duration,
          exclusivity: proposal.exclusivity,
          license_fee: proposal.licenseFee,
          advance_payment: proposal.advancePayment,
          royalty_percentage: proposal.royaltyPercentage,
          status: 'proposta',
          proposal_date: proposal.proposalDate,
          project_name: proposal.projectName,
          client_name: proposal.clientName,
          client_company: proposal.clientCompany,
          usage_description: proposal.usageDescription
        })
        .select()
        .single();

      if (error) {
        console.error('[LicenseProposal] Erro ao criar:', error);
        return { success: false, error: error.message };
      }

      console.log(`[LicenseProposal] Proposta criada: ${data.id}`);
      return { success: true, proposalId: data.id };
    } catch (error) {
      console.error('[LicenseProposal] Erro:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  /**
   * Atualiza status da proposta
   */
  static async updateProposalStatus(
    proposalId: string,
    newStatus: ProposalStatus,
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[LicenseProposal] Atualizando status: ${proposalId} -> ${newStatus}`);

      const updates: Record<string, unknown> = { status: newStatus };
      
      // Define datas específicas por status
      if (newStatus === 'sent') {
        updates.submitted_date = new Date().toISOString();
      } else if (newStatus === 'accepted') {
        updates.signed_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('sync_licenses')
        .update(updates)
        .eq('id', proposalId);

      if (error) {
        console.error('[LicenseProposal] Erro ao atualizar:', error);
        return { success: false, error: error.message };
      }

      // Se aceita, ativa automaticamente a licença
      if (newStatus === 'accepted') {
        await LicenseActivationService.activateLicense(proposalId);
      }

      return { success: true };
    } catch (error) {
      console.error('[LicenseProposal] Erro:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  /**
   * Verifica conflito de exclusividade
   */
  static async checkExclusivityConflict(
    musicRegistryId: string,
    territory: string,
    mediaType: string
  ): Promise<boolean> {
    const { data } = await supabase
      .from('sync_licenses')
      .select('id')
      .eq('music_registry_id', musicRegistryId)
      .eq('territory', territory)
      .eq('media_type', mediaType)
      .eq('exclusivity', true)
      .eq('status', 'ativo')
      .limit(1);

    return data !== null && data.length > 0;
  }

  /**
   * Lista propostas pendentes (próximas de expirar)
   */
  static async getPendingProposals(daysToExpiry: number = 7): Promise<LicenseProposal[]> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + daysToExpiry);

    const { data, error } = await supabase
      .from('sync_licenses')
      .select('*')
      .in('status', ['proposta', 'negociacao'])
      .lte('proposal_date', expiryDate.toISOString())
      .order('proposal_date', { ascending: true });

    if (error) {
      console.error('[LicenseProposal] Erro ao listar pendentes:', error);
      return [];
    }

    return (data || []).map(this.mapToProposal);
  }

  /**
   * Mapeia registro do banco para interface
   */
  private static mapToProposal(record: any): LicenseProposal {
    return {
      id: record.id,
      title: record.title,
      description: record.description,
      musicRegistryId: record.music_registry_id,
      artistId: record.artist_id,
      contactId: record.contact_id,
      licenseType: record.license_type,
      mediaType: record.media_type,
      territory: record.territory,
      duration: record.duration,
      exclusivity: record.exclusivity,
      licenseFee: record.license_fee,
      advancePayment: record.advance_payment,
      royaltyPercentage: record.royalty_percentage,
      status: record.status,
      proposalDate: record.proposal_date,
      expiryDate: record.end_date,
      projectName: record.project_name,
      clientName: record.client_name,
      clientCompany: record.client_company,
      usageDescription: record.usage_description
    };
  }
}

/**
 * Serviço de ativação de licenças
 */
export class LicenseActivationService {
  
  /**
   * Ativa uma licença após aceite da proposta
   */
  static async activateLicense(proposalId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[LicenseActivation] Ativando licença: ${proposalId}`);

      // Busca a proposta
      const { data: proposal, error: proposalError } = await supabase
        .from('sync_licenses')
        .select('*')
        .eq('id', proposalId)
        .single();

      if (proposalError || !proposal) {
        return { success: false, error: 'Proposta não encontrada' };
      }

      // Verifica novamente conflitos de exclusividade
      if (proposal.exclusivity) {
        const hasConflict = await LicenseProposalService.checkExclusivityConflict(
          proposal.music_registry_id,
          proposal.territory,
          proposal.media_type
        );

        if (hasConflict) {
          return {
            success: false,
            error: 'Conflito de exclusividade detectado. Não é possível ativar.'
          };
        }
      }

      // Calcula data de expiração baseada na duração
      const startDate = new Date();
      const endDate = this.calculateEndDate(startDate, proposal.duration);

      // Atualiza status e datas
      const { error: updateError } = await supabase
        .from('sync_licenses')
        .update({
          status: 'ativo',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          signed_date: new Date().toISOString()
        })
        .eq('id', proposalId);

      if (updateError) {
        console.error('[LicenseActivation] Erro ao ativar:', updateError);
        return { success: false, error: updateError.message };
      }

      // Cria contrato associado (se necessário)
      await this.createAssociatedContract(proposal, startDate, endDate);

      console.log(`[LicenseActivation] Licença ativada com sucesso: ${proposalId}`);
      return { success: true };
    } catch (error) {
      console.error('[LicenseActivation] Erro:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  /**
   * Calcula data de término baseada na duração
   */
  private static calculateEndDate(startDate: Date, duration: string): Date {
    const endDate = new Date(startDate);
    
    const durationMap: Record<string, () => void> = {
      '1_month': () => endDate.setMonth(endDate.getMonth() + 1),
      '3_months': () => endDate.setMonth(endDate.getMonth() + 3),
      '6_months': () => endDate.setMonth(endDate.getMonth() + 6),
      '1_year': () => endDate.setFullYear(endDate.getFullYear() + 1),
      '2_years': () => endDate.setFullYear(endDate.getFullYear() + 2),
      '3_years': () => endDate.setFullYear(endDate.getFullYear() + 3),
      '5_years': () => endDate.setFullYear(endDate.getFullYear() + 5),
      'perpetual': () => endDate.setFullYear(endDate.getFullYear() + 99)
    };

    const calculate = durationMap[duration];
    if (calculate) {
      calculate();
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1); // Default: 1 ano
    }

    return endDate;
  }

  /**
   * Cria contrato associado à licença
   */
  private static async createAssociatedContract(
    license: any,
    startDate: Date,
    endDate: Date
  ): Promise<void> {
    try {
      await supabase.from('contracts').insert({
        title: `Licença Sync - ${license.title}`,
        description: license.usage_description || `Licença de sincronização para ${license.project_name || 'projeto'}`,
        artist_id: license.artist_id,
        contract_type: 'sync',
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        value: license.license_fee,
        status: 'signed',
        signed_date: new Date().toISOString(),
        terms: `Território: ${license.territory}\nTipo de Mídia: ${license.media_type}\nExclusividade: ${license.exclusivity ? 'Sim' : 'Não'}`
      });

      console.log('[LicenseActivation] Contrato criado para licença');
    } catch (error) {
      console.error('[LicenseActivation] Erro ao criar contrato:', error);
      // Não falha a ativação se o contrato falhar
    }
  }

  /**
   * Desativa licença expirada
   */
  static async deactivateExpiredLicenses(): Promise<{ deactivated: number }> {
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('sync_licenses')
        .update({ status: 'expirado' })
        .eq('status', 'ativo')
        .lt('end_date', now)
        .select('id');

      if (error) {
        console.error('[LicenseActivation] Erro ao desativar:', error);
        return { deactivated: 0 };
      }

      console.log(`[LicenseActivation] ${data?.length || 0} licenças desativadas`);
      return { deactivated: data?.length || 0 };
    } catch (error) {
      console.error('[LicenseActivation] Erro:', error);
      return { deactivated: 0 };
    }
  }

  /**
   * Lista licenças próximas de expirar
   */
  static async getExpiringLicenses(daysAhead: number = 30): Promise<any[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const { data, error } = await supabase
      .from('sync_licenses')
      .select(`
        *,
        artists(name, full_name),
        music_registry(title)
      `)
      .eq('status', 'ativo')
      .lte('end_date', futureDate.toISOString())
      .order('end_date', { ascending: true });

    if (error) {
      console.error('[LicenseActivation] Erro ao listar expirando:', error);
      return [];
    }

    return data || [];
  }
}
