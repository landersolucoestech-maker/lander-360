import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Search, Loader2, Globe, Music, Sparkles, ExternalLink, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TrendItem {
  title: string;
  description: string;
  source?: string;
  relevance: 'alta' | 'média' | 'baixa';
  category: string;
}

interface TrendResult {
  musicTrends: TrendItem[];
  socialTrends: TrendItem[];
  marketingTrends: TrendItem[];
  recommendations: string[];
  summary: string;
}

export const MarketTrends = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [genre, setGenre] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [trends, setTrends] = useState<TrendResult | null>(null);
  const [activeTab, setActiveTab] = useState('music');

  const handleSearch = async () => {
    if (!searchQuery.trim() && !genre.trim()) {
      toast({
        title: 'Atenção',
        description: 'Digite um termo de busca ou gênero musical.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const query = `${searchQuery} ${genre} tendências música marketing 2024 2025 Brasil`.trim();
      
      const { data, error } = await supabase.functions.invoke('generate-creative-ideas', {
        body: {
          type: 'market-trends',
          searchQuery: query,
          genre,
          context: searchQuery,
        },
      });

      if (error) throw error;

      if (data.result) {
        setTrends(data.result);
      }
    } catch (error) {
      console.error('Error fetching trends:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao buscar tendências. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case 'alta': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'média': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'baixa': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const renderTrendList = (items: TrendItem[]) => (
    <div className="space-y-3">
      {items?.length > 0 ? items.map((item, idx) => (
        <Card key={idx} className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium">{item.title}</h4>
                  <Badge className={getRelevanceColor(item.relevance)}>
                    {item.relevance}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                {item.source && (
                  <a 
                    href={item.source} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-primary flex items-center gap-1 mt-2 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Fonte
                  </a>
                )}
              </div>
              <Badge variant="outline">{item.category}</Badge>
            </div>
          </CardContent>
        </Card>
      )) : (
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma tendência encontrada
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Tendências de Mercado
          </CardTitle>
          <CardDescription>
            Busque tendências atuais de música, redes sociais e marketing digital
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Ex: funk, sertanejo, pop brasileiro..."
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Busca específica (opcional)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Buscar Tendências
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading && (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Analisando tendências do mercado...</p>
          </div>
        </Card>
      )}

      {!isLoading && !trends && (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <Globe className="h-12 w-12 text-muted-foreground/50" />
            <div>
              <h3 className="font-medium">Descubra o que está em alta</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Digite um gênero musical ou termo de busca para ver tendências atuais
              </p>
            </div>
          </div>
        </Card>
      )}

      {trends && (
        <>
          {/* Summary */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Sparkles className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Resumo das Tendências</h3>
                  <p className="text-sm text-muted-foreground">{trends.summary}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trends Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="music" className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                Música ({trends.musicTrends?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="social" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Social ({trends.socialTrends?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="marketing" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Marketing ({trends.marketingTrends?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="music" className="mt-4">
              {renderTrendList(trends.musicTrends)}
            </TabsContent>

            <TabsContent value="social" className="mt-4">
              {renderTrendList(trends.socialTrends)}
            </TabsContent>

            <TabsContent value="marketing" className="mt-4">
              {renderTrendList(trends.marketingTrends)}
            </TabsContent>
          </Tabs>

          {/* Recommendations */}
          {trends.recommendations?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recomendações Estratégicas</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {trends.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Badge variant="outline" className="shrink-0 mt-0.5">{idx + 1}</Badge>
                      <span className="text-muted-foreground">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
