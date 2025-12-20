import { useReleaseMetrics } from '@/hooks/useReleaseMetrics';
import { Skeleton } from '@/components/ui/skeleton';

interface ReleaseMetricsBadgeProps {
  releaseId: string;
  variant?: 'inline' | 'grid';
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function ReleaseMetricsBadge({ releaseId, variant = 'inline' }: ReleaseMetricsBadgeProps) {
  const { data: metrics, isLoading } = useReleaseMetrics(releaseId);

  if (isLoading) {
    return variant === 'grid' ? (
      <div className="grid grid-cols-4 gap-2 mt-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    ) : (
      <Skeleton className="h-4 w-16" />
    );
  }

  const spotify = metrics?.byPlatform?.spotify;
  const apple_music = metrics?.byPlatform?.apple_music;
  const youtube = metrics?.byPlatform?.youtube;
  const deezer = metrics?.byPlatform?.deezer;

  const hasAnyMetrics = spotify || apple_music || youtube || deezer;

  if (!hasAnyMetrics) {
    if (variant === 'grid') {
      return (
        <div className="grid grid-cols-4 gap-2 mt-2">
          <div className="bg-black/40 rounded-lg p-2 text-center">
            <div className="text-[10px] text-green-400 uppercase mb-1">Spotify</div>
            <div className="text-sm font-bold text-white/50">—</div>
          </div>
          <div className="bg-black/40 rounded-lg p-2 text-center">
            <div className="text-[10px] text-gray-300 uppercase mb-1">Apple</div>
            <div className="text-sm font-bold text-white/50">—</div>
          </div>
          <div className="bg-black/40 rounded-lg p-2 text-center">
            <div className="text-[10px] text-red-400 uppercase mb-1">YouTube</div>
            <div className="text-sm font-bold text-white/50">—</div>
          </div>
          <div className="bg-black/40 rounded-lg p-2 text-center">
            <div className="text-[10px] text-purple-400 uppercase mb-1">Deezer</div>
            <div className="text-sm font-bold text-white/50">—</div>
          </div>
        </div>
      );
    }
    return null;
  }

  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-4 gap-2 mt-2">
        <div className="bg-black/40 rounded-lg p-2 text-center">
          <div className="text-[10px] text-green-400 uppercase mb-1">Spotify</div>
          <div className="text-sm font-bold text-white">
            {spotify?.streams ? formatNumber(spotify.streams) : '—'}
          </div>
        </div>
        <div className="bg-black/40 rounded-lg p-2 text-center">
          <div className="text-[10px] text-gray-300 uppercase mb-1">Apple</div>
          <div className="text-sm font-bold text-white">
            {apple_music?.streams ? formatNumber(apple_music.streams) : '—'}
          </div>
        </div>
        <div className="bg-black/40 rounded-lg p-2 text-center">
          <div className="text-[10px] text-red-400 uppercase mb-1">YouTube</div>
          <div className="text-sm font-bold text-white">
            {youtube?.views ? formatNumber(youtube.views) : '—'}
          </div>
        </div>
        <div className="bg-black/40 rounded-lg p-2 text-center">
          <div className="text-[10px] text-purple-400 uppercase mb-1">Deezer</div>
          <div className="text-sm font-bold text-white">
            {deezer?.streams ? formatNumber(deezer.streams) : '—'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-[10px] text-white/70">
      {spotify?.streams ? <span>Sp: {formatNumber(spotify.streams)}</span> : null}
      {apple_music?.streams ? <span>AM: {formatNumber(apple_music.streams)}</span> : null}
      {youtube?.views ? <span>YT: {formatNumber(youtube.views)}</span> : null}
      {deezer?.streams ? <span>Dz: {formatNumber(deezer.streams)}</span> : null}
    </div>
  );
}