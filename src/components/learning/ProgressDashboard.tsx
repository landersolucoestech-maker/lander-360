import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  LearningStage,
  LearningProgress,
  LearningUserBadge,
} from '@/hooks/useLearningHub';
import { 
  Award, 
  Trophy, 
  Target, 
  Zap, 
  Star, 
  BookOpen,
  Rocket,
  Users,
  FileText,
  Calendar,
  BarChart3,
} from 'lucide-react';

interface ProgressDashboardProps {
  stages: LearningStage[];
  progress: LearningProgress[];
  userBadges: LearningUserBadge[];
  totalLessons: number;
}

const badgeIcons: Record<string, React.ElementType> = {
  Award,
  Star,
  Zap,
  Trophy,
  BookOpen,
  Rocket,
  Users,
  FileText,
  Calendar,
  BarChart3,
};

export const ProgressDashboard = ({
  stages,
  progress,
  userBadges,
  totalLessons,
}: ProgressDashboardProps) => {
  const completedLessons = progress.filter((p) => p.completed).length;
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const totalPoints = userBadges.reduce((sum, ub) => sum + (ub.badge?.points || 0), 0);

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Progresso Geral</p>
                <p className="text-2xl font-bold">{overallProgress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10 text-green-500">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aulas Concluídas</p>
                <p className="text-2xl font-bold">
                  {completedLessons}/{totalLessons}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-yellow-500/10 text-yellow-500">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Badges</p>
                <p className="text-2xl font-bold">{userBadges.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-500/10 text-purple-500">
                <Star className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pontos</p>
                <p className="text-2xl font-bold">{totalPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stage Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso por Estágio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stages.map((stage, index) => {
              const stageProgress = Math.round(Math.random() * 100); // TODO: Calculate real progress
              const isCompleted = stageProgress === 100;

              return (
                <div key={stage.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        Estágio {stage.stage_number}: {stage.title}
                      </span>
                      {isCompleted && (
                        <Badge className="bg-green-500">Concluído</Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {stageProgress}%
                    </span>
                  </div>
                  <Progress value={stageProgress} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Badges Conquistados</CardTitle>
        </CardHeader>
        <CardContent>
          {userBadges.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Complete estágios para conquistar badges!
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {userBadges.map((ub) => {
                const Icon = badgeIcons[ub.badge?.icon || 'Award'] || Award;

                return (
                  <div
                    key={ub.id}
                    className="flex flex-col items-center p-4 rounded-lg bg-muted/50 text-center"
                  >
                    <div className="p-3 rounded-full bg-yellow-500/20 text-yellow-500 mb-2">
                      <Icon className="h-8 w-8" />
                    </div>
                    <span className="font-medium text-sm">{ub.badge?.name}</span>
                    <span className="text-xs text-muted-foreground">
                      +{ub.badge?.points} pts
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
