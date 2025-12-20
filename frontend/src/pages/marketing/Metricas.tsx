import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Eye, Users, Target, PlayCircle, Heart, Share2, Link, LineChart } from "lucide-react";
import { useSocialMediaMetrics, useMarketingCampaigns } from "@/hooks/useMarketing";
import AdvancedMarketingModule from "@/components/marketing/AdvancedMarketingModule";

const MarketingMetricas = () => {
  const [activeTab, setActiveTab] = useState("metricas");
  const { data: metrics = [], isLoading: metricsLoading } = useSocialMediaMetrics();
  const { data: campaigns = [], isLoading: campaignsLoading } = useMarketingCampaigns();

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const totalReach = metrics.reduce((sum, m) => sum + (m.reach || 0), 0);
  const totalFollowers = metrics.reduce((sum, m) => sum + (m.followers || 0), 0);
  const averageEngagement = metrics.length > 0 
    ? metrics.reduce((sum, m) => sum + (m.engagement_rate || 0), 0) / metrics.length 
    : 0;
  const averageRoas = campaigns.length > 0 
    ? campaigns.reduce((sum, c) => sum + (c.roas || 0), 0) / campaigns.length 
    : 0;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full h-full px-4 py-3 space-y-3">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="h-9 w-9" />
                <div className="flex flex-col gap-2">
                  <h1 className="text-3xl font-bold text-foreground">Métricas e Resultados</h1>
                  <p className="text-muted-foreground">
                    Análise detalhada do desempenho das campanhas e redes sociais
                  </p>
                </div>
              </div>
              <Button className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Exportar Relatório
              </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="metricas" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Métricas
                </TabsTrigger>
                <TabsTrigger value="avancado" className="gap-2">
                  <Link className="h-4 w-4" />
                  Marketing Avançado
                </TabsTrigger>
                <TabsTrigger value="analytics" className="gap-2">
                  <LineChart className="h-4 w-4" />
                  Analytics & Benchmarks
                </TabsTrigger>
              </TabsList>

              <TabsContent value="metricas" className="space-y-6">
                {/* Overall KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardCard
                title="Alcance Total"
                value={metricsLoading ? "..." : formatNumber(totalReach)}
                description="impressões este mês"
                icon={Eye}
              />
              <DashboardCard
                title="Engajamento Médio"
                value={metricsLoading ? "..." : `${Math.min(averageEngagement, 100).toFixed(1)}%`}
                description="taxa de interação"
                icon={Heart}
              />
              <DashboardCard
                title="Seguidores Totais"
                value={metricsLoading ? "..." : formatNumber(totalFollowers)}
                description="em todas as plataformas"
                icon={Users}
              />
              <DashboardCard
                title="ROI Médio"
                value={campaignsLoading ? "..." : `${Math.min(Math.round(averageRoas * 100), 100)}%`}
                description="retorno sobre investimento"
                icon={TrendingUp}
              />
            </div>

            {/* Platform Performance and Campaign Results Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Platform Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance por Plataforma</CardTitle>
                  <CardDescription>
                    Comparativo de desempenho entre as redes sociais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {metricsLoading ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Carregando métricas...
                      </div>
                    ) : metrics.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhuma métrica encontrada
                      </div>
                    ) : (
                      metrics.map((metric) => (
                        <div
                          key={metric.platform}
                          className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-foreground">{metric.platform}</h3>
                            <div className="flex gap-2">
                              <Badge variant="outline">{metric.posts_count} posts</Badge>
                              {metric.stories_count > 0 && (
                                <Badge variant="outline">{metric.stories_count} stories</Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">Seguidores</div>
                              <div className="font-semibold text-lg">{formatNumber(metric.followers)}</div>
                              <div className={`text-xs flex items-center justify-center gap-1 ${
                                metric.followers_growth > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                <TrendingUp className="h-3 w-3" />
                                {metric.followers_growth > 0 ? '+' : ''}{Math.min(Math.abs(metric.followers_growth), 100)}%
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">Engajamento</div>
                              <div className="font-semibold text-lg">{Math.min(metric.engagement_rate, 100)}%</div>
                              <div className={`text-xs flex items-center justify-center gap-1 ${
                                metric.engagement_growth > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                <TrendingUp className="h-3 w-3" />
                                {metric.engagement_growth > 0 ? '+' : ''}{Math.min(Math.abs(metric.engagement_growth), 100)}%
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">Alcance</div>
                              <div className="font-semibold text-lg">{formatNumber(metric.reach)}</div>
                              <div className={`text-xs flex items-center justify-center gap-1 ${
                                metric.reach_growth > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                <TrendingUp className="h-3 w-3" />
                                {metric.reach_growth > 0 ? '+' : ''}{Math.min(Math.abs(metric.reach_growth), 100)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Campaign Results */}
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle>Resultados das Campanhas</CardTitle>
                  <CardDescription>
                    Performance detalhada das campanhas publicitárias
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {campaignsLoading ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Carregando campanhas...
                      </div>
                    ) : campaigns.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhuma campanha encontrada
                      </div>
                    ) : (
                      campaigns.map((campaign) => (
                        <div
                          key={campaign.id}
                          className="p-6 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="space-y-1">
                              <h3 className="text-lg font-semibold text-foreground">{campaign.name}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>Budget: R$ {campaign.budget?.toLocaleString('pt-BR') || '0'}</span>
                                <span>Gasto: R$ {campaign.spent?.toLocaleString('pt-BR') || '0'}</span>
                                <Badge 
                                  variant="default" 
                                  className="text-xs"
                                >
                                  ROAS: {Math.min((campaign.roas * 100 || 0), 100).toFixed(0)}%
                                </Badge>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              Ver Detalhes
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">Alcance</div>
                              <div className="font-semibold">{formatNumber(campaign.reach || 0)}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">Impressões</div>
                              <div className="font-semibold">{formatNumber(campaign.impressions || 0)}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">Clicks</div>
                              <div className="font-semibold">{formatNumber(campaign.clicks || 0)}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">Conversões</div>
                              <div className="font-semibold">{formatNumber(campaign.conversions || 0)}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">CTR</div>
                              <div className="font-semibold">{Math.min((campaign.ctr || 0), 100).toFixed(2)}%</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">CPC</div>
                              <div className="font-semibold">R$ {(campaign.cpc || 0).toFixed(2)}</div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
              </TabsContent>

              <TabsContent value="avancado">
                <AdvancedMarketingModule />
              </TabsContent>

              <TabsContent value="analytics">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="h-5 w-5" />
                      Analytics Avançado & Benchmarks
                    </CardTitle>
                    <CardDescription>
                      Compare seu desempenho com o mercado (estilo Chartmetric)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-12 text-center">
                    <LineChart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Módulo de Analytics em Desenvolvimento</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Em breve você poderá comparar suas métricas com benchmarks de mercado, 
                      analisar tendências e descobrir oportunidades de crescimento.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MarketingMetricas;