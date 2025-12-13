import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  UserCircle, 
  Sparkles, 
  TrendingUp, 
  Target, 
  Music2, 
  Users, 
  Instagram, 
  Youtube,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  BarChart3,
  FileDown
} from 'lucide-react';
import { useArtists } from '@/hooks/useArtists';
import { useArtistSpotifyMetrics } from '@/hooks/useSpotifyMetrics';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

interface AnalysisResult {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  recommendations: string[];
  contentStrategy: {
    platforms: string[];
    frequency: string;
    contentTypes: string[];
    tone: string;
  };
  audienceInsights: {
    demographics: string;
    interests: string[];
    behavior: string;
  };
  competitivePosition: string;
  growthPotential: string;
}

export function ArtistProfileAnalyzer() {
  const { toast } = useToast();
  const { data: artists = [], isLoading: isLoadingArtists } = useArtists();
  const [selectedArtistId, setSelectedArtistId] = useState<string>('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  
  const selectedArtist = artists.find(a => a.id === selectedArtistId);
  const { data: spotifyMetrics } = useArtistSpotifyMetrics(selectedArtistId);

  const handleAnalyze = async () => {
    if (!selectedArtist) {
      toast({
        title: 'Erro',
        description: 'Selecione um artista para análise.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const artistData = {
        name: selectedArtist.name,
        stageName: selectedArtist.stage_name,
        genre: selectedArtist.genre,
        bio: selectedArtist.bio,
        instagram: selectedArtist.instagram_url,
        spotify: selectedArtist.spotify_url,
        youtube: selectedArtist.youtube_url,
        tiktok: selectedArtist.tiktok,
        distributors: selectedArtist.distributors,
        spotifyFollowers: spotifyMetrics?.followers,
        spotifyMonthlyListeners: spotifyMetrics?.monthly_listeners,
        spotifyPopularity: spotifyMetrics?.popularity,
        topTracks: spotifyMetrics?.top_tracks?.slice(0, 5),
      };

      const prompt = `Analise o perfil completo do artista musical abaixo e forneça uma análise estratégica detalhada.

DADOS DO ARTISTA:
- Nome: ${artistData.name}
- Nome Artístico: ${artistData.stageName || 'Não informado'}
- Gênero: ${artistData.genre || 'Não informado'}
- Bio: ${artistData.bio || 'Não informada'}
- Instagram: ${artistData.instagram || 'Não informado'}
- Spotify: ${artistData.spotify || 'Não informado'}
- YouTube: ${artistData.youtube || 'Não informado'}
- TikTok: ${artistData.tiktok || 'Não informado'}
- Distribuidoras: ${artistData.distributors?.join(', ') || 'Não informadas'}

MÉTRICAS DO SPOTIFY:
- Seguidores: ${artistData.spotifyFollowers || 'Não disponível'}
- Ouvintes Mensais: ${artistData.spotifyMonthlyListeners || 'Não disponível'}
- Popularidade: ${artistData.spotifyPopularity || 'Não disponível'}
- Top Tracks: ${artistData.topTracks?.map((t: any) => t.name).join(', ') || 'Não disponível'}

${additionalContext ? `CONTEXTO ADICIONAL:\n${additionalContext}` : ''}

Forneça a análise no seguinte formato JSON:
{
  "summary": "Resumo executivo do perfil do artista em 2-3 frases",
  "strengths": ["ponto forte 1", "ponto forte 2", "ponto forte 3"],
  "weaknesses": ["ponto fraco 1", "ponto fraco 2"],
  "opportunities": ["oportunidade 1", "oportunidade 2", "oportunidade 3"],
  "recommendations": ["recomendação estratégica 1", "recomendação 2", "recomendação 3", "recomendação 4", "recomendação 5"],
  "contentStrategy": {
    "platforms": ["plataforma prioritária 1", "plataforma 2"],
    "frequency": "frequência ideal de postagens",
    "contentTypes": ["tipo de conteúdo 1", "tipo 2", "tipo 3"],
    "tone": "tom de comunicação recomendado"
  },
  "audienceInsights": {
    "demographics": "descrição do público-alvo ideal",
    "interests": ["interesse 1", "interesse 2", "interesse 3"],
    "behavior": "padrão de comportamento do público"
  },
  "competitivePosition": "análise do posicionamento competitivo no mercado",
  "growthPotential": "avaliação do potencial de crescimento com justificativa"
}

Retorne APENAS o JSON, sem texto adicional.`;

      const { data, error } = await supabase.functions.invoke('ai-gateway', {
        body: {
          provider: 'gemini',
          model: 'google/gemini-2.5-flash',
          messages: [{ role: 'user', content: prompt }],
        },
      });

      if (error) throw error;

      const responseText = data?.content || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsedAnalysis = JSON.parse(jsonMatch[0]);
        setAnalysis(parsedAnalysis);
        toast({
          title: 'Análise Concluída',
          description: 'O perfil do artista foi analisado com sucesso.',
        });
      } else {
        throw new Error('Resposta inválida da IA');
      }
    } catch (error) {
      console.error('Error analyzing profile:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao analisar o perfil. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExportPDF = async () => {
    if (!analysis || !selectedArtist) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let y = 0;

    // Load and add header banner
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        logoImg.onload = () => resolve();
        logoImg.onerror = reject;
        logoImg.src = '/lovable-uploads/pdf-header-banner.png';
      });
      
      const canvas = document.createElement('canvas');
      canvas.width = logoImg.width;
      canvas.height = logoImg.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(logoImg, 0, 0);
      const logoDataUrl = canvas.toDataURL('image/png');
      
      // Full width header at top of page
      const imgHeight = (logoImg.height / logoImg.width) * pageWidth;
      doc.addImage(logoDataUrl, 'PNG', 0, 0, pageWidth, imgHeight);
      y = imgHeight + 10;
    } catch (error) {
      console.error('Failed to load logo:', error);
      // Continue without logo
    }

    const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin, y);
        y += fontSize * 0.5;
      });
      y += 4;
    };

    const addSection = (title: string, items: string[]) => {
      addText(title, 12, true);
      items.forEach((item, i) => {
        const text = typeof item === 'string' ? item : (item as any).action || JSON.stringify(item);
        addText(`• ${text}`, 10);
      });
      y += 4;
    };

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`Análise de Perfil - ${selectedArtist.stage_name || selectedArtist.name}`, margin, y);
    y += 12;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, margin, y);
    y += 12;

    // Summary
    addText('RESUMO EXECUTIVO', 12, true);
    addText(analysis.summary, 10);
    y += 4;

    // Strengths
    addSection('PONTOS FORTES', analysis.strengths);

    // Weaknesses
    addSection('PONTOS FRACOS', analysis.weaknesses);

    // Opportunities
    addSection('OPORTUNIDADES', analysis.opportunities);

    // Recommendations
    addSection('RECOMENDAÇÕES ESTRATÉGICAS', analysis.recommendations);

    // Content Strategy
    addText('ESTRATÉGIA DE CONTEÚDO', 12, true);
    addText(`Plataformas: ${analysis.contentStrategy.platforms.join(', ')}`, 10);
    addText(`Frequência: ${analysis.contentStrategy.frequency}`, 10);
    addText(`Tipos de Conteúdo: ${analysis.contentStrategy.contentTypes.join(', ')}`, 10);
    addText(`Tom: ${analysis.contentStrategy.tone}`, 10);
    y += 4;

    // Audience Insights
    addText('INSIGHTS DO PÚBLICO', 12, true);
    addText(`Demografia: ${analysis.audienceInsights.demographics}`, 10);
    addText(`Interesses: ${analysis.audienceInsights.interests.join(', ')}`, 10);
    addText(`Comportamento: ${analysis.audienceInsights.behavior}`, 10);
    y += 4;

    // Competitive Position
    addText('POSICIONAMENTO COMPETITIVO', 12, true);
    addText(analysis.competitivePosition, 10);
    y += 4;

    // Growth Potential
    addText('POTENCIAL DE CRESCIMENTO', 12, true);
    addText(analysis.growthPotential, 10);

    const artistName = (selectedArtist.stage_name || selectedArtist.name).replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`Analise_Perfil_${artistName}.pdf`);

    toast({
      title: 'PDF Exportado',
      description: 'A análise foi exportada com sucesso.',
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-primary" />
            Analisar Perfil do Artista
          </CardTitle>
          <CardDescription>
            Selecione um artista para receber uma análise estratégica completa com IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Artista</Label>
            <Select value={selectedArtistId} onValueChange={setSelectedArtistId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o artista" />
              </SelectTrigger>
              <SelectContent>
                {artists.map((artist) => (
                  <SelectItem key={artist.id} value={artist.id}>
                    {artist.stage_name || artist.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedArtist && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center gap-3">
                  {selectedArtist.image_url ? (
                    <img 
                      src={selectedArtist.image_url} 
                      alt={selectedArtist.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Music2 className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{selectedArtist.stage_name || selectedArtist.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedArtist.genre || 'Gênero não informado'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-500" />
                    <span>{spotifyMetrics?.followers?.toLocaleString() || '—'} seguidores</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span>{spotifyMetrics?.monthly_listeners?.toLocaleString() || '—'} ouvintes/mês</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedArtist.instagram_url && (
                    <Badge variant="outline" className="gap-1">
                      <Instagram className="h-3 w-3" /> Instagram
                    </Badge>
                  )}
                  {selectedArtist.spotify_url && (
                    <Badge variant="outline" className="gap-1">
                      <Music2 className="h-3 w-3" /> Spotify
                    </Badge>
                  )}
                  {selectedArtist.youtube_url && (
                    <Badge variant="outline" className="gap-1">
                      <Youtube className="h-3 w-3" /> YouTube
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <Label>Contexto Adicional (Opcional)</Label>
            <Textarea
              placeholder="Adicione informações extras sobre objetivos, desafios atuais, próximos lançamentos..."
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              rows={4}
            />
          </div>

          <Button 
            onClick={handleAnalyze} 
            disabled={!selectedArtistId || isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                Analisando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analisar Perfil com IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Resultado da Análise
            </CardTitle>
            {analysis && (
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <FileDown className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isAnalyzing ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : analysis ? (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6">
                {/* Summary */}
                <div className="p-4 bg-primary/10 rounded-lg">
                  <h4 className="font-semibold mb-2">Resumo Executivo</h4>
                  <p className="text-sm">{analysis.summary}</p>
                </div>

                {/* SWOT Analysis */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Pontos Fortes
                    </h4>
                    <ul className="text-sm space-y-1">
                      {analysis.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-500">•</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      Pontos Fracos
                    </h4>
                    <ul className="text-sm space-y-1">
                      {analysis.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-red-500">•</span>
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Opportunities */}
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2 text-blue-600">
                    <Target className="h-4 w-4" />
                    Oportunidades
                  </h4>
                  <ul className="text-sm space-y-1">
                    {analysis.opportunities.map((o, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        {o}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations */}
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2 text-primary">
                    <Lightbulb className="h-4 w-4" />
                    Recomendações Estratégicas
                  </h4>
                  <div className="space-y-2">
                    {analysis.recommendations.map((r, i) => (
                      <div key={i} className="p-3 bg-muted/50 rounded-lg text-sm">
                        <span className="font-medium text-primary">{i + 1}.</span>{' '}
                        {typeof r === 'string' ? r : (r as any).action || JSON.stringify(r)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content Strategy */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Estratégia de Conteúdo</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-muted-foreground mb-1">Plataformas</p>
                      <div className="flex flex-wrap gap-1">
                        {analysis.contentStrategy.platforms.map((p, i) => (
                          <Badge key={i} variant="secondary">{p}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-muted-foreground mb-1">Frequência</p>
                      <p className="font-medium">{analysis.contentStrategy.frequency}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-muted-foreground mb-1">Tipos de Conteúdo</p>
                      <div className="flex flex-wrap gap-1">
                        {analysis.contentStrategy.contentTypes.map((t, i) => (
                          <Badge key={i} variant="outline">{t}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-muted-foreground mb-1">Tom</p>
                      <p className="font-medium">{analysis.contentStrategy.tone}</p>
                    </div>
                  </div>
                </div>

                {/* Audience Insights */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Insights do Público</h4>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-muted-foreground mb-1">Demografia</p>
                      <p>{analysis.audienceInsights.demographics}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-muted-foreground mb-1">Interesses</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {analysis.audienceInsights.interests.map((i, idx) => (
                          <Badge key={idx} variant="outline">{i}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-muted-foreground mb-1">Comportamento</p>
                      <p>{analysis.audienceInsights.behavior}</p>
                    </div>
                  </div>
                </div>

                {/* Competitive Position & Growth */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Posicionamento Competitivo</h4>
                    <p className="text-sm">{analysis.competitivePosition}</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-primary/5 to-primary/10">
                    <h4 className="font-semibold mb-2">Potencial de Crescimento</h4>
                    <p className="text-sm">{analysis.growthPotential}</p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <UserCircle className="h-12 w-12 mb-4 opacity-50" />
              <p>Selecione um artista e clique em "Analisar Perfil"</p>
              <p className="text-sm">para receber uma análise estratégica completa</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
