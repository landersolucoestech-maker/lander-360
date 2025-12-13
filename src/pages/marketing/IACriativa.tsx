import React, { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, MessageSquare, BarChart3, FileText, History, Lightbulb, Zap, Globe, UserCircle } from 'lucide-react';
import { CreativeIdeaGenerator } from '@/components/creative-ai/CreativeIdeaGenerator';
import { CreativeAIChatbot } from '@/components/creative-ai/CreativeAIChatbot';
import { CreativeAIAnalytics } from '@/components/creative-ai/CreativeAIAnalytics';
import { CreativeAIHistory } from '@/components/creative-ai/CreativeAIHistory';
import { ContentSuggestions } from '@/components/creative-ai/ContentSuggestions';
import { CreativeAIAutomations } from '@/components/creative-ai/CreativeAIAutomations';
import { SpotifyPitchGenerator } from '@/components/creative-ai/SpotifyPitchGenerator';
import { ArtistProfileAnalyzer } from '@/components/creative-ai/ArtistProfileAnalyzer';
import { useCreativeAIStats } from '@/hooks/useCreativeAI';

const IACriativa = () => {
  const [activeTab, setActiveTab] = useState('generator');
  const { data: stats } = useCreativeAIStats();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="h-7 w-7 text-primary" />
                  IA Criativa Inteligente
                </h1>
                <p className="text-muted-foreground mt-1">
                  Gere ideias criativas, estratégias de marketing e conteúdos personalizados com IA
                </p>
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
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <UserCircle className="h-4 w-4" />
                  Análise de Perfil
                </TabsTrigger>
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Sugestões de Conteúdo
                </TabsTrigger>
                <TabsTrigger value="chatbot" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Assistente IA
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Análise de Dados
                </TabsTrigger>
                <TabsTrigger value="automations" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Automações
                </TabsTrigger>
                <TabsTrigger value="pitch" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Pitching Editorial
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Histórico
                </TabsTrigger>
              </TabsList>

              <TabsContent value="generator" className="mt-6">
                <CreativeIdeaGenerator />
              </TabsContent>

              <TabsContent value="profile" className="mt-6">
                <ArtistProfileAnalyzer />
              </TabsContent>

              <TabsContent value="content" className="mt-6">
                <ContentSuggestions />
              </TabsContent>

              <TabsContent value="chatbot" className="mt-6">
                <CreativeAIChatbot />
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <CreativeAIAnalytics />
              </TabsContent>

              <TabsContent value="automations" className="mt-6">
                <CreativeAIAutomations />
              </TabsContent>

              <TabsContent value="pitch" className="mt-6">
                <SpotifyPitchGenerator />
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <CreativeAIHistory />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default IACriativa;
