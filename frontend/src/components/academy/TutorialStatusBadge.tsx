import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TutorialStatusBadgeProps {
  isCompleted: boolean;
  isLocked?: boolean;
  className?: string;
}

export function TutorialStatusBadge({ isCompleted, isLocked, className }: TutorialStatusBadgeProps) {
  if (isLocked) {
    return (
      <Badge variant="outline" className={cn("gap-1 text-muted-foreground", className)}>
        <Lock className="h-3 w-3" />
        Bloqueado
      </Badge>
    );
  }

  if (isCompleted) {
    return (
      <Badge className={cn("gap-1 bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20", className)}>
        <CheckCircle2 className="h-3 w-3" />
        Concluído
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={cn("gap-1 text-amber-600 border-amber-500/30", className)}>
      <Clock className="h-3 w-3" />
      Pendente
    </Badge>
  );
}
