import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InventoryService } from '@/services/inventory';
import { useToast } from '@/hooks/use-toast';

// Query keys
export const inventoryQueryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...inventoryQueryKeys.lists(), { filters }] as const,
  details: () => [...inventoryQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...inventoryQueryKeys.details(), id] as const,
};

// Get all inventory items
export const useInventory = () => {
  return useQuery({
    queryKey: inventoryQueryKeys.lists(),
    queryFn: InventoryService.getAll,
  });
};

// Get inventory item by ID
export const useInventoryItem = (id: string) => {
  return useQuery({
    queryKey: inventoryQueryKeys.detail(id),
    queryFn: () => InventoryService.getById(id),
    enabled: !!id,
  });
};

// Get inventory by category
export const useInventoryByCategory = (category: string) => {
  return useQuery({
    queryKey: inventoryQueryKeys.list({ category }),
    queryFn: () => InventoryService.getByCategory(category),
    enabled: !!category,
  });
};

// Get inventory by status
export const useInventoryByStatus = (status: string) => {
  return useQuery({
    queryKey: inventoryQueryKeys.list({ status }),
    queryFn: () => InventoryService.getByStatus(status),
    enabled: !!status,
  });
};

// Create inventory mutation
export const useCreateInventory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: { 
      name: string; 
      description?: string; 
      quantity?: number; 
      category?: string; 
      location?: string;
      status?: string;
      sector?: string;
      responsible?: string;
      purchase_location?: string;
      invoice_number?: string;
      entry_date?: string;
      unit_value?: number;
      observations?: string;
    }) => InventoryService.create(data),
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.lists() });
      toast({
        title: 'Sucesso',
        description: `Item "${newItem.name}" criado com sucesso.`,
      });
    },
    onError: (error) => {
      console.error('Error creating inventory item:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao criar item no inventário. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};

// Update inventory mutation
export const useUpdateInventory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ 
      name: string; 
      description?: string; 
      quantity?: number; 
      category?: string; 
      location?: string;
      status?: string;
      sector?: string;
      responsible?: string;
      purchase_location?: string;
      invoice_number?: string;
      entry_date?: string;
      unit_value?: number;
      observations?: string;
    }> }) =>
      InventoryService.update(id, data),
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.detail(updatedItem.id) });
      toast({
        title: 'Sucesso',
        description: `Item "${updatedItem.name}" atualizado com sucesso.`,
      });
    },
    onError: (error) => {
      console.error('Error updating inventory item:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar item no inventário. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};

// Delete inventory mutation
export const useDeleteInventory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => InventoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.lists() });
      toast({
        title: 'Sucesso',
        description: 'Item removido do inventário com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error deleting inventory item:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao remover item do inventário. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};