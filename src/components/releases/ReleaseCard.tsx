import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";

interface ReleaseCardProps {
  release: {
    id: string;
    title: string;
    artist: string;
    releaseDate: string;
    status: string;
    type: string;
    cover?: string;
    isUrgent?: boolean;
  };
  onViewDetails: (release: any) => void;
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
    isPast: false
  };
};

export const ReleaseCard = ({ release, onViewDetails }: ReleaseCardProps) => {
  const [timeRemaining, setTimeRemaining] = useState(() => 
    calculateTimeRemaining(release.releaseDate)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(release.releaseDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [release.releaseDate]);

  const pad = (num: number) => num.toString().padStart(2, "0");

  return (
    <div 
      className="relative overflow-hidden rounded-xl bg-card border border-border group cursor-pointer transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
      onClick={() => onViewDetails(release)}
    >
      {/* Background Image */}
      <div className="relative aspect-[4/5] w-full">
        {release.cover ? (
          <img 
            src={release.cover} 
            alt={release.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/20 via-background to-primary/10 flex items-center justify-center">
            <Music className="h-16 w-16 text-primary/40" />
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Top Right Badge */}
        <div className="absolute top-3 right-3">
          {release.isUrgent ? (
            <Badge className="bg-destructive text-destructive-foreground font-bold text-xs px-3 py-1">
              URGENTE
            </Badge>
          ) : timeRemaining.isPast ? (
            <Badge className="bg-green-500 text-white font-bold text-xs px-3 py-1">
              LANÇADO
            </Badge>
          ) : null}
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
          {/* Title and Artist */}
          <div>
            <h3 className="text-xl font-bold text-white uppercase tracking-wide truncate">
              {release.title}
            </h3>
            <p className="text-sm text-white/70">{release.artist}</p>
          </div>

          {/* Action Buttons */}
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
            <Button 
              size="sm" 
              variant="secondary"
              className="flex-1 bg-muted/80 hover:bg-muted text-muted-foreground text-xs h-7"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              Mídia
            </Button>
          </div>

          {/* Countdown Timer */}
          {!timeRemaining.isPast && (
            <div className="pt-2 border-t border-white/20">
              <p className="text-[10px] text-white/50 uppercase tracking-wider mb-2">
                Tempo restante
              </p>
              <div className="grid grid-cols-4 gap-1 text-center">
                <div className="bg-black/50 rounded px-1 py-1.5">
                  <div className="text-lg font-bold text-white leading-none">
                    {pad(timeRemaining.days)}
                  </div>
                  <div className="text-[8px] text-white/50 uppercase mt-0.5">dias</div>
                </div>
                <div className="bg-black/50 rounded px-1 py-1.5">
                  <div className="text-lg font-bold text-white leading-none">
                    {pad(timeRemaining.hours)}
                  </div>
                  <div className="text-[8px] text-white/50 uppercase mt-0.5">horas</div>
                </div>
                <div className="bg-black/50 rounded px-1 py-1.5">
                  <div className="text-lg font-bold text-white leading-none">
                    {pad(timeRemaining.minutes)}
                  </div>
                  <div className="text-[8px] text-white/50 uppercase mt-0.5">min</div>
                </div>
                <div className="bg-black/50 rounded px-1 py-1.5">
                  <div className="text-lg font-bold text-white leading-none">
                    {pad(timeRemaining.seconds)}
                  </div>
                  <div className="text-[8px] text-white/50 uppercase mt-0.5">seg</div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
