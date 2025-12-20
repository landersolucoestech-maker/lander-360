
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Music, Upload, FileText, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRecentActivities } from "@/hooks/useDashboard";
import { formatDateBR } from "@/lib/utils";
import { Link } from "react-router-dom";

const getActivityIcon = (type: string) => {
  switch (type) {
    case "artist":
      return Music;
    case "project":
      return FileText;
    case "contract":
      return FileText;
    case "transaction":
      return Upload;
    case "release":
      return Calendar;
    default:
      return Music;
  }
};

const getActivityStatus = (type: string) => {
  switch (type) {
    case "artist":
      return "Novo";
    case "project":
      return "Criado";
    case "contract":
      return "Assinado";
    case "transaction":
      return "Processado";
    case "release":
      return "Lançado";
    default:
      return "Ativo";
  }
};

const getStatusColor = (type: string) => {
  switch (type) {
    case "artist":
    case "project":
    case "release":
      return "default";
    case "contract":
      return "secondary";
    case "transaction":
      return "outline";
    default:
      return "secondary";
  }
};

export function RecentActivity() {
  const { data: dbActivities = [], isLoading, error } = useRecentActivities(4);
  
  // Use only real data from database
  const activities = dbActivities.slice(0, 4);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Agora há pouco";
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    if (diffInHours < 48) return "Ontem";
    return formatDateBR(timestamp);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold">Atividades Recentes</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/relatorios">
            Ver todas
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg animate-pulse">
                <div className="h-10 w-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
                <div className="h-6 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Erro ao carregar atividades</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">Nenhuma atividade recente</p>
            <p className="text-sm text-muted-foreground">
              Atividades aparecerão aqui conforme você usar o sistema
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const IconComponent = getActivityIcon(activity.type);
              return (
                <div
                  key={`${activity.type}-${activity.id}`}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(activity.timestamp)}
                    </p>
                  </div>
                  
                  <Badge variant={getStatusColor(activity.type) as any}>
                    {getActivityStatus(activity.type)}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
