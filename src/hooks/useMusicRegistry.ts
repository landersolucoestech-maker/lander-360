import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MusicRegistryService } from '@/services/musicRegistry';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type MusicRegistryInsert = Database['public']['Tables']['music_registry']['Insert'];
type MusicRegistryUpdate = Database['public']['Tables']['music_registry']['Update'];

// Query keys
export const musicRegistryQueryKeys = {
  all: ['music-registry'] as const,
  lists: () => [...musicRegistryQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...musicRegistryQueryKeys.lists(), { filters }] as const,
  details: () => [...musicRegistryQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...musicRegistryQueryKeys.details(), id] as const,
  search: (query: string) => [...musicRegistryQueryKeys.all, 'search', query] as const,
};

// Get all music registry entries
export const useMusicRegistry = () => {
  return useQuery({
    queryKey: musicRegistryQueryKeys.lists(),
    queryFn: MusicRegistryService.getAll,
  });
};

// Get music registry entry by ID
export const useMusicRegistryEntry = (id: string) => {
  return useQuery({
    queryKey: musicRegistryQueryKeys.detail(id),
    queryFn: () => MusicRegistryService.getById(id),
    enabled: !!id,
  });
};

// Get music by artist
export const useMusicByArtist = (artistId: string) => {
  return useQuery({
    queryKey: musicRegistryQueryKeys.list({ artistId }),
    queryFn: () => MusicRegistryService.getByArtist(artistId),
    enabled: !!artistId,
  });
};

// Get music by genre
export const useMusicByGenre = (genre: string) => {
  return useQuery({
    queryKey: musicRegistryQueryKeys.list({ genre }),
    queryFn: () => MusicRegistryService.getByGenre(genre),
    enabled: !!genre,
  });
};

// Search music
export const useSearchMusic = (query: string) => {
  return useQuery({
    queryKey: musicRegistryQueryKeys.search(query),
    queryFn: () => MusicRegistryService.search(query),
    enabled: query.length > 0,
  });
};

// Get music by composer
export const useMusicByComposer = (composer: string) => {
  return useQuery({
    queryKey: musicRegistryQueryKeys.list({ composer }),
    queryFn: () => MusicRegistryService.getByComposer(composer),
    enabled: !!composer,
  });
};

// Get music by producer
export const useMusicByProducer = (producer: string) => {
  return useQuery({
    queryKey: musicRegistryQueryKeys.list({ producer }),
    queryFn: () => MusicRegistryService.getByProducer(producer),
    enabled: !!producer,
  });
};

// Create music registry entry mutation
export const useCreateMusicRegistryEntry = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: MusicRegistryInsert) => MusicRegistryService.create(data),
    onSuccess: (newEntry) => {
      queryClient.invalidateQueries({ queryKey: musicRegistryQueryKeys.lists() });
      toast({
        title: 'Sucesso',
        description: `Música "${newEntry.title}" registrada com sucesso.`,
      });
    },
    onError: (error) => {
      console.error('Error creating music registry entry:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao registrar música. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};

// Update music registry entry mutation
export const useUpdateMusicRegistryEntry = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MusicRegistryUpdate }) =>
      MusicRegistryService.update(id, data),
    onSuccess: (updatedEntry) => {
      queryClient.invalidateQueries({ queryKey: musicRegistryQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: musicRegistryQueryKeys.detail(updatedEntry.id) });
      toast({
        title: 'Sucesso',
        description: `Música "${updatedEntry.title}" atualizada com sucesso.`,
      });
    },
    onError: (error) => {
      console.error('Error updating music registry entry:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar registro da música. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};

// Delete music registry entry mutation
export const useDeleteMusicRegistryEntry = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => MusicRegistryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: musicRegistryQueryKeys.lists() });
      toast({
        title: 'Sucesso',
        description: 'Registro de música removido com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error deleting music registry entry:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao remover registro da música. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};