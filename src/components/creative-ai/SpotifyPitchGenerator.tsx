import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Copy, Check, Music, TrendingUp, Target, Zap, Info } from 'lucide-react';
import { useArtists } from '@/hooks/useArtists';
import { useReleases } from '@/hooks/useReleases';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';

const GENRES = [
  'Funk', 'Funk Brasileiro', 'MTG', 'Pop', 'Pop Brasileiro', 'Hip Hop', 'Trap', 
  'Trap Brasileiro', 'R&B', 'Eletrônica', 'EDM', 'House', 'Sertanejo', 
  'Pagode', 'MPB', 'Rock', 'Indie', 'Gospel', 'Reggaeton', 'Outro'
];

const MOODS = [
  { value: 'energetico', label: 'Energético / Alta Energia' },
  { value: 'festa', label: 'Festa / Baile' },
  { value: 'treino', label: 'Treino / Academia' },
  { value: 'relaxante', label: 'Relaxante / Chill' },
  { value: 'romantico', label: 'Romântico' },
  { value: 'melancolico', label: 'Melancólico / Sad' },
  { value: 'motivacional', label: 'Motivacional' },
  { value: 'noturno', label: 'Noturno / Madrugada' },
  { value: 'viral', label: 'Viral / Trends' },
];

const REFERENCES = [
  'DJ Arana', 'Love Funk', 'DJ GBR', 'MC Ryan SP', 'Anitta', 'MC Cabelinho',
  'Veigh', 'Matuê', 'WIU', 'Poze do Rodo', 'L7nnon', 'MC Hariel',
  'Outro'
];

interface PitchFormData {
  artistId: string;
  releaseId: string;
  genre: string;
  subgenre: string;
  mood: string;
  references: string;
  bpm: string;
  lastReleaseStreams: string;
  monthlyGrowth: string;
  hasViralContent: boolean;
  differentiator: string;
  additionalContext: string;
}

export const SpotifyPitchGenerator = () => {
  const { toast } = useToast();
  const { data: artists } = useArtists();
  const { data: releases } = useReleases();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPitch, setGeneratedPitch] = useState('');
  const [copied, setCopied] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  
  const [formData, setFormData] = useState<PitchFormData>({
    artistId: '',
    releaseId: '',
    genre: '',
    subgenre: '',
    mood: '',
    references: '',
    bpm: '',
    lastReleaseStreams: '',
    monthlyGrowth: '',
    hasViralContent: false,
    differentiator: '',
    additionalContext: '',
  });

  const selectedArtist = artists?.find(a => a.id === formData.artistId);
  const selectedRelease = releases?.find(r => r.id === formData.releaseId);
  const artistReleases = releases?.filter(r => r.artist_id === formData.artistId) || [];

  const handleGenerate = async () => {
    if (!formData.artistId || !formData.genre || !formData.mood) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha artista, gênero e mood/energia da música.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = buildPitchPrompt();
      
      const { data, error } = await supabase.functions.invoke('generate-creative-ideas', {
        body: {
          prompt,
          type: 'pitch',
        }
      });

      if (error) throw error;

      if (data?.content) {
        setGeneratedPitch(data.content);
        toast({
          title: 'Pitching gerado!',
          description: 'Seu texto de pitching editorial foi criado com sucesso.',
        });
      }
    } catch (error) {
      console.error('Error generating pitch:', error);
      toast({
        title: 'Erro ao gerar pitching',
        description: 'Não foi possível gerar o texto. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const buildPitchPrompt = () => {
    const artistName = selectedArtist?.stage_name || selectedArtist?.name || '';
    const releaseName = selectedRelease?.title || '';
    
    let prompt = `Você é um especialista em pitching editorial para Spotify for Artists. Gere um texto de pitching profissional e objetivo seguindo as melhores práticas.

DADOS DO LANÇAMENTO:
- Artista: ${artistName}
${releaseName ? `- Música/Lançamento: ${releaseName}` : ''}
- Gênero Principal: ${formData.genre}
${formData.subgenre ? `- Subgênero: ${formData.subgenre}` : ''}
- Mood/Energia: ${formData.mood}
${formData.references ? `- Referências Sonoras: ${formData.references}` : ''}
${formData.bpm ? `- BPM: ${formData.bpm}` : ''}

DADOS DE TRAÇÃO (se disponíveis):
${formData.lastReleaseStreams ? `- Streams do último lançamento: ${formData.lastReleaseStreams}` : '- Sem dados de streams anteriores'}
${formData.monthlyGrowth ? `- Crescimento mensal: ${formData.monthlyGrowth}%` : ''}
${formData.hasViralContent ? '- Possui conteúdo viral/tendências' : ''}

DIFERENCIAL:
${formData.differentiator || 'Não especificado'}

CONTEXTO ADICIONAL:
${formData.additionalContext || 'Nenhum'}

INSTRUÇÕES PARA O PITCHING:
1. Abertura direta (1-2 frases): Explique o que é a música sem floreios
2. Contexto estratégico: Mostre que faz parte de algo maior
3. Gênero + subgênero + referências claras
4. Mood, energia e uso ideal da música (treino, festa, TikTok, etc.)
5. Dados de tração APENAS se fornecidos (não invente)
6. Diferencial claro: Por que essa música é diferente?

REGRAS:
- Seja direto e objetivo
- NÃO use linguagem emocional vaga como "feita com o coração"
- NÃO invente números ou dados
- Foque em classificação (editores pensam por categorias)
- Máximo 150 palavras
- Use português brasileiro

Gere APENAS o texto do pitching, sem explicações adicionais.`;

    return prompt;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedPitch);
    setCopied(true);
    toast({
      title: 'Copiado!',
      description: 'Texto copiado para a área de transferência.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Guide Section */}
      <Collapsible open={showGuide} onOpenChange={setShowGuide}>
        <Card className="bg-gradient-to-r from-green-500/10 to-primary/10 border-green-500/20">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-green-500" />
                Guia de Pitching Editorial Spotify
                <Badge variant="outline" className="ml-auto">
                  {showGuide ? 'Clique para ocultar' : 'Clique para expandir'}
                </Badge>
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-card rounded-lg border">
                  <Target className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold mb-1">Objetivo do Pitching</h4>
                  <p className="text-sm text-muted-foreground">
                    Ajudar editores a decidir onde a música se encaixa (gênero, mood, ocasião) e se há estratégia por trás.
                  </p>
                </div>
                <div className="p-4 bg-card rounded-lg border">
                  <Music className="h-6 w-6 text-green-500 mb-2" />
                  <h4 className="font-semibold mb-1">Pré-requisitos</h4>
                  <p className="text-sm text-muted-foreground">
                    Música finalizada, upload via distribuidora, pitch 7-21 dias antes do lançamento, perfil atualizado.
                  </p>
                </div>
                <div className="p-4 bg-card rounded-lg border">
                  <Zap className="h-6 w-6 text-yellow-500 mb-2" />
                  <h4 className="font-semibold mb-1">O que Funciona</h4>
                  <p className="text-sm text-muted-foreground">
                    Abertura direta, gênero claro, mood definido, dados reais (se houver), diferencial único.
                  </p>
                </div>
                <div className="p-4 bg-card rounded-lg border">
                  <TrendingUp className="h-6 w-6 text-red-500 mb-2" />
                  <h4 className="font-semibold mb-1">Evitar</h4>
                  <p className="text-sm text-muted-foreground">
                    Texto emocional, mentir números, histórias pessoais longas, pitches genéricos.
                  </p>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5 text-green-500" />
              Dados do Lançamento
            </CardTitle>
            <CardDescription>
              Preencha as informações para gerar um pitching personalizado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Artist & Release */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Artista *</Label>
                <Select
                  value={formData.artistId}
                  onValueChange={(value) => setFormData({ ...formData, artistId: value, releaseId: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o artista" />
                  </SelectTrigger>
                  <SelectContent>
                    {artists?.map((artist) => (
                      <SelectItem key={artist.id} value={artist.id}>
                        {artist.stage_name || artist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Lançamento (Opcional)</Label>
                <Select
                  value={formData.releaseId}
                  onValueChange={(value) => setFormData({ ...formData, releaseId: value })}
                  disabled={!formData.artistId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o lançamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {artistReleases.map((release) => (
                      <SelectItem key={release.id} value={release.id}>
                        {release.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Genre & Subgenre */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gênero Principal *</Label>
                <Select
                  value={formData.genre}
                  onValueChange={(value) => setFormData({ ...formData, genre: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENRES.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Subgênero</Label>
                <Input
                  placeholder="Ex: MTG, Brega Funk, etc."
                  value={formData.subgenre}
                  onChange={(e) => setFormData({ ...formData, subgenre: e.target.value })}
                />
              </div>
            </div>

            {/* Mood & BPM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mood / Energia *</Label>
                <Select
                  value={formData.mood}
                  onValueChange={(value) => setFormData({ ...formData, mood: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o mood" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOODS.map((mood) => (
                      <SelectItem key={mood.value} value={mood.label}>
                        {mood.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>BPM (Opcional)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 130"
                  value={formData.bpm}
                  onChange={(e) => setFormData({ ...formData, bpm: e.target.value })}
                />
              </div>
            </div>

            {/* References */}
            <div className="space-y-2">
              <Label>Referências Sonoras</Label>
              <Input
                placeholder="Ex: DJ Arana, Love Funk, estilo São Paulo"
                value={formData.references}
                onChange={(e) => setFormData({ ...formData, references: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Artistas ou estilos que servem como referência sonora
              </p>
            </div>

            {/* Traction Data */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-4">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Dados de Tração (apenas se reais)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Streams último lançamento</Label>
                  <Input
                    placeholder="Ex: 120.000"
                    value={formData.lastReleaseStreams}
                    onChange={(e) => setFormData({ ...formData, lastReleaseStreams: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Crescimento mensal (%)</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 15"
                    value={formData.monthlyGrowth}
                    onChange={(e) => setFormData({ ...formData, monthlyGrowth: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="viralContent"
                  checked={formData.hasViralContent}
                  onChange={(e) => setFormData({ ...formData, hasViralContent: e.target.checked })}
                  className="rounded border-border"
                />
                <Label htmlFor="viralContent" className="text-sm cursor-pointer">
                  Possui conteúdo viral ou tendências ativas
                </Label>
              </div>
            </div>

            {/* Differentiator */}
            <div className="space-y-2">
              <Label>Diferencial da Música</Label>
              <Textarea
                placeholder="O que torna essa música diferente das outras? Ex: produção minimalista, refrão memorável, colaboração estratégica..."
                value={formData.differentiator}
                onChange={(e) => setFormData({ ...formData, differentiator: e.target.value })}
                rows={2}
              />
            </div>

            {/* Additional Context */}
            <div className="space-y-2">
              <Label>Contexto Adicional</Label>
              <Textarea
                placeholder="Informações extras: faz parte de um EP? Continuação de hit anterior? Novo posicionamento?"
                value={formData.additionalContext}
                onChange={(e) => setFormData({ ...formData, additionalContext: e.target.value })}
                rows={2}
              />
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando Pitching...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Pitching Editorial
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Pitch */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Pitching Gerado
              </span>
              {generatedPitch && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copiar
                    </>
                  )}
                </Button>
              )}
            </CardTitle>
            <CardDescription>
              Texto pronto para colar no Spotify for Artists
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedPitch ? (
              <ScrollArea className="h-[400px]">
                <div className="p-4 bg-muted/50 rounded-lg border whitespace-pre-wrap font-mono text-sm">
                  {generatedPitch}
                </div>
              </ScrollArea>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                <div className="text-center space-y-2">
                  <Music className="h-12 w-12 mx-auto opacity-50" />
                  <p>Preencha os dados e clique em "Gerar Pitching"</p>
                  <p className="text-xs">O texto será exibido aqui</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2 text-green-500">✓ Boas Práticas</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Enviar 7-21 dias antes do lançamento</li>
                <li>• Ser específico sobre gênero e mood</li>
                <li>• Incluir apenas dados reais</li>
                <li>• Manter texto objetivo e curto</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-red-500">✗ Evitar</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Texto emocional demais</li>
                <li>• Inventar números</li>
                <li>• Histórias pessoais longas</li>
                <li>• Pitch genérico sem contexto</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-blue-500">ℹ Lembre-se</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Pitching não garante playlist</li>
                <li>• Editores buscam contexto e potencial</li>
                <li>• Playlists amplificam o que já funciona</li>
                <li>• Mantenha perfil do artista atualizado</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
