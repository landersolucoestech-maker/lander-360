import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { FeaturedArtists } from "@/components/dashboard/FeaturedArtists";
import { SystemAlertsPanel } from "@/components/dashboard/SystemAlertsPanel";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDashboardStats, useMonthlyFinancialSummary, useTodayEvents } from "@/hooks/useDashboard";
import { useNavigate } from "react-router-dom";
import { Users, Calendar, FileText, MapPin, Clock, TrendingUp, Headphones } from "lucide-react";
const Index = () => {
  const {
    data: stats,
    isLoading,
    error
  } = useDashboardStats();
  const {
    data: financial,
    isLoading: isLoadingFinancial
  } = useMonthlyFinancialSummary();
  const {
    data: todayEvents = [],
    isLoading: isLoadingEvents
  } = useTodayEvents();
  const navigate = useNavigate();

  // Use real data only - no mock fallbacks
  const displayStats = stats || {
    totalWorks: 0,
    activeArtists: 0,
    activeContracts: 0,
    monthlyRevenue: 0,
    monthlyStreams: 0
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };
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
  return <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full h-full px-4 py-3 space-y-3">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="h-9 w-9" />
                <div className="flex flex-col gap-1">
                  <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                  <p className="text-sm text-muted-foreground">
                    Visão geral do seu negócio musical
                  </p>
                </div>
              </div>
            </div>


            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              <DashboardCard title="Artistas Ativos" value={isLoading ? '...' : displayStats.activeArtists || 0} description="Artistas ativos no sistema" icon={Users} trend={stats?.trends?.artists} />
              <DashboardCard title="Contratos Vigentes" value={isLoading ? '...' : displayStats.activeContracts || 0} description="Contratos ativos no sistema" icon={FileText} trend={stats?.trends?.contracts} />
              <DashboardCard title="Receita Mensal" value={isLoadingFinancial ? '...' : formatCurrency(financial?.revenue || 0)} description="Receitas do mês" icon={TrendingUp} trend={stats?.trends?.revenue} />
              <DashboardCard title="Streams do Mês" value={isLoading ? '...' : formatNumber(displayStats.monthlyStreams || 0)} description="Total de streams no mês" icon={Headphones} trend={stats?.trends?.streams} />
            </div>

            {/* System Alerts */}
            <SystemAlertsPanel />

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
                  {isLoadingEvents ? <div className="flex items-center justify-center py-8">
                      <span className="text-muted-foreground">Carregando...</span>
                    </div> : todayEvents.length === 0 ? <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Nenhum evento agendado para hoje
                      </p>
                      <Button variant="outline" onClick={() => navigate('/agenda')}>Ver Agenda Completa</Button>
                    </div> : <div className="space-y-3">
                      {todayEvents.map(event => <div key={event.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{event.title}</span>
                              {getStatusBadge(event.status || 'agendado')}
                            </div>
                            {event.artists && (
                              <div className="flex items-center gap-1 text-sm text-primary">
                                <Users className="h-3 w-3" />
                                <span>{event.artists.stage_name || event.artists.name}</span>
                              </div>
                            )}
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {event.start_time || '--:--'} {event.end_time ? `- ${event.end_time}` : ''}
                              </span>
                              {event.location && <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {event.location}
                                </span>}
                            </div>
                            {event.event_type && (
                              <Badge variant="outline" className="text-xs">
                                {getEventTypeLabel(event.event_type)}
                              </Badge>
                            )}
                          </div>
                        </div>)}
                      <Button variant="outline" className="w-full" onClick={() => navigate('/agenda')}>
                        Ver Agenda Completa
                      </Button>
                    </div>}
                </CardContent>
              </Card>
            </div>


            {/* Featured Artists */}
            <FeaturedArtists />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>;
};
export default Index;