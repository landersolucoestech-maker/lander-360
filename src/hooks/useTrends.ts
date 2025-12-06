import { useQuery } from '@tanstack/react-query';
import { TrendsService, TrendStats } from '@/services/trends';

export const trendsQueryKeys = {
  all: ['trends'] as const,
  artistPage: () => [...trendsQueryKeys.all, 'artist-page'] as const,
};

export const useArtistPageTrends = () => {
  return useQuery<TrendStats>({
    queryKey: trendsQueryKeys.artistPage(),
    queryFn: TrendsService.getArtistPageTrends,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};
