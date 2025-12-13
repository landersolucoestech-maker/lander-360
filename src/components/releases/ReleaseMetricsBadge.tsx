import { BarChart3, Eye, Music } from 'lucide-react';
import { useReleaseMetrics } from '@/hooks/useReleaseMetrics';
import { Skeleton } from '@/components/ui/skeleton';

interface ReleaseMetricsBadgeProps {
  releaseId: string;
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

export function ReleaseMetricsBadge({ releaseId }: ReleaseMetricsBadgeProps) {
  const { data: metrics, isLoading } = useReleaseMetrics(releaseId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
      </div>
    );
  }

  if (!metrics || (metrics.totalStreams === 0 && metrics.totalViews === 0)) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      {metrics.totalStreams > 0 && (
        <div className="flex items-center gap-1" title="Total Streams">
          <Music className="h-3 w-3" />
          <span>{formatNumber(metrics.totalStreams)}</span>
        </div>
      )}
      {metrics.totalViews > 0 && (
        <div className="flex items-center gap-1" title="YouTube Views">
          <Eye className="h-3 w-3" />
          <span>{formatNumber(metrics.totalViews)}</span>
        </div>
      )}
    </div>
  );
}