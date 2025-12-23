import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ContractsService } from '@/services/contracts';
import { Contract, ContractInsert, ContractUpdate } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

// Query keys
export const contractsQueryKeys = {
  all: ['contracts'] as const,
  lists: () => [...contractsQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...contractsQueryKeys.lists(), { filters }] as const,
  details: () => [...contractsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...contractsQueryKeys.details(), id] as const,
  active: () => [...contractsQueryKeys.all, 'active'] as const,
  expiring: (days: number) => [...contractsQueryKeys.all, 'expiring', days] as const,
};

// Get all contracts
export const useContracts = () => {
  return useQuery({
    queryKey: contractsQueryKeys.lists(),
    queryFn: ContractsService.getAll,
  });
};

// Get contract by ID
export const useContract = (id: string) => {
  return useQuery({
    queryKey: contractsQueryKeys.detail(id),
    queryFn: () => ContractsService.getById(id),
    enabled: !!id,
  });
};

// Get contract with details
export const useContractWithDetails = (id: string) => {
  return useQuery({
    queryKey: [...contractsQueryKeys.detail(id), 'with-details'],
    queryFn: () => ContractsService.getWithDetails(id),
    enabled: !!id,
  });
};

// Get contracts by artist
export const useContractsByArtist = (artistId: string) => {
  return useQuery({
    queryKey: contractsQueryKeys.list({ artistId }),
    queryFn: () => ContractsService.getByArtist(artistId),
    enabled: !!artistId,
  });
};

// Get contracts by project
export const useContractsByProject = (projectId: string) => {
  return useQuery({
    queryKey: contractsQueryKeys.list({ projectId }),
    queryFn: () => ContractsService.getByProject(projectId),
    enabled: !!projectId,
  });
};

// Get active contracts
export const useActiveContracts = () => {
  return useQuery({
    queryKey: contractsQueryKeys.active(),
    queryFn: ContractsService.getActive,
  });
};

// Get contracts expiring soon
export const useContractsExpiringSoon = (days: number = 30) => {
  return useQuery({
    queryKey: contractsQueryKeys.expiring(days),
    queryFn: () => ContractsService.getExpiringSoon(days),
  });
};

// Filter contracts by type
export const useContractsByType = (contractType: string) => {
  return useQuery({
    queryKey: contractsQueryKeys.list({ contractType }),
    queryFn: () => ContractsService.filterByType(contractType),
    enabled: !!contractType,
  });
};

// Create contract mutation
export const useCreateContract = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: ContractInsert) => ContractsService.create(data),
    onSuccess: (newContract) => {
      queryClient.invalidateQueries({ queryKey: contractsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contractsQueryKeys.active() });
      toast({
        title: 'Sucesso',
        description: `Contrato "${(newContract as any).title || newContract.contract_type}" criado com sucesso.`,
      });
      
      // Se um usuário foi criado automaticamente para o artista
      if ((newContract as any).userCreationMessage) {
        setTimeout(() => {
          toast({
            title: '🎵 Acesso do Artista Criado',
            description: (newContract as any).userCreationMessage,
          });
        }, 1000);
      }
    },
    onError: (error) => {
      console.error('Error creating contract:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao criar contrato. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};

// Update contract mutation
export const useUpdateContract = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ContractUpdate }) =>
      ContractsService.update(id, data),
    onSuccess: (updatedContract) => {
      queryClient.invalidateQueries({ queryKey: contractsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contractsQueryKeys.detail(updatedContract.id) });
      queryClient.invalidateQueries({ queryKey: contractsQueryKeys.active() });
      toast({
        title: 'Sucesso',
        description: `Contrato "${(updatedContract as any).title || updatedContract.contract_type}" atualizado com sucesso.`,
      });
      
      // Se um usuário foi criado automaticamente para o artista
      if ((updatedContract as any).userCreationMessage) {
        setTimeout(() => {
          toast({
            title: '🎵 Acesso do Artista Criado',
            description: (updatedContract as any).userCreationMessage,
          });
        }, 1000);
      }
    },
    onError: (error) => {
      console.error('Error updating contract:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar contrato. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};

// Delete contract mutation
export const useDeleteContract = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => ContractsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contractsQueryKeys.active() });
      toast({
        title: 'Sucesso',
        description: 'Contrato removido com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error deleting contract:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao remover contrato. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};