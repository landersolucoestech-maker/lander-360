import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Loader2, Copy, Check, RefreshCw, Split, Instagram, Youtube, Music, Share2, Twitter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AIProviderSelector } from './AIProviderSelector';
import { AIProvider } from '@/hooks/useAI';

interface Variation {
  id: string;
  version: string;
  content: string;
  tone: string;
  cta: string;
  targetAudience: string;
}

interface ChannelAdaptation {
  channel: string;
  content: string;
  hashtags: string[];
  characterLimit: number;
  tips: string;
}

const CHANNELS = [
  { value: 'instagram', label: 'Instagram', icon: Instagram, limit: 2200 },
  { value: 'tiktok', label: 'TikTok', icon: Share2, limit: 300 },
  { value: 'youtube', label: 'YouTube', icon: Youtube, limit: 5000 },
  { value: 'twitter', label: 'Twitter/X', icon: Twitter, limit: 280 },
  { value: 'facebook', label: 'Facebook', icon: Share2, limit: 63206 },
  { value: 'linkedin', label: 'LinkedIn', icon: Share2, limit: 3000 },
];

const CONTENT_TYPES = [
  { value: 'ad', label: 'Anúncio/Ad' },
  { value: 'post', label: 'Post Orgânico' },
  { value: 'caption', label: 'Legenda' },
  { value: 'email', label: 'Email Marketing' },
  { value: 'headline', label: 'Headline' },
  { value: 'cta', label: 'Call-to-Action' },
];

export const ABVariationGenerator = () => {
  const { toast } = useToast();
  const [originalContent, setOriginalContent] = useState('');
  const [contentType, setContentType] = useState('');
  const [targetChannel, setTargetChannel] = useState('');
  const [variations, setVariations] = useState<Variation[]>([]);
  const [channelAdaptations, setChannelAdaptations] = useState<ChannelAdaptation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdapting, setIsAdapting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | 'auto'>('auto');
  const [activeTab, setActiveTab] = useState('variations');

  const handleGenerateVariations = async () => {
    if (!originalContent.trim()) {
      toast({ title: 'Atenção', description: 'Digite o conteúdo original.', variant: 'destructive' });
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
          type: 'ab-variations',
          originalContent,
          contentType,
          targetChannel,
        }),
      });

      const data = await response.json();
      
      if (data.result && Array.isArray(data.result)) {
        setVariations(data.result.map((v: any, idx: number) => ({
          id: `var-${idx}`,
          version: v.version || `Versão ${String.fromCharCode(65 + idx)}`,
          content: v.content,
          tone: v.tone || 'Neutro',
          cta: v.cta || '',
          targetAudience: v.targetAudience || 'Geral',
        })));
      }
    } catch (error) {
      console.error('Error generating variations:', error);
      toast({ title: 'Erro', description: 'Falha ao gerar variações.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdaptToChannels = async () => {
    if (!originalContent.trim()) {
      toast({ title: 'Atenção', description: 'Digite o conteúdo original.', variant: 'destructive' });
      return;
    }

    setIsAdapting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-creative-ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: 'channel-adaptation',
          originalContent,
          contentType,
          channels: CHANNELS.map(c => c.value),
        }),
      });

      const data = await response.json();
      
      if (data.result && Array.isArray(data.result)) {
        setChannelAdaptations(data.result.map((a: any) => ({
          channel: a.channel,
          content: a.content,
          hashtags: a.hashtags || [],
          characterLimit: CHANNELS.find(c => c.value === a.channel)?.limit || 0,
          tips: a.tips || '',
        })));
      }
    } catch (error) {
      console.error('Error adapting content:', error);
      toast({ title: 'Erro', description: 'Falha ao adaptar conteúdo.', variant: 'destructive' });
    } finally {
      setIsAdapting(false);
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: 'Copiado!', description: 'Conteúdo copiado.' });
  };

  const getChannelIcon = (channel: string) => {
    const ch = CHANNELS.find(c => c.value === channel);
    if (!ch) return <Share2 className="h-4 w-4" />;
    const Icon = ch.icon;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Split className="h-5 w-5 text-primary" />
            Gerador de Variações A/B
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Modelo IA</Label>
              <AIProviderSelector value={selectedProvider} onChange={setSelectedProvider} />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Conteúdo</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Canal Principal</Label>
              <Select value={targetChannel} onValueChange={setTargetChannel}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o canal" />
                </SelectTrigger>
                <SelectContent>
                  {CHANNELS.map(ch => (
                    <SelectItem key={ch.value} value={ch.value}>{ch.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Conteúdo Original *</Label>
            <Textarea
              placeholder="Cole ou digite o texto que deseja criar variações..."
              value={originalContent}
              onChange={(e) => setOriginalContent(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleGenerateVariations} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Gerar Variações A/B
            </Button>
            <Button variant="outline" onClick={handleAdaptToChannels} disabled={isAdapting}>
              {isAdapting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Adaptar por Canal
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="variations">Variações A/B ({variations.length})</TabsTrigger>
          <TabsTrigger value="channels">Adaptações por Canal ({channelAdaptations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="variations" className="mt-4">
          {variations.length === 0 ? (
            <Card className="p-8">
              <div className="flex flex-col items-center justify-center text-center">
                <Split className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="font-medium">Nenhuma variação gerada</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Digite um conteúdo e clique em "Gerar Variações A/B"
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {variations.map((variation) => (
                <Card key={variation.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{variation.version}</Badge>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{variation.tone}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopy(variation.content, variation.id)}
                        >
                          {copiedId === variation.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm whitespace-pre-wrap">{variation.content}</p>
                    </div>
                    {variation.cta && (
                      <div className="text-sm">
                        <span className="font-medium">CTA:</span>{' '}
                        <span className="text-muted-foreground">{variation.cta}</span>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Público: {variation.targetAudience}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="channels" className="mt-4">
          {channelAdaptations.length === 0 ? (
            <Card className="p-8">
              <div className="flex flex-col items-center justify-center text-center">
                <Share2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="font-medium">Nenhuma adaptação gerada</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Clique em "Adaptar por Canal" para gerar versões otimizadas
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {channelAdaptations.map((adaptation, idx) => (
                <Card key={idx} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getChannelIcon(adaptation.channel)}
                        {adaptation.channel}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(adaptation.content, `ch-${idx}`)}
                      >
                        {copiedId === `ch-${idx}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm whitespace-pre-wrap">{adaptation.content}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {adaptation.content.length}/{adaptation.characterLimit} caracteres
                    </div>
                    {adaptation.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {adaptation.hashtags.slice(0, 5).map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            #{tag.replace('#', '')}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {adaptation.tips && (
                      <div className="text-xs text-muted-foreground border-t pt-2 mt-2">
                        💡 {adaptation.tips}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
