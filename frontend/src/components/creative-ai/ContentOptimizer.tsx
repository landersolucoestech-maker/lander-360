import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, TrendingUp, TrendingDown, RefreshCw, Target, Zap, BarChart3, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMarketingCampaigns } from '@/hooks/useMarketing';
import { useCreativeIdeas } from '@/hooks/useCreativeAI';
import { AIProviderSelector } from './AIProviderSelector';
import { AIProvider } from '@/hooks/useAI';

interface OptimizationResult {
  originalContent: string;
  optimizedContent: string;
  changes: string[];
  expectedImprovement: string;
  reasoning: string;
}

interface PerformanceMetrics {
  clicks: number;
  impressions: number;
  engagement: number;
  conversions: number;
  ctr: number;
}

export const ContentOptimizer = () => {
  const { toast } = useToast();
  const { data: campaigns } = useMarketingCampaigns();
  const { data: savedIdeas } = useCreativeIdeas({ status: 'saved' });
  
  const [content, setContent] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [selectedIdea, setSelectedIdea] = useState('');
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    clicks: 0,
    impressions: 0,
    engagement: 0,
    conversions: 0,
    ctr: 0,
  });
  const [optimizationGoal, setOptimizationGoal] = useState('');
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | 'auto'>('auto');

  const handleOptimize = async () => {
    if (!content.trim()) {
      toast({ title: 'Atenção', description: 'Digite o conteúdo a ser otimizado.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-creative-ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: 'optimize-content',
          originalContent: content,
          metrics,
          optimizationGoal,
          campaignContext: selectedCampaign ? campaigns?.find(c => c.id === selectedCampaign) : null,
        }),
      });

      const data = await response.json();
      
      if (data.result) {
        setResult({
          originalContent: content,
          optimizedContent: data.result.optimizedContent || data.result.content,
          changes: data.result.changes || [],
          expectedImprovement: data.result.expectedImprovement || 'Melhoria moderada esperada',
          reasoning: data.result.reasoning || '',
        });
      }
    } catch (error) {
      console.error('Error optimizing content:', error);
      toast({ title: 'Erro', description: 'Falha ao otimizar conteúdo.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectIdea = (ideaId: string) => {
    setSelectedIdea(ideaId);
    const idea = savedIdeas?.find(i => i.id === ideaId);
    if (idea) {
      setContent(idea.description);
    }
  };

  const handleSelectCampaign = (campaignId: string) => {
    setSelectedCampaign(campaignId);
    const campaign = campaigns?.find(c => c.id === campaignId);
    if (campaign) {
      const ctr = campaign.impressions ? (campaign.clicks || 0) / campaign.impressions * 100 : 0;
      setMetrics({
        clicks: campaign.clicks || 0,
        impressions: campaign.impressions || 0,
        engagement: Math.round(ctr * 10), // Derived from CTR
        conversions: campaign.conversions || 0,
        ctr: ctr,
      });
    }
  };

  const applyOptimization = () => {
    if (result) {
      setContent(result.optimizedContent);
      toast({ title: 'Aplicado!', description: 'Conteúdo otimizado aplicado.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Otimizador de Conteúdo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Modelo IA</Label>
                <AIProviderSelector value={selectedProvider} onChange={setSelectedProvider} />
              </div>
              <div className="space-y-2">
                <Label>Objetivo da Otimização</Label>
                <Select value={optimizationGoal} onValueChange={setOptimizationGoal}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ctr">Aumentar CTR</SelectItem>
                    <SelectItem value="engagement">Aumentar Engajamento</SelectItem>
                    <SelectItem value="conversions">Aumentar Conversões</SelectItem>
                    <SelectItem value="reach">Aumentar Alcance</SelectItem>
                    <SelectItem value="clarity">Melhorar Clareza</SelectItem>
                    <SelectItem value="emotion">Mais Emocional</SelectItem>
                    <SelectItem value="urgency">Adicionar Urgência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Campanha (opcional)</Label>
                <Select value={selectedCampaign} onValueChange={handleSelectCampaign}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vincular a campanha" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns?.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ideia Salva (opcional)</Label>
                <Select value={selectedIdea} onValueChange={handleSelectIdea}>
                  <SelectTrigger>
                    <SelectValue placeholder="Carregar ideia salva" />
                  </SelectTrigger>
                  <SelectContent>
                    {savedIdeas?.slice(0, 20).map(idea => (
                      <SelectItem key={idea.id} value={idea.id}>
                        {idea.title?.substring(0, 40)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Conteúdo a Otimizar *</Label>
              <Textarea
                placeholder="Cole o conteúdo que deseja otimizar com base na performance..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
              />
            </div>

            <Button onClick={handleOptimize} disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Otimizar com IA
            </Button>
          </CardContent>
        </Card>

        {/* Metrics Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
              Métricas de Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Informe as métricas atuais para otimização mais precisa
            </p>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Cliques</Label>
                <Input
                  type="number"
                  value={metrics.clicks}
                  onChange={(e) => setMetrics({ ...metrics, clicks: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Impressões</Label>
                <Input
                  type="number"
                  value={metrics.impressions}
                  onChange={(e) => setMetrics({ ...metrics, impressions: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Engajamento</Label>
                <Input
                  type="number"
                  value={metrics.engagement}
                  onChange={(e) => setMetrics({ ...metrics, engagement: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Conversões</Label>
                <Input
                  type="number"
                  value={metrics.conversions}
                  onChange={(e) => setMetrics({ ...metrics, conversions: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              {metrics.impressions > 0 && (
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">CTR Calculado</p>
                  <p className="text-xl font-bold">{((metrics.clicks / metrics.impressions) * 100).toFixed(2)}%</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Resultado da Otimização
              </CardTitle>
              <Badge variant="outline" className="text-green-500">
                <TrendingUp className="h-3 w-3 mr-1" />
                {result.expectedImprovement}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Original</Label>
                <div className="bg-muted/30 rounded-lg p-4 min-h-[150px]">
                  <p className="text-sm whitespace-pre-wrap">{result.originalContent}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-primary">Otimizado</Label>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 min-h-[150px]">
                  <p className="text-sm whitespace-pre-wrap">{result.optimizedContent}</p>
                </div>
              </div>
            </div>

            {result.changes.length > 0 && (
              <div className="space-y-2">
                <Label>Mudanças Aplicadas</Label>
                <div className="flex flex-wrap gap-2">
                  {result.changes.map((change, idx) => (
                    <Badge key={idx} variant="secondary">{change}</Badge>
                  ))}
                </div>
              </div>
            )}

            {result.reasoning && (
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="text-sm font-medium mb-2">Raciocínio da IA</h4>
                <p className="text-sm text-muted-foreground">{result.reasoning}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={applyOptimization}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Aplicar Otimização
              </Button>
              <Button variant="outline" onClick={() => setResult(null)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Nova Otimização
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
