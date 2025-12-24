import { useState, useEffect, useMemo } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchFilter } from "@/components/filters/SearchFilter";
import { useMarketingCampaigns } from "@/hooks/useMarketing";
import { usePaidCampaigns } from "@/hooks/usePaidCampaigns";
import { useArtists } from "@/hooks/useArtists";
import { useReleases } from "@/hooks/useReleases";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Target, Plus, Calendar, DollarSign, TrendingUp, BarChart3, Megaphone, MousePointer, Eye, Pencil, Trash2, Facebook, Instagram, Music2, Play, Sparkles } from "lucide-react";
import { formatDateBR } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const platformOptions = [
  { id: "facebook", label: "Facebook", icon: Facebook },
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "tiktok", label: "TikTok", icon: Play },
  { id: "spotify", label: "Spotify Ad Studio", icon: Music2 },
  { id: "youtube", label: "YouTube Ads", icon: Play },
  { id: "google", label: "Google Ads", icon: Target },
];

const campaignTypes = [
  { id: "awareness", label: "Reconhecimento" },
  { id: "traffic", label: "Tráfego" },
  { id: "conversion", label: "Conversão" },
  { id: "engagement", label: "Engajamento" },
];

const MarketingCampanhas = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: dbCampaigns, isLoading } = useMarketingCampaigns();
  const { campaigns: paidCampaigns, metrics, deleteCampaign } = usePaidCampaigns();
  const artistsQuery = useArtists();
  const releasesQuery = useReleases();
  const artists = artistsQuery.data || [];
  const releases = releasesQuery.data || [];

  const [filteredCampaigns, setFilteredCampaigns] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    objective: "",
    target_audience: "",
    status: "planning",
    // Tráfego pago fields
    platform: [] as string[],
    campaign_type: "",
    artist_id: "",
    release_id: "",
    daily_budget: 10,
    duration_days: 7,
    ad_url: "",
    landing_url: "",
    // Configurações avançadas
    geo_targeting: "",
    age_range: "18-35",
    interests: "",
  });

  // Merge campaigns from both sources
  const allCampaigns = useMemo(() => {
    const marketing = (dbCampaigns || []).map(c => ({ ...c, source: 'marketing' }));
    const paid = (paidCampaigns || []).map(c => ({ ...c, source: 'paid' }));
    return [...marketing, ...paid];
  }, [dbCampaigns, paidCampaigns]);

  useEffect(() => {
    setFilteredCampaigns(allCampaigns);
  }, [allCampaigns]);

  const totalBudget = formData.daily_budget * formData.duration_days;

  const filterOptions = [{
    key: "status",
    label: "Status",
    options: ["Planejada", "Ativa", "Pausada", "Finalizada"]
  }];

  const handleSearch = (searchTerm: string) => {
    filterCampaigns(searchTerm, {});
  };

  const handleFilter = (filters: Record<string, string>) => {
    filterCampaigns("", filters);
  };

  const handleClear = () => {
    setFilteredCampaigns(allCampaigns);
  };

  const filterCampaigns = (searchTerm: string, filters: Record<string, string>) => {
    let filtered = allCampaigns;
    if (searchTerm) {
      filtered = filtered.filter(campaign => 
        campaign.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        campaign.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(campaign => {
          if (key === "status") {
            const statusTranslation: Record<string, string> = {
              'Planejada': 'planning',
              'Ativa': 'active',
              'Pausada': 'paused',
              'Finalizada': 'completed'
            };
            return campaign.status === statusTranslation[value] || campaign.status === value.toLowerCase();
          }
          return true;
        });
      }
    });
    setFilteredCampaigns(filtered);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      objective: "",
      target_audience: "",
      status: "planning",
      platform: [],
      campaign_type: "",
      artist_id: "",
      release_id: "",
      daily_budget: 10,
      duration_days: 7,
      ad_url: "",
      landing_url: "",
      geo_targeting: "",
      age_range: "18-35",
      interests: "",
    });
    setEditingCampaign(null);
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast({ title: "Nome é obrigatório", variant: "destructive" });
      return;
    }

    try {
      // Save to paid_campaigns table (unified)
      const payload = {
        name: formData.name,
        description: formData.description,
        platform: formData.platform[0] || 'meta',
        campaign_type: formData.campaign_type || formData.objective,
        artist_id: formData.artist_id || null,
        release_id: formData.release_id || null,
        budget: totalBudget,
        daily_budget: formData.daily_budget,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + formData.duration_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: formData.status === 'planning' ? 'draft' : formData.status,
        ad_url: formData.ad_url || null,
        landing_url: formData.landing_url || null,
        target_audience: {
          geo: formData.geo_targeting,
          age: formData.age_range,
          interests: formData.interests,
        },
      };

      if (editingCampaign?.source === 'paid' || editingCampaign?.id) {
        const { error } = await supabase
          .from('paid_campaigns')
          .update(payload)
          .eq('id', editingCampaign.id);
        if (error) throw error;
        toast({ title: "Campanha atualizada com sucesso" });
      } else {
        const { error } = await supabase
          .from('paid_campaigns')
          .insert([payload]);
        if (error) throw error;
        toast({ title: "Campanha criada com sucesso" });
      }

      queryClient.invalidateQueries({ queryKey: ['paid-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao salvar campanha", variant: "destructive" });
    }
  };

  const handleEdit = (campaign: any) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name || "",
      description: campaign.description || "",
      objective: campaign.objective || campaign.campaign_type || "",
      target_audience: typeof campaign.target_audience === 'string' ? campaign.target_audience : "",
      status: campaign.status || "planning",
      platform: campaign.platform ? [campaign.platform] : [],
      campaign_type: campaign.campaign_type || "",
      artist_id: campaign.artist_id || "",
      release_id: campaign.release_id || "",
      daily_budget: campaign.daily_budget || 10,
      duration_days: campaign.end_date && campaign.start_date 
        ? Math.ceil((new Date(campaign.end_date).getTime() - new Date(campaign.start_date).getTime()) / (1000 * 60 * 60 * 24))
        : 7,
      ad_url: campaign.ad_url || "",
      landing_url: campaign.landing_url || "",
      geo_targeting: campaign.target_audience?.geo || "",
      age_range: campaign.target_audience?.age || "18-35",
      interests: campaign.target_audience?.interests || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (campaign: any) => {
    if (campaign.source === 'paid') {
      deleteCampaign.mutate(campaign.id);
    }
  };

  const handlePlatformToggle = (platformId: string) => {
    setFormData(prev => ({
      ...prev,
      platform: prev.platform.includes(platformId)
        ? prev.platform.filter(p => p !== platformId)
        : [...prev.platform, platformId]
    }));
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return "R$ 0";
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active": return <Badge className="bg-green-500/20 text-green-400">Ativa</Badge>;
      case "planning":
      case "draft": return <Badge className="bg-blue-500/20 text-blue-400">Planejada</Badge>;
      case "completed": return <Badge variant="outline">Finalizada</Badge>;
      case "paused": return <Badge className="bg-yellow-500/20 text-yellow-400">Pausada</Badge>;
      default: return <Badge variant="secondary">{status || "Indefinido"}</Badge>;
    }
  };

  // Calculate KPIs
  const activeCampaigns = allCampaigns.filter(c => c.status === "active").length;
  const totalBudgetKpi = allCampaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
  const totalSpent = allCampaigns.reduce((sum, c) => sum + (c.spent || 0), 0);
  const avgCtr = metrics.avgCtr || 0;

  // Get selected release for preview
  const selectedRelease = releases.find(r => r.id === formData.release_id);
  const selectedArtist = artists.find(a => a.id === formData.artist_id);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full h-full px-4 py-3 space-y-3">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="h-9 w-9" />
                <div className="flex flex-col gap-2">
                  <h1 className="text-3xl font-bold text-foreground">Campanhas de Marketing</h1>
                  <p className="text-muted-foreground">
                    Planeje, execute e monitore campanhas de marketing e tráfego pago
                  </p>
                </div>
              </div>
              <Button className="gap-2" onClick={() => { resetForm(); setIsModalOpen(true); }}>
                <Plus className="h-4 w-4" />
                Nova Campanha
              </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <DashboardCard 
                title="Campanhas Ativas" 
                value={activeCampaigns} 
                description="em execução" 
                icon={Target} 
                trend={{ value: 0, isPositive: true }} 
              />
              <DashboardCard 
                title="Budget Total" 
                value={formatCurrency(totalBudgetKpi)} 
                description="investimento" 
                icon={DollarSign} 
                trend={{ value: 0, isPositive: true }} 
              />
              <DashboardCard 
                title="Gasto Total" 
                value={formatCurrency(totalSpent)} 
                description="executado" 
                icon={TrendingUp} 
                trend={{ value: 0, isPositive: true }} 
              />
              <DashboardCard 
                title="Cliques" 
                value={metrics.totalClicks.toLocaleString('pt-BR')} 
                description="total" 
                icon={MousePointer} 
                trend={{ value: 0, isPositive: true }} 
              />
              <DashboardCard 
                title="CTR Médio" 
                value={`${avgCtr.toFixed(2)}%`} 
                description="taxa de clique" 
                icon={BarChart3} 
                trend={{ value: 0, isPositive: true }} 
              />
            </div>

            {/* Search and Filters */}
            <SearchFilter 
              searchPlaceholder="Buscar campanhas por nome ou descrição..." 
              filters={filterOptions} 
              onSearch={handleSearch} 
              onFilter={handleFilter} 
              onClear={handleClear} 
            />

            {/* Campaigns List */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Todas as Campanhas</CardTitle>
                <CardDescription>
                  Gerencie campanhas de marketing e tráfego pago em um só lugar
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Carregando...</div>
                ) : filteredCampaigns.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma campanha cadastrada</h3>
                    <p className="text-muted-foreground mb-4">Comece criando sua primeira campanha</p>
                    <Button onClick={() => { resetForm(); setIsModalOpen(true); }} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Criar Primeira Campanha
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredCampaigns.map(campaign => (
                      <div key={campaign.id} className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                          {/* Info principal */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-base font-semibold text-foreground truncate">{campaign.name}</h3>
                              {getStatusBadge(campaign.status)}
                              {campaign.platform && (
                                <Badge variant="outline" className="text-xs">{campaign.platform}</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {campaign.artists?.name || campaign.artists?.name ? (
                                <span>{campaign.artists?.name || campaign.artists?.name}</span>
                              ) : null}
                              {campaign.start_date && campaign.end_date && (
                                <span className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {formatDateBR(campaign.start_date)} - {formatDateBR(campaign.end_date)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* KPIs */}
                          <div className="flex items-center gap-6 text-sm">
                            <div className="text-center">
                              <div className="text-xs text-muted-foreground">Budget</div>
                              <div className="font-medium">{formatCurrency(campaign.budget)}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-muted-foreground">Gasto</div>
                              <div className="font-medium">{formatCurrency(campaign.spent)}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-muted-foreground">Cliques</div>
                              <div className="font-medium">{campaign.clicks?.toLocaleString() || "-"}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-muted-foreground">CTR</div>
                              <div className="font-medium">{campaign.ctr ? `${campaign.ctr}%` : "-"}</div>
                            </div>
                          </div>

                          {/* Ações */}
                          <div className="flex items-center gap-2 shrink-0">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(campaign)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(campaign)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Campaign Modal - Unified Form */}
            <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) resetForm(); }}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingCampaign ? "Editar Campanha" : "Nova Campanha"}</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
                  {/* Left Column - Configuration */}
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                      <div>
                        <Label>Nome da Campanha *</Label>
                        <Input 
                          value={formData.name} 
                          onChange={e => setFormData({...formData, name: e.target.value})} 
                          placeholder="Ex: Lançamento Single 2024" 
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Artista</Label>
                          <Select 
                            value={formData.artist_id} 
                            onValueChange={v => setFormData({...formData, artist_id: v, release_id: ""})}
                          >
                            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                            <SelectContent>
                              {artists.map(a => (
                                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Lançamento</Label>
                          <Select 
                            value={formData.release_id} 
                            onValueChange={v => setFormData({...formData, release_id: v})}
                            disabled={!formData.artist_id}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={formData.artist_id ? "Selecione" : "Selecione um artista primeiro"} />
                            </SelectTrigger>
                            <SelectContent>
                              {releases
                                .filter(r => r.artist_id === formData.artist_id)
                                .map(r => (
                                  <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
                                ))}
                              {releases.filter(r => r.artist_id === formData.artist_id).length === 0 && (
                                <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                                  Nenhum lançamento encontrado
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Platform Selection */}
                    <div className="space-y-3">
                      <Label>Plataformas de Anúncio</Label>
                      <div className="flex flex-wrap gap-2">
                        {platformOptions.map(platform => {
                          const Icon = platform.icon;
                          const isSelected = formData.platform.includes(platform.id);
                          return (
                            <Button
                              key={platform.id}
                              type="button"
                              variant={isSelected ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePlatformToggle(platform.id)}
                              className="gap-2"
                            >
                              <Icon className="h-4 w-4" />
                              {platform.label}
                            </Button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Budget */}
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                      <div className="text-center">
                        <Label className="text-muted-foreground">Orçamento diário</Label>
                        <div className="flex items-center justify-center gap-2 my-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => setFormData({...formData, daily_budget: Math.max(5, formData.daily_budget - 5)})}
                          >
                            -
                          </Button>
                          <span className="text-3xl font-bold">R$ {formData.daily_budget}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => setFormData({...formData, daily_budget: formData.daily_budget + 5})}
                          >
                            +
                          </Button>
                        </div>
                        <Slider
                          value={[formData.daily_budget]}
                          onValueChange={([v]) => setFormData({...formData, daily_budget: v})}
                          min={5}
                          max={500}
                          step={5}
                          className="my-4"
                        />
                      </div>

                      <div className="text-center">
                        <Label className="text-muted-foreground">Duração</Label>
                        <div className="flex items-center justify-center gap-2 my-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => setFormData({...formData, duration_days: Math.max(1, formData.duration_days - 1)})}
                          >
                            -
                          </Button>
                          <span className="text-2xl font-bold">{formData.duration_days} dias</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => setFormData({...formData, duration_days: formData.duration_days + 1})}
                          >
                            +
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          R$ {totalBudget} / {formData.duration_days} dias
                        </p>
                      </div>
                    </div>

                    {/* Type and Status */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Objetivo</Label>
                        <Select value={formData.campaign_type} onValueChange={v => setFormData({...formData, campaign_type: v})}>
                          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>
                            {campaignTypes.map(t => (
                              <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="planning">Planejada</SelectItem>
                            <SelectItem value="active">Ativa</SelectItem>
                            <SelectItem value="paused">Pausada</SelectItem>
                            <SelectItem value="completed">Finalizada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Advanced Settings */}
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="engagement">
                        <AccordionTrigger>
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            Engajamento de Fãs
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-3 pt-2">
                          <div>
                            <Label>Público-alvo</Label>
                            <Textarea 
                              value={formData.target_audience} 
                              onChange={e => setFormData({...formData, target_audience: e.target.value})}
                              placeholder="Ex: Fãs de funk, 18-35 anos" 
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="geo">
                        <AccordionTrigger>
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Segmentação Geográfica
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-3 pt-2">
                          <div>
                            <Label>Cidades/Países</Label>
                            <Input 
                              value={formData.geo_targeting} 
                              onChange={e => setFormData({...formData, geo_targeting: e.target.value})}
                              placeholder="Ex: Brasil, São Paulo, Rio de Janeiro" 
                            />
                          </div>
                          <div>
                            <Label>Faixa Etária</Label>
                            <Select value={formData.age_range} onValueChange={v => setFormData({...formData, age_range: v})}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="13-17">13-17 anos</SelectItem>
                                <SelectItem value="18-24">18-24 anos</SelectItem>
                                <SelectItem value="18-35">18-35 anos</SelectItem>
                                <SelectItem value="25-44">25-44 anos</SelectItem>
                                <SelectItem value="35-54">35-54 anos</SelectItem>
                                <SelectItem value="55+">55+ anos</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="creative">
                        <AccordionTrigger>
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Criativos de Anúncio
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-3 pt-2">
                          <div>
                            <Label>URL do Anúncio</Label>
                            <Input 
                              value={formData.ad_url} 
                              onChange={e => setFormData({...formData, ad_url: e.target.value})}
                              placeholder="https://" 
                            />
                          </div>
                          <div>
                            <Label>Landing Page</Label>
                            <Input 
                              value={formData.landing_url} 
                              onChange={e => setFormData({...formData, landing_url: e.target.value})}
                              placeholder="https://" 
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    <div>
                      <Label>Descrição</Label>
                      <Textarea 
                        value={formData.description} 
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        placeholder="Observações da campanha" 
                      />
                    </div>
                  </div>

                  {/* Right Column - Preview */}
                  <div className="space-y-4">
                    {/* Release Preview Card */}
                    {(selectedRelease || selectedArtist) && (
                      <Card className="overflow-hidden">
                        <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative">
                          {selectedRelease?.cover_url ? (
                            <img src={selectedRelease.cover_url} alt={selectedRelease.title} className="w-full h-full object-cover" />
                          ) : (
                            <Music2 className="h-24 w-24 text-muted-foreground/50" />
                          )}
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="bg-background/80 backdrop-blur-sm rounded-lg p-3">
                              <p className="font-semibold">{selectedRelease?.title || "Selecione um lançamento"}</p>
                              <p className="text-sm text-muted-foreground">{selectedArtist?.name || selectedArtist?.name || "Artista"}</p>
                              {selectedRelease?.genre && (
                                <Badge variant="secondary" className="mt-2">{selectedRelease.genre}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}

                    {/* Campaign Summary */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Resumo da Campanha</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Plataformas</span>
                          <span className="font-medium">{formData.platform.length || 0} selecionadas</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Orçamento diário</span>
                          <span className="font-medium">R$ {formData.daily_budget}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duração</span>
                          <span className="font-medium">{formData.duration_days} dias</span>
                        </div>
                        <div className="flex justify-between border-t pt-3">
                          <span className="font-semibold">Total</span>
                          <span className="font-bold text-lg">R$ {totalBudget}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Button onClick={handleSubmit} className="w-full" size="lg" disabled={!formData.name}>
                      {editingCampaign ? "Atualizar Campanha" : "Criar Campanha"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MarketingCampanhas;
