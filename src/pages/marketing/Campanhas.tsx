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
  const allCampaigns: any[] = [];
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
              <DashboardCard title="Campanhas Ativas" value={0} description="em execução" icon={Target} trend={{
              value: 0,
              isPositive: true
            }} />
              <DashboardCard title="Budget Total" value="R$ 0" description="investimento mensal" icon={DollarSign} trend={{
              value: 0,
              isPositive: true
            }} />
              <DashboardCard title="ROI Médio" value="0%" description="retorno sobre investimento" icon={TrendingUp} trend={{
              value: 0,
              isPositive: true
            }} />
              <DashboardCard title="Taxa de Conversão" value="0%" description="média geral" icon={BarChart3} trend={{
              value: 0,
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
                <div className="space-y-6">
                  {filteredCampaigns.map(campaign => <div key={campaign.id} className="p-6 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="space-y-2 flex-1">
                          <h3 className="text-lg font-semibold text-foreground">{campaign.name}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{campaign.objective}</Badge>
                            <Badge variant={campaign.status === "Ativa" ? "success" : campaign.status === "Planejada" ? "info" : campaign.status === "Finalizada" ? "outline" : "warning"}>
                              {campaign.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Público: {campaign.targetAudience}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            Ver
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => {
                            setSelectedCampaign(campaign);
                            setIsModalOpen(true);
                          }}>
                            Editar
                          </Button>
                          <Button variant="outline" size="sm">
                            Excluir
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Budget / Gasto</div>
                          <div className="font-medium">{campaign.budget} / {campaign.spent}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Alcance</div>
                          <div className="font-medium">{campaign.kpis.reach}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">CTR</div>
                          <div className="font-medium">{campaign.kpis.ctr}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">CPC</div>
                          <div className="font-medium">{campaign.kpis.cpc}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {campaign.platforms.map((platform, index) => <Badge key={index} variant="outline" className="text-xs">
                              {platform}
                            </Badge>)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {campaign.startDate} - {campaign.endDate}
                        </div>
                      </div>
                    </div>)}
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