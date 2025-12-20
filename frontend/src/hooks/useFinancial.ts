import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FinancialService } from '@/services/financial';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { useDemoData } from '@/contexts/DemoDataContext';

type FinancialTransactionInsert = Database['public']['Tables']['financial_transactions']['Insert'];
type FinancialTransactionUpdate = Database['public']['Tables']['financial_transactions']['Update'];

// Query keys
export const financialQueryKeys = {
  all: ['financial'] as const,
  lists: () => [...financialQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...financialQueryKeys.lists(), { filters }] as const,
  details: () => [...financialQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...financialQueryKeys.details(), id] as const,
  totals: () => [...financialQueryKeys.all, 'totals'] as const,
};

// Get all financial transactions
export const useFinancialTransactions = () => {
  const { isDemo, transactions } = useDemoData();
  
  return useQuery({
    queryKey: financialQueryKeys.lists(),
    queryFn: async () => {
      if (isDemo) {
        return transactions as any[];
      }
      return FinancialService.getAll();
    },
  });
};

// Get financial transaction by ID
export const useFinancialTransaction = (id: string) => {
  return useQuery({
    queryKey: financialQueryKeys.detail(id),
    queryFn: () => FinancialService.getById(id),
    enabled: !!id,
  });
};

// Get transactions by type
export const useFinancialTransactionsByType = (transactionType: string) => {
  return useQuery({
    queryKey: financialQueryKeys.list({ transactionType }),
    queryFn: () => FinancialService.getByType(transactionType),
    enabled: !!transactionType,
  });
};

// Get transactions by date range
export const useFinancialTransactionsByDateRange = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: financialQueryKeys.list({ startDate, endDate }),
    queryFn: () => FinancialService.getByDateRange(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
};

// Get transactions by artist
export const useFinancialTransactionsByArtist = (artistId: string) => {
  return useQuery({
    queryKey: financialQueryKeys.list({ artistId }),
    queryFn: () => FinancialService.getByArtist(artistId),
    enabled: !!artistId,
  });
};

// Get totals by type
export const useFinancialTotalsByType = () => {
  return useQuery({
    queryKey: financialQueryKeys.totals(),
    queryFn: FinancialService.getTotalByType,
  });
};

// Create financial transaction mutation
export const useCreateFinancialTransaction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: FinancialTransactionInsert) => FinancialService.create(data),
    onSuccess: (newTransaction) => {
      queryClient.invalidateQueries({ queryKey: financialQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: financialQueryKeys.totals() });
      toast({
        title: 'Sucesso',
        description: `Transação "${newTransaction.description}" criada com sucesso.`,
      });
    },
    onError: (error) => {
      console.error('Error creating financial transaction:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao criar transação financeira. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};

// Update financial transaction mutation
export const useUpdateFinancialTransaction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FinancialTransactionUpdate }) =>
      FinancialService.update(id, data),
    onSuccess: (updatedTransaction) => {
      queryClient.invalidateQueries({ queryKey: financialQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: financialQueryKeys.detail(updatedTransaction.id) });
      queryClient.invalidateQueries({ queryKey: financialQueryKeys.totals() });
      toast({
        title: 'Sucesso',
        description: `Transação "${updatedTransaction.description}" atualizada com sucesso.`,
      });
    },
    onError: (error) => {
      console.error('Error updating financial transaction:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar transação financeira. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};

// Delete financial transaction mutation
export const useDeleteFinancialTransaction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => FinancialService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financialQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: financialQueryKeys.totals() });
      toast({
        title: 'Sucesso',
        description: 'Transação financeira removida com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error deleting financial transaction:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao remover transação financeira. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};