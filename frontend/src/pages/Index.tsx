import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { FeaturedArtists } from "@/components/dashboard/FeaturedArtists";
import { SystemAlertsPanel } from "@/components/dashboard/SystemAlertsPanel";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDashboardStats, useMonthlyFinancialSummary, useTodayEvents } from "@/hooks/useDashboard";
import { useLinkedArtist, useArtistDashboardStats } from "@/hooks/useLinkedArtist";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  Users, Calendar, FileText, MapPin, Clock, TrendingUp, Headphones, Music, 
  FolderOpen, DollarSign, Wallet, BarChart3, Disc, Upload, Play, Trophy
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Index = () => {
  const { permissions, user } = useAuth();
  const isArtist = permissions.roles.includes('artista') && !permissions.isAdmin;
  
  // Dados para admin/gestor (visão geral)
  const { data: stats, isLoading, error } = useDashboardStats();
  const { data: financial, isLoading: isLoadingFinancial } = useMonthlyFinancialSummary();
  const { data: todayEvents = [], isLoading: isLoadingEvents } = useTodayEvents();
  
  // Dados para artista (visão personalizada)
  const { data: linkedArtist, isLoading: isLoadingArtist } = useLinkedArtist();
  const { data: artistStats, isLoading: isLoadingArtistStats } = useArtistDashboardStats(linkedArtist?.id || null);
  
  const navigate = useNavigate();

  // Função para obter o nome do artista para exibição
  const getArtistDisplayName = () => {
    if (linkedArtist?.stage_name) return linkedArtist.stage_name;
    if (linkedArtist?.name) return linkedArtist.name;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'Artista';
  };

  // Dados padrão
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
      case "publicado":
        return <Badge className="bg-green-500">Publicado</Badge>;
      case "em_producao":
        return <Badge variant="secondary">Em Produção</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // ============================================
  // 🎵 DASHBOARD DO ARTISTA (Meu Painel)
  // ============================================
  if (isArtist) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <div className="w-full h-full px-4 py-3 space-y-4">
              {/* Header do Artista */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-3">
                  <SidebarTrigger className="h-9 w-9" />
                  <div className="flex items-center gap-4">
                    {linkedArtist && (
                      <Avatar className="h-14 w-14 border-2 border-primary">
                        <AvatarImage src={linkedArtist.avatar_url || ''} alt={linkedArtist.name} />
                        <AvatarFallback className="text-lg">{linkedArtist.name?.charAt(0) || 'A'}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex flex-col gap-1">
                      <h1 className="text-2xl font-bold text-foreground">
                        {isLoadingArtist ? 'Carregando...' : `Olá, ${getArtistDisplayName()}!`}
                      </h1>
                      <p className="text-sm text-muted-foreground">
                        Meu Painel - Visão geral da sua carreira
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* GRID 1: 💰 Minha Carteira */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Wallet className="h-5 w-5 text-green-500" />
                    Minha Carteira
                  </CardTitle>
                  <CardDescription>Saldo disponível e pendente</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Saldo Disponível</p>
                      <p className="text-2xl font-bold text-green-600">
                        {isLoadingArtistStats ? '...' : formatCurrency(artistStats?.availableBalance || 0)}
                      </p>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-950 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Saldo Pendente</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {isLoadingArtistStats ? '...' : formatCurrency(artistStats?.pendingBalance || 0)}
                      </p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Total Recebido</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {isLoadingArtistStats ? '...' : formatCurrency(artistStats?.totalEarnings || 0)}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/financeiro')}>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Ver Meu Financeiro Completo
                  </Button>
                </CardContent>
              </Card>

              {/* GRID 2: 🎵 Minha Carreira */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Music className="h-5 w-5 text-purple-500" />
                    Minha Carreira
                  </CardTitle>
                  <CardDescription>Projetos, obras e fonogramas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-3 border rounded-lg">
                      <FolderOpen className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                      <p className="text-2xl font-bold">{isLoadingArtistStats ? '...' : artistStats?.totalProjects || 0}</p>
                      <p className="text-xs text-muted-foreground">Projetos</p>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <Music className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                      <p className="text-2xl font-bold">{isLoadingArtistStats ? '...' : artistStats?.totalWorks || 0}</p>
                      <p className="text-xs text-muted-foreground">Obras</p>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <Disc className="h-8 w-8 mx-auto text-pink-500 mb-2" />
                      <p className="text-2xl font-bold">{isLoadingArtistStats ? '...' : artistStats?.totalPhonograms || 0}</p>
                      <p className="text-xs text-muted-foreground">Fonogramas</p>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <FileText className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                      <p className="text-2xl font-bold">{isLoadingArtistStats ? '...' : artistStats?.activeContracts || 0}</p>
                      <p className="text-xs text-muted-foreground">Contratos</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" className="flex-1" onClick={() => navigate('/projetos')}>
                      Meus Projetos
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => navigate('/registro-musicas')}>
                      Minhas Obras
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* GRID 3: 🚀 Meus Lançamentos */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Upload className="h-5 w-5 text-red-500" />
                      Meus Lançamentos
                    </CardTitle>
                    <CardDescription>Publicados e agendados</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-green-50 dark:bg-green-950 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {isLoadingArtistStats ? '...' : artistStats?.publishedReleases || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">Publicados</p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {isLoadingArtistStats ? '...' : artistStats?.scheduledReleases || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">Agendados</p>
                      </div>
                    </div>
                    
                    {/* Lista de últimos lançamentos */}
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {(artistStats?.recentReleases || []).slice(0, 3).map((release: any) => (
                        <div key={release.id} className="flex items-center justify-between p-2 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <Play className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium truncate max-w-[150px]">{release.title}</span>
                          </div>
                          {getStatusBadge(release.status)}
                        </div>
                      ))}
                      {(!artistStats?.recentReleases || artistStats.recentReleases.length === 0) && (
                        <p className="text-sm text-muted-foreground text-center py-4">Nenhum lançamento ainda</p>
                      )}
                    </div>
                    
                    <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/lancamentos')}>
                      Ver Todos os Lançamentos
                    </Button>
                  </CardContent>
                </Card>

                {/* GRID 4: 📊 Desempenho */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BarChart3 className="h-5 w-5 text-cyan-500" />
                      Desempenho
                    </CardTitle>
                    <CardDescription>Streams, ganhos e top obras</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Total de Streams */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Headphones className="h-5 w-5 text-green-500" />
                          <span className="text-sm">Total de Streams</span>
                        </div>
                        <span className="text-lg font-bold">
                          {isLoadingArtistStats ? '...' : formatNumber(artistStats?.totalStreams || 0)}
                        </span>
                      </div>
                      
                      {/* Ganhos do Mês */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-blue-500" />
                          <span className="text-sm">Ganhos do Mês</span>
                        </div>
                        <span className="text-lg font-bold text-green-600">
                          {isLoadingArtistStats ? '...' : formatCurrency(artistStats?.monthlyEarnings || 0)}
                        </span>
                      </div>

                      {/* Top Obras */}
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          Top Obras
                        </p>
                        <div className="space-y-2">
                          {(artistStats?.topWorks || []).slice(0, 3).map((work: any, index: number) => (
                            <div key={work.id} className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2">
                                <span className="text-muted-foreground">#{index + 1}</span>
                                <span className="truncate max-w-[150px]">{work.title}</span>
                              </span>
                              <span className="text-muted-foreground">{formatNumber(work.streams || 0)}</span>
                            </div>
                          ))}
                          {(!artistStats?.topWorks || artistStats.topWorks.length === 0) && (
                            <p className="text-sm text-muted-foreground text-center">Sem dados ainda</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/relatorios')}>
                      Ver Relatórios Completos
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Minha Agenda */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-indigo-500" />
                    Minha Agenda
                  </CardTitle>
                  <CardDescription>Próximos compromissos</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingArtistStats ? (
                    <div className="flex items-center justify-center py-8">
                      <span className="text-muted-foreground">Carregando...</span>
                    </div>
                  ) : (artistStats?.upcomingEvents || []).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <Calendar className="h-10 w-10 text-muted-foreground mb-3" />
                      <p className="text-muted-foreground mb-3">Nenhum evento agendado</p>
                      <Button variant="outline" size="sm" onClick={() => navigate('/agenda')}>
                        Ver Agenda
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(artistStats?.upcomingEvents || []).slice(0, 4).map((event: any) => (
                        <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{event.title}</span>
                              {getStatusBadge(event.status || 'agendado')}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(event.start_date).toLocaleDateString('pt-BR')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {event.start_time || '--:--'}
                              </span>
                              {event.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {event.location}
                                </span>
                              )}
                            </div>
                          </div>
                          {event.event_type && (
                            <Badge variant="outline" className="text-xs ml-2">
                              {getEventTypeLabel(event.event_type)}
                            </Badge>
                          )}
                        </div>
                      ))}
                      <Button variant="outline" className="w-full mt-2" onClick={() => navigate('/agenda')}>
                        Ver Agenda Completa
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  // ============================================
  // 🔐 DASHBOARD ADMINISTRATIVO
  // ============================================
  return (
    <SidebarProvider>
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
                  {isLoadingEvents ? (
                    <div className="flex items-center justify-center py-8">
                      <span className="text-muted-foreground">Carregando...</span>
                    </div>
                  ) : todayEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Nenhum evento agendado para hoje
                      </p>
                      <Button variant="outline" onClick={() => navigate('/agenda')}>Ver Agenda Completa</Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {todayEvents.map(event => (
                        <div key={event.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors">
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
                              {event.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {event.location}
                                </span>
                              )}
                            </div>
                            {event.event_type && (
                              <Badge variant="outline" className="text-xs">
                                {getEventTypeLabel(event.event_type)}
                              </Badge>
                            )}
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

            {/* Featured Artists */}
            <FeaturedArtists />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
