import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PhonogramService, PhonogramInsert, PhonogramUpdate } from '@/services/phonograms';
import { useToast } from '@/hooks/use-toast';

export const phonogramQueryKeys = {
  all: ['phonograms'] as const,
  lists: () => [...phonogramQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...phonogramQueryKeys.lists(), { filters }] as const,
  details: () => [...phonogramQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...phonogramQueryKeys.details(), id] as const,
};

export const usePhonograms = () => {
  return useQuery({
    queryKey: phonogramQueryKeys.lists(),
    queryFn: PhonogramService.getAll,
  });
};

export const usePhonogram = (id: string) => {
  return useQuery({
    queryKey: phonogramQueryKeys.detail(id),
    queryFn: () => PhonogramService.getById(id),
    enabled: !!id,
  });
};

export const usePhonogramsByArtist = (artistId: string) => {
  return useQuery({
    queryKey: phonogramQueryKeys.list({ artistId }),
    queryFn: () => PhonogramService.getByArtist(artistId),
    enabled: !!artistId,
  });
};

export const usePhonogramsByWork = (workId: string) => {
  return useQuery({
    queryKey: phonogramQueryKeys.list({ workId }),
    queryFn: () => PhonogramService.getByWork(workId),
    enabled: !!workId,
  });
};

export const useCreatePhonogram = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: PhonogramInsert) => PhonogramService.create(data),
    onSuccess: (newEntry) => {
      queryClient.invalidateQueries({ queryKey: phonogramQueryKeys.lists() });
      toast({
        title: 'Sucesso',
        description: `Fonograma "${newEntry.title}" registrado com sucesso.`,
      });
    },
    onError: (error) => {
      console.error('Error creating phonogram:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao registrar fonograma. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdatePhonogram = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PhonogramUpdate }) =>
      PhonogramService.update(id, data),
    onSuccess: (updatedEntry) => {
      queryClient.invalidateQueries({ queryKey: phonogramQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: phonogramQueryKeys.detail(updatedEntry.id) });
      toast({
        title: 'Sucesso',
        description: `Fonograma "${updatedEntry.title}" atualizado com sucesso.`,
      });
    },
    onError: (error) => {
      console.error('Error updating phonogram:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar fonograma. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};

export const useDeletePhonogram = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => PhonogramService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: phonogramQueryKeys.lists() });
      toast({
        title: 'Sucesso',
        description: 'Fonograma removido com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error deleting phonogram:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao remover fonograma. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};
