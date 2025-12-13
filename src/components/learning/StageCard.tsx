import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LearningStage } from '@/hooks/useLearningHub';
import {
  BookOpen,
  Rocket,
  Users,
  FileText,
  Calendar,
  BarChart3,
  Zap,
  Lock,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StageCardProps {
  stage: LearningStage;
  progress: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  BookOpen,
  Rocket,
  Users,
  FileText,
  Calendar,
  BarChart3,
  Zap,
};

const colorMap: Record<string, string> = {
  blue: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  purple: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
  green: 'bg-green-500/20 text-green-500 border-green-500/30',
  orange: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
  pink: 'bg-pink-500/20 text-pink-500 border-pink-500/30',
  cyan: 'bg-cyan-500/20 text-cyan-500 border-cyan-500/30',
  amber: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
};

export const StageCard = ({
  stage,
  progress,
  isUnlocked,
  isCompleted,
  onClick,
}: StageCardProps) => {
  const Icon = iconMap[stage.icon || 'BookOpen'] || BookOpen;
  const colorClass = colorMap[stage.color || 'blue'];

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-300 hover:scale-[1.02] border',
        isUnlocked
          ? 'hover:shadow-lg hover:border-primary/50'
          : 'opacity-60 cursor-not-allowed',
        isCompleted && 'border-green-500/50 bg-green-500/5'
      )}
      onClick={isUnlocked ? onClick : undefined}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className={cn('p-3 rounded-lg border', colorClass)}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex items-center gap-2">
            {isCompleted && (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Concluído
              </Badge>
            )}
            {!isUnlocked && <Lock className="h-5 w-5 text-muted-foreground" />}
          </div>
        </div>
        <CardTitle className="text-lg mt-3">
          Estágio {stage.stage_number}: {stage.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{stage.description}</p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};
