import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, TrendingDown, Loader2, RefreshCw, Calendar, Users, Eye, Heart } from 'lucide-react';
import { useArtists } from '@/hooks/useArtists';
import { useSocialMediaMetrics } from '@/hooks/useMarketing';
import { useMarketingCampaigns } from '@/hooks/useMarketing';
import { useAnalyzeData, useCreativeAIStats } from '@/hooks/useCreativeAI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { AIProviderSelector } from './AIProviderSelector';
import { AIProvider } from '@/hooks/useAI';

const COLORS = ['hsl(var(--primary))', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export const CreativeAIAnalytics = () => {
  const { data: artists } = useArtists();
  const { data: metrics } = useSocialMediaMetrics();
  const { data: campaigns } = useMarketingCampaigns();
  const { data: aiStats } = useCreativeAIStats();
  const analyzeData = useAnalyzeData();
  
  const [selectedArtist, setSelectedArtist] = useState<string>('');
  const [period, setPeriod] = useState<string>('30');
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | 'auto'>('auto');

  const handleAnalyze = async () => {
    // Prepare data for analysis
    const analysisData = {
      campaigns: campaigns?.slice(0, 10),
      metrics: metrics,
      aiStats,
      period,
    };

    try {
      const result = await analyzeData.mutateAsync(analysisData);
      setAiInsights(result);
    } catch (error) {
      console.error('Error analyzing data:', error);
    }
  };

  // KPI Cards data
  const kpis = [
    {
      title: 'Ideias Geradas',
      value: aiStats?.total || 0,
      trend: aiStats?.growthPercent || 0,
      icon: BarChart3,
      color: 'text-primary',
    },
    {
      title: 'Taxa de Utilidade',
      value: `${aiStats?.usefulRate || 0}%`,
      trend: 0,
      icon: Heart,
      color: 'text-green-500',
    },
    {
      title: 'Este Mês',
      value: aiStats?.thisMonthCount || 0,
      trend: aiStats?.growthPercent || 0,
      icon: Calendar,
      color: 'text-blue-500',
    },
    {
      title: 'Campanhas Ativas',
      value: campaigns?.filter(c => c.status === 'active').length || 0,
      trend: 0,
      icon: Users,
      color: 'text-purple-500',
    },
  ];

  // Chart data for ideas by objective
  const objectiveData = Object.entries(aiStats?.byObjective || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  // Chart data for ideas by channel
  const channelData = Object.entries(aiStats?.byChannel || {}).map(([name, value]) => ({
    name,
    value,
  }));

  // Campaigns performance data
  const campaignData = campaigns?.slice(0, 5).map(c => ({
    name: c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name,
    reach: c.reach || 0,
    clicks: c.clicks || 0,
    conversions: c.conversions || 0,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[150px]">
              <AIProviderSelector value={selectedProvider} onChange={setSelectedProvider} />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Select value={selectedArtist || 'all'} onValueChange={(value) => setSelectedArtist(value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por artista" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os artistas</SelectItem>
                  {artists?.filter(artist => artist.id).map(artist => (
                    <SelectItem key={artist.id} value={artist.id}>
                      {artist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                  <SelectItem value="365">Último ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAnalyze} disabled={analyzeData.isPending}>
              {analyzeData.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Analisar com IA
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <Card key={idx}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-muted ${kpi.color}`}>
                  <kpi.icon className="h-5 w-5" />
                </div>
              </div>
              {kpi.trend !== 0 && (
                <div className={`flex items-center gap-1 mt-2 text-sm ${kpi.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {kpi.trend > 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span>{Math.abs(kpi.trend)}% vs mês anterior</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ideas by Objective */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ideias por Objetivo</CardTitle>
          </CardHeader>
          <CardContent>
            {objectiveData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={objectiveData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {objectiveData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ideas by Channel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ideias por Canal</CardTitle>
          </CardHeader>
          <CardContent>
            {channelData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={channelData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>

        {/* Campaigns Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Performance das Campanhas</CardTitle>
          </CardHeader>
          <CardContent>
            {campaignData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={campaignData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="reach" fill="hsl(var(--primary))" name="Alcance" />
                  <Bar dataKey="clicks" fill="#10B981" name="Cliques" />
                  <Bar dataKey="conversions" fill="#F59E0B" name="Conversões" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhuma campanha encontrada
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {aiInsights && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Insights da IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiInsights.summary && (
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Resumo Executivo</h4>
                <p className="text-sm text-muted-foreground">{aiInsights.summary}</p>
              </div>
            )}

            {aiInsights.recommendations && (
              <div>
                <h4 className="font-medium mb-2">Recomendações</h4>
                <ul className="space-y-2">
                  {aiInsights.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Badge variant="outline" className="shrink-0">{idx + 1}</Badge>
                      <span className="text-muted-foreground">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {aiInsights.kpis && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {aiInsights.kpis.map((kpi: any, idx: number) => (
                  <div key={idx} className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">{kpi.name}</p>
                    <p className="text-lg font-bold">{kpi.value}</p>
                    {kpi.trend && (
                      <p className={`text-xs ${kpi.trend.includes('+') ? 'text-green-500' : 'text-red-500'}`}>
                        {kpi.trend}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
