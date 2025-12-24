import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, FileText, ClipboardList, Send, CheckCircle2, Download, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMarketingBriefings, useMarketingCampaigns } from '@/hooks/useMarketing';
import { useArtists } from '@/hooks/useArtists';
import { useReleases } from '@/hooks/useReleases';
import { AIProviderSelector } from './AIProviderSelector';
import { AIProvider } from '@/hooks/useAI';

interface BriefingSuggestion {
  title: string;
  objective: string;
  targetAudience: string;
  deliverables: string[];
  keyMessages: string[];
  tone: string;
  references: string[];
  timeline: string;
  budget: string;
  kpis: string[];
}

const BRIEFING_TYPES = [
  { value: 'campaign', label: 'Campanha de Marketing' },
  { value: 'content', label: 'Produção de Conteúdo' },
  { value: 'ad', label: 'Anúncio/Ads' },
  { value: 'influencer', label: 'Ação com Influencer' },
  { value: 'launch', label: 'Lançamento de Música' },
  { value: 'event', label: 'Evento/Show' },
  { value: 'video', label: 'Produção Audiovisual' },
];

export const BriefingAssistant = () => {
  const { toast } = useToast();
  const { data: artists } = useArtists();
  const { data: releases } = useReleases();
  const { data: campaigns } = useMarketingCampaigns();
  const { data: existingBriefings } = useMarketingBriefings();

  const [briefingType, setBriefingType] = useState('');
  const [artistId, setArtistId] = useState('');
  const [releaseId, setReleaseId] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [freeFormNotes, setFreeFormNotes] = useState('');
  const [suggestion, setSuggestion] = useState<BriefingSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | 'auto'>('auto');

  const handleGenerateBriefing = async () => {
    if (!briefingType) {
      toast({ title: 'Atenção', description: 'Selecione o tipo de briefing.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const artist = artistId ? artists?.find(a => a.id === artistId) : null;
      const release = releaseId ? releases?.find(r => r.id === releaseId) : null;
      const campaign = campaignId ? campaigns?.find(c => c.id === campaignId) : null;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-creative-ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: 'briefing-assistant',
          briefingType,
          artistData: artist,
          releaseData: release,
          campaignData: campaign,
          freeFormNotes,
          existingBriefingsContext: existingBriefings?.slice(0, 5),
        }),
      });

      const data = await response.json();
      
      if (data.result) {
        setSuggestion({
          title: data.result.title || `Briefing - ${briefingType}`,
          objective: data.result.objective || '',
          targetAudience: data.result.targetAudience || '',
          deliverables: data.result.deliverables || [],
          keyMessages: data.result.keyMessages || [],
          tone: data.result.tone || '',
          references: data.result.references || [],
          timeline: data.result.timeline || '',
          budget: data.result.budget || '',
          kpis: data.result.kpis || [],
        });
      }
    } catch (error) {
      console.error('Error generating briefing:', error);
      toast({ title: 'Erro', description: 'Falha ao gerar briefing.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyBriefing = () => {
    if (!suggestion) return;
    
    const formatValue = (val: any) => typeof val === 'object' ? JSON.stringify(val, null, 2) : val;
    
    const briefingText = `
# ${suggestion.title}

## Objetivo
${formatValue(suggestion.objective)}

## Público-Alvo
${formatValue(suggestion.targetAudience)}

## Entregáveis
${suggestion.deliverables.map(d => `- ${formatValue(d)}`).join('\n')}

## Mensagens-Chave
${suggestion.keyMessages.map(m => `- ${formatValue(m)}`).join('\n')}

## Tom de Comunicação
${formatValue(suggestion.tone)}

## Referências
${suggestion.references.map(r => `- ${formatValue(r)}`).join('\n')}

## Cronograma
${formatValue(suggestion.timeline)}

## Orçamento Estimado
${formatValue(suggestion.budget)}

## KPIs
${suggestion.kpis.map(k => `- ${formatValue(k)}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(briefingText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copiado!', description: 'Briefing copiado.' });
  };

  const handleCreateBriefing = () => {
    // TODO: Integrate with existing briefing creation modal/form
    toast({ 
      title: 'Em Desenvolvimento', 
      description: 'Integração com criação de briefing será implementada.' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Assistente de Briefing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            A IA ajuda a estruturar briefings completos com base no contexto do projeto.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Modelo IA</Label>
              <AIProviderSelector value={selectedProvider} onChange={setSelectedProvider} />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Briefing *</Label>
              <Select value={briefingType} onValueChange={setBriefingType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {BRIEFING_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Artista</Label>
              <Select value={artistId} onValueChange={setArtistId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {artists?.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Lançamento</Label>
              <Select 
                value={releaseId} 
                onValueChange={setReleaseId}
                disabled={!artistId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={artistId ? "Selecione" : "Selecione artista"} />
                </SelectTrigger>
                <SelectContent>
                  {releases?.filter(r => r.artist_id === artistId).map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Campanha Vinculada</Label>
              <Select value={campaignId} onValueChange={setCampaignId}>
                <SelectTrigger>
                  <SelectValue placeholder="Opcional" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns?.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notas e Contexto Adicional</Label>
            <Textarea
              placeholder="Descreva detalhes específicos, referências, requisitos especiais..."
              value={freeFormNotes}
              onChange={(e) => setFreeFormNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Button onClick={handleGenerateBriefing} disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Gerar Briefing com IA
          </Button>
        </CardContent>
      </Card>

      {/* Generated Briefing */}
      {suggestion && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {suggestion.title}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyBriefing}>
                  {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  {copied ? 'Copiado' : 'Copiar'}
                </Button>
                <Button size="sm" onClick={handleCreateBriefing}>
                  <Send className="h-4 w-4 mr-1" />
                  Criar Briefing
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Objetivo</Label>
                <p className="text-sm bg-muted/50 rounded-lg p-3">{suggestion.objective}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Público-Alvo</Label>
                <p className="text-sm bg-muted/50 rounded-lg p-3">
                  {typeof suggestion.targetAudience === 'object' 
                    ? JSON.stringify(suggestion.targetAudience, null, 2) 
                    : suggestion.targetAudience}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Entregáveis</Label>
              <div className="flex flex-wrap gap-2">
                {suggestion.deliverables.map((item, idx) => (
                  <Badge key={idx} variant="outline" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {item}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Mensagens-Chave</Label>
              <ul className="space-y-1">
                {suggestion.keyMessages.map((msg, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {msg}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Tom</Label>
                <Badge variant="secondary">{suggestion.tone}</Badge>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Cronograma</Label>
                <p className="text-sm">{suggestion.timeline}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Orçamento</Label>
                <p className="text-sm">
                  {typeof suggestion.budget === 'object' 
                    ? JSON.stringify(suggestion.budget, null, 2) 
                    : suggestion.budget}
                </p>
              </div>
            </div>

            {suggestion.references.length > 0 && (
              <div className="space-y-2">
                <Label className="text-muted-foreground">Referências Sugeridas</Label>
                <div className="flex flex-wrap gap-2">
                  {suggestion.references.map((ref, idx) => (
                    <Badge key={idx} variant="outline">{ref}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-muted-foreground">KPIs Recomendados</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {suggestion.kpis.map((kpi, idx) => (
                  <div key={idx} className="bg-muted/50 rounded-lg p-2 text-center">
                    <p className="text-xs text-muted-foreground">{kpi}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
