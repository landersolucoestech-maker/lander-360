import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TutorialModule, TutorialProgress } from '@/types/academy';
import { TutorialIcon } from './TutorialIcon';
import { TutorialStatusBadge } from './TutorialStatusBadge';
import { Lock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TutorialCardProps {
  tutorial: TutorialModule;
  progress: TutorialProgress;
  isUnlocked: boolean;
  onClick?: () => void;
  className?: string;
}

export function TutorialCard({ tutorial, progress, isUnlocked, onClick, className }: TutorialCardProps) {
  const completedCount = progress.completedChecklist.length;
  const totalCount = tutorial.checklist.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleClick = () => {
    if (isUnlocked && onClick) {
      onClick();
    }
  };

  return (
    <Card 
      onClick={handleClick}
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        isUnlocked 
          ? "hover:shadow-lg hover:border-primary/50 cursor-pointer" 
          : "opacity-60 cursor-not-allowed",
        progress.isCompleted && "border-green-500/30 bg-green-500/5",
        className
      )}
    >
      {!isUnlocked && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-center">
            <Lock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Complete o StartHub primeiro
            </p>
          </div>
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center justify-center w-12 h-12 rounded-xl transition-colors",
              progress.isCompleted 
                ? "bg-green-500/10 text-green-600" 
                : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
            )}>
              <TutorialIcon icon={tutorial.icon} size={24} />
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-medium">
                #{tutorial.order.toString().padStart(2, '0')}
              </span>
              <CardTitle className="text-lg leading-tight">{tutorial.title}</CardTitle>
            </div>
          </div>
          <TutorialStatusBadge 
            isCompleted={progress.isCompleted} 
            isLocked={!isUnlocked}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {tutorial.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-1.5" />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {completedCount}/{totalCount} itens
          </span>
          {isUnlocked && (
            <span className="flex items-center gap-1 text-primary group-hover:gap-2 transition-all">
              Acessar
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
