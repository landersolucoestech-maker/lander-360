import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ReleasesService } from '@/services/releases';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type ReleaseInsert = Database['public']['Tables']['releases']['Insert'];
type ReleaseUpdate = Database['public']['Tables']['releases']['Update'];

// Query keys
export const releasesQueryKeys = {
  all: ['releases'] as const,
  lists: () => [...releasesQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...releasesQueryKeys.lists(), { filters }] as const,
  details: () => [...releasesQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...releasesQueryKeys.details(), id] as const,
};

// Get all releases
export const useReleases = () => {
  return useQuery({
    queryKey: releasesQueryKeys.lists(),
    queryFn: ReleasesService.getAll,
  });
};

// Get release by ID
export const useRelease = (id: string) => {
  return useQuery({
    queryKey: releasesQueryKeys.detail(id),
    queryFn: () => ReleasesService.getById(id),
    enabled: !!id,
  });
};

// Get release with details
export const useReleaseWithDetails = (id: string) => {
  return useQuery({
    queryKey: [...releasesQueryKeys.detail(id), 'with-details'],
    queryFn: () => ReleasesService.getWithDetails(id),
    enabled: !!id,
  });
};

// Get releases by artist
export const useReleasesByArtist = (artistId: string) => {
  return useQuery({
    queryKey: releasesQueryKeys.list({ artistId }),
    queryFn: () => ReleasesService.getByArtist(artistId),
    enabled: !!artistId,
  });
};

// Get releases by type
export const useReleasesByType = (type: 'single' | 'ep' | 'album' | 'compilation') => {
  return useQuery({
    queryKey: releasesQueryKeys.list({ type }),
    queryFn: () => ReleasesService.getByType(type),
    enabled: !!type,
  });
};

// Create release mutation
export const useCreateRelease = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: ReleaseInsert) => ReleasesService.create(data),
    onSuccess: (newRelease) => {
      queryClient.invalidateQueries({ queryKey: releasesQueryKeys.lists() });
      toast({
        title: 'Sucesso',
        description: `Lançamento "${newRelease.title}" criado com sucesso.`,
      });
    },
    onError: (error) => {
      console.error('Error creating release:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao criar lançamento. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};

// Update release mutation
export const useUpdateRelease = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReleaseUpdate }) =>
      ReleasesService.update(id, data),
    onSuccess: (updatedRelease) => {
      queryClient.invalidateQueries({ queryKey: releasesQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: releasesQueryKeys.detail(updatedRelease.id) });
      toast({
        title: 'Sucesso',
        description: `Lançamento "${updatedRelease.title}" atualizado com sucesso.`,
      });
    },
    onError: (error) => {
      console.error('Error updating release:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar lançamento. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};

// Delete release mutation
export const useDeleteRelease = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => ReleasesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: releasesQueryKeys.lists() });
      toast({
        title: 'Sucesso',
        description: 'Lançamento removido com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error deleting release:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao remover lançamento. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};

// Get releases count
export const useReleasesCount = () => {
  return useQuery({
    queryKey: [...releasesQueryKeys.all, 'count'],
    queryFn: ReleasesService.getCount,
  });
};