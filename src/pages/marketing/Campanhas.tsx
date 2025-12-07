import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchFilter } from "@/components/filters/SearchFilter";
import { MarketingCampaignModal } from "@/components/modals/MarketingCampaignModal";
import { useMarketingCampaigns } from "@/hooks/useMarketing";
import { Target, Plus, Calendar, DollarSign, TrendingUp, BarChart3, Megaphone } from "lucide-react";
import { formatDateBR } from "@/lib/utils";

const MarketingCampanhas = () => {
  const { data: dbCampaigns, isLoading } = useMarketingCampaigns();
  const [filteredCampaigns, setFilteredCampaigns] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => {
    if (dbCampaigns) {
      setFilteredCampaigns(dbCampaigns);
    }
  }, [dbCampaigns]);

  const allCampaigns = dbCampaigns || [];

  const filterOptions = [{
    key: "status",
    label: "Status",
    options: ["planning", "active", "paused", "completed"]
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
          if (key === "status") return campaign.status === value;
          return true;
        });
      }
    });
    setFilteredCampaigns(filtered);
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return "R$ 0";
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active": return <Badge variant="success">Ativa</Badge>;
      case "planning": return <Badge variant="info">Planejada</Badge>;
      case "completed": return <Badge variant="outline">Finalizada</Badge>;
      case "paused": return <Badge variant="warning">Pausada</Badge>;
      default: return <Badge variant="secondary">{status || "Indefinido"}</Badge>;
    }
  };

  // Calculate KPIs
  const activeCampaigns = allCampaigns.filter(c => c.status === "active").length;
  const totalBudget = allCampaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
  const totalSpent = allCampaigns.reduce((sum, c) => sum + (c.spent || 0), 0);
  const avgRoas = allCampaigns.length > 0 
    ? allCampaigns.reduce((sum, c) => sum + (c.roas || 0), 0) / allCampaigns.length 
    : 0;
  const avgCtr = allCampaigns.length > 0 
    ? allCampaigns.reduce((sum, c) => sum + (c.ctr || 0), 0) / allCampaigns.length 
    : 0;

  return (
    <SidebarProvider>
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
              <DashboardCard 
                title="Campanhas Ativas" 
                value={activeCampaigns} 
                description="em execução" 
                icon={Target} 
                trend={{ value: 0, isPositive: true }} 
              />
              <DashboardCard 
                title="Budget Total" 
                value={formatCurrency(totalBudget)} 
                description="investimento total" 
                icon={DollarSign} 
                trend={{ value: 0, isPositive: true }} 
              />
              <DashboardCard 
                title="ROI Médio" 
                value={`${avgRoas.toFixed(0)}%`} 
                description="retorno sobre investimento" 
                icon={TrendingUp} 
                trend={{ value: 0, isPositive: true }} 
              />
              <DashboardCard 
                title="Taxa de Conversão" 
                value={`${avgCtr.toFixed(1)}%`} 
                description="média geral" 
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
                <CardTitle>Campanhas de Marketing</CardTitle>
                <CardDescription>
                  Gerencie todas as suas campanhas ativas e planejadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Carregando...</div>
                ) : filteredCampaigns.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma campanha cadastrada</h3>
                    <p className="text-muted-foreground mb-4">Comece criando sua primeira campanha de marketing</p>
                    <Button onClick={() => setIsModalOpen(true)} className="gap-2">
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
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {campaign.description && <span>{campaign.description}</span>}
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
                              <div className="text-xs text-muted-foreground">Alcance</div>
                              <div className="font-medium">{campaign.reach?.toLocaleString() || "-"}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-muted-foreground">CTR</div>
                              <div className="font-medium">{campaign.ctr ? `${campaign.ctr}%` : "-"}</div>
                            </div>
                          </div>

                          {/* Ações */}
                          <div className="flex items-center gap-2 shrink-0">
                            <Button variant="outline" size="sm">Ver</Button>
                            <Button variant="outline" size="sm" onClick={() => {
                              setSelectedCampaign(campaign);
                              setIsModalOpen(true);
                            }}>Editar</Button>
                            <Button variant="outline" size="sm">Excluir</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <MarketingCampaignModal 
              isOpen={isModalOpen} 
              onClose={() => {
                setIsModalOpen(false);
                setSelectedCampaign(null);
              }} 
              initialData={selectedCampaign} 
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MarketingCampanhas;
