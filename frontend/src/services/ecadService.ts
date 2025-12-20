/**
 * EcadReportImportService & EcadReconciliationService
 * 
 * Serviços para:
 * - Importar relatórios ECAD (CSV/XLS)
 * - Normalizar dados
 * - Reconciliar execuções detectadas com relatórios ECAD
 * - Identificar divergências
 */

import { supabase } from '@/integrations/supabase/client';

// Interface para linha do relatório ECAD
export interface EcadReportRow {
  codigoObra?: string;
  titulo: string;
  artista: string;
  isrc?: string;
  iswc?: string;
  tipoExecucao: string;
  dataExecucao: string;
  quantidadeExecucoes: number;
  valorArrecadado: number;
  plataforma?: string;
  emissora?: string;
}

// Interface para resultado da importação
export interface ImportResult {
  success: boolean;
  reportId?: string;
  totalRecords: number;
  matchedRecords: number;
  unmatchedRecords: number;
  errors: string[];
}

// Interface para resultado da reconciliação
export interface ReconciliationResult {
  success: boolean;
  totalProcessed: number;
  ok: number;
  notReported: number;
  divergent: number;
  divergences: Array<{
    trackId: string;
    type: 'not_reported' | 'count_mismatch' | 'value_mismatch';
    detectedCount: number;
    ecadCount: number;
    difference: number;
  }>;
}

/**
 * Serviço de importação de relatórios ECAD
 */
export class EcadReportImportService {
  
  /**
   * Importa arquivo CSV/XLS do ECAD
   */
  static async importReport(
    fileContent: string,
    reportPeriod: string,
    reportType: 'monthly' | 'quarterly' | 'yearly' = 'monthly',
    fileName?: string
  ): Promise<ImportResult> {
    const errors: string[] = [];
    let matchedRecords = 0;
    let unmatchedRecords = 0;

    try {
      console.log(`[EcadImport] Iniciando importação: ${fileName || 'arquivo'}`);

      // Parse do CSV
      const rows = this.parseCSV(fileContent);
      console.log(`[EcadImport] ${rows.length} linhas encontradas`);

      if (rows.length === 0) {
        return {
          success: false,
          totalRecords: 0,
          matchedRecords: 0,
          unmatchedRecords: 0,
          errors: ['Nenhum registro encontrado no arquivo']
        };
      }

      // Cria o relatório principal
      const { data: report, error: reportError } = await supabase
        .from('ecad_reports')
        .insert({
          report_period: reportPeriod,
          report_type: reportType,
          file_name: fileName,
          total_records: rows.length,
          matched_records: 0,
          unmatched_records: 0,
          divergent_records: 0,
          total_value: rows.reduce((sum, r) => sum + r.valorArrecadado, 0),
          import_status: 'processing',
          imported_at: new Date().toISOString()
        })
        .select()
        .single();

      if (reportError) {
        console.error('[EcadImport] Erro ao criar relatório:', reportError);
        return {
          success: false,
          totalRecords: rows.length,
          matchedRecords: 0,
          unmatchedRecords: 0,
          errors: [reportError.message]
        };
      }

      // Processa cada linha
      for (const row of rows) {
        try {
          const matchResult = await this.matchTrack(row);
          
          // Insere item do relatório
          await supabase.from('ecad_report_items').insert({
            ecad_report_id: report.id,
            music_registry_id: matchResult.trackId,
            ecad_work_code: row.codigoObra,
            title: row.titulo,
            artist_name: row.artista,
            execution_count: row.quantidadeExecucoes,
            execution_value: row.valorArrecadado,
            platform: row.plataforma || row.emissora,
            period: row.dataExecucao,
            matched: matchResult.matched,
            divergence_type: matchResult.matched ? null : 'unmatched'
          });

          if (matchResult.matched) {
            matchedRecords++;
          } else {
            unmatchedRecords++;
          }
        } catch (error) {
          console.error('[EcadImport] Erro ao processar linha:', error);
          errors.push(`Erro na linha: ${row.titulo}`);
        }
      }

      // Atualiza o relatório com contagens finais
      await supabase
        .from('ecad_reports')
        .update({
          matched_records: matchedRecords,
          unmatched_records: unmatchedRecords,
          import_status: 'completed'
        })
        .eq('id', report.id);

      console.log(`[EcadImport] Importação concluída: ${matchedRecords} matched, ${unmatchedRecords} unmatched`);

      return {
        success: true,
        reportId: report.id,
        totalRecords: rows.length,
        matchedRecords,
        unmatchedRecords,
        errors
      };
    } catch (error) {
      console.error('[EcadImport] Erro na importação:', error);
      return {
        success: false,
        totalRecords: 0,
        matchedRecords: 0,
        unmatchedRecords: 0,
        errors: [error instanceof Error ? error.message : 'Erro desconhecido']
      };
    }
  }

  /**
   * Parse de CSV para array de objetos
   */
  private static parseCSV(content: string): EcadReportRow[] {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(';').map(h => h.trim().toLowerCase());
    const rows: EcadReportRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(';').map(v => v.trim());
      if (values.length < headers.length) continue;

      const row: EcadReportRow = {
        codigoObra: this.getColumnValue(headers, values, ['codigo_obra', 'codigo', 'obra']),
        titulo: this.getColumnValue(headers, values, ['titulo', 'title', 'nome']) || '',
        artista: this.getColumnValue(headers, values, ['artista', 'artist', 'interprete']) || '',
        isrc: this.getColumnValue(headers, values, ['isrc']),
        iswc: this.getColumnValue(headers, values, ['iswc']),
        tipoExecucao: this.getColumnValue(headers, values, ['tipo_execucao', 'tipo', 'execution_type']) || 'radio',
        dataExecucao: this.getColumnValue(headers, values, ['data_execucao', 'data', 'date']) || '',
        quantidadeExecucoes: parseInt(this.getColumnValue(headers, values, ['quantidade', 'execucoes', 'count']) || '1'),
        valorArrecadado: parseFloat(this.getColumnValue(headers, values, ['valor', 'value', 'arrecadado'])?.replace(',', '.') || '0'),
        plataforma: this.getColumnValue(headers, values, ['plataforma', 'platform']),
        emissora: this.getColumnValue(headers, values, ['emissora', 'station', 'canal'])
      };

      if (row.titulo) {
        rows.push(row);
      }
    }

    return rows;
  }

  /**
   * Busca valor de coluna por possíveis nomes
   */
  private static getColumnValue(headers: string[], values: string[], possibleNames: string[]): string | undefined {
    for (const name of possibleNames) {
      const index = headers.findIndex(h => h.includes(name));
      if (index >= 0 && index < values.length) {
        return values[index];
      }
    }
    return undefined;
  }

  /**
   * Tenta fazer match de uma linha do relatório com uma faixa no sistema
   */
  private static async matchTrack(row: EcadReportRow): Promise<{ matched: boolean; trackId?: string }> {
    // Primeiro tenta por ISRC
    if (row.isrc) {
      const { data } = await supabase
        .from('music_registry')
        .select('id')
        .eq('isrc', row.isrc)
        .limit(1);

      if (data && data.length > 0) {
        return { matched: true, trackId: data[0].id };
      }
    }

    // Depois por ISWC
    if (row.iswc) {
      const { data } = await supabase
        .from('music_registry')
        .select('id')
        .eq('iswc', row.iswc)
        .limit(1);

      if (data && data.length > 0) {
        return { matched: true, trackId: data[0].id };
      }
    }

    // Por fim, tenta por título (fuzzy match)
    const normalizedTitle = this.normalizeString(row.titulo);

    const { data } = await supabase
      .from('music_registry')
      .select('id, title')
      .limit(100);

    if (data) {
      for (const track of data) {
        const trackTitle = this.normalizeString(track.title);
        if (trackTitle === normalizedTitle || trackTitle.includes(normalizedTitle) || normalizedTitle.includes(trackTitle)) {
          return { matched: true, trackId: track.id };
        }
      }
    }

    return { matched: false };
  }

  /**
   * Normaliza string para comparação
   */
  private static normalizeString(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  }
}

/**
 * Serviço de reconciliação ECAD
 */
export class EcadReconciliationService {
  
  /**
   * Executa reconciliação entre detecções e relatório ECAD
   */
  static async reconcile(
    reportId: string,
    period: { start: string; end: string }
  ): Promise<ReconciliationResult> {
    try {
      console.log(`[EcadReconciliation] Iniciando reconciliação do relatório: ${reportId}`);

      // Busca itens do relatório ECAD
      const { data: ecadItems, error: ecadError } = await supabase
        .from('ecad_report_items')
        .select('*')
        .eq('ecad_report_id', reportId);

      if (ecadError) throw ecadError;

      // Busca detecções do período
      const { data: detections, error: detectionsError } = await supabase
        .from('radio_tv_detections')
        .select('*')
        .gte('detected_at', period.start)
        .lte('detected_at', period.end);

      if (detectionsError) throw detectionsError;

      // Agrupa detecções por track
      const detectionsByTrack = new Map<string, { count: number; ids: string[] }>();
      for (const detection of (detections || []) as any[]) {
        if (detection.music_registry_id) {
          const existing = detectionsByTrack.get(detection.music_registry_id) || { count: 0, ids: [] };
          existing.count++;
          existing.ids.push(detection.id);
          detectionsByTrack.set(detection.music_registry_id, existing);
        }
      }

      // Agrupa itens ECAD por track
      const ecadByTrack = new Map<string, { count: number; value: number; itemId: string }>();
      const ecadItemsList = (ecadItems || []) as any[];
      for (const item of ecadItemsList) {
        if (item.music_registry_id) {
          const existing = ecadByTrack.get(item.music_registry_id) || { count: 0, value: 0, itemId: '' };
          existing.count += item.execution_count || 0;
          existing.value += item.execution_value || 0;
          existing.itemId = item.id;
          ecadByTrack.set(item.music_registry_id, existing);
        }
      }

      // Compara e identifica divergências
      const divergences: ReconciliationResult['divergences'] = [];
      let ok = 0;
      let notReported = 0;
      let divergent = 0;

      // Verifica detecções que não estão no ECAD
      for (const [trackId, detected] of detectionsByTrack) {
        const ecad = ecadByTrack.get(trackId);
        
        if (!ecad) {
          // Não reportado ao ECAD
          notReported++;
          divergences.push({
            trackId,
            type: 'not_reported',
            detectedCount: detected.count,
            ecadCount: 0,
            difference: detected.count
          });

          // Cria divergência no banco
          await this.createDivergence({
            detectionId: detected.ids[0],
            musicRegistryId: trackId,
            type: 'not_reported',
            detectedCount: detected.count,
            ecadCount: 0
          });
        } else if (detected.count !== ecad.count) {
          // Contagem divergente
          divergent++;
          divergences.push({
            trackId,
            type: 'count_mismatch',
            detectedCount: detected.count,
            ecadCount: ecad.count,
            difference: detected.count - ecad.count
          });

          await this.createDivergence({
            detectionId: detected.ids[0],
            ecadReportItemId: ecad.itemId,
            musicRegistryId: trackId,
            type: 'count_mismatch',
            detectedCount: detected.count,
            ecadCount: ecad.count
          });
        } else {
          ok++;
          
          // Marca detecções como reconciliadas
          await supabase
            .from('radio_tv_detections')
            .update({ ecad_matched: true, ecad_report_id: reportId })
            .in('id', detected.ids);
        }
      }

      // Atualiza o relatório com contagem de divergências
      await supabase
        .from('ecad_reports')
        .update({ divergent_records: divergent + notReported })
        .eq('id', reportId);

      console.log(`[EcadReconciliation] Concluído: ${ok} OK, ${notReported} não reportados, ${divergent} divergentes`);

      return {
        success: true,
        totalProcessed: detectionsByTrack.size,
        ok,
        notReported,
        divergent,
        divergences
      };
    } catch (error) {
      console.error('[EcadReconciliation] Erro:', error);
      return {
        success: false,
        totalProcessed: 0,
        ok: 0,
        notReported: 0,
        divergent: 0,
        divergences: []
      };
    }
  }

  /**
   * Cria registro de divergência
   */
  private static async createDivergence(params: {
    detectionId?: string;
    ecadReportItemId?: string;
    musicRegistryId: string;
    type: string;
    detectedCount: number;
    ecadCount: number;
  }): Promise<void> {
    await supabase.from('ecad_divergences').insert({
      detection_id: params.detectionId,
      ecad_report_item_id: params.ecadReportItemId,
      music_registry_id: params.musicRegistryId,
      divergence_type: params.type,
      detected_count: params.detectedCount,
      ecad_count: params.ecadCount,
      status: 'open'
    });
  }

  /**
   * Executa reconciliação automática após importação
   */
  static async runAutoReconciliation(reportId: string): Promise<ReconciliationResult> {
    // Busca período do relatório
    const { data: report } = await supabase
      .from('ecad_reports')
      .select('report_period')
      .eq('id', reportId)
      .single();

    if (!report) {
      return {
        success: false,
        totalProcessed: 0,
        ok: 0,
        notReported: 0,
        divergent: 0,
        divergences: []
      };
    }

    // Parse do período (formato: YYYY-MM)
    const [year, month] = report.report_period.split('-');
    const startDate = `${year}-${month}-01T00:00:00`;
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    const endDate = `${year}-${month}-${lastDay}T23:59:59`;

    return this.reconcile(reportId, { start: startDate, end: endDate });
  }

  /**
   * Resolve uma divergência
   */
  static async resolveDivergence(
    divergenceId: string,
    resolution: string,
    resolvedBy: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ecad_divergences')
        .update({
          status: 'resolved',
          resolution_notes: resolution,
          resolved_by: resolvedBy,
          resolved_at: new Date().toISOString()
        })
        .eq('id', divergenceId);

      return !error;
    } catch {
      return false;
    }
  }
}
