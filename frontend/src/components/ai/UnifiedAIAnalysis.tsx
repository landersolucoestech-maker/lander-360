import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Brain, Play, AlertTriangle, Shield, Zap, 
  TrendingUp, Link2, Bot, FileCheck, Loader2,
  CheckCircle, DollarSign, Users, Music, FileSignature,
  BarChart3, Target, RefreshCw
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import {
  useFinancialReport,
  useArtistsReport,
  useMusicReport,
  useReleasesReport,
  useContractsReport,
  useProjectsReport,
  usePhonogramsReport,
} from "@/hooks/useReports";

type AnalysisCategory = 'business' | 'system';
type BusinessAnalysisType = 'geral' | 'financeiro' | 'catalogo' | 'contratos' | 'oportunidades';
type SystemAnalysisType = 'full' | 'errors' | 'security' | 'performance' | 'integrations' | 'automations' | 'compliance';
type AnalysisType = BusinessAnalysisType | SystemAnalysisType;

const businessAnalysisOptions = [
  { id: 'geral' as const, label: 'Visão Geral', icon: Brain, description: 'Análise completa de negócios' },
  { id: 'financeiro' as const, label: 'Financeiro', icon: DollarSign, description: 'Receitas, despesas e fluxo de caixa' },
  { id: 'catalogo' as const, label: 'Catálogo', icon: Music, description: 'Obras, fonogramas e lançamentos' },
  { id: 'contratos' as const, label: 'Contratos', icon: FileSignature, description: 'Status e renovações' },
  { id: 'oportunidades' as const, label: 'Oportunidades', icon: Target, description: 'Potenciais de crescimento' },
];

const systemAnalysisOptions = [
  { id: 'full' as const, label: 'Análise Completa', icon: Brain, description: 'Análise de todos os aspectos do sistema' },
  { id: 'errors' as const, label: 'Erros & Problemas', icon: AlertTriangle, description: 'Identificar bugs e falhas' },
  { id: 'security' as const, label: 'Segurança', icon: Shield, description: 'Vulnerabilidades e recomendações' },
  { id: 'performance' as const, label: 'Performance', icon: Zap, description: 'Otimizações e gargalos' },
  { id: 'integrations' as const, label: 'Integrações', icon: Link2, description: 'Novas integrações sugeridas' },
  { id: 'automations' as const, label: 'Automações', icon: Bot, description: 'Processos automatizáveis' },
  { id: 'compliance' as const, label: 'Conformidade', icon: FileCheck, description: 'LGPD e direitos autorais' },
];

interface UnifiedAIAnalysisProps {
  defaultCategory?: AnalysisCategory;
  showCategoryTabs?: boolean;
  compact?: boolean;
}

export function UnifiedAIAnalysis({ 
  defaultCategory = 'business', 
  showCategoryTabs = true,
  compact = false 
}: UnifiedAIAnalysisProps) {
  const { toast } = useToast();
  const [category, setCategory] = useState<AnalysisCategory>(defaultCategory);
  const [selectedType, setSelectedType] = useState<AnalysisType>(defaultCategory === 'business' ? 'geral' : 'full');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);

  // Fetch real data from database
  const { data: financialData = [] } = useFinancialReport();
  const { data: artistsData = [] } = useArtistsReport();
  const { data: musicData = [] } = useMusicReport();
  const { data: releasesData = [] } = useReleasesReport();
  const { data: contractsData = [] } = useContractsReport();
  const { data: projectsData = [] } = useProjectsReport();
  const { data: phonogramsData = [] } = usePhonogramsReport();

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalReceitas = financialData
      .filter((t: any) => t.type === 'receita' || t.type === 'receitas')
      .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
    
    const totalDespesas = financialData
      .filter((t: any) => t.type === 'despesa' || t.type === 'despesas')
      .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

    const activeStatuses = ['ativo', 'signed', 'active', 'assinado'];
    const contratosAtivos = contractsData.filter((c: any) => 
      activeStatuses.includes(c.status?.toLowerCase() || '')
    ).length;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 60);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    
    const contratosVencendo = contractsData.filter((c: any) => {
      const endDate = c.end_date || c.effective_to;
      if (!endDate) return false;
      // Must be currently active (not expired) and expiring within 60 days
      return endDate >= todayStr && endDate <= futureDateStr;
    }).length;

    return {
      totalReceitas,
      totalDespesas,
      lucro: totalReceitas - totalDespesas,
      contratosAtivos,
      contratosVencendo,
      obrasRegistradas: musicData.length,
      fonogramasRegistrados: phonogramsData.length,
      lancamentos: releasesData.length,
      totalArtistas: artistsData.length,
      totalContratos: contractsData.length,
      totalProjetos: projectsData.length,
      projetosAtivos: projectsData.filter((p: any) => p.status === 'in_progress' || p.status === 'draft').length,
    };
  }, [financialData, artistsData, musicData, releasesData, contractsData, projectsData, phonogramsData]);

  const collectSystemData = () => {
    return {
      timestamp: new Date().toISOString(),
      resumo: summaryStats,
      modules: [
        'Dashboard', 'Artistas', 'Projetos', 'Registro de Músicas', 
        'Lançamentos', 'Gestão de Shares', 'Contratos', 'Financeiro',
        'Serviços', 'Agenda', 'Nota Fiscal', 'Inventário', 'LanderZap',
        'Usuários', 'CRM', 'Auditoria', 'Relatórios', 'Marketing'
      ],
      features: {
        authentication: 'Supabase Auth com 2FA',
        database: 'PostgreSQL via Supabase',
        storage: 'Supabase Storage',
        notifications: 'Email (Resend), SMS e WhatsApp (Twilio)',
        ai: 'Lovable AI Gateway',
        contracts: 'Geração automática de PDF',
        royalties: 'Importação de relatórios DSP',
      },
      integrations: {
        belvo: 'Open Banking',
        whatsapp: 'Meta Business API',
        google_calendar: 'Sincronização de eventos',
        distributors: ['ONErpm', 'DistroKid'],
      },
      security: {
        rls: 'Row Level Security habilitado',
        roles: ['admin', 'empresario', 'financeiro', 'marketing', 'juridico', 'artista', 'produtor_artistico'],
        session_management: 'Controle de sessões ativas',
        login_lockout: '5 tentativas, 15 min bloqueio',
      },
      detalhes: {
        artistas: artistsData.slice(0, 20).map((a: any) => ({
          nome: a.name,
          genero: a.genre,
          perfil: a.profile_type,
          status_contrato: a.contract_status,
        })),
        contratos: contractsData.slice(0, 20).map((c: any) => ({
          titulo: c.title,
          tipo: c.contract_type,
          status: c.status,
          inicio: c.start_date,
          fim: c.end_date,
          valor: c.value,
        })),
        financeiro: financialData.slice(0, 30).map((f: any) => ({
          descricao: f.description,
          tipo: f.type,
          valor: f.amount,
          categoria: f.category,
          status: f.status,
          data: f.date,
        })),
        lancamentos: releasesData.slice(0, 20).map((r: any) => ({
          titulo: r.title,
          tipo: r.release_type,
          status: r.status,
          data: r.release_date,
        })),
        obras: musicData.slice(0, 20).map((m: any) => ({
          titulo: m.title,
          status: m.status,
          genero: m.genre,
        })),
        projetos: projectsData.slice(0, 15).map((p: any) => ({
          nome: p.name,
          status: p.status,
        })),
      },
    };
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisResult('');

    try {
      const systemData = collectSystemData();
      
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-system`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ 
            analysisType: selectedType,
            systemData 
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Falha na análise');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Streaming não suportado');
      }
      
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullContent += content;
                setAnalysisResult(fullContent);
              }
            } catch {
              // Ignore parse errors for partial chunks
            }
          }
        }
      }

      setLastAnalysis(new Date());
      toast({
        title: "Análise concluída",
        description: "A análise foi finalizada com sucesso.",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Erro na análise",
        description: error instanceof Error ? error.message : "Não foi possível completar a análise",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory as AnalysisCategory);
    setSelectedType(newCategory === 'business' ? 'geral' : 'full');
    setAnalysisResult('');
  };

  const currentOptions = category === 'business' ? businessAnalysisOptions : systemAnalysisOptions;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">IA & Insights Inteligentes</h2>
            <p className="text-muted-foreground">
              Análises automáticas de negócios e sistema
            </p>
          </div>
        </div>
        {lastAnalysis && (
          <Badge variant="outline" className="text-xs">
            Última análise: {lastAnalysis.toLocaleString('pt-BR')}
          </Badge>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Receitas</span>
            </div>
            <p className="text-lg font-bold text-green-600">
              R$ {summaryStats.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-xs text-muted-foreground">Despesas</span>
            </div>
            <p className="text-lg font-bold text-red-600">
              R$ {summaryStats.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Artistas</span>
            </div>
            <p className="text-lg font-bold text-blue-600">{summaryStats.totalArtistas}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Music className="h-4 w-4 text-purple-500" />
              <span className="text-xs text-muted-foreground">Obras</span>
            </div>
            <p className="text-lg font-bold text-purple-600">{summaryStats.obrasRegistradas}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileSignature className="h-4 w-4 text-orange-500" />
              <span className="text-xs text-muted-foreground">Contratos</span>
            </div>
            <p className="text-lg font-bold text-orange-600">{summaryStats.totalContratos}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-cyan-500" />
              <span className="text-xs text-muted-foreground">Lançamentos</span>
            </div>
            <p className="text-lg font-bold text-cyan-600">{summaryStats.lancamentos}</p>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Análise Inteligente
              </CardTitle>
              <CardDescription>
                Selecione a categoria e o tipo de análise
              </CardDescription>
            </div>
            <Button 
              onClick={runAnalysis} 
              disabled={isAnalyzing}
              className="gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Executar Análise
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Category Tabs */}
          {showCategoryTabs && (
            <Tabs value={category} onValueChange={handleCategoryChange}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="business" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Negócios
                </TabsTrigger>
                <TabsTrigger value="system" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Sistema
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {/* Analysis Type Selection */}
          <div className="flex flex-wrap gap-2">
            {currentOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.id}
                  variant={selectedType === option.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(option.id)}
                  disabled={isAnalyzing}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {option.label}
                </Button>
              );
            })}
          </div>

          {/* Selected Analysis Description */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              {currentOptions.find(o => o.id === selectedType)?.description}
            </p>
          </div>

          {/* Analysis Result */}
          <div className="min-h-[400px] rounded-lg border bg-muted/30 p-4">
            {isAnalyzing ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-muted-foreground">Analisando dados do sistema...</span>
                </div>
                {analysisResult && (
                  <ScrollArea className="h-[350px]">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => <h1 className="text-xl font-bold mt-4 mb-2 text-foreground">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-lg font-semibold mt-4 mb-2 text-foreground">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-base font-semibold mt-3 mb-1 text-foreground">{children}</h3>,
                          p: ({ children }) => <p className="mb-2 text-muted-foreground">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="text-muted-foreground">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                        }}
                      >
                        {analysisResult}
                      </ReactMarkdown>
                    </div>
                  </ScrollArea>
                )}
              </div>
            ) : analysisResult ? (
              <ScrollArea className="h-[350px]">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => <h1 className="text-xl font-bold mt-4 mb-2 text-foreground">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-lg font-semibold mt-4 mb-2 text-foreground">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-base font-semibold mt-3 mb-1 text-foreground">{children}</h3>,
                      p: ({ children }) => <p className="mb-2 text-muted-foreground">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="text-muted-foreground">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                    }}
                  >
                    {analysisResult}
                  </ReactMarkdown>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="p-4 rounded-full bg-primary/10 mb-4">
                  <Brain className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  {currentOptions.find(t => t.id === selectedType)?.label}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md">
                  {currentOptions.find(t => t.id === selectedType)?.description}. 
                  Clique em "Executar Análise" para gerar insights.
                </p>
                <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary">{summaryStats.totalArtistas} artistas</Badge>
                  <Badge variant="secondary">{summaryStats.obrasRegistradas} obras</Badge>
                  <Badge variant="secondary">{summaryStats.totalContratos} contratos</Badge>
                  <Badge variant="secondary">{financialData.length} transações</Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Alerts */}
      {summaryStats.contratosVencendo > 0 && (
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-yellow-600">Atenção: Contratos Vencendo</p>
                <p className="text-sm text-muted-foreground">
                  {summaryStats.contratosVencendo} contrato(s) vencem nos próximos 60 dias.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {summaryStats.lucro < 0 && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <TrendingUp className="h-5 w-5 text-red-600 rotate-180" />
              </div>
              <div>
                <p className="font-medium text-red-600">Fluxo de Caixa Negativo</p>
                <p className="text-sm text-muted-foreground">
                  Despesas excedem receitas em R$ {Math.abs(summaryStats.lucro).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">18</p>
                <p className="text-xs text-muted-foreground">Módulos Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">7</p>
                <p className="text-xs text-muted-foreground">Roles de Segurança</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Link2 className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">6</p>
                <p className="text-xs text-muted-foreground">Integrações</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">RLS</p>
                <p className="text-xs text-muted-foreground">Segurança Ativa</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default UnifiedAIAnalysis;
