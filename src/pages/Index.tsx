import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDashboardStats } from "@/hooks/useDashboard";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Music,
  DollarSign,
  Calendar,
  FileText,
  MapPin,
  Clock,
} from "lucide-react";
import { mockDashboardStats, mockEvents } from "@/data/mockData";

const Index = () => {
  const { data: stats, isLoading, error } = useDashboardStats();
  const navigate = useNavigate();

  // Use mock data when no database data exists or all values are zero
  const hasNoData = !stats || (
    stats.totalWorks === 0 && 
    stats.activeArtists === 0 && 
    stats.activeContracts === 0 && 
    stats.monthlyRevenue === 0
  );
  const displayStats = hasNoData ? mockDashboardStats : stats;

  // Filter today's events
  const today = new Date().toISOString().split('T')[0];
  const todayEvents = mockEvents.filter(event => event.start_date === today);

  if (error) {
    console.error('Dashboard error:', error);
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      sessoes_estudio: "Estúdio",
      shows: "Show",
      sessoes_fotos: "Fotos",
      podcasts: "Podcast",
      reunioes: "Reunião",
      viagens: "Viagem"
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmado":
        return <Badge variant="default">Confirmado</Badge>;
      case "pendente":
        return <Badge variant="secondary">Pendente</Badge>;
      case "agendado":
        return <Badge variant="outline">Agendado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full h-full px-4 py-3 space-y-3">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Visão geral do seu negócio musical
                </p>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <DashboardCard
                title="Obras e Fonogramas"
                value={isLoading ? '...' : displayStats.totalWorks || 0}
                description="Cadastrados no sistema"
                icon={Music}
                trend={stats?.trends?.works}
              />
              <DashboardCard
                title="Artistas Ativos"
                value={isLoading ? '...' : displayStats.activeArtists || 0}
                description="Artistas ativos no sistema"
                icon={Users}
                trend={stats?.trends?.artists}
              />
              <DashboardCard
                title="Contratos Vigentes"
                value={isLoading ? '...' : displayStats.activeContracts || 0}
                description="Contratos ativos no sistema"
                icon={FileText}
                trend={stats?.trends?.contracts}
              />
              <DashboardCard
                title="Receita Mensal"
                value={isLoading ? '...' : formatCurrency(displayStats.monthlyRevenue || 0)}
                description="Receita do mês atual"
                icon={DollarSign}
                trend={stats?.trends?.revenue}
              />
            </div>

            {/* Recent Activity and Today's Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <RecentActivity />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Agenda de Hoje
                  </CardTitle>
                  <CardDescription>Compromissos agendados</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {todayEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Nenhum evento agendado para hoje
                      </p>
                      <Button variant="outline" onClick={() => navigate('/agenda')}>Ver Agenda Completa</Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {todayEvents.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{event.event_name}</span>
                              {getStatusBadge(event.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {event.start_time} - {event.end_time}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {getEventTypeLabel(event.event_type)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full" onClick={() => navigate('/agenda')}>
                        Ver Agenda Completa
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <QuickActions />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
