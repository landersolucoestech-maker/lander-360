import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardAlerts } from '@/hooks/useDashboard';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  FileText, 
  Disc, 
  Calendar,
  Clock,
  DollarSign,
  ChevronRight
} from 'lucide-react';

export const AlertsOverview = () => {
  const { data: alerts, isLoading } = useDashboardAlerts();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  const alertItems = [
    {
      icon: FileText,
      label: 'Contratos a vencer (30 dias)',
      count: alerts?.contractsExpiring30Days || 0,
      severity: 'critical',
      path: '/contratos',
    },
    {
      icon: FileText,
      label: 'Contratos a vencer (60 dias)',
      count: alerts?.contractsExpiring60Days || 0,
      severity: 'warning',
      path: '/contratos',
    },
    {
      icon: FileText,
      label: 'Contratos a vencer (90 dias)',
      count: alerts?.contractsExpiring90Days || 0,
      severity: 'info',
      path: '/contratos',
    },
    {
      icon: Disc,
      label: 'Lançamentos em análise',
      count: alerts?.releasesInAnalysis || 0,
      severity: 'warning',
      path: '/lancamentos',
    },
    {
      icon: Calendar,
      label: 'Lançamentos sem data',
      count: alerts?.releasesWithoutDate || 0,
      severity: 'warning',
      path: '/lancamentos',
    },
    {
      icon: Clock,
      label: 'Aprovações pendentes',
      count: alerts?.pendingApprovals || 0,
      severity: 'info',
      path: '/registro-musicas',
    },
    {
      icon: DollarSign,
      label: 'Pagamentos atrasados',
      count: alerts?.overduePayments || 0,
      severity: 'critical',
      path: '/financeiro',
    },
  ].filter(item => item.count > 0);

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10 border-red-500/20 text-red-500';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500';
      default:
        return 'bg-blue-500/10 border-blue-500/20 text-blue-500';
    }
  };

  const totalAlerts = alertItems.reduce((sum, item) => sum + item.count, 0);

  if (totalAlerts === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-base">Atenção Necessária</CardTitle>
          </div>
          <Badge variant="secondary">{totalAlerts} alertas</Badge>
        </div>
        <CardDescription>Itens que requerem sua atenção</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {alertItems.map((item, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent/50 ${getSeverityStyles(item.severity)}`}
            onClick={() => navigate(item.path)}
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={item.severity === 'critical' ? 'destructive' : 'secondary'}
                className="min-w-[24px] justify-center"
              >
                {item.count}
              </Badge>
              <ChevronRight className="h-4 w-4 opacity-50" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
