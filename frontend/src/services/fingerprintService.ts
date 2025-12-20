/**
 * FingerprintProviderService
 * 
 * Serviço para integração com provedores de fingerprinting de áudio
 * como BMAT, Soundmouse, ACRCloud, etc.
 * 
 * Responsável por:
 * - Enviar áudio master para análise
 * - Registrar fingerprints
 * - Processar execuções detectadas
 */

import { supabase } from '@/integrations/supabase/client';

// Tipos de provedores suportados
export type FingerprintProvider = 'bmat' | 'soundmouse' | 'acrcloud' | 'audiblemagic';

// Interface para configuração do provedor
export interface ProviderConfig {
  provider: FingerprintProvider;
  apiKey: string;
  apiSecret?: string;
  baseUrl: string;
  webhookSecret?: string;
}

// Interface para resultado de registro de fingerprint
export interface FingerprintRegistrationResult {
  success: boolean;
  externalId?: string;
  fingerprintHash?: string;
  error?: string;
  registeredAt?: string;
}

// Interface para execução detectada
export interface DetectedPlay {
  externalId: string;
  trackExternalId: string;
  platform: 'radio' | 'tv';
  stationChannel: string;
  detectedAt: string;
  durationSeconds: number;
  confidenceScore: number;
  metadata?: Record<string, unknown>;
}

/**
 * Serviço principal de fingerprinting
 */
export class FingerprintProviderService {
  
  /**
   * Envia áudio master para o provedor de fingerprinting
   * Deve ser chamado após upload de nova faixa
   */
  static async registerAudioFingerprint(
    trackId: string,
    audioUrl: string,
    metadata: {
      title: string;
      artist: string;
      isrc?: string;
      iswc?: string;
      duration?: number;
    }
  ): Promise<FingerprintRegistrationResult> {
    try {
      console.log(`[FingerprintService] Registrando fingerprint para track: ${trackId}`);
      
      // Chama edge function para processar com o provedor
      const { data, error } = await supabase.functions.invoke('fingerprint-register', {
        body: {
          trackId,
          audioUrl,
          metadata
        }
      });

      if (error) {
        console.error('[FingerprintService] Erro ao registrar:', error);
        return { success: false, error: error.message };
      }

      // Atualiza registro na tabela music_registry com ID externo
      if (data?.externalId) {
        await supabase
          .from('music_registry')
          .update({
            fingerprint_id: data.externalId,
            fingerprint_provider: data.provider,
            fingerprint_registered_at: new Date().toISOString()
          } as any)
          .eq('id', trackId);
      }

      console.log(`[FingerprintService] Fingerprint registrado: ${data?.externalId}`);
      
      return {
        success: true,
        externalId: data?.externalId,
        fingerprintHash: data?.fingerprintHash,
        registeredAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('[FingerprintService] Erro inesperado:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  /**
   * Processa execução detectada recebida via webhook
   * Salva na tabela radio_tv_detections
   */
  static async processDetectedPlay(play: DetectedPlay): Promise<{ success: boolean; detectionId?: string; error?: string }> {
    try {
      console.log(`[FingerprintService] Processando execução: ${play.trackExternalId} em ${play.stationChannel}`);

      // Busca track pelo ID externo do fingerprint (usando metadata)
      const { data: tracks } = await supabase
        .from('music_registry')
        .select('id, title, artist_id')
        .limit(100);

      // Filtra manualmente por metadata
      const track = (tracks || []).find((t: any) => 
        t.metadata?.fingerprint_id === play.trackExternalId
      );

      // Verifica duplicidade
      const { data: allDetections } = await supabase
        .from('radio_tv_detections')
        .select('id, metadata')
        .limit(100);

      const existing = (allDetections || []).find((d: any) => 
        d.metadata?.external_detection_id === play.externalId
      );

      if (existing) {
        console.log(`[FingerprintService] Execução já registrada: ${play.externalId}`);
        return { success: true, detectionId: existing.id };
      }

      // Cria registro de detecção
      const { data: detection, error } = await supabase
        .from('radio_tv_detections')
        .insert({
          music_registry_id: track?.id || null,
          artist_id: track?.artist_id || null,
          title: track?.title || 'Desconhecido',
          platform: play.platform,
          station_channel: play.stationChannel,
          detected_at: play.detectedAt,
          duration_seconds: play.durationSeconds,
          confidence_score: play.confidenceScore,
          fingerprint_provider: 'external',
          external_detection_id: play.externalId,
          status: track ? 'verified' : 'pending',
          ecad_matched: false,
          metadata: play.metadata
        } as any)
        .select()
        .single();

      if (error) {
        console.error('[FingerprintService] Erro ao salvar detecção:', error);
        return { success: false, error: error.message };
      }

      console.log(`[FingerprintService] Detecção salva: ${detection.id}`);
      return { success: true, detectionId: detection.id };
    } catch (error) {
      console.error('[FingerprintService] Erro ao processar execução:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  /**
   * Sincroniza execuções não recebidas por webhook
   * Job de fallback executado diariamente
   */
  static async syncMissingPlays(
    startDate: string,
    endDate: string
  ): Promise<{ success: boolean; synced: number; errors: number }> {
    try {
      console.log(`[FingerprintService] Sincronizando execuções de ${startDate} a ${endDate}`);

      // Chama edge function para buscar execuções do provedor
      const { data, error } = await supabase.functions.invoke('fingerprint-sync', {
        body: { startDate, endDate }
      });

      if (error) {
        console.error('[FingerprintService] Erro na sincronização:', error);
        return { success: false, synced: 0, errors: 1 };
      }

      let synced = 0;
      let errors = 0;

      // Processa cada execução
      for (const play of (data?.plays || [])) {
        const result = await this.processDetectedPlay(play);
        if (result.success) {
          synced++;
        } else {
          errors++;
        }
      }

      console.log(`[FingerprintService] Sincronização concluída: ${synced} sincronizados, ${errors} erros`);
      return { success: true, synced, errors };
    } catch (error) {
      console.error('[FingerprintService] Erro na sincronização:', error);
      return { success: false, synced: 0, errors: 1 };
    }
  }

  /**
   * Lista todas as faixas com fingerprint registrado (via metadata)
   */
  static async getRegisteredTracks(): Promise<Array<{
    id: string;
    title: string;
    fingerprintId: string;
    provider: string;
    registeredAt: string;
  }>> {
    const { data, error } = await supabase
      .from('music_registry')
      .select('id, title, metadata')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[FingerprintService] Erro ao listar faixas:', error);
      return [];
    }

    return (data || [])
      .filter((track: any) => track.metadata?.fingerprint_id)
      .map((track: any) => ({
        id: track.id,
        title: track.title,
        fingerprintId: track.metadata?.fingerprint_id || '',
        provider: track.metadata?.fingerprint_provider || '',
        registeredAt: track.metadata?.fingerprint_registered_at || ''
      }));
  }

  /**
   * Remove fingerprint de uma faixa (para re-registro)
   */
  static async removeFingerprint(trackId: string): Promise<boolean> {
    console.log(`[FingerprintService] removeFingerprint chamado para: ${trackId}`);
    // Fingerprint é gerenciado via metadata - implementar conforme necessário
    return true;
  }
}
