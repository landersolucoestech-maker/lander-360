import { supabase } from '@/integrations/supabase/client';

export interface ReleaseValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ReleaseData {
  id?: string;
  title?: string;
  artist_id?: string;
  release_date?: string | null;
  status?: string;
  cover_url?: string;
  genre?: string;
  language?: string;
  distributors?: string[];
  tracks?: any[];
  upc?: string;
}

export class ReleaseValidationService {
  /**
   * Validate release data before saving or status change
   */
  static validate(release: ReleaseData, targetStatus?: string): ReleaseValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic required fields
    if (!release.title?.trim()) {
      errors.push('Título é obrigatório');
    }

    if (!release.artist_id) {
      errors.push('Artista é obrigatório');
    }

    // Date validation for status transitions
    const statusesRequiringDate = ['em_analise', 'aprovado', 'distribuido', 'lancado', 'released'];
    if (targetStatus && statusesRequiringDate.includes(targetStatus)) {
      if (!release.release_date) {
        errors.push(`Data de lançamento é obrigatória para status "${targetStatus}"`);
      }
    }

    // Validate release date is not in the past for new releases
    if (release.release_date && !release.id) {
      const releaseDate = new Date(release.release_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (releaseDate < today) {
        warnings.push('A data de lançamento está no passado');
      }
    }

    // Track validation for distribution
    const distributionStatuses = ['aprovado', 'distribuido', 'lancado', 'released'];
    if (targetStatus && distributionStatuses.includes(targetStatus)) {
      if (!release.tracks || release.tracks.length === 0) {
        errors.push('Pelo menos uma faixa é necessária para distribuição');
      }

      if (!release.cover_url) {
        warnings.push('Capa do lançamento não foi definida');
      }

      if (!release.distributors || release.distributors.length === 0) {
        errors.push('Distribuidor é obrigatório para distribuição');
      }
    }

    // Genre and language for metadata completeness
    if (!release.genre) {
      warnings.push('Gênero musical não definido');
    }

    if (!release.language) {
      warnings.push('Idioma não definido');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Check if a status transition is valid
   */
  static isValidStatusTransition(currentStatus: string, targetStatus: string): boolean {
    const validTransitions: Record<string, string[]> = {
      'rascunho': ['em_analise', 'cancelado'],
      'draft': ['em_analise', 'cancelado'],
      'em_analise': ['aprovado', 'rejeitado', 'pausado', 'rascunho'],
      'pending': ['aprovado', 'rejeitado', 'pausado', 'rascunho'],
      'aprovado': ['distribuido', 'pausado', 'em_analise'],
      'distribuido': ['lancado', 'pausado'],
      'lancado': ['arquivado'],
      'released': ['arquivado'],
      'rejeitado': ['rascunho', 'em_analise'],
      'pausado': ['em_analise', 'aprovado', 'cancelado'],
      'cancelado': ['rascunho'],
    };

    const allowedTargets = validTransitions[currentStatus] || [];
    return allowedTargets.includes(targetStatus);
  }

  /**
   * Validate and block release operations if date is missing
   */
  static async validateBeforeSave(release: ReleaseData): Promise<ReleaseValidationResult> {
    const baseValidation = this.validate(release, release.status);

    // Additional async validations
    if (release.artist_id) {
      const { data: artist } = await supabase
        .from('artists')
        .select('id, name, contract_status')
        .eq('id', release.artist_id)
        .single();

      if (!artist) {
        baseValidation.errors.push('Artista não encontrado');
        baseValidation.isValid = false;
      } else if (artist.contract_status !== 'active' && artist.contract_status !== 'ativo') {
        baseValidation.warnings.push('O artista não possui contrato ativo');
      }
    }

    // Check for duplicate UPC
    if (release.upc && release.upc.trim()) {
      const { data: existingRelease } = await supabase
        .from('releases')
        .select('id, title')
        .eq('upc', release.upc)
        .neq('id', release.id || '')
        .single();

      if (existingRelease) {
        baseValidation.errors.push(`UPC já utilizado no lançamento "${existingRelease.title}"`);
        baseValidation.isValid = false;
      }
    }

    return baseValidation;
  }

  /**
   * Get workflow status options
   */
  static getWorkflowStatusOptions(): { value: string; label: string; description: string }[] {
    return [
      { value: 'rascunho', label: 'Rascunho', description: 'Lançamento em preparação' },
      { value: 'em_analise', label: 'Em Análise', description: 'Aguardando aprovação' },
      { value: 'aprovado', label: 'Aprovado', description: 'Aprovado para distribuição' },
      { value: 'distribuido', label: 'Distribuído', description: 'Enviado para distribuidoras' },
      { value: 'lancado', label: 'Lançado', description: 'Disponível nas plataformas' },
      { value: 'pausado', label: 'Pausado', description: 'Temporariamente suspenso' },
      { value: 'rejeitado', label: 'Rejeitado', description: 'Requer correções' },
      { value: 'cancelado', label: 'Cancelado', description: 'Lançamento cancelado' },
    ];
  }
}
