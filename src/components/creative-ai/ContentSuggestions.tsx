import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2, Copy, Check, Instagram, Youtube, Music, Share2, Clock, TrendingUp } from 'lucide-react';
import { useArtists } from '@/hooks/useArtists';
import { useContentSuggestions, useSaveIdea } from '@/hooks/useCreativeAI';
import { useToast } from '@/hooks/use-toast';

interface ContentSuggestion {
  type: string;
  platform: string;
  content: string;
  hashtags: string[];
  best_time: string;
  estimated_reach: string;
}

const OBJECTIVES = [
  { value: 'engagement', label: 'Aumentar Engajamento' },
  { value: 'followers', label: 'Ganhar Seguidores' },
  { value: 'promotion', label: 'Promover Lançamento' },
  { value: 'branding', label: 'Fortalecer Marca' },
  { value: 'viral', label: 'Viralizar Conteúdo' },
];

export const ContentSuggestions = () => {
  const { toast } = useToast();
  const { data: artists } = useArtists();
  const generateSuggestions = useContentSuggestions();
  const saveIdea = useSaveIdea();

  const [selectedArtist, setSelectedArtist] = useState<string>('');
  const [objective, setObjective] = useState<string>('');
  const [channel, setChannel] = useState<string>('');
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!selectedArtist || !objective) {
      toast({
        title: 'Atenção',
        description: 'Selecione um artista e objetivo.',
        variant: 'destructive',
      });
      return;
    }

    const artist = artists?.find(a => a.id === selectedArtist);
    if (!artist) return;

    try {
      const result = await generateSuggestions.mutateAsync({
        artistData: artist,
        objective,
        channel: channel || undefined,
      });

      if (Array.isArray(result)) {
        setSuggestions(result);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
    }
  };

  const handleCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({
      title: 'Copiado!',
      description: 'Conteúdo copiado para a área de transferência.',
    });
  };

  const handleSave = async (suggestion: ContentSuggestion) => {
    await saveIdea.mutateAsync({
      artist_id: selectedArtist,
      objective,
      channel: suggestion.platform,
      title: `${suggestion.type} para ${suggestion.platform}`,
      description: suggestion.content,
      suggested_channel: suggestion.platform,
      content_format: suggestion.type,
      execution_notes: `Melhor horário: ${suggestion.best_time}\nHashtags: ${suggestion.hashtags?.join(' ')}`,
      status: 'saved',
    });
  };

  const getChannelIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'instagram': return <Instagram className="h-4 w-4" />;
      case 'youtube': return <Youtube className="h-4 w-4" />;
      case 'spotify': return <Music className="h-4 w-4" />;
      default: return <Share2 className="h-4 w-4" />;
    }
  };

  const getReachColor = (reach: string) => {
    switch (reach?.toLowerCase()) {
      case 'alto': return 'bg-green-500/20 text-green-400';
      case 'médio': return 'bg-yellow-500/20 text-yellow-400';
      case 'baixo': return 'bg-red-500/20 text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Sugestões de Conteúdo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px] space-y-2">
              <label className="text-sm font-medium">Artista *</label>
              <Select value={selectedArtist} onValueChange={setSelectedArtist}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o artista" />
                </SelectTrigger>
                <SelectContent>
                  {artists?.map(artist => (
                    <SelectItem key={artist.id} value={artist.id}>
                      {artist.stage_name || artist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px] space-y-2">
              <label className="text-sm font-medium">Objetivo *</label>
              <Select value={objective} onValueChange={setObjective}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o objetivo" />
                </SelectTrigger>
                <SelectContent>
                  {OBJECTIVES.map(obj => (
                    <SelectItem key={obj.value} value={obj.value}>
                      {obj.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px] space-y-2">
              <label className="text-sm font-medium">Canal</label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os canais" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="twitter">Twitter/X</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleGenerate} disabled={generateSuggestions.isPending}>
              {generateSuggestions.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Gerar Sugestões
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions Grid */}
      {generateSuggestions.isPending && (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Gerando sugestões de conteúdo...</p>
          </div>
        </Card>
      )}

      {!generateSuggestions.isPending && suggestions.length === 0 && (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50" />
            <div>
              <h3 className="font-medium text-foreground">Nenhuma sugestão gerada</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Selecione um artista e objetivo para gerar sugestões de conteúdo
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.map((suggestion, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getChannelIcon(suggestion.platform)}
                    {suggestion.platform}
                  </Badge>
                  <Badge variant="secondary">{suggestion.type}</Badge>
                </div>
                <Badge className={getReachColor(suggestion.estimated_reach)}>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {suggestion.estimated_reach}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm whitespace-pre-wrap">{suggestion.content}</p>
              </div>

              {suggestion.hashtags?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {suggestion.hashtags.map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      #{tag.replace('#', '')}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Melhor horário: {suggestion.best_time}</span>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleCopy(suggestion.content, index)}
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar
                    </>
                  )}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleSave(suggestion)}
                  disabled={saveIdea.isPending}
                >
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
