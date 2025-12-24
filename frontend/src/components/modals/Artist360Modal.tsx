import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useContractsByArtist } from "@/hooks/useContracts";
import { useFinancialTransactionsByArtist } from "@/hooks/useFinancial";
import { useProjects } from "@/hooks/useProjects";
import { useReleases } from "@/hooks/useReleases";
import { useMusicRegistry } from "@/hooks/useMusicRegistry";
import { usePhonograms } from "@/hooks/usePhonograms";
import { useArtistGoals } from "@/hooks/useArtistGoals";
import { ArtistGoalsSection } from "@/components/artists/ArtistGoalsSection";
import { formatDateBR, formatCurrency } from "@/lib/utils";
import { 
  TrendingUp, TrendingDown, Music, FileText, DollarSign, Target, 
  Calendar, BarChart3, Users, Disc, PlayCircle, Award, AlertCircle,
  CheckCircle, Clock, Sparkles
} from "lucide-react";

interface Artist360ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artist: any;
}

export function Artist360Modal({ open, onOpenChange, artist }: Artist360ModalProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Get artist ID safely - handle both string and number IDs
  const artistId = artist?.id?.toString() || "";
  
  const { data: contracts = [], isLoading: isLoadingContracts } = useContractsByArtist(artistId);
  const { data: transactions = [], isLoading: isLoadingTransactions } = useFinancialTransactionsByArtist(artistId);
  const { data: allProjects = [], isLoading: isLoadingProjects } = useProjects();
  const { data: allReleases = [], isLoading: isLoadingReleases } = useReleases();
  const { data: allMusic = [], isLoading: isLoadingMusic } = useMusicRegistry();
  const { data: allPhonograms = [], isLoading: isLoadingPhonograms } = usePhonograms();
  const { goals = [], isLoading: isLoadingGoals } = useArtistGoals(artistId);

  const isLoading = isLoadingContracts || isLoadingTransactions || isLoadingProjects || 
                    isLoadingReleases || isLoadingMusic || isLoadingPhonograms || isLoadingGoals;

  // Filter data for this artist
  const projects = useMemo(() => 
    allProjects.filter((p: any) => p.artist_id === artistId), 
    [allProjects, artistId]
  );
  
  const releases = useMemo(() => 
    allReleases.filter((r: any) => r.artist_id === artistId), 
    [allReleases, artistId]
  );
  
  const music = useMemo(() => 
    allMusic.filter((m: any) => m.artist_id === artistId), 
    [allMusic, artistId]
  );
  
  const phonograms = useMemo(() => 
    allPhonograms.filter((p: any) => p.artist_id === artistId), 
    [allPhonograms, artistId]
  );

  // Financial KPIs
  const financialKPIs = useMemo(() => {
    const receitas = transactions
      .filter((t: any) => t.type === 'receitas' || t.type === 'income')
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
    
    const despesas = transactions
      .filter((t: any) => t.type === 'despesas' || t.type === 'expense')
      .reduce((sum: number, t: any) => sum + Math.abs(t.amount || 0), 0);
    
    const pendentes = transactions
      .filter((t: any) => t.status === 'pendente' || t.status === 'pending')
      .reduce((sum: number, t: any) => sum + Math.abs(t.amount || 0), 0);

    return { receitas, despesas, saldo: receitas - despesas, pendentes };
  }, [transactions]);

  // Contract status
  const contractStatus = useMemo(() => {
    const activeContracts = contracts.filter((c: any) => 
      ['ativo', 'active', 'assinado', 'signed'].includes(c.status?.toLowerCase())
    );
    const expiringContracts = contracts.filter((c: any) => {
      if (!c.end_date && !c.effective_to) return false;
      const endDate = new Date(c.end_date || c.effective_to);
      const daysUntil = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntil > 0 && daysUntil <= 60;
    });
    return { active: activeContracts.length, expiring: expiringContracts.length, total: contracts.length };
  }, [contracts]);

  // Goals progress
  const goalsProgress = useMemo(() => {
    const activeGoals = goals.filter((g: any) => g.status === 'active' || g.status === 'em_progresso');
    const completedGoals = goals.filter((g: any) => g.status === 'completed' || g.status === 'concluido');
    const avgProgress = activeGoals.length > 0
      ? activeGoals.reduce((sum: number, g: any) => {
          const progress = g.target_value > 0 ? (g.current_value / g.target_value) * 100 : 0;
          return sum + Math.min(progress, 100);
        }, 0) / activeGoals.length
      : 0;
    return { active: activeGoals.length, completed: completedGoals.length, avgProgress };
  }, [goals]);

  // Release status
  const releaseStatus = useMemo(() => {
    const released = releases.filter((r: any) => r.status === 'released' || r.status === 'lançado').length;
    const pending = releases.filter((r: any) => 
      ['planning', 'em_analise', 'pending', 'aceita'].includes(r.status?.toLowerCase())
    ).length;
    return { released, pending, total: releases.length };
  }, [releases]);

  // Health score calculation
  const healthScore = useMemo(() => {
    let score = 0;
    let maxScore = 0;

    // Contracts (20 points)
    maxScore += 20;
    if (contractStatus.active > 0) score += 15;
    if (contractStatus.expiring === 0) score += 5;

    // Financial (20 points)
    maxScore += 20;
    if (financialKPIs.saldo > 0) score += 15;
    if (financialKPIs.pendentes < financialKPIs.receitas * 0.2) score += 5;

    // Catalog (20 points)
    maxScore += 20;
    if (music.length > 0) score += 10;
    if (phonograms.length > 0) score += 5;
    if (releases.length > 0) score += 5;

    // Goals (20 points)
    maxScore += 20;
    if (goals.length > 0) score += 10;
    if (goalsProgress.avgProgress > 50) score += 10;

    // Activity (20 points)
    maxScore += 20;
    if (projects.length > 0) score += 10;
    const recentRelease = releases.some((r: any) => {
      const releaseDate = new Date(r.release_date || r.created_at);
      return (Date.now() - releaseDate.getTime()) < 90 * 24 * 60 * 60 * 1000;
    });
    if (recentRelease) score += 10;

    return Math.round((score / maxScore) * 100);
  }, [contractStatus, financialKPIs, music, phonograms, releases, goals, goalsProgress, projects]);

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getHealthLabel = (score: number) => {
    if (score >= 80) return "Excelente";
    if (score >= 60) return "Bom";
    if (score >= 40) return "Atenção";
    return "Crítico";
  };

  if (!artist) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={artist.image_url || artist.avatar} />
              <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                {(artist.name || "A").substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-2xl">{artist.name}</DialogTitle>
              <DialogDescription className="sr-only">
                Visão completa 360º do artista {artist.name}
              </DialogDescription>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{artist.genre || "Sem gênero"}</Badge>
                <Badge variant={artist.contract_status === 'active' ? "default" : "secondary"}>
                  {artist.contract_status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </div>
            <div className="text-center">
              {isLoading ? (
                <Skeleton className="h-12 w-16" />
              ) : (
                <>
                  <div className={`text-4xl font-bold ${getHealthColor(healthScore)}`}>{healthScore}%</div>
                  <p className="text-sm text-muted-foreground">Saúde da Carreira</p>
                  <Badge variant="outline" className={getHealthColor(healthScore)}>
                    {getHealthLabel(healthScore)}
                  </Badge>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <div className="px-6 pt-4">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="catalog">Catálogo</TabsTrigger>
              <TabsTrigger value="financial">Financeiro</TabsTrigger>
              <TabsTrigger value="contracts">Contratos</TabsTrigger>
              <TabsTrigger value="goals">Metas</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[60vh] px-6 pb-6">
            {isLoading ? (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="pt-4">
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-8 w-12" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Card>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-40" />
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                      {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
            <>
            <TabsContent value="overview" className="mt-4 space-y-4">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Music className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">Obras</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">{music.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Disc className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-muted-foreground">Fonogramas</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">{phonograms.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <PlayCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-muted-foreground">Lançamentos</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">{releases.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-muted-foreground">Contratos</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">{contractStatus.active}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Financial Summary */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Resumo Financeiro
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Receitas</p>
                      <p className="text-xl font-bold text-green-500">
                        {formatCurrency(financialKPIs.receitas)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Despesas</p>
                      <p className="text-xl font-bold text-red-500">
                        {formatCurrency(financialKPIs.despesas)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Saldo</p>
                      <p className={`text-xl font-bold ${financialKPIs.saldo >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatCurrency(financialKPIs.saldo)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pendentes</p>
                      <p className="text-xl font-bold text-yellow-500">
                        {formatCurrency(financialKPIs.pendentes)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Goals Progress */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Progresso das Metas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Progresso Médio</span>
                      <span className="text-sm font-medium">{goalsProgress.avgProgress.toFixed(0)}%</span>
                    </div>
                    <Progress value={goalsProgress.avgProgress} className="h-2" />
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-500">{goalsProgress.active}</p>
                        <p className="text-xs text-muted-foreground">Em Progresso</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-500">{goalsProgress.completed}</p>
                        <p className="text-xs text-muted-foreground">Concluídas</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{goals.length}</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Alerts */}
              {(contractStatus.expiring > 0 || goalsProgress.avgProgress < 30) && (
                <Card className="border-yellow-500/50 bg-yellow-500/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2 text-yellow-500">
                      <AlertCircle className="h-5 w-5" />
                      Alertas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {contractStatus.expiring > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span>{contractStatus.expiring} contrato(s) vencendo nos próximos 60 dias</span>
                      </div>
                    )}
                    {goalsProgress.avgProgress < 30 && goalsProgress.active > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="h-4 w-4 text-yellow-500" />
                        <span>Metas com baixo progresso ({goalsProgress.avgProgress.toFixed(0)}%)</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="catalog" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Obras Musicais ({music.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {music.length === 0 ? (
                      <p className="text-muted-foreground text-sm">Nenhuma obra registrada</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {music.slice(0, 10).map((m: any) => (
                          <div key={m.id} className="flex items-center justify-between py-2 border-b last:border-0">
                            <span className="text-sm font-medium">{m.title}</span>
                            <Badge variant="outline" className="text-xs">{m.status || 'Pendente'}</Badge>
                          </div>
                        ))}
                        {music.length > 10 && (
                          <p className="text-xs text-muted-foreground">+{music.length - 10} obras</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Fonogramas ({phonograms.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {phonograms.length === 0 ? (
                      <p className="text-muted-foreground text-sm">Nenhum fonograma registrado</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {phonograms.slice(0, 10).map((p: any) => (
                          <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                            <span className="text-sm font-medium">{p.title}</span>
                            <span className="text-xs text-muted-foreground">{p.isrc || 'Sem ISRC'}</span>
                          </div>
                        ))}
                        {phonograms.length > 10 && (
                          <p className="text-xs text-muted-foreground">+{phonograms.length - 10} fonogramas</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Lançamentos ({releases.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {releases.length === 0 ? (
                      <p className="text-muted-foreground text-sm">Nenhum lançamento</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {releases.slice(0, 10).map((r: any) => (
                          <div key={r.id} className="flex items-center justify-between py-2 border-b last:border-0">
                            <div>
                              <span className="text-sm font-medium">{r.title}</span>
                              <p className="text-xs text-muted-foreground">
                                {r.release_date ? formatDateBR(r.release_date) : 'Sem data'}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">{r.status || 'Pendente'}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Projetos ({projects.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {projects.length === 0 ? (
                      <p className="text-muted-foreground text-sm">Nenhum projeto</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {projects.slice(0, 10).map((p: any) => (
                          <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                            <span className="text-sm font-medium">{p.name}</span>
                            <Badge variant="outline" className="text-xs">{p.status || 'Ativo'}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="financial" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-green-500/10 border-green-500/20">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Receitas Total</p>
                    <p className="text-2xl font-bold text-green-500">{formatCurrency(financialKPIs.receitas)}</p>
                  </CardContent>
                </Card>
                <Card className="bg-red-500/10 border-red-500/20">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Despesas Total</p>
                    <p className="text-2xl font-bold text-red-500">{formatCurrency(financialKPIs.despesas)}</p>
                  </CardContent>
                </Card>
                <Card className={financialKPIs.saldo >= 0 ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Saldo</p>
                    <p className={`text-2xl font-bold ${financialKPIs.saldo >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrency(financialKPIs.saldo)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-yellow-500/10 border-yellow-500/20">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Pendentes</p>
                    <p className="text-2xl font-bold text-yellow-500">{formatCurrency(financialKPIs.pendentes)}</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Últimas Transações</CardTitle>
                </CardHeader>
                <CardContent>
                  {transactions.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Nenhuma transação registrada</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {transactions.slice(0, 15).map((t: any) => (
                        <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div>
                            <span className="text-sm font-medium">{t.description}</span>
                            <p className="text-xs text-muted-foreground">{formatDateBR(t.date)}</p>
                          </div>
                          <span className={`text-sm font-bold ${
                            t.type === 'receitas' || t.type === 'income' ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {t.type === 'receitas' || t.type === 'income' ? '+' : '-'}
                            {formatCurrency(Math.abs(t.amount))}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contracts" className="mt-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4 text-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{contractStatus.active}</p>
                    <p className="text-sm text-muted-foreground">Ativos</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{contractStatus.expiring}</p>
                    <p className="text-sm text-muted-foreground">Vencendo</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-2xl font-bold">{contractStatus.total}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contratos</CardTitle>
                </CardHeader>
                <CardContent>
                  {contracts.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Nenhum contrato registrado</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {contracts.map((c: any) => (
                        <div key={c.id} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div>
                            <span className="text-sm font-medium">{c.title}</span>
                            <p className="text-xs text-muted-foreground">
                              {c.start_date && `De ${formatDateBR(c.start_date)}`}
                              {c.end_date && ` até ${formatDateBR(c.end_date)}`}
                            </p>
                          </div>
                          <Badge variant={
                            ['ativo', 'active', 'assinado'].includes(c.status?.toLowerCase()) ? 'default' : 'secondary'
                          }>
                            {c.status || 'Rascunho'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="goals" className="mt-4">
              <ArtistGoalsSection artistId={artist.id} artistName={artist.name} />
            </TabsContent>
            </>
            )}
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
