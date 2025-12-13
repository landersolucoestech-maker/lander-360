import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Music, BarChart3 } from "lucide-react";
import { ReleaseMetricsBadge } from "./ReleaseMetricsBadge";

interface Track {
  title?: string;
  performers?: string[];
  producers?: string[];
  composers?: string[];
}

interface ReleaseCardProps {
  release: {
    id: string;
    title: string;
    artist: string;
    releaseDate: string;
    status: string;
    type: string;
    genre?: string;
    cover?: string;
    approvalStatus?: "em_analise" | "aprovado" | "rejeitado" | "pausado" | "takedown";
    priority?: "alta" | "media" | "baixa";
    takedown?: boolean;
    hasMarketingPlan?: boolean;
    tracks?: Track[];
  };
  onViewDetails: (release: any) => void;
  onEdit?: (release: any) => void;
  onDelete?: (release: any) => void;
  onViewMetrics?: (release: any) => void;
}

const calculateTimeRemaining = (releaseDate: string) => {
  const now = new Date().getTime();
  const target = new Date(releaseDate).getTime();
  const difference = target - now;

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((difference % (1000 * 60)) / 1000),
    isPast: false,
  };
};

export const ReleaseCard = ({ release, onViewDetails, onEdit, onDelete, onViewMetrics }: ReleaseCardProps) => {
  const [timeRemaining, setTimeRemaining] = useState(() => calculateTimeRemaining(release.releaseDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(release.releaseDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [release.releaseDate]);

  const pad = (num: number) => num.toString().padStart(2, "0");

  // Extrair intérpretes e produtores das tracks
  const performers = release.tracks?.flatMap(t => t.performers || []) || [];
  const producers = release.tracks?.flatMap(t => t.producers || []) || [];
  const uniquePerformers = [...new Set(performers)];
  const uniqueProducers = [...new Set(producers)];
  
  const displayCredits = () => {
    const parts: string[] = [];
    if (uniquePerformers.length > 0) {
      parts.push(uniquePerformers.join(", "));
    }
    if (uniqueProducers.length > 0) {
      parts.push(`Prod. ${uniqueProducers.join(", ")}`);
    }
    return parts.join(" • ") || release.artist;
  };

  return (
    <div
      className="relative overflow-hidden rounded-xl bg-card border border-border group cursor-pointer transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 w-full h-[450px]"
      onClick={() => onViewDetails(release)}
    >
      {/* Background Image - fills the entire card */}
      <div className="relative w-full h-full">
        {release.cover ? (
          <img
            src={release.cover}
            alt={release.title}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/20 via-background to-primary/10 flex items-center justify-center">
            <Music className="h-16 w-16 text-primary/40" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Top Right Badge - Status Only */}
        <div className="absolute top-3 right-3">
          {/* Status Badge */}
          {release.takedown || release.approvalStatus === "takedown" ? (
            <Badge className="bg-purple-600 text-white font-bold text-xs px-3 py-1">TAKEDOWN</Badge>
          ) : release.approvalStatus === "em_analise" ? (
            <Badge className="bg-yellow-500 text-black font-bold text-xs px-3 py-1">EM ANÁLISE</Badge>
          ) : release.approvalStatus === "aprovado" ? (
            <Badge className="bg-green-500 text-white font-bold text-xs px-3 py-1">APROVADO</Badge>
          ) : release.approvalStatus === "rejeitado" ? (
            <Badge className="bg-red-600 text-white font-bold text-xs px-3 py-1">REJEITADO</Badge>
          ) : release.approvalStatus === "pausado" ? (
            <Badge className="bg-blue-500 text-white font-bold text-xs px-3 py-1">PAUSADO</Badge>
          ) : (
            <Badge className="bg-yellow-500 text-black font-bold text-xs px-3 py-1">EM ANÁLISE</Badge>
          )}
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
          {/* Title and Credits */}
          <div>
            <h3 className="text-xl font-bold text-white uppercase tracking-wide truncate">{release.title}</h3>
            <p className="text-sm text-white/70 truncate">{displayCredits()}</p>
            {/* Release Type and Genre Badges - Red color */}
            <div className="flex gap-2 mt-2">
              <Badge className="bg-red-600 text-white font-bold text-xs px-3 py-1">
                {release.type === 'single' ? 'Single' : release.type === 'ep' ? 'EP' : release.type === 'album' ? 'Álbum' : release.type?.toUpperCase() || 'Single'}
              </Badge>
              {release.genre && (
                <Badge className="bg-red-600 text-white font-bold text-xs px-3 py-1 capitalize">
                  {release.genre}
                </Badge>
              )}
            </div>
            {/* Streaming Metrics Grid */}
            <ReleaseMetricsBadge releaseId={release.id} variant="grid" />
          </div>

          {/* Marketing Planning - Only show when there's a marketing plan */}
          {release.hasMarketingPlan && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="flex-1 bg-primary/80 hover:bg-primary text-primary-foreground text-xs h-7"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                Planejamento
              </Button>
              <Badge
                className={`flex-1 flex items-center justify-center text-xs h-7 ${
                  release.priority === "alta"
                    ? "bg-destructive text-destructive-foreground"
                    : release.priority === "media"
                      ? "bg-yellow-500 text-black"
                      : "bg-green-500 text-white"
                }`}
              >
                {release.priority === "alta" ? "Alta" : release.priority === "media" ? "Média" : "Baixa"}
              </Badge>
            </div>
          )}

          {/* Countdown Timer */}
          {!timeRemaining.isPast && (release.approvalStatus === "aprovado" || !release.approvalStatus) && (
            <div className="pt-2 border-t border-white/20">
              <p className="text-[10px] text-white/50 uppercase tracking-wider mb-2">Tempo restante pra lançamento</p>
              <div className="grid grid-cols-4 gap-1 text-center">
                <div className="bg-black/50 rounded px-1 py-1.5">
                  <div className="text-lg font-bold text-white leading-none">{pad(timeRemaining.days)}</div>
                  <div className="text-[8px] text-white/50 uppercase mt-0.5">dias</div>
                </div>
                <div className="bg-black/50 rounded px-1 py-1.5">
                  <div className="text-lg font-bold text-white leading-none">{pad(timeRemaining.hours)}</div>
                  <div className="text-[8px] text-white/50 uppercase mt-0.5">horas</div>
                </div>
                <div className="bg-black/50 rounded px-1 py-1.5">
                  <div className="text-lg font-bold text-white leading-none">{pad(timeRemaining.minutes)}</div>
                  <div className="text-[8px] text-white/50 uppercase mt-0.5">min</div>
                </div>
                <div className="bg-black/50 rounded px-1 py-1.5">
                  <div className="text-lg font-bold text-white leading-none">{pad(timeRemaining.seconds)}</div>
                  <div className="text-[8px] text-white/50 uppercase mt-0.5">seg</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons - Always visible */}
          <div className={!timeRemaining.isPast ? "pt-2" : "pt-2 border-t border-white/20"}>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                className="flex-1 bg-white/20 hover:bg-white/30 text-white text-xs h-8 min-w-[60px]"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(release);
                }}
              >
                Ver
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-white/20 hover:bg-white/30 text-white text-xs h-8 min-w-[60px]"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(release);
                }}
              >
                Editar
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-white/20 hover:bg-white/30 text-white text-xs h-8 min-w-[60px]"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(release);
                }}
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
