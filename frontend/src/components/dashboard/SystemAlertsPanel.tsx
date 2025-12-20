import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  Check,
  Bell,
  FileText,
  Music,
  Disc,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  useSystemAlerts,
  useDismissAlert,
  useResolveAlert,
  useMarkAlertRead,
  useProcessAutomations,
  SystemAlert,
} from '@/hooks/useSystemAlerts';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical':
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    case 'warning':
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    default:
      return <Info className="h-4 w-4 text-blue-500" />;
  }
};

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case 'critical':
      return <Badge variant="destructive">Crítico</Badge>;
    case 'warning':
      return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Atenção</Badge>;
    default:
      return <Badge variant="secondary">Info</Badge>;
  }
};

const getEntityIcon = (entityType: string | undefined) => {
  switch (entityType) {
    case 'contract':
      return <FileText className="h-4 w-4" />;
    case 'obra':
      return <Music className="h-4 w-4" />;
    case 'release':
      return <Disc className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getNavigationPath = (alert: SystemAlert) => {
  switch (alert.entity_type) {
    case 'contract':
      return '/contratos';
    case 'obra':
      return '/registro-musicas';
    case 'release':
      return '/lancamentos';
    default:
      return null;
  }
};

interface AlertItemProps {
  alert: SystemAlert;
  onDismiss: (id: string) => void;
  onResolve: (id: string) => void;
  onMarkRead: (id: string) => void;
}

const AlertItem = ({ alert, onDismiss, onResolve, onMarkRead }: AlertItemProps) => {
  const navigate = useNavigate();
  const path = getNavigationPath(alert);

  const handleClick = () => {
    if (!alert.is_read) {
      onMarkRead(alert.id);
    }
    if (path) {
      navigate(path);
    }
  };

  return (
    <div
      className={`p-3 rounded-lg border transition-colors ${
        !alert.is_read ? 'bg-accent/50 border-accent' : 'border-border hover:bg-accent/30'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getSeverityIcon(alert.severity)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{alert.title}</span>
            {getSeverityBadge(alert.severity)}
            {alert.days_until_due && (
              <Badge variant="outline" className="text-xs">
                {alert.days_until_due} dias
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {alert.message}
          </p>
          <div className="flex items-center gap-2 mt-2">
            {alert.entity_name && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {getEntityIcon(alert.entity_type)}
                <span>{alert.entity_name}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {path && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleClick}>
              <ChevronDown className="h-3 w-3 rotate-[-90deg]" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-green-500 hover:text-green-600"
            onClick={() => onResolve(alert.id)}
            title="Marcar como resolvido"
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => onDismiss(alert.id)}
            title="Descartar"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export const SystemAlertsPanel = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { data: alerts, isLoading } = useSystemAlerts();
  const dismissAlert = useDismissAlert();
  const resolveAlert = useResolveAlert();
  const markAlertRead = useMarkAlertRead();
  const processAutomations = useProcessAutomations();

  const criticalAlerts = alerts?.filter(a => a.severity === 'critical') || [];
  const warningAlerts = alerts?.filter(a => a.severity === 'warning') || [];
  const infoAlerts = alerts?.filter(a => a.severity === 'info') || [];

  const totalAlerts = alerts?.length || 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (totalAlerts === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={criticalAlerts.length > 0 ? 'border-destructive/50' : ''}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle className="text-base">Alertas do Sistema</CardTitle>
              <div className="flex items-center gap-1">
                {criticalAlerts.length > 0 && (
                  <Badge variant="destructive" className="h-5 px-1.5">
                    {criticalAlerts.length}
                  </Badge>
                )}
                {warningAlerts.length > 0 && (
                  <Badge className="h-5 px-1.5 bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                    {warningAlerts.length}
                  </Badge>
                )}
                {infoAlerts.length > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5">
                    {infoAlerts.length}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={() => processAutomations.mutate()}
                disabled={processAutomations.isPending}
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${processAutomations.isPending ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
          <CardDescription>
            {totalAlerts} {totalAlerts === 1 ? 'alerta ativo' : 'alertas ativos'}
          </CardDescription>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-2">
                {/* Critical alerts first */}
                {criticalAlerts.map(alert => (
                  <AlertItem
                    key={alert.id}
                    alert={alert}
                    onDismiss={id => dismissAlert.mutate(id)}
                    onResolve={id => resolveAlert.mutate(id)}
                    onMarkRead={id => markAlertRead.mutate(id)}
                  />
                ))}
                {/* Warning alerts */}
                {warningAlerts.map(alert => (
                  <AlertItem
                    key={alert.id}
                    alert={alert}
                    onDismiss={id => dismissAlert.mutate(id)}
                    onResolve={id => resolveAlert.mutate(id)}
                    onMarkRead={id => markAlertRead.mutate(id)}
                  />
                ))}
                {/* Info alerts */}
                {infoAlerts.map(alert => (
                  <AlertItem
                    key={alert.id}
                    alert={alert}
                    onDismiss={id => dismissAlert.mutate(id)}
                    onResolve={id => resolveAlert.mutate(id)}
                    onMarkRead={id => markAlertRead.mutate(id)}
                  />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
