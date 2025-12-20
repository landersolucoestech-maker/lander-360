/**
 * TakedownService & ClaimsService
 * 
 * Serviços para gerenciamento de:
 * - Claims recebidos de plataformas (YouTube, Meta, TikTok)
 * - Takedowns enviados para remoção de conteúdo
 * - Disputes e contestações
 */

import { supabase } from '@/integrations/supabase/client';

// Plataformas suportadas
export type Platform = 'youtube' | 'meta' | 'tiktok' | 'spotify' | 'soundcloud' | 'other';

// Status de takedown
export type TakedownStatus = 'draft' | 'sent' | 'processing' | 'removed' | 'rejected' | 'disputed';

// Status de claim
export type ClaimStatus = 'received' | 'reviewing' | 'accepted' | 'disputed' | 'released' | 'resolved';

// Tipos de claim
export type ClaimType = 'copyright' | 'content_id' | 'manual' | 'automated';

// Interface para claim recebido
export interface ReceivedClaim {
  id: string;
  platform: Platform;
  claimType: ClaimType;
  externalClaimId: string;
  contentUrl: string;
  claimedContentTitle?: string;
  claimerName?: string;
  musicRegistryId?: string;
  artistId?: string;
  matchedAsset?: string;
  matchPercentage?: number;
  claimDate: string;
  status: ClaimStatus;
  action?: 'monetize' | 'block' | 'track';
  revenue?: number;
  notes?: string;
}

// Interface para takedown
export interface TakedownRequest {
  id: string;
  platform: Platform;
  reason: 'copyright' | 'trademark' | 'privacy' | 'other';
  contentUrl: string;
  infringingParty?: string;
  musicRegistryId?: string;
  artistId?: string;
  releaseId?: string;
  description: string;
  evidenceUrls?: string[];
  status: TakedownStatus;
  requestDate: string;
  submittedDate?: string;
  resolvedDate?: string;
  responseNotes?: string;
}

/**
 * Serviço de gerenciamento de Claims
 */
export class ClaimsService {
  
  /**
   * Processa claim recebido via webhook
   */
  static async processIncomingClaim(claimData: {
    platform: Platform;
    externalClaimId: string;
    claimType: ClaimType;
    contentUrl: string;
    contentTitle?: string;
    claimerName?: string;
    matchedAssetId?: string;
    matchPercentage?: number;
    action?: string;
    rawData?: Record<string, unknown>;
  }): Promise<{ success: boolean; claimId?: string; error?: string }> {
    try {
      console.log(`[ClaimsService] Processando claim: ${claimData.externalClaimId} de ${claimData.platform}`);

      // Verifica duplicidade
      const { data: existing } = await supabase
        .from('takedowns')
        .select('id')
        .eq('content_url', claimData.contentUrl)
        .eq('is_incoming', true)
        .limit(1);

      if (existing && existing.length > 0) {
        console.log('[ClaimsService] Claim já existe, atualizando...');
        return { success: true, claimId: existing[0].id };
      }

      // Tenta fazer match com asset do catálogo
      let musicRegistryId: string | undefined;
      let artistId: string | undefined;

      if (claimData.matchedAssetId) {
        const { data: track } = await supabase
          .from('music_registry')
          .select('id, artist_id')
          .or(`isrc.eq.${claimData.matchedAssetId},fingerprint_id.eq.${claimData.matchedAssetId}`)
          .limit(1);

        if (track && track.length > 0) {
          musicRegistryId = track[0].id;
          artistId = track[0].artist_id;
        }
      }

      // Cria registro do claim
      const { data, error } = await supabase
        .from('takedowns')
        .insert({
          platform: claimData.platform,
          reason: 'copyright',
          content_url: claimData.contentUrl,
          title: claimData.contentTitle || `Claim ${claimData.externalClaimId}`,
          infringing_party: claimData.claimerName,
          music_registry_id: musicRegistryId,
          artist_id: artistId,
          description: `Claim automático recebido via ${claimData.platform}. Match: ${claimData.matchPercentage || 'N/A'}%`,
          status: 'pending',
          is_incoming: true,
          dispute_status: null,
          request_date: new Date().toISOString(),
          evidence_urls: claimData.rawData ? [JSON.stringify(claimData.rawData)] : []
        })
        .select()
        .single();

      if (error) {
        console.error('[ClaimsService] Erro ao salvar claim:', error);
        return { success: false, error: error.message };
      }

      console.log(`[ClaimsService] Claim registrado: ${data.id}`);
      return { success: true, claimId: data.id };
    } catch (error) {
      console.error('[ClaimsService] Erro:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  /**
   * Atualiza status de um claim
   */
  static async updateClaimStatus(
    claimId: string,
    newStatus: ClaimStatus,
    notes?: string
  ): Promise<boolean> {
    try {
      const updates: Record<string, unknown> = { 
        status: newStatus === 'resolved' ? 'resolved' : 'pending',
        dispute_status: newStatus === 'disputed' ? 'disputed' : null
      };
      
      if (newStatus === 'resolved') {
        updates.resolved_date = new Date().toISOString();
      }
      if (notes) {
        updates.response_notes = notes;
      }

      const { error } = await supabase
        .from('takedowns')
        .update(updates)
        .eq('id', claimId);

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Disputa um claim
   */
  static async disputeClaim(
    claimId: string,
    reason: string,
    evidence: string[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[ClaimsService] Disputando claim: ${claimId}`);

      const { data: claim } = await supabase
        .from('takedowns')
        .select('*')
        .eq('id', claimId)
        .single();

      if (!claim) {
        return { success: false, error: 'Claim não encontrado' };
      }

      // Atualiza status local
      const existingEvidence = Array.isArray(claim.evidence_urls) ? claim.evidence_urls : [];
      await supabase
        .from('takedowns')
        .update({
          dispute_status: 'disputed',
          response_notes: reason,
          evidence_urls: [...existingEvidence, ...evidence]
        })
        .eq('id', claimId);

      // Envia disputa via edge function (se API disponível)
      const { error } = await supabase.functions.invoke('platform-dispute', {
        body: {
          platform: claim.platform,
          claimId: claim.id,
          reason,
          evidence
        }
      });

      if (error) {
        console.warn('[ClaimsService] Disputa via API falhou, registrada apenas localmente');
      }

      return { success: true };
    } catch (error) {
      console.error('[ClaimsService] Erro ao disputar:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  /**
   * Lista claims por status
   */
  static async getClaimsByStatus(status: ClaimStatus): Promise<ReceivedClaim[]> {
    const statusMap: Record<ClaimStatus, string> = {
      'received': 'pending',
      'reviewing': 'pending',
      'accepted': 'resolved',
      'disputed': 'pending',
      'released': 'resolved',
      'resolved': 'resolved'
    };

    const { data, error } = await supabase
      .from('takedowns')
      .select('*')
      .eq('is_incoming', true)
      .eq('status', statusMap[status])
      .order('request_date', { ascending: false });

    if (error) {
      console.error('[ClaimsService] Erro ao listar claims:', error);
      return [];
    }

    return (data || []).map(this.mapToClaim);
  }

  /**
   * Mapeia registro para interface
   */
  private static mapToClaim(record: any): ReceivedClaim {
    return {
      id: record.id,
      platform: record.platform,
      claimType: 'copyright',
      externalClaimId: record.id,
      contentUrl: record.content_url,
      claimedContentTitle: record.title,
      claimerName: record.infringing_party,
      musicRegistryId: record.music_registry_id,
      artistId: record.artist_id,
      claimDate: record.request_date,
      status: record.dispute_status === 'disputed' ? 'disputed' : 
              record.status === 'resolved' ? 'resolved' : 'received',
      notes: record.response_notes
    };
  }
}

/**
 * Serviço de envio de Takedowns
 */
export class TakedownService {
  
  /**
   * Cria e envia solicitação de takedown
   */
  static async createTakedown(request: Omit<TakedownRequest, 'id' | 'status' | 'requestDate'>): Promise<{ 
    success: boolean; 
    takedownId?: string; 
    error?: string;
    sentViaApi?: boolean;
  }> {
    try {
      console.log(`[TakedownService] Criando takedown para: ${request.contentUrl}`);

      // Cria registro do takedown
      const { data, error } = await supabase
        .from('takedowns')
        .insert({
          platform: request.platform,
          reason: request.reason,
          content_url: request.contentUrl,
          title: request.description.substring(0, 100),
          infringing_party: request.infringingParty,
          music_registry_id: request.musicRegistryId,
          artist_id: request.artistId,
          release_id: request.releaseId,
          description: request.description,
          evidence_urls: request.evidenceUrls,
          status: 'pending',
          is_incoming: false,
          request_date: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('[TakedownService] Erro ao criar:', error);
        return { success: false, error: error.message };
      }

      // Tenta enviar via API da plataforma
      let sentViaApi = false;
      try {
        const apiResult = await this.sendTakedownViaApi(data.id, request);
        sentViaApi = apiResult.success;
        
        if (sentViaApi) {
          await supabase
            .from('takedowns')
            .update({ 
              status: 'submitted',
              submitted_date: new Date().toISOString()
            })
            .eq('id', data.id);
        }
      } catch (apiError) {
        console.warn('[TakedownService] Envio via API falhou, takedown registrado para envio manual');
      }

      console.log(`[TakedownService] Takedown criado: ${data.id}, via API: ${sentViaApi}`);
      return { success: true, takedownId: data.id, sentViaApi };
    } catch (error) {
      console.error('[TakedownService] Erro:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  /**
   * Envia takedown via API da plataforma (quando disponível)
   */
  private static async sendTakedownViaApi(
    takedownId: string,
    request: Omit<TakedownRequest, 'id' | 'status' | 'requestDate'>
  ): Promise<{ success: boolean; externalId?: string }> {
    // Chama edge function que gerencia integração com APIs das plataformas
    const { data, error } = await supabase.functions.invoke('platform-takedown', {
      body: {
        takedownId,
        platform: request.platform,
        contentUrl: request.contentUrl,
        reason: request.reason,
        description: request.description,
        evidenceUrls: request.evidenceUrls
      }
    });

    if (error) {
      console.error('[TakedownService] Erro na API:', error);
      return { success: false };
    }

    return { success: data?.success || false, externalId: data?.externalId };
  }

  /**
   * Atualiza status do takedown
   */
  static async updateTakedownStatus(
    takedownId: string,
    newStatus: TakedownStatus,
    responseNotes?: string
  ): Promise<boolean> {
    try {
      const updates: Record<string, unknown> = { status: newStatus };
      
      if (newStatus === 'sent' || newStatus === 'processing') {
        updates.submitted_date = new Date().toISOString();
      }
      if (newStatus === 'removed' || newStatus === 'rejected') {
        updates.resolved_date = new Date().toISOString();
      }
      if (responseNotes) {
        updates.response_notes = responseNotes;
      }

      const { error } = await supabase
        .from('takedowns')
        .update(updates)
        .eq('id', takedownId);

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Lista takedowns por status
   */
  static async getTakedownsByStatus(status?: TakedownStatus): Promise<TakedownRequest[]> {
    let query = supabase
      .from('takedowns')
      .select('*')
      .eq('is_incoming', false)
      .order('request_date', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[TakedownService] Erro ao listar:', error);
      return [];
    }

    return (data || []).map(this.mapToTakedown);
  }

  /**
   * Reenvia takedown que falhou
   */
  static async retryTakedown(takedownId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: takedown } = await supabase
        .from('takedowns')
        .select('*')
        .eq('id', takedownId)
        .single();

      if (!takedown) {
        return { success: false, error: 'Takedown não encontrado' };
      }

      const takedownRecord = takedown as any;
      const result = await this.sendTakedownViaApi(takedownId, {
        platform: takedownRecord.platform as Platform,
        reason: takedownRecord.reason as 'copyright' | 'trademark' | 'privacy' | 'other',
        contentUrl: takedownRecord.content_url || '',
        infringingParty: takedownRecord.infringing_party,
        musicRegistryId: takedownRecord.music_registry_id,
        artistId: takedownRecord.artist_id,
        releaseId: takedownRecord.release_id,
        description: takedownRecord.description || '',
        evidenceUrls: Array.isArray(takedownRecord.evidence_urls) ? takedownRecord.evidence_urls : []
      });

      if (result.success) {
        await this.updateTakedownStatus(takedownId, 'sent');
      }

      return { success: result.success };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  /**
   * Mapeia registro para interface
   */
  private static mapToTakedown(record: any): TakedownRequest {
    return {
      id: record.id,
      platform: record.platform as Platform,
      reason: record.reason as 'copyright' | 'trademark' | 'privacy' | 'other',
      contentUrl: record.content_url || '',
      infringingParty: record.infringing_party,
      musicRegistryId: record.music_registry_id,
      artistId: record.artist_id,
      releaseId: record.release_id,
      description: record.description || '',
      evidenceUrls: Array.isArray(record.evidence_urls) ? record.evidence_urls : [],
      status: record.status as TakedownStatus,
      requestDate: record.request_date,
      submittedDate: record.submitted_date,
      resolvedDate: record.resolved_date,
      responseNotes: record.response_notes
    };
  }

  /**
   * Estatísticas de takedowns
   */
  static async getStats(): Promise<{
    total: number;
    pending: number;
    sent: number;
    removed: number;
    rejected: number;
    successRate: number;
  }> {
    const { data, error } = await supabase
      .from('takedowns')
      .select('status')
      .eq('is_incoming', false);

    if (error || !data) {
      return { total: 0, pending: 0, sent: 0, removed: 0, rejected: 0, successRate: 0 };
    }

    const stats = {
      total: data.length,
      pending: data.filter(t => t.status === 'pending').length,
      sent: data.filter(t => t.status === 'submitted' || t.status === 'processing').length,
      removed: data.filter(t => t.status === 'resolved').length,
      rejected: data.filter(t => t.status === 'rejected').length,
      successRate: 0
    };

    const resolved = stats.removed + stats.rejected;
    stats.successRate = resolved > 0 ? (stats.removed / resolved) * 100 : 0;

    return stats;
  }
}
