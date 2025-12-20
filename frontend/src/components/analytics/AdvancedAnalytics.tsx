import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useArtists } from "@/hooks/useArtists";
import { useReleases } from "@/hooks/useReleases";
import { useMusicRegistry } from "@/hooks/useMusicRegistry";
import { useFinancialTransactions } from "@/hooks/useFinancial";
import { useActiveContracts } from "@/hooks/useContracts";
import { 
  TrendingUp, TrendingDown, BarChart3, Target, Users, Music, 
  PlayCircle, DollarSign, Award, Zap, Globe, Calendar 
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface MarketBenchmark {
  metric: string;
  yourValue: number;
  marketAvg: number;
  topPerformers: number;
  percentile: number;
}

export function AdvancedAnalytics() {
  const [selectedArtist, setSelectedArtist] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("30d");

  const { data: artists = [] } = useArtists();
  const { data: releases = [] } = useReleases();
  const { data: music = [] } = useMusicRegistry();
  const { data: transactions = [] } = useFinancialTransactions();
  const { data: contracts = [] } = useActiveContracts();

  // Filter data based on selected artist
  const filteredReleases = useMemo(() => 
    selectedArtist === "all" 
      ? releases 
      : releases.filter((r: any) => r.artist_id === selectedArtist),
    [releases, selectedArtist]
  );

  const filteredMusic = useMemo(() => 
    selectedArtist === "all" 
      ? music 
      : music.filter((m: any) => m.artist_id === selectedArtist),
    [music, selectedArtist]
  );

  const filteredTransactions = useMemo(() => 
    selectedArtist === "all" 
      ? transactions 
      : transactions.filter((t: any) => t.artist_id === selectedArtist),
    [transactions, selectedArtist]
  );

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalRevenue = filteredTransactions
      .filter((t: any) => t.type === 'receitas' || t.type === 'income')
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

    const totalExpenses = filteredTransactions
      .filter((t: any) => t.type === 'despesas' || t.type === 'expense')
      .reduce((sum: number, t: any) => sum + Math.abs(t.amount || 0), 0);

    const releasedCount = filteredReleases.filter((r: any) => 
      r.status === 'released' || r.status === 'lançado'
    ).length;

    const avgReleasesPerArtist = selectedArtist === "all" && artists.length > 0
      ? releases.length / artists.length
      : filteredReleases.length;

    const catalogSize = filteredMusic.length;
    
    return {
      totalRevenue,
      totalExpenses,
      profit: totalRevenue - totalExpenses,
      releasedCount,
      avgReleasesPerArtist: avgReleasesPerArtist.toFixed(1),
      catalogSize,
      artistCount: selectedArtist === "all" ? artists.length : 1,
      contractCount: contracts.length,
    };
  }, [filteredTransactions, filteredReleases, filteredMusic, artists, contracts, selectedArtist, releases]);

  // Market benchmarks (simulated based on industry averages)
  const benchmarks: MarketBenchmark[] = useMemo(() => {
    const yourCatalog = kpis.catalogSize;
    const yourReleases = parseInt(kpis.avgReleasesPerArtist);
    const yourRevenue = kpis.totalRevenue;

    // Industry averages for independent labels
    const marketAvgCatalog = 25;
    const marketAvgReleases = 4;
    const marketAvgRevenue = 50000;

    // Top performers (top 10%)
    const topCatalog = 100;
    const topReleases = 12;
    const topRevenue = 200000;

    const calculatePercentile = (value: number, avg: number, top: number) => {
      if (value >= top) return 95;
      if (value >= avg) return 50 + ((value - avg) / (top - avg)) * 45;
      return Math.max(5, (value / avg) * 50);
    };

    return [
      {
        metric: "Tamanho do Catálogo",
        yourValue: yourCatalog,
        marketAvg: marketAvgCatalog,
        topPerformers: topCatalog,
        percentile: calculatePercentile(yourCatalog, marketAvgCatalog, topCatalog)
      },
      {
        metric: "Lançamentos/Ano",
        yourValue: yourReleases,
        marketAvg: marketAvgReleases,
        topPerformers: topReleases,
        percentile: calculatePercentile(yourReleases, marketAvgReleases, topReleases)
      },
      {
        metric: "Receita Anual (R$)",
        yourValue: yourRevenue,
        marketAvg: marketAvgRevenue,
        topPerformers: topRevenue,
        percentile: calculatePercentile(yourRevenue, marketAvgRevenue, topRevenue)
      },
      {
        metric: "Artistas Ativos",
        yourValue: kpis.artistCount,
        marketAvg: 10,
        topPerformers: 50,
        percentile: calculatePercentile(kpis.artistCount, 10, 50)
      },
    ];
  }, [kpis]);

  // Growth metrics (simulated month-over-month)
  const growthMetrics = useMemo(() => {
    // Simulate growth based on recent data
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentReleases = filteredReleases.filter((r: any) => 
      new Date(r.created_at) >= thirtyDaysAgo
    ).length;

    const previousReleases = filteredReleases.filter((r: any) => {
      const date = new Date(r.created_at);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    }).length;

    const recentRevenue = filteredTransactions
      .filter((t: any) => new Date(t.date) >= thirtyDaysAgo && (t.type === 'receitas' || t.type === 'income'))
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

    const previousRevenue = filteredTransactions
      .filter((t: any) => {
        const date = new Date(t.date);
        return date >= sixtyDaysAgo && date < thirtyDaysAgo && (t.type === 'receitas' || t.type === 'income');
      })
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

    const releaseGrowth = previousReleases > 0 
      ? ((recentReleases - previousReleases) / previousReleases) * 100 
      : recentReleases > 0 ? 100 : 0;

    const revenueGrowth = previousRevenue > 0 
      ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 
      : recentRevenue > 0 ? 100 : 0;

    return {
      releaseGrowth: Math.min(releaseGrowth, 100),
      revenueGrowth: Math.min(revenueGrowth, 100),
      recentReleases,
      recentRevenue,
    };
  }, [filteredReleases, filteredTransactions]);

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 75) return "text-green-500";
    if (percentile >= 50) return "text-blue-500";
    if (percentile >= 25) return "text-yellow-500";
    return "text-red-500";
  };

  const getPercentileBadge = (percentile: number) => {
    if (percentile >= 90) return { label: "Top 10%", variant: "default" as const };
    if (percentile >= 75) return { label: "Acima da Média", variant: "default" as const };
    if (percentile >= 50) return { label: "Na Média", variant: "secondary" as const };
    if (percentile >= 25) return { label: "Abaixo da Média", variant: "outline" as const };
    return { label: "Precisa Melhorar", variant: "destructive" as const };
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={selectedArtist} onValueChange={setSelectedArtist}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Selecionar Artista" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Artistas</SelectItem>
            {artists.map((artist: any) => (
              <SelectItem key={artist.id} value={artist.id}>
                {artist.stage_name || artist.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
            <SelectItem value="1y">Último ano</SelectItem>
            <SelectItem value="all">Todo período</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="benchmarks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="benchmarks">Benchmarks de Mercado</TabsTrigger>
          <TabsTrigger value="growth">Crescimento</TabsTrigger>
          <TabsTrigger value="competitive">Análise Competitiva</TabsTrigger>
        </TabsList>

        <TabsContent value="benchmarks" className="space-y-4">
          {/* Overall Score */}
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Score Geral de Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary">
                    {Math.round(benchmarks.reduce((sum, b) => sum + b.percentile, 0) / benchmarks.length)}
                  </div>
                  <p className="text-sm text-muted-foreground">Percentil Médio</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">
                    Comparado com outras labels independentes do mercado brasileiro
                  </p>
                  <Progress 
                    value={benchmarks.reduce((sum, b) => sum + b.percentile, 0) / benchmarks.length} 
                    className="h-3"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Individual Benchmarks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benchmarks.map((benchmark, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{benchmark.metric}</CardTitle>
                    <Badge {...getPercentileBadge(benchmark.percentile)}>
                      {getPercentileBadge(benchmark.percentile).label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Seu valor</p>
                        <p className={`text-3xl font-bold ${getPercentileColor(benchmark.percentile)}`}>
                          {benchmark.metric.includes("Receita") 
                            ? formatCurrency(benchmark.yourValue)
                            : benchmark.yourValue}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Percentil</p>
                        <p className={`text-2xl font-bold ${getPercentileColor(benchmark.percentile)}`}>
                          {benchmark.percentile.toFixed(0)}%
                        </p>
                      </div>
                    </div>
                    
                    <Progress value={benchmark.percentile} className="h-2" />
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Média do Mercado</p>
                        <p className="font-medium">
                          {benchmark.metric.includes("Receita") 
                            ? formatCurrency(benchmark.marketAvg)
                            : benchmark.marketAvg}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Top Performers</p>
                        <p className="font-medium text-green-500">
                          {benchmark.metric.includes("Receita") 
                            ? formatCurrency(benchmark.topPerformers)
                            : benchmark.topPerformers}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Lançamentos (30d)</p>
                    <p className="text-2xl font-bold">{growthMetrics.recentReleases}</p>
                  </div>
                  <div className={`flex items-center gap-1 ${growthMetrics.releaseGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {growthMetrics.releaseGrowth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span className="text-sm font-medium">{growthMetrics.releaseGrowth.toFixed(0)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Receita (30d)</p>
                    <p className="text-2xl font-bold">{formatCurrency(growthMetrics.recentRevenue)}</p>
                  </div>
                  <div className={`flex items-center gap-1 ${growthMetrics.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {growthMetrics.revenueGrowth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span className="text-sm font-medium">{growthMetrics.revenueGrowth.toFixed(0)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Music className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Catálogo Total</p>
                    <p className="text-2xl font-bold">{kpis.catalogSize}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <DollarSign className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Lucro</p>
                    <p className={`text-2xl font-bold ${kpis.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrency(kpis.profit)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Growth Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Recomendações de Crescimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {benchmarks.filter(b => b.percentile < 50).map((benchmark, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Target className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Melhorar {benchmark.metric}</p>
                      <p className="text-sm text-muted-foreground">
                        Seu valor atual ({benchmark.yourValue}) está abaixo da média do mercado ({benchmark.marketAvg}). 
                        Considere aumentar em {Math.round(((benchmark.marketAvg - benchmark.yourValue) / benchmark.yourValue) * 100)}% para atingir a média.
                      </p>
                    </div>
                  </div>
                ))}
                {benchmarks.every(b => b.percentile >= 50) && (
                  <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg">
                    <Award className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-500">Excelente Performance!</p>
                      <p className="text-sm text-muted-foreground">
                        Todos os seus indicadores estão na média ou acima do mercado. Continue assim!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Posicionamento no Mercado
              </CardTitle>
              <CardDescription>
                Análise comparativa com labels independentes similares
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Market Position */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-3xl font-bold">{kpis.artistCount}</p>
                    <p className="text-sm text-muted-foreground">Artistas no Roster</p>
                    <Badge variant="outline" className="mt-2">
                      {kpis.artistCount > 15 ? 'Label Médio' : kpis.artistCount > 5 ? 'Label Pequeno' : 'Boutique'}
                    </Badge>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <PlayCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="text-3xl font-bold">{kpis.releasedCount}</p>
                    <p className="text-sm text-muted-foreground">Lançamentos</p>
                    <Badge variant="outline" className="mt-2">
                      {kpis.releasedCount > 20 ? 'Alta Produtividade' : kpis.releasedCount > 10 ? 'Média' : 'Em Crescimento'}
                    </Badge>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                    <p className="text-3xl font-bold">{formatCurrency(kpis.totalRevenue)}</p>
                    <p className="text-sm text-muted-foreground">Receita Total</p>
                    <Badge variant="outline" className="mt-2">
                      {kpis.totalRevenue > 100000 ? 'Alto Faturamento' : kpis.totalRevenue > 30000 ? 'Médio' : 'Inicial'}
                    </Badge>
                  </div>
                </div>

                {/* Competitive Insights */}
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Insights Competitivos
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="font-medium mb-2">Frequência de Lançamentos</p>
                      <p className="text-sm text-muted-foreground">
                        Você lança em média {kpis.avgReleasesPerArtist} releases por artista. 
                        Labels de sucesso mantêm uma média de 4-6 lançamentos/ano por artista.
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="font-medium mb-2">Diversificação de Catálogo</p>
                      <p className="text-sm text-muted-foreground">
                        Com {kpis.catalogSize} obras registradas, você possui um catálogo 
                        {kpis.catalogSize > 50 ? ' robusto' : kpis.catalogSize > 20 ? ' em desenvolvimento' : ' inicial'}.
                        Catálogos maiores geram mais oportunidades de sync e licenciamento.
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="font-medium mb-2">Contratos Ativos</p>
                      <p className="text-sm text-muted-foreground">
                        {kpis.contractCount} contratos ativos. 
                        Uma boa gestão contratual é essencial para garantir direitos e receitas.
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="font-medium mb-2">Margem de Lucro</p>
                      <p className="text-sm text-muted-foreground">
                        {kpis.totalRevenue > 0 
                          ? `Margem atual: ${((kpis.profit / kpis.totalRevenue) * 100).toFixed(1)}%. ` +
                            (kpis.profit / kpis.totalRevenue > 0.3 ? 'Excelente margem!' : 'Considere otimizar custos.')
                          : 'Sem dados de receita suficientes para análise.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
