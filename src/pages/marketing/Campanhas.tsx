import { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchFilter } from "@/components/filters/SearchFilter";
import { MarketingCampaignModal } from "@/components/modals/MarketingCampaignModal";
import { Target, Plus, Calendar, Users, DollarSign, TrendingUp, BarChart3, Megaphone } from "lucide-react";
const MarketingCampanhas = () => {
  const allCampaigns = [
    {
      id: "1",
      name: "Lançamento Single 'Noite Estrelada'",
      objective: "Awareness",
      status: "Ativa",
      targetAudience: "Jovens 18-35, fãs de MPB e Pop",
      budget: "R$ 25.000",
      spent: "R$ 18.500",
      platforms: ["Instagram", "TikTok", "Spotify"],
      startDate: "01/12/2024",
      endDate: "31/12/2024",
      kpis: { reach: "1.2M", ctr: "4.5%", cpc: "R$ 0,15" }
    },
    {
      id: "2",
      name: "Turnê Nacional 2025",
      objective: "Conversão",
      status: "Planejada",
      targetAudience: "Fãs existentes, 25-45 anos",
      budget: "R$ 50.000",
      spent: "R$ 0",
      platforms: ["Instagram", "Facebook", "YouTube"],
      startDate: "15/01/2025",
      endDate: "28/02/2025",
      kpis: { reach: "-", ctr: "-", cpc: "-" }
    },
    {
      id: "3",
      name: "Promoção Álbum Completo",
      objective: "Engajamento",
      status: "Ativa",
      targetAudience: "Ouvintes de streaming, todas as idades",
      budget: "R$ 15.000",
      spent: "R$ 12.300",
      platforms: ["Spotify", "YouTube", "TikTok"],
      startDate: "15/11/2024",
      endDate: "15/12/2024",
      kpis: { reach: "850K", ctr: "3.8%", cpc: "R$ 0,18" }
    },
    {
      id: "4",
      name: "Parceria com Influenciadores",
      objective: "Awareness",
      status: "Finalizada",
      targetAudience: "Público Gen Z, 16-24 anos",
      budget: "R$ 30.000",
      spent: "R$ 29.800",
      platforms: ["TikTok", "Instagram"],
      startDate: "01/10/2024",
      endDate: "31/10/2024",
      kpis: { reach: "2.5M", ctr: "5.2%", cpc: "R$ 0,12" }
    },
    {
      id: "5",
      name: "Campanha de Fim de Ano",
      objective: "Tráfego",
      status: "Pausada",
      targetAudience: "Público geral, compradores de ingressos",
      budget: "R$ 20.000",
      spent: "R$ 8.500",
      platforms: ["Facebook", "Instagram", "YouTube"],
      startDate: "20/11/2024",
      endDate: "25/12/2024",
      kpis: { reach: "420K", ctr: "2.9%", cpc: "R$ 0,22" }
    },
    {
      id: "6",
      name: "Lançamento Clipe Oficial",
      objective: "Engajamento",
      status: "Ativa",
      targetAudience: "Fãs de música, 18-40 anos",
      budget: "R$ 35.000",
      spent: "R$ 22.000",
      platforms: ["YouTube", "Instagram", "TikTok"],
      startDate: "05/12/2024",
      endDate: "05/01/2025",
      kpis: { reach: "980K", ctr: "4.1%", cpc: "R$ 0,16" }
    }
  ];
  const [filteredCampaigns, setFilteredCampaigns] = useState(allCampaigns);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const filterOptions = [{
    key: "objective",
    label: "Objetivo",
    options: ["Awareness", "Conversão", "Engajamento", "Tráfego"]
  }, {
    key: "status",
    label: "Status",
    options: ["Ativa", "Planejada", "Finalizada", "Pausada"]
  }, {
    key: "platforms",
    label: "Plataforma",
    options: ["Instagram", "TikTok", "Facebook", "YouTube", "Spotify"]
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
      filtered = filtered.filter(campaign => campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) || campaign.targetAudience.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(campaign => {
          if (key === "objective") return campaign.objective === value;
          if (key === "status") return campaign.status === value;
          if (key === "platforms") return campaign.platforms.includes(value);
          return true;
        });
      }
    });
    setFilteredCampaigns(filtered);
  };
  return <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full h-full px-4 py-4 space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-foreground">Planejamento de Campanhas</h1>
                <p className="text-muted-foreground">
                  Crie, gerencie e monitore campanhas de marketing
                </p>
              </div>
              <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Nova Campanha
              </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardCard title="Campanhas Ativas" value={3} description="em execução" icon={Target} trend={{
              value: 12,
              isPositive: true
            }} />
              <DashboardCard title="Budget Total" value="R$ 175.000" description="investimento mensal" icon={DollarSign} trend={{
              value: 8,
              isPositive: true
            }} />
              <DashboardCard title="ROI Médio" value="245%" description="retorno sobre investimento" icon={TrendingUp} trend={{
              value: 18,
              isPositive: true
            }} />
              <DashboardCard title="Taxa de Conversão" value="4.1%" description="média geral" icon={BarChart3} trend={{
              value: 5,
              isPositive: true
            }} />
            </div>

            {/* Search and Filters */}
            <SearchFilter searchPlaceholder="Buscar campanhas por nome ou público-alvo..." filters={filterOptions} onSearch={handleSearch} onFilter={handleFilter} onClear={handleClear} />

            {/* Campaigns List */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Campanhas de Marketing</CardTitle>
                <CardDescription>
                  Gerencie todas as suas campanhas ativas e planejadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredCampaigns.map(campaign => (
                    <div key={campaign.id} className="p-5 border border-border rounded-lg hover:bg-accent/50 transition-colors flex flex-col">
                      {/* Header com nome e status */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-foreground truncate">{campaign.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">{campaign.objective}</Badge>
                            <Badge 
                              variant={campaign.status === "Ativa" ? "success" : campaign.status === "Planejada" ? "info" : campaign.status === "Finalizada" ? "outline" : "warning"}
                              className="text-xs"
                            >
                              {campaign.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Público alvo */}
                      <p className="text-xs text-muted-foreground mb-3">
                        <span className="font-medium">Público:</span> {campaign.targetAudience}
                      </p>

                      {/* KPIs em grid compacto */}
                      <div className="grid grid-cols-2 gap-3 mb-3 p-3 bg-accent/30 rounded-md">
                        <div>
                          <div className="text-xs text-muted-foreground">Budget</div>
                          <div className="text-sm font-medium">{campaign.budget}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Gasto</div>
                          <div className="text-sm font-medium">{campaign.spent}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Alcance</div>
                          <div className="text-sm font-medium">{campaign.kpis.reach}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">CTR</div>
                          <div className="text-sm font-medium">{campaign.kpis.ctr}</div>
                        </div>
                      </div>

                      {/* Plataformas */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {campaign.platforms.map((platform, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                      </div>

                      {/* Período */}
                      <div className="text-xs text-muted-foreground mb-4">
                        <Calendar className="inline-block h-3 w-3 mr-1" />
                        {campaign.startDate} - {campaign.endDate}
                      </div>

                      {/* Botões de ação */}
                      <div className="flex items-center gap-2 mt-auto pt-3 border-t border-border">
                        <Button variant="outline" size="sm" className="flex-1">
                          Ver
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                          setSelectedCampaign(campaign);
                          setIsModalOpen(true);
                        }}>
                          Editar
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          Excluir
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Campaign Templates */}
            

            <MarketingCampaignModal isOpen={isModalOpen} onClose={() => {
            setIsModalOpen(false);
            setSelectedCampaign(null);
          }} initialData={selectedCampaign} />

          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>;
};
export default MarketingCampanhas;