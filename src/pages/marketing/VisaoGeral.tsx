import { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { WorkflowNavigation } from "@/components/navigation/WorkflowNavigation";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchFilter } from "@/components/filters/SearchFilter";
import { MarketingCampaignModal } from "@/components/modals/MarketingCampaignModal";
import { Megaphone, Plus, TrendingUp, Target, Eye, Users, BarChart3, Calendar } from "lucide-react";
const MarketingVisaoGeral = () => {
  const allCampaigns: any[] = [];
  const [filteredCampaigns, setFilteredCampaigns] = useState(allCampaigns);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const filterOptions = [{
    key: "type",
    label: "Tipo",
    options: ["Lançamento", "Promoção", "Evento", "Branding"]
  }, {
    key: "status",
    label: "Status",
    options: ["Ativa", "Planejada", "Finalizada", "Pausada"]
  }, {
    key: "platform",
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
      filtered = filtered.filter(campaign => campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) || campaign.platform.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(campaign => {
          if (key === "type") return campaign.type === value;
          if (key === "status") return campaign.status === value;
          if (key === "platform") return campaign.platform.includes(value);
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
            {/* Workflow Navigation */}
            <WorkflowNavigation currentStep="marketing" />
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-foreground">Marketing</h1>
                <p className="text-muted-foreground">
                  Painel principal de campanhas e métricas de marketing
                </p>
              </div>
              <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Nova Campanha
              </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardCard title="Campanhas Ativas" value={0} description="em execução" icon={Megaphone} trend={{
              value: 0,
              isPositive: true
            }} />
              <DashboardCard title="Alcance Total" value="0" description="impressões este mês" icon={Eye} trend={{
              value: 0,
              isPositive: true
            }} />
              <DashboardCard title="Engajamento Médio" value="0%" description="taxa de interação" icon={Target} trend={{
              value: 0,
              isPositive: true
            }} />
              <DashboardCard title="ROI Médio" value="0%" description="retorno sobre investimento" icon={TrendingUp} trend={{
              value: 0,
              isPositive: true
            }} />
            </div>

            {/* Performance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Meta Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0%</div>
                  <p className="text-xs text-muted-foreground">do objetivo alcançado</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Novos Seguidores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+0</div>
                  <p className="text-xs text-muted-foreground">últimos 30 dias</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Conversões</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">leads qualificados</p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <SearchFilter searchPlaceholder="Buscar campanhas por nome ou plataforma..." filters={filterOptions} onSearch={handleSearch} onFilter={handleFilter} onClear={handleClear} />

            {/* Campaigns List */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Campanhas de Marketing</CardTitle>
                <CardDescription>
                  Todas as campanhas e seu desempenho
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredCampaigns.map(campaign => <div key={campaign.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Megaphone className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-medium text-foreground">{campaign.name}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{campaign.type}</Badge>
                            <Badge variant={campaign.status === "Ativa" ? "success" : campaign.status === "Planejada" ? "info" : campaign.status === "Finalizada" ? "outline" : "warning"}>
                              {campaign.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">{campaign.platform}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="text-muted-foreground">Budget</div>
                          <div className="font-medium">{campaign.budget}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">Alcance</div>
                          <div className="font-medium">{campaign.reach}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">Engajamento</div>
                          <div className="font-medium">{campaign.engagement}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">Clicks</div>
                          <div className="font-medium">{campaign.clicks}</div>
                        </div>
                        <Button variant="outline" size="sm">
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>)}
                </div>
              </CardContent>
            </Card>

            {/* Marketing Campaign Modal */}
            <MarketingCampaignModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>;
};
export default MarketingVisaoGeral;