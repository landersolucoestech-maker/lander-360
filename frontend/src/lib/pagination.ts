/**
 * Utilitários de Paginação para Supabase
 * Implementa paginação consistente em todos os serviços
 */

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/**
 * Calcula o range para query do Supabase baseado nos parâmetros de paginação
 */
export function calculateRange(params: PaginationParams): { from: number; to: number } {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, params.pageSize || DEFAULT_PAGE_SIZE));
  
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  return { from, to };
}

/**
 * Cria o objeto de resultado paginado
 */
export function createPaginatedResult<T>(
  data: T[],
  totalCount: number,
  params: PaginationParams
): PaginatedResult<T> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, params.pageSize || DEFAULT_PAGE_SIZE));
  const totalPages = Math.ceil(totalCount / pageSize);
  
  return {
    data,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

/**
 * Normaliza parâmetros de paginação
 */
export function normalizePaginationParams(params?: Partial<PaginationParams>): PaginationParams {
  return {
    page: Math.max(1, params?.page || 1),
    pageSize: Math.min(MAX_PAGE_SIZE, Math.max(1, params?.pageSize || DEFAULT_PAGE_SIZE)),
    sortBy: params?.sortBy || 'created_at',
    sortOrder: params?.sortOrder || 'desc',
  };
}
