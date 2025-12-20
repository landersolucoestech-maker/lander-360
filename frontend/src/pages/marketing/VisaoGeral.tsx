import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { WorkflowNavigation } from "@/components/navigation/WorkflowNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, DollarSign, Target, TrendingUp, TrendingDown, 
  Megaphone, FileText, CheckSquare, AlertTriangle, 
  Instagram, Youtube, Music2, BarChart3, ArrowRight,
  Calendar, Zap, Eye, MousePointerClick, RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMarketingCampaigns, useMarketingTasks, useMarketingBriefings, useSocialMediaMetrics } from "@/hooks/useMarketing";
import { usePaidCampaigns } from "@/hooks/usePaidCampaigns";


const MarketingVisaoGeral = () => {
  const navigate = useNavigate();
  
  // Data hooks
  const { data: campaigns = [], isLoading: campaignsLoading } = useMarketingCampaigns();
  const { data: tasks = [], isLoading: tasksLoading } = useMarketingTasks();
  const { data: briefings = [], isLoading: briefingsLoading } = useMarketingBriefings();
  const { data: socialMetrics = [] } = useSocialMediaMetrics();
  const { campaigns: paidCampaigns = [], metrics: paidMetrics } = usePaidCampaigns();

  // Calculate KPIs
  const activeCampaigns = campaigns.filter((c: any) => c.status === 'Ativa' || c.status === 'ativa');
  const totalLeads = campaigns.reduce((sum: number, c: any) => sum + (c.conversions || 0), 0);
  const totalSpent = paidMetrics?.totalSpent || campaigns.reduce((sum: number, c: any) => sum + (c.spent || 0), 0);
  const avgCPL = totalLeads > 0 ? totalSpent / totalLeads : 0;
  const avgROI = campaigns.length > 0 
    ? campaigns.reduce((sum: number, c: any) => sum + (c.roas || 0), 0) / campaigns.length 
    : 0;
  const avgConversion = campaigns.length > 0
    ? campaigns.reduce((sum: number, c: any) => {
        const impressions = c.impressions || 0;
        const conversions = c.conversions || 0;
        return sum + (impressions > 0 ? (conversions / impressions) * 100 : 0);
      }, 0) / campaigns.length
    : 0;

  // Format currency helper
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Channel performance
  const channelPerformance = [
    { 
      name: 'Instagram', 
      icon: Instagram, 
      value: socialMetrics.find((m: any) => m.platform === 'instagram')?.followers || 0,
      engagement: socialMetrics.find((m: any) => m.platform === 'instagram')?.engagement_rate || 0,
      color: 'bg-pink-500'
    },
    { 
      name: 'YouTube', 
      icon: Youtube, 
      value: socialMetrics.find((m: any) => m.platform === 'youtube')?.followers || 0,
      engagement: socialMetrics.find((m: any) => m.platform === 'youtube')?.engagement_rate || 0,
      color: 'bg-red-500'
    },
    { 
      name: 'TikTok', 
      icon: Music2, 
      value: socialMetrics.find((m: any) => m.platform === 'tiktok')?.followers || 0,
      engagement: socialMetrics.find((m: any) => m.platform === 'tiktok')?.engagement_rate || 0,
      color: 'bg-foreground'
    },
    { 
      name: 'Spotify', 
      icon: Music2, 
      value: socialMetrics.find((m: any) => m.platform === 'spotify')?.followers || 0,
      engagement: socialMetrics.find((m: any) => m.platform === 'spotify')?.engagement_rate || 0,
      color: 'bg-green-500'
    },
  ];

  // Marketing funnel data
  const funnelData = {
    awareness: campaigns.reduce((sum: number, c: any) => sum + (c.impressions || 0), 0),
    interest: campaigns.reduce((sum: number, c: any) => sum + (c.clicks || 0), 0),
    consideration: campaigns.reduce((sum: number, c: any) => sum + (c.reach || 0), 0),
    conversion: totalLeads
  };

  // Smart alerts
  const alerts = [];
  const overdueTasks = tasks.filter((t: any) => t.status === 'Atrasada');
  const pendingBriefings = briefings.filter((b: any) => b.status === 'Pendente');
  const lowPerformingCampaigns = campaigns.filter((c: any) => (c.roas || 0) < 1 && c.status === 'Ativa');

  if (overdueTasks.length > 0) {
    alerts.push({ type: 'warning', message: `${overdueTasks.length} tarefa(s) atrasada(s)`, action: '/marketing/tarefas' });
  }
  if (pendingBriefings.length > 0) {
    alerts.push({ type: 'info', message: `${pendingBriefings.length} briefing(s) aguardando aprovação`, action: '/marketing/briefing' });
  }
  if (lowPerformingCampaigns.length > 0) {
    alerts.push({ type: 'danger', message: `${lowPerformingCampaigns.length} campanha(s) com ROI abaixo de 1x`, action: '/marketing/campanhas' });
  }

  // Best performing content (top campaigns by ROAS)
  const topCampaigns = [...campaigns]
    .filter((c: any) => c.roas && c.roas > 0)
    .sort((a: any, b: any) => (b.roas || 0) - (a.roas || 0))
    .slice(0, 3);

  const isLoading = campaignsLoading || tasksLoading || briefingsLoading;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full h-full px-4 py-3 space-y-4">
            <WorkflowNavigation currentStep="marketing" />
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="h-9 w-9" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Visão Geral</h1>
                  <p className="text-sm text-muted-foreground">
                    Cockpit estratégico de marketing
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="gap-2" disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>

            {/* KPIs Principais */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Leads</p>
                      <p className="text-2xl font-bold">{formatNumber(totalLeads)}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">+12%</span>
                    <span className="text-muted-foreground">vs mês anterior</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">CPL</p>
                      <p className="text-2xl font-bold">{formatCurrency(avgCPL)}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-orange-500" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs">
                    <TrendingDown className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">-8%</span>
                    <span className="text-muted-foreground">custo por lead</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">ROI</p>
                      <p className="text-2xl font-bold">{avgROI.toFixed(1)}x</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">+15%</span>
                    <span className="text-muted-foreground">retorno</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Conversão</p>
                      <p className="text-2xl font-bold">{avgConversion.toFixed(1)}%</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Target className="h-5 w-5 text-blue-500" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">+5%</span>
                    <span className="text-muted-foreground">taxa média</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left Column - Performance e Funil */}
              <div className="lg:col-span-2 space-y-4">
                {/* Performance por Canal */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Performance por Canal</CardTitle>
                    <CardDescription>Engajamento e alcance por plataforma</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {channelPerformance.map((channel) => (
                        <div key={channel.name} className="flex items-center gap-4">
                          <div className={`h-8 w-8 rounded-lg ${channel.color} flex items-center justify-center`}>
                            <channel.icon className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{channel.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {formatNumber(channel.value)} seguidores
                              </span>
                            </div>
                            <Progress value={channel.engagement * 10} className="h-2" />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">
                            {channel.engagement.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Funil de Marketing */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Funil de Marketing</CardTitle>
                    <CardDescription>Jornada do lead até conversão</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-24 text-sm text-muted-foreground">Awareness</div>
                        <div className="flex-1 bg-muted rounded-full h-8 relative overflow-hidden">
                          <div className="absolute inset-y-0 left-0 bg-primary/80 rounded-full" style={{ width: '100%' }} />
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-primary-foreground">
                            {formatNumber(funnelData.awareness)} impressões
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 text-sm text-muted-foreground">Interesse</div>
                        <div className="flex-1 bg-muted rounded-full h-8 relative overflow-hidden">
                          <div 
                            className="absolute inset-y-0 left-0 bg-primary/60 rounded-full" 
                            style={{ width: funnelData.awareness > 0 ? `${Math.min((funnelData.interest / funnelData.awareness) * 100 * 5, 100)}%` : '0%' }} 
                          />
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                            {formatNumber(funnelData.interest)} cliques
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 text-sm text-muted-foreground">Consideração</div>
                        <div className="flex-1 bg-muted rounded-full h-8 relative overflow-hidden">
                          <div 
                            className="absolute inset-y-0 left-0 bg-primary/40 rounded-full" 
                            style={{ width: funnelData.interest > 0 ? `${Math.min((funnelData.consideration / funnelData.interest) * 100 * 2, 100)}%` : '0%' }} 
                          />
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                            {formatNumber(funnelData.consideration)} alcance
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 text-sm text-muted-foreground">Conversão</div>
                        <div className="flex-1 bg-muted rounded-full h-8 relative overflow-hidden">
                          <div 
                            className="absolute inset-y-0 left-0 bg-green-500 rounded-full" 
                            style={{ width: funnelData.consideration > 0 ? `${Math.min((funnelData.conversion / funnelData.consideration) * 100 * 10, 100)}%` : '0%' }} 
                          />
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                            {formatNumber(funnelData.conversion)} leads
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Campanhas Ativas */}
                <Card>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Campanhas Ativas</CardTitle>
                      <CardDescription>{activeCampaigns.length} campanhas em execução</CardDescription>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => navigate('/marketing/campanhas')}
                    >
                      Ver todas <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {activeCampaigns.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhuma campanha ativa no momento
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {activeCampaigns.slice(0, 4).map((campaign: any) => (
                          <div key={campaign.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                              <Megaphone className="h-4 w-4 text-primary" />
                              <div>
                                <p className="text-sm font-medium">{campaign.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatCurrency(campaign.spent || 0)} gastos
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{(campaign.roas || 0).toFixed(1)}x ROI</p>
                              <p className="text-xs text-muted-foreground">
                                {formatNumber(campaign.impressions || 0)} imp.
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Alerts, Top Content, Quick Actions */}
              <div className="space-y-4">
                {/* Alertas Inteligentes */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      Alertas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {alerts.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        Nenhum alerta no momento
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {alerts.map((alert, index) => (
                          <div 
                            key={index}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                              alert.type === 'danger' ? 'bg-destructive/10 hover:bg-destructive/20' :
                              alert.type === 'warning' ? 'bg-yellow-500/10 hover:bg-yellow-500/20' :
                              'bg-blue-500/10 hover:bg-blue-500/20'
                            }`}
                            onClick={() => navigate(alert.action)}
                          >
                            <p className="text-sm">{alert.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Top Performers */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Melhor Performance</CardTitle>
                    <CardDescription>Campanhas com maior ROI</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {topCampaigns.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        Sem dados de performance ainda
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {topCampaigns.map((campaign: any, index: number) => (
                          <div key={campaign.id} className="flex items-center gap-3">
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0 ? 'bg-yellow-500 text-yellow-950' :
                              index === 1 ? 'bg-gray-300 text-gray-700' :
                              'bg-orange-400 text-orange-950'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{campaign.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatNumber(campaign.conversions || 0)} conversões
                              </p>
                            </div>
                            <Badge variant="outline" className="text-green-600">
                              {(campaign.roas || 0).toFixed(1)}x
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Atalhos Rápidos */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      Atalhos Rápidos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      onClick={() => navigate('/marketing/campanhas')}
                    >
                      <Megaphone className="h-4 w-4" />
                      Criar Campanha
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      onClick={() => navigate('/marketing/briefing')}
                    >
                      <FileText className="h-4 w-4" />
                      Novo Briefing
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      onClick={() => navigate('/marketing/tarefas')}
                    >
                      <CheckSquare className="h-4 w-4" />
                      Criar Tarefa
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      onClick={() => navigate('/marketing/ia-criativa')}
                    >
                      <BarChart3 className="h-4 w-4" />
                      IA Criativa
                    </Button>
                  </CardContent>
                </Card>

                {/* Resumo de Atividades */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Atividades</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold">{tasks.length}</p>
                        <p className="text-xs text-muted-foreground">Tarefas</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold">{briefings.length}</p>
                        <p className="text-xs text-muted-foreground">Briefings</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold">{campaigns.length}</p>
                        <p className="text-xs text-muted-foreground">Campanhas</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold">{paidCampaigns.length}</p>
                        <p className="text-xs text-muted-foreground">Ads Ativos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MarketingVisaoGeral;
