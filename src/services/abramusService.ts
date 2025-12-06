import { supabase } from '@/integrations/supabase/client';

export interface AbramusWork {
  codigo_abramus: string;
  codigo_ecad: string;
  titulo: string;
  genero: string;
  idioma: string;
  instrumental: boolean;
  participantes: Array<{
    nome: string;
    cpf: string;
    funcao: string;
    percentual: number;
  }>;
}

export interface AbramusParticipant {
  nome: string;
  cpf: string;
  codigo_abramus: string;
  funcoes: string[];
  obras_registradas: number;
}

export interface SearchWorksResponse {
  success: boolean;
  data: AbramusWork[];
  total: number;
  message: string;
}

export interface SearchParticipantsResponse {
  success: boolean;
  data: AbramusParticipant[];
  total: number;
  message: string;
}

export class AbramusService {
  /**
   * Search for works in ABRAMUS database
   * @param query - Search query (title, code, genre, or participant name)
   * @param searchType - Optional filter: 'titulo' | 'codigo' | 'participante' | undefined for all
   */
  static async searchWorks(query: string, searchType?: 'titulo' | 'codigo' | 'participante'): Promise<SearchWorksResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('search-abramus', {
        body: { query, searchType }
      });

      if (error) {
        console.error('Error calling search-abramus function:', error);
        return {
          success: false,
          data: [],
          total: 0,
          message: 'Erro ao conectar com a base ABRAMUS'
        };
      }

      return data as SearchWorksResponse;
    } catch (error) {
      console.error('Error in searchWorks:', error);
      return {
        success: false,
        data: [],
        total: 0,
        message: 'Erro ao buscar obras na base ABRAMUS'
      };
    }
  }

  /**
   * Search for participants in ABRAMUS database
   * @param query - Search query (name or CPF)
   */
  static async searchParticipants(query: string): Promise<SearchParticipantsResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('search-participants', {
        body: { query }
      });

      if (error) {
        console.error('Error calling search-participants function:', error);
        return {
          success: false,
          data: [],
          total: 0,
          message: 'Erro ao conectar com a base ABRAMUS'
        };
      }

      return data as SearchParticipantsResponse;
    } catch (error) {
      console.error('Error in searchParticipants:', error);
      return {
        success: false,
        data: [],
        total: 0,
        message: 'Erro ao buscar participantes na base ABRAMUS'
      };
    }
  }
}
