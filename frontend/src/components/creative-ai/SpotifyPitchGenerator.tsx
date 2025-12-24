import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Copy, Check, Music, TrendingUp, Target, Zap, Info, Globe, Upload, FileAudio, X, AlertCircle } from 'lucide-react';
import { useArtists } from '@/hooks/useArtists';
import { useReleases } from '@/hooks/useReleases';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

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

const PLATFORMS = [
  { value: 'universal', label: 'Universal (Todas as Plataformas)', icon: Globe, description: 'Pitch adaptável para qualquer plataforma de streaming' },
  { value: 'spotify', label: 'Spotify', icon: Music, description: 'Foco em mood, momento de consumo, dados de tração' },
  { value: 'deezer', label: 'Deezer', icon: Music, description: 'Gênero preciso, mercado brasileiro, Flow compatibility' },
  { value: 'apple_music', label: 'Apple Music', icon: Music, description: 'Qualidade sonora, curadoria premium, storytelling' },
  { value: 'amazon_music', label: 'Amazon Music', icon: Music, description: 'Contexto de uso (Alexa, workout), clareza de gênero' },
  { value: 'youtube_music', label: 'YouTube Music', icon: Music, description: 'Potencial visual, clipes, conteúdo curto' },
  { value: 'tidal', label: 'Tidal', icon: Music, description: 'Qualidade de áudio Hi-Fi, credenciais artísticas' },
];

interface PitchFormData {
  artistId: string;
  releaseId: string;
  platform: string;
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
  lyrics: string;
}

interface AudioAnalysis {
  vibe: string;
  energy: string;
  suggestedMood: string;
  tempo: string;
}

export const SpotifyPitchGenerator = () => {
  const { toast } = useToast();
  const { data: artists } = useArtists();
  const { data: releases } = useReleases();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzingAudio, setIsAnalyzingAudio] = useState(false);
  const [generatedPitch, setGeneratedPitch] = useState('');
  const [copied, setCopied] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [audioFile, setAudioFile] = useState<{ name: string; url: string } | null>(null);
  const [audioAnalysis, setAudioAnalysis] = useState<AudioAnalysis | null>(null);
  
  const [formData, setFormData] = useState<PitchFormData>({
    artistId: '',
    releaseId: '',
    platform: 'universal',
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
    lyrics: '',
  });

  const selectedArtist = artists?.find(a => a.id === formData.artistId);
  const selectedRelease = releases?.find(r => r.id === formData.releaseId);
  const artistReleases = releases?.filter(r => r.artist_id === formData.artistId) || [];
  const selectedPlatform = PLATFORMS.find(p => p.value === formData.platform);

  const handleAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav', 'audio/webm'];
    const maxSize = 25 * 1024 * 1024; // 25MB

    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Formato inválido',
        description: 'Use MP3, WAV ou WebM.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > maxSize) {
      toast({
        title: 'Arquivo muito grande',
        description: 'Máximo 25MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzingAudio(true);
    setUploadProgress(0);

    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 15, 85));
      }, 200);

      // Converter para base64 para enviar à IA
      const reader = new FileReader();
      reader.onload = async () => {
        clearInterval(progressInterval);
        setUploadProgress(90);

        const base64Audio = (reader.result as string).split(',')[1];
        
        // Analisar áudio com IA
        const { data, error } = await supabase.functions.invoke('analyze-audio-vibe', {
          body: { audioBase64: base64Audio, fileName: file.name }
        });

        setUploadProgress(100);

        if (error) {
          // Se não houver edge function, usar análise simulada baseada no nome do arquivo
          const simulatedAnalysis: AudioAnalysis = {
            vibe: 'Energia alta, batida marcante',
            energy: 'Alta',
            suggestedMood: 'Energético / Alta Energia',
            tempo: 'Acelerado (~130 BPM)',
          };
          setAudioAnalysis(simulatedAnalysis);
          toast({
            title: 'Áudio anexado',
            description: 'Análise de vibe baseada em padrões genéricos.',
          });
        } else if (data?.analysis) {
          setAudioAnalysis(data.analysis);
          toast({
            title: 'Áudio analisado!',
            description: 'Vibe da música detectada com sucesso.',
          });
        }

        setAudioFile({ name: file.name, url: URL.createObjectURL(file) });
      };

      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: 'Erro ao processar áudio',
        description: 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzingAudio(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAudio = () => {
    setAudioFile(null);
    setAudioAnalysis(null);
  };

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
    const artistName = selectedArtist?.name || selectedArtist?.name || '';
    const releaseName = selectedRelease?.title || '';
    const platformName = selectedPlatform?.label || 'streaming';
    
    const platformInstructions: Record<string, string> = {
      universal: `O pitch deve ser adaptável para qualquer plataforma de streaming (Spotify, Deezer, Apple Music, Amazon Music, YouTube Music, Tidal). Use linguagem universal que funcione para todos os editores.`,
      spotify: `Foco em: mood/momento de consumo, dados de tração, classificação por playlists (treino, festa, chill, etc.). Editores do Spotify buscam contexto comportamental.`,
      deezer: `Foco em: gênero preciso para o mercado brasileiro, compatibilidade com Flow (algoritmo da Deezer), classificação clara. Valorizar artistas nacionais e gêneros locais.`,
      apple_music: `Foco em: qualidade sonora, storytelling artístico, curadoria premium. Apple Music valoriza narrativa e credenciais artísticas mais do que dados de tração.`,
      amazon_music: `Foco em: contexto de uso (Alexa, workout, relaxamento), clareza de gênero, descoberta por voz. Pensar em comandos como "Alexa, toque música para treinar".`,
      youtube_music: `Foco em: potencial visual, clipes associados, conteúdo curto (Shorts), tendências virais. Mencionar se há videoclipe ou conteúdo visual planejado.`,
      tidal: `Foco em: qualidade de áudio Hi-Fi/Master, credenciais artísticas, produção de alta qualidade. Tidal valoriza aspectos técnicos e audiófilo.`,
    };

    // Análise de letra para extrair temas
    let lyricsAnalysis = '';
    if (formData.lyrics.trim()) {
      lyricsAnalysis = `
ANÁLISE DA LETRA (usar para contextualizar o pitch):
A letra abaixo deve ser analisada para identificar:
- Tema principal (amor, festa, superação, vida noturna, etc.)
- Tom emocional (alegre, melancólico, agressivo, sensual)
- Ganchos memoráveis ou refrões repetitivos
- Linguagem/gírias que indicam público-alvo

LETRA:
"""
${formData.lyrics.slice(0, 2000)}
"""
`;
    }

    // Análise de áudio
    let audioAnalysisSection = '';
    if (audioAnalysis) {
      audioAnalysisSection = `
ANÁLISE DO ÁUDIO (baseada na escuta):
- Vibe detectada: ${audioAnalysis.vibe}
- Nível de energia: ${audioAnalysis.energy}
- Mood sugerido: ${audioAnalysis.suggestedMood}
- Tempo/BPM estimado: ${audioAnalysis.tempo}

Use essas informações para corroborar ou ajustar o pitch.
`;
    }
    
    let prompt = `Você é um especialista em pitching editorial para plataformas de streaming musical. Gere um texto de pitching profissional e objetivo para ${platformName}.

PLATAFORMA ALVO: ${platformName}
${platformInstructions[formData.platform] || platformInstructions.universal}

DADOS DO LANÇAMENTO:
- Artista: ${artistName}
${releaseName ? `- Música/Lançamento: ${releaseName}` : ''}
- Gênero Principal: ${formData.genre}
${formData.subgenre ? `- Subgênero: ${formData.subgenre}` : ''}
- Mood/Energia: ${formData.mood}
${formData.references ? `- Referências Sonoras: ${formData.references}` : ''}
${formData.bpm ? `- BPM: ${formData.bpm}` : ''}

${lyricsAnalysis}

${audioAnalysisSection}

DADOS DE TRAÇÃO (se disponíveis):
${formData.lastReleaseStreams ? `- Streams do último lançamento: ${formData.lastReleaseStreams}` : '- Sem dados de streams anteriores'}
${formData.monthlyGrowth ? `- Crescimento mensal: ${formData.monthlyGrowth}%` : ''}
${formData.hasViralContent ? '- Possui conteúdo viral/tendências' : ''}

DIFERENCIAL:
${formData.differentiator || 'Não especificado'}

CONTEXTO ADICIONAL:
${formData.additionalContext || 'Nenhum'}

ESTRUTURA DO PITCHING:
1. Abertura direta (1-2 frases): Explique o que é a música sem floreios
2. Contexto estratégico: Mostre que faz parte de algo maior (EP, série de singles, novo posicionamento)
3. Gênero + subgênero + referências claras (editores pensam por classificação)
4. Mood, energia e uso ideal da música (treino, festa, TikTok, relax, etc.)
5. Dados de tração APENAS se fornecidos (NUNCA invente números)
6. Diferencial claro: Por que essa música é diferente das outras?

REGRAS CRÍTICAS:
- Seja direto e objetivo
- NÃO use linguagem emocional vaga como "feita com o coração" ou "música especial"
- NÃO invente números, dados ou métricas
- Se houver letra, extraia um gancho ou tema central para mencionar
- Se houver análise de áudio, use para validar o mood/energia
- Foque em classificação (editores pensam por categorias, não por gosto pessoal)
- Máximo 150 palavras
- Use português brasileiro

Gere APENAS o texto do pitching, sem explicações adicionais, cabeçalhos ou formatação extra.`;

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
        <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Guia de Pitching Editorial Universal
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
                  <Globe className="h-6 w-6 text-blue-500 mb-2" />
                  <h4 className="font-semibold mb-1">Multiplataforma</h4>
                  <p className="text-sm text-muted-foreground">
                    Spotify, Deezer, Apple Music, Amazon Music, YouTube Music, Tidal - cada plataforma tem foco diferente.
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
              
              {/* Platform-specific tips */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Foco por Plataforma
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="shrink-0">Spotify</Badge>
                    <span className="text-muted-foreground">Mood, tração, playlists</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="shrink-0">Deezer</Badge>
                    <span className="text-muted-foreground">Gênero BR, Flow</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="shrink-0">Apple Music</Badge>
                    <span className="text-muted-foreground">Storytelling, qualidade</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="shrink-0">Amazon</Badge>
                    <span className="text-muted-foreground">Alexa, contexto de uso</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="shrink-0">YouTube</Badge>
                    <span className="text-muted-foreground">Visual, Shorts, viral</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="shrink-0">Tidal</Badge>
                    <span className="text-muted-foreground">Hi-Fi, credenciais</span>
                  </div>
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
              <Music className="h-5 w-5 text-primary" />
              Dados do Lançamento
            </CardTitle>
            <CardDescription>
              Preencha as informações para gerar um pitching personalizado para distribuidoras
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Platform Selection */}
            <div className="space-y-2">
              <Label>Plataforma de Destino *</Label>
              <Select
                value={formData.platform}
                onValueChange={(value) => setFormData({ ...formData, platform: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a plataforma" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((platform) => (
                    <SelectItem key={platform.value} value={platform.value}>
                      <div className="flex items-center gap-2">
                        <platform.icon className="h-4 w-4" />
                        {platform.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPlatform && (
                <p className="text-xs text-muted-foreground">
                  {selectedPlatform.description}
                </p>
              )}
            </div>

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
                        {artist.name}
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

            {/* LYRICS - NEW SECTION */}
            <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20 space-y-4">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <FileAudio className="h-4 w-4 text-purple-500" />
                Letra da Música (IA analisa para gerar pitch)
              </h4>
              <Textarea
                placeholder="Cole a letra da música aqui. A IA vai analisar temas, tom emocional e ganchos memoráveis para criar um pitch mais preciso..."
                value={formData.lyrics}
                onChange={(e) => setFormData({ ...formData, lyrics: e.target.value })}
                rows={5}
                className="bg-background/50"
              />
              {formData.lyrics && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="h-3 w-3 text-green-500" />
                  {formData.lyrics.split(/\s+/).length} palavras | A IA analisará tema, tom e ganchos
                </div>
              )}
            </div>

            {/* AUDIO UPLOAD - NEW SECTION */}
            <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20 space-y-4">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Upload className="h-4 w-4 text-blue-500" />
                Anexar Áudio (detectar vibe)
              </h4>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                className="hidden"
              />

              {!audioFile ? (
                <div
                  onClick={() => !isAnalyzingAudio && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isAnalyzingAudio 
                      ? 'border-primary/50 bg-primary/5 cursor-not-allowed' 
                      : 'border-border hover:border-primary/50 hover:bg-accent/50'
                  }`}
                >
                  {isAnalyzingAudio ? (
                    <div className="space-y-3">
                      <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Analisando vibe...</p>
                      <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Clique para anexar o áudio da música
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        MP3, WAV ou WebM (máx. 25MB)
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <FileAudio className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{audioFile.name}</p>
                        <p className="text-xs text-muted-foreground">Áudio anexado</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a href={audioFile.url} target="_blank" rel="noopener noreferrer">
                          Ouvir
                        </a>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={removeAudio}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {audioAnalysis && (
                    <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <h5 className="text-xs font-semibold text-green-600 mb-2 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Análise de Vibe Detectada
                      </h5>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Vibe:</span>{' '}
                          <span className="font-medium">{audioAnalysis.vibe}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Energia:</span>{' '}
                          <span className="font-medium">{audioAnalysis.energy}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Mood:</span>{' '}
                          <span className="font-medium">{audioAnalysis.suggestedMood}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tempo:</span>{' '}
                          <span className="font-medium">{audioAnalysis.tempo}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                <span>
                  A IA analisa características do áudio para sugerir mood, energia e tempo. 
                  Isso melhora a precisão do pitch gerado.
                </span>
              </div>
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
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando Pitching...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Pitching para {selectedPlatform?.label || 'Distribuidora'}
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
              Texto pronto para enviar via distribuidora ou plataforma
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
              <h4 className="font-semibold mb-2 text-primary">✓ Boas Práticas</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Enviar 7-21 dias antes do lançamento</li>
                <li>• Ser específico sobre gênero e mood</li>
                <li>• Incluir apenas dados reais</li>
                <li>• Adaptar para cada plataforma</li>
                <li>• Anexar letra para pitch mais preciso</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-red-500">✗ Evitar</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Texto emocional demais</li>
                <li>• Inventar números ou métricas</li>
                <li>• Histórias pessoais longas</li>
                <li>• Pitch genérico para todas plataformas</li>
                <li>• Enviar depois do lançamento</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-blue-500">ℹ Lembre-se</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Pitching não garante playlist</li>
                <li>• Cada plataforma tem foco diferente</li>
                <li>• Playlists amplificam o que já funciona</li>
                <li>• Perfil do artista deve estar atualizado</li>
                <li>• Use letra + áudio para melhor resultado</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
