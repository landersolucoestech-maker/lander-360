import React, { useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, MessageSquare, BarChart3, FileText, History, Lightbulb, Globe, UserCircle, Split, Zap, ClipboardList, TrendingUp } from 'lucide-react';
import { CreativeIdeaGenerator } from '@/components/creative-ai/CreativeIdeaGenerator';
import { CreativeAIChatbot } from '@/components/creative-ai/CreativeAIChatbot';
import { CreativeAIAnalytics } from '@/components/creative-ai/CreativeAIAnalytics';
import { CreativeAIHistory } from '@/components/creative-ai/CreativeAIHistory';
import { ContentSuggestions } from '@/components/creative-ai/ContentSuggestions';
import { SpotifyPitchGenerator } from '@/components/creative-ai/SpotifyPitchGenerator';
import { ArtistProfileAnalyzer } from '@/components/creative-ai/ArtistProfileAnalyzer';
import { ABVariationGenerator } from '@/components/creative-ai/ABVariationGenerator';
import { ContentOptimizer } from '@/components/creative-ai/ContentOptimizer';
import { BriefingAssistant } from '@/components/creative-ai/BriefingAssistant';
import { MarketTrends } from '@/components/creative-ai/MarketTrends';
import { useCreativeAIStats } from '@/hooks/useCreativeAI';

const IACriativa = () => {
  const [activeTab, setActiveTab] = useState('generator');
  const { data: stats } = useCreativeAIStats();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full h-full px-4 py-3 space-y-3">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="h-9 w-9" />
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="h-7 w-7 text-primary" />
                    IA Criativa Inteligente
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Acelere a criação e otimização com IA integrada à estratégia e análise de resultados
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-3">
                <div className="bg-card border border-border rounded-lg px-4 py-2 text-center">
                  <p className="text-2xl font-bold text-primary">{stats?.total || 0}</p>
                  <p className="text-xs text-muted-foreground">Ideias Geradas</p>
                </div>
                <div className="bg-card border border-border rounded-lg px-4 py-2 text-center">
                  <p className="text-2xl font-bold text-green-500">{stats?.usefulRate || 0}%</p>
                  <p className="text-xs text-muted-foreground">Taxa de Utilidade</p>
                </div>
                <div className="bg-card border border-border rounded-lg px-4 py-2 text-center">
                  <p className="text-2xl font-bold text-blue-500">
                    {stats?.growthPercent !== undefined && stats.growthPercent > 0 ? '+' : ''}
                    {stats?.growthPercent || 0}%
                  </p>
                  <p className="text-xs text-muted-foreground">Este Mês</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/50 p-1">
                <TabsTrigger value="generator" className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Gerador de Ideias
                </TabsTrigger>
                <TabsTrigger value="ab-variations" className="flex items-center gap-2">
                  <Split className="h-4 w-4" />
                  Variações A/B
                </TabsTrigger>
                <TabsTrigger value="optimizer" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Otimizador
                </TabsTrigger>
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Sugestões
                </TabsTrigger>
                <TabsTrigger value="briefing" className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Briefing
                </TabsTrigger>
                <TabsTrigger value="chatbot" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Assistente
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <UserCircle className="h-4 w-4" />
                  Perfil
                </TabsTrigger>
                <TabsTrigger value="pitch" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Pitching
                </TabsTrigger>
                <TabsTrigger value="trends" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Tendências
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Histórico
                </TabsTrigger>
              </TabsList>

              <TabsContent value="generator" className="mt-6">
                <CreativeIdeaGenerator />
              </TabsContent>

              <TabsContent value="ab-variations" className="mt-6">
                <ABVariationGenerator />
              </TabsContent>

              <TabsContent value="optimizer" className="mt-6">
                <ContentOptimizer />
              </TabsContent>

              <TabsContent value="content" className="mt-6">
                <ContentSuggestions />
              </TabsContent>

              <TabsContent value="briefing" className="mt-6">
                <BriefingAssistant />
              </TabsContent>

              <TabsContent value="chatbot" className="mt-6">
                <CreativeAIChatbot />
              </TabsContent>

              <TabsContent value="profile" className="mt-6">
                <ArtistProfileAnalyzer />
              </TabsContent>

              <TabsContent value="pitch" className="mt-6">
                <SpotifyPitchGenerator />
              </TabsContent>

              <TabsContent value="trends" className="mt-6">
                <MarketTrends />
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <CreativeAIAnalytics />
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <CreativeAIHistory />
              </TabsContent>
            </Tabs>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default IACriativa;
