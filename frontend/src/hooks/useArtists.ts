import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArtistsService } from '@/services/artists';
import { Artist, ArtistInsert, ArtistUpdate } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { useDemoData } from '@/contexts/DemoDataContext';

// Query keys
export const artistsQueryKeys = {
  all: ['artists'] as const,
  lists: () => [...artistsQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...artistsQueryKeys.lists(), { filters }] as const,
  details: () => [...artistsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...artistsQueryKeys.details(), id] as const,
  search: (query: string) => [...artistsQueryKeys.all, 'search', query] as const,
};

// Get all artists
export const useArtists = () => {
  const { isDemo, artists: demoArtists } = useDemoData();
  
  return useQuery({
    queryKey: artistsQueryKeys.lists(),
    queryFn: async () => {
      if (isDemo) {
        return demoArtists as Artist[];
      }
      return ArtistsService.getAll();
    },
  });
};

// Get artist by ID
export const useArtist = (id: string) => {
  return useQuery({
    queryKey: artistsQueryKeys.detail(id),
    queryFn: () => ArtistsService.getById(id),
    enabled: !!id,
  });
};

// Get artist with details
export const useArtistWithDetails = (id: string) => {
  return useQuery({
    queryKey: [...artistsQueryKeys.detail(id), 'with-details'],
    queryFn: () => ArtistsService.getWithDetails(id),
    enabled: !!id,
  });
};

// Search artists
export const useSearchArtists = (query: string) => {
  return useQuery({
    queryKey: artistsQueryKeys.search(query),
    queryFn: () => ArtistsService.search(query),
    enabled: query.length > 0,
  });
};

// Filter artists by genre
export const useArtistsByGenre = (genre: string) => {
  return useQuery({
    queryKey: artistsQueryKeys.list({ genre }),
    queryFn: () => ArtistsService.filterByGenre(genre),
    enabled: !!genre,
  });
};

// Create artist mutation
export const useCreateArtist = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: ArtistInsert) => ArtistsService.create(data),
    onSuccess: (newArtist) => {
      queryClient.invalidateQueries({ queryKey: artistsQueryKeys.lists() });
      toast({
        title: 'Sucesso',
        description: `Artista "${newArtist.name}" criado com sucesso.`,
      });
    },
    onError: (error) => {
      console.error('Error creating artist:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao criar artista. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};

// Update artist mutation
export const useUpdateArtist = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ArtistUpdate }) =>
      ArtistsService.update(id, data),
    onSuccess: (updatedArtist) => {
      queryClient.invalidateQueries({ queryKey: artistsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: artistsQueryKeys.detail(updatedArtist.id) });
      toast({
        title: 'Sucesso',
        description: `Artista "${updatedArtist.name}" atualizado com sucesso.`,
      });
    },
    onError: (error) => {
      console.error('Error updating artist:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar artista. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};

// Delete artist mutation
export const useDeleteArtist = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => ArtistsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: artistsQueryKeys.lists() });
      toast({
        title: 'Sucesso',
        description: 'Artista removido com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error deleting artist:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao remover artista. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};

// Get artists count
export const useArtistsCount = () => {
  return useQuery({
    queryKey: [...artistsQueryKeys.all, 'count'],
    queryFn: ArtistsService.getCount,
  });
};