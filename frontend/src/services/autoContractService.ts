import { supabase } from '@/integrations/supabase/client';
import { ContractsService } from './contracts';

export interface AutoContractData {
  artist_id: string;
  artist_name: string;
  music_title: string;
  music_id?: string;
  participant_percentage?: number;
}

export class AutoContractService {
  // Create automatic edition contract when Lander Records is added as editor
  static async createEditionContract(data: AutoContractData): Promise<string | null> {
    try {
      // Check if contract already exists for this artist with edition type
      const existingContracts = await ContractsService.getByArtist(data.artist_id);
      const hasEditionContract = existingContracts.some(
        c => c.service_type === 'edicao' && c.status !== 'rescindido' && c.status !== 'expirado'
      );

      if (hasEditionContract) {
        console.log('Edition contract already exists for artist:', data.artist_id);
        return null;
      }

      // Create new edition contract
      const contractData = {
        title: `Contrato de Edição "${data.music_title}" - ${data.artist_name}`,
        client_type: 'artista' as const,
        service_type: 'edicao' as const,
        artist_id: data.artist_id,
        status: 'rascunho' as const,
        description: `Contrato de edição musical criado automaticamente para a obra "${data.music_title}". Lander Records como editora.`,
        observations: `Obra: ${data.music_title}\nParticipação Lander Records: ${data.participant_percentage || 0}%`,
        notes: `Obra: ${data.music_title}\nParticipação: ${data.participant_percentage || 0}%`,
        effective_from: new Date().toISOString().split('T')[0],
      };

      const contract = await ContractsService.create(contractData);
      console.log('Auto contract created:', contract.id);
      
      return contract.id;
    } catch (error) {
      console.error('Error creating auto contract:', error);
      return null;
    }
  }

  // Request digital signature for a contract via Autentique
  static async requestDigitalSignature(contractId: string, pdfBase64?: string): Promise<{ success: boolean; documentId?: string; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('autentique-signature', {
        body: { contractId, action: 'create', pdfBase64 }
      });

      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao enviar para assinatura');
      }
      
      return { success: true, documentId: data.documentId };
    } catch (error: any) {
      console.error('Error requesting digital signature:', error);
      return { success: false, error: error.message };
    }
  }

  // Check signature status
  static async checkSignatureStatus(documentId: string): Promise<{ status: string; signedUrl?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('autentique-signature', {
        body: { documentId, action: 'status' }
      });

      if (error) throw error;
      
      return { status: data.status, signedUrl: data.signedUrl };
    } catch (error: any) {
      console.error('Error checking signature status:', error);
      return { status: 'error' };
    }
  }
}
