import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Save, ThumbsUp, ThumbsDown, Edit, Download, Instagram, Youtube, Music, Share2 } from 'lucide-react';
import { useArtists } from '@/hooks/useArtists';
import { useMusicRegistry } from '@/hooks/useMusicRegistry';
import { useReleases } from '@/hooks/useReleases';
import { useMarketingCampaigns } from '@/hooks/useMarketing';
import { useGenerateIdeas, useSaveIdea, useUpdateIdea, GenerateIdeasParams } from '@/hooks/useCreativeAI';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { AIProviderSelector } from './AIProviderSelector';
import { AIProvider } from '@/hooks/useAI';
interface GeneratedIdea {
  title: string;
  description: string;
  suggested_channel: string;
  content_format: string;
  execution_notes: string;
  priority: string;
  post_frequency: string;
  recommended_dates: string[];
  engagement_strategies: string[];
}

const OBJECTIVES = [
  { value: 'campanha', label: 'Campanha de Marketing' },
  { value: 'post', label: 'Post para Redes Sociais' },
  { value: 'roteiro', label: 'Roteiro de Vídeo' },
  { value: 'titulo', label: 'Títulos e Headlines' },
  { value: 'legenda', label: 'Legendas e Descrições' },
  { value: 'estrategia', label: 'Estratégia de Marketing' },
  { value: 'pre-lancamento', label: 'Pré-Lançamento' },
  { value: 'lancamento', label: 'Lançamento' },
  { value: 'pos-lancamento', label: 'Pós-Lançamento' },
];

const CHANNELS = [
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'tiktok', label: 'TikTok', icon: Share2 },
  { value: 'youtube', label: 'YouTube', icon: Youtube },
  { value: 'spotify', label: 'Spotify', icon: Music },
  { value: 'twitter', label: 'Twitter/X', icon: Share2 },
  { value: 'todos', label: 'Todos os Canais', icon: Share2 },
];

const TONES = [
  'Divertido', 'Sério', 'Motivacional', 'Inspirador', 'Romântico',
  'Energético', 'Nostálgico', 'Misterioso', 'Provocativo', 'Autêntico'
];

export const CreativeIdeaGenerator = () => {
  const { toast } = useToast();
  const { data: artists } = useArtists();
  const { data: musics } = useMusicRegistry();
  const { data: releases } = useReleases();
  const { data: campaigns } = useMarketingCampaigns();
  
  const generateIdeas = useGenerateIdeas();
  const saveIdea = useSaveIdea();
  const updateIdea = useUpdateIdea();

  const [params, setParams] = useState<GenerateIdeasParams>({
    objective: '',
    targetAudience: {},
    keywords: [],
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [generatedIdeas, setGeneratedIdeas] = useState<GeneratedIdea[]>([]);
  const [editingIdea, setEditingIdea] = useState<GeneratedIdea | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | 'auto'>('auto');

  const handleGenerate = async () => {
    if (!params.artistId) {
      toast({
        title: 'Atenção',
        description: 'Selecione um artista para gerar ideias.',
        variant: 'destructive',
      });
      return;
    }

    if (!params.objective) {
      toast({
        title: 'Atenção',
        description: 'Selecione um objetivo para as ideias.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await generateIdeas.mutateAsync(params);
      if (Array.isArray(result)) {
        setGeneratedIdeas(result);
      } else if (result?.raw) {
        toast({
          title: 'Resposta da IA',
          description: 'A IA retornou uma resposta não estruturada. Tente novamente.',
        });
      }
    } catch (error) {
      console.error('Error generating ideas:', error);
    }
  };

  const handleSaveIdea = async (idea: GeneratedIdea) => {
    await saveIdea.mutateAsync({
      artist_id: params.artistId,
      music_registry_id: params.musicId,
      release_id: params.releaseId,
      campaign_id: params.campaignId,
      objective: params.objective,
      target_audience: params.targetAudience,
      channel: params.channel,
      tone: params.tone,
      keywords: params.keywords,
      additional_notes: params.additionalNotes,
      title: idea.title,
      description: idea.description,
      suggested_channel: idea.suggested_channel,
      content_format: idea.content_format,
      execution_notes: idea.execution_notes,
      priority: idea.priority,
      post_frequency: idea.post_frequency,
      recommended_dates: idea.recommended_dates,
      engagement_strategies: idea.engagement_strategies,
      status: 'saved',
    });
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && (params.keywords?.length || 0) < 5) {
      setParams(prev => ({
        ...prev,
        keywords: [...(prev.keywords || []), keywordInput.trim()],
      }));
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (index: number) => {
    setParams(prev => ({
      ...prev,
      keywords: prev.keywords?.filter((_, i) => i !== index) || [],
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'alta': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'média': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'baixa': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel?.toLowerCase()) {
      case 'instagram': return <Instagram className="h-4 w-4" />;
      case 'youtube': return <Youtube className="h-4 w-4" />;
      case 'spotify': return <Music className="h-4 w-4" />;
      default: return <Share2 className="h-4 w-4" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Parameters Panel */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Parâmetros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* AI Provider Selection */}
          <div className="space-y-2">
            <Label>Modelo de IA</Label>
            <AIProviderSelector 
              value={selectedProvider} 
              onChange={setSelectedProvider}
              showDescription
            />
          </div>

          {/* Artist */}
          <div className="space-y-2">
            <Label>Artista *</Label>
            <Select 
              value={params.artistId || ''} 
              onValueChange={(value) => setParams(prev => ({ ...prev, artistId: value, musicId: undefined }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o artista" />
              </SelectTrigger>
              <SelectContent>
                {artists?.filter(artist => artist.id).map(artist => (
                  <SelectItem key={artist.id} value={artist.id}>
                    {artist.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Music/Work */}
          <div className="space-y-2">
            <Label>Obra/Fonograma</Label>
            <Select 
              value={params.musicId || ''} 
              onValueChange={(value) => setParams(prev => ({ ...prev, musicId: value }))}
              disabled={!params.artistId}
            >
              <SelectTrigger>
                <SelectValue placeholder={params.artistId ? "Selecione a obra (opcional)" : "Selecione um artista primeiro"} />
              </SelectTrigger>
              <SelectContent>
                {musics?.filter(music => music.id && music.artist_id === params.artistId).map(music => (
                  <SelectItem key={music.id} value={music.id}>
                    {music.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Objective */}
          <div className="space-y-2">
            <Label>Objetivo *</Label>
            <Select 
              value={params.objective} 
              onValueChange={(value) => setParams(prev => ({ ...prev, objective: value }))}
            >
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

          {/* Target Audience */}
          <div className="space-y-2">
            <Label>Público-Alvo</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Faixa etária"
                value={params.targetAudience?.ageRange || ''}
                onChange={(e) => setParams(prev => ({
                  ...prev,
                  targetAudience: { ...prev.targetAudience, ageRange: e.target.value }
                }))}
              />
              <Input
                placeholder="Região"
                value={params.targetAudience?.region || ''}
                onChange={(e) => setParams(prev => ({
                  ...prev,
                  targetAudience: { ...prev.targetAudience, region: e.target.value }
                }))}
              />
            </div>
          </div>

          {/* Channel */}
          <div className="space-y-2">
            <Label>Canal de Divulgação</Label>
            <Select 
              value={params.channel || ''} 
              onValueChange={(value) => setParams(prev => ({ ...prev, channel: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o canal" />
              </SelectTrigger>
              <SelectContent>
                {CHANNELS.map(ch => (
                  <SelectItem key={ch.value} value={ch.value}>
                    {ch.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tone */}
          <div className="space-y-2">
            <Label>Tom/Estilo</Label>
            <Select 
              value={params.tone || ''} 
              onValueChange={(value) => setParams(prev => ({ ...prev, tone: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tom" />
              </SelectTrigger>
              <SelectContent>
                {TONES.map(tone => (
                  <SelectItem key={tone} value={tone.toLowerCase()}>
                    {tone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Keywords */}
          <div className="space-y-2">
            <Label>Palavras-chave (até 5)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Adicionar palavra-chave"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
              />
              <Button type="button" variant="outline" onClick={handleAddKeyword}>
                +
              </Button>
            </div>
            {params.keywords && params.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {params.keywords.map((kw, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive/20"
                    onClick={() => handleRemoveKeyword(idx)}
                  >
                    {kw} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label>Observações Adicionais</Label>
            <Textarea
              placeholder="Parâmetros específicos, referências, etc."
              value={params.additionalNotes || ''}
              onChange={(e) => setParams(prev => ({ ...prev, additionalNotes: e.target.value }))}
              rows={3}
            />
          </div>

          <Button 
            className="w-full" 
            onClick={handleGenerate}
            disabled={generateIdeas.isPending}
          >
            {generateIdeas.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar Ideias
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Panel */}
      <div className="lg:col-span-2 space-y-4">
        {generateIdeas.isPending && (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">A IA está criando ideias personalizadas...</p>
            </div>
          </Card>
        )}

        {!generateIdeas.isPending && generatedIdeas.length === 0 && (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground/50" />
              <div>
                <h3 className="font-medium text-foreground">Nenhuma ideia gerada ainda</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Preencha os parâmetros e clique em "Gerar Ideias" para começar
                </p>
              </div>
            </div>
          </Card>
        )}

        {generatedIdeas.map((idea, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg">{idea.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getPriorityColor(idea.priority)}>
                      {idea.priority || 'Média'}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getChannelIcon(idea.suggested_channel)}
                      {idea.suggested_channel}
                    </Badge>
                    <Badge variant="secondary">
                      {idea.content_format}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingIdea(idea);
                      setEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSaveIdea(idea)}
                    disabled={saveIdea.isPending}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {idea.description}
                </p>
              </div>

              {idea.execution_notes && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <h4 className="text-sm font-medium mb-1">Notas de Execução</h4>
                  <p className="text-sm text-muted-foreground">{idea.execution_notes}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {idea.post_frequency && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Frequência de Posts</h4>
                    <p className="text-sm text-muted-foreground">{idea.post_frequency}</p>
                  </div>
                )}

                {idea.recommended_dates && idea.recommended_dates.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Datas Recomendadas</h4>
                    <div className="flex flex-wrap gap-1">
                      {idea.recommended_dates.map((date, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {date}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {idea.engagement_strategies && idea.engagement_strategies.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Estratégias de Engajamento</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {idea.engagement_strategies.map((strategy, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {strategy}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground mr-2">Esta ideia foi útil?</span>
                <Button variant="ghost" size="sm" className="text-green-500 hover:text-green-400">
                  <ThumbsUp className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-400">
                  <ThumbsDown className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Ideia</DialogTitle>
          </DialogHeader>
          {editingIdea && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={editingIdea.title}
                  onChange={(e) => setEditingIdea({ ...editingIdea, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={editingIdea.description}
                  onChange={(e) => setEditingIdea({ ...editingIdea, description: e.target.value })}
                  rows={5}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Canal Sugerido</Label>
                  <Input
                    value={editingIdea.suggested_channel}
                    onChange={(e) => setEditingIdea({ ...editingIdea, suggested_channel: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Formato</Label>
                  <Input
                    value={editingIdea.content_format}
                    onChange={(e) => setEditingIdea({ ...editingIdea, content_format: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notas de Execução</Label>
                <Textarea
                  value={editingIdea.execution_notes}
                  onChange={(e) => setEditingIdea({ ...editingIdea, execution_notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              if (editingIdea) {
                const idx = generatedIdeas.findIndex(i => i.title === editingIdea.title);
                if (idx !== -1) {
                  const newIdeas = [...generatedIdeas];
                  newIdeas[idx] = editingIdea;
                  setGeneratedIdeas(newIdeas);
                }
              }
              setEditDialogOpen(false);
            }}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
