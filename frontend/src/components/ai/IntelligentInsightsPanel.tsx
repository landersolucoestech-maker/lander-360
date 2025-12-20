import { useIntelligentAnalysis } from '@/hooks/useIntelligentAnalysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  Lightbulb, 
  TrendingUp, 
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Brain,
  Target,
  Zap
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const severityColors = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
};

const severityIcons = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Lightbulb
};

export const IntelligentInsightsPanel = () => {
  const { data, isLoading, refetch, isFetching } = useIntelligentAnalysis();

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const { insights = [], inconsistencies = [], opportunities = [], alerts = [], summary } = data || {};

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Análise Inteligente</CardTitle>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            {summary?.criticalCount > 0 && (
              <Badge variant="outline" className={severityColors.critical}>
                {summary.criticalCount} crítico{summary.criticalCount > 1 ? 's' : ''}
              </Badge>
            )}
            {summary?.warningCount > 0 && (
              <Badge variant="outline" className={severityColors.warning}>
                {summary.warningCount} aviso{summary.warningCount > 1 ? 's' : ''}
              </Badge>
            )}
            {summary?.infoCount > 0 && (
              <Badge variant="outline" className={severityColors.info}>
                {summary.infoCount} info
              </Badge>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="alerts" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="alerts" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Alertas ({alerts.length})
            </TabsTrigger>
            <TabsTrigger value="inconsistencies" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Inconsistências ({inconsistencies.length})
            </TabsTrigger>
            <TabsTrigger value="opportunities" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              Oportunidades ({opportunities.length})
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-1">
              <Lightbulb className="h-3 w-3" />
              Insights ({insights.length})
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px] pr-4">
            <TabsContent value="alerts" className="space-y-3 mt-0">
              {alerts.length === 0 ? (
                <EmptyState icon={AlertCircle} message="Nenhum alerta crítico no momento" />
              ) : (
                alerts.map(item => <InsightCard key={item.id} item={item} />)
              )}
            </TabsContent>

            <TabsContent value="inconsistencies" className="space-y-3 mt-0">
              {inconsistencies.length === 0 ? (
                <EmptyState icon={AlertTriangle} message="Nenhuma inconsistência detectada" />
              ) : (
                inconsistencies.map(item => <InsightCard key={item.id} item={item} />)
              )}
            </TabsContent>

            <TabsContent value="opportunities" className="space-y-3 mt-0">
              {opportunities.length === 0 ? (
                <EmptyState icon={TrendingUp} message="Nenhuma oportunidade identificada" />
              ) : (
                opportunities.map(item => <InsightCard key={item.id} item={item} />)
              )}
            </TabsContent>

            <TabsContent value="insights" className="space-y-3 mt-0">
              {insights.length === 0 ? (
                <EmptyState icon={Lightbulb} message="Nenhum insight disponível" />
              ) : (
                insights.map(item => <InsightCard key={item.id} item={item} />)
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface InsightCardProps {
  item: {
    id: string;
    type: string;
    severity: 'critical' | 'warning' | 'info';
    title: string;
    description: string;
    module: string;
    actionable: boolean;
    suggestedAction?: string;
    relatedEntities?: { type: string; id: string; name: string }[];
  };
}

const InsightCard = ({ item }: InsightCardProps) => {
  const Icon = severityIcons[item.severity];

  return (
    <div className={`p-4 rounded-lg border ${severityColors[item.severity]} bg-card/50`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">{item.title}</h4>
            <Badge variant="outline" className="text-xs">
              {item.module}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{item.description}</p>
          
          {item.suggestedAction && (
            <div className="flex items-center gap-2 pt-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary">{item.suggestedAction}</span>
            </div>
          )}

          {item.relatedEntities && item.relatedEntities.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {item.relatedEntities.map((entity, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {entity.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
        {item.actionable && (
          <Button variant="ghost" size="sm" className="shrink-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

const EmptyState = ({ icon: Icon, message }: { icon: any; message: string }) => (
  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
    <Icon className="h-12 w-12 mb-4 opacity-50" />
    <p className="text-sm">{message}</p>
  </div>
);

export default IntelligentInsightsPanel;
