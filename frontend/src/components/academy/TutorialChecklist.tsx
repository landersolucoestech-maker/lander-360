import { Checkbox } from '@/components/ui/checkbox';
import { ChecklistItem, TutorialProgress } from '@/types/academy';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle } from 'lucide-react';

interface TutorialChecklistProps {
  items: ChecklistItem[];
  progress: TutorialProgress;
  onToggle: (itemId: string) => void;
  className?: string;
}

export function TutorialChecklist({ items, progress, onToggle, className }: TutorialChecklistProps) {
  const completedCount = progress.completedChecklist.length;
  const totalCount = items.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          O que fazer neste módulo
        </h3>
        <span className="text-sm text-muted-foreground">
          {completedCount}/{totalCount} ({progressPercentage}%)
        </span>
      </div>

      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const isCompleted = progress.completedChecklist.includes(item.id);
          
          return (
            <button
              key={item.id}
              onClick={() => onToggle(item.id)}
              className={cn(
                "w-full flex items-start gap-3 p-3 rounded-lg border transition-all text-left",
                isCompleted 
                  ? "bg-primary/5 border-primary/30 hover:bg-primary/10" 
                  : "bg-card border-border hover:border-primary/30 hover:bg-muted/50"
              )}
            >
              <div className="mt-0.5">
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <span className={cn(
                  "font-medium",
                  isCompleted && "line-through text-muted-foreground"
                )}>
                  {item.label}
                </span>
                {item.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {item.description}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
