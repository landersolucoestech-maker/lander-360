import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchFilter } from "@/components/filters/SearchFilter";
import { MarketingBriefingModal } from "@/components/modals/MarketingBriefingModal";
import { FileText, Plus, Clock, CheckCircle, AlertTriangle, User } from "lucide-react";
import { useMarketingBriefings, useMarketingStats } from "@/hooks/useMarketing";

const MarketingBriefing = () => {
  const { data: briefings = [], isLoading: briefingsLoading } = useMarketingBriefings();
  const { data: stats, isLoading: statsLoading } = useMarketingStats();
  const [filteredBriefings, setFilteredBriefings] = useState(briefings);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBriefing, setSelectedBriefing] = useState(null);
  const filterOptions = [{
    key: "status",
    label: "Status",
    options: ["Pendente", "Em Revisão", "Aprovado", "Rejeitado"]
  }, {
    key: "priority",
    label: "Prioridade",
    options: ["Alta", "Média", "Baixa"]
  }, {
    key: "createdBy",
    label: "Criado por", 
    options: [] // Will be populated from database
  }];
  const handleSearch = (searchTerm: string) => {
    filterBriefings(searchTerm, {});
  };
  const handleFilter = (filters: Record<string, string>) => {
    filterBriefings("", filters);
  };
  const handleClear = () => {
    setFilteredBriefings(briefings);
  };
  const filterBriefings = (searchTerm: string, filters: Record<string, string>) => {
    let filtered = briefings;
    if (searchTerm) {
      filtered = filtered.filter(briefing => 
        briefing.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (briefing.campaign && briefing.campaign.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (briefing.description && briefing.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(briefing => {
          if (key === "status") return briefing.status === value;
          if (key === "priority") return briefing.priority === value;
          if (key === "createdBy") return briefing.created_by_name === value;
          return true;
        });
      }
    });
    setFilteredBriefings(filtered);
  };

  // Update filtered briefings when briefings change
  useEffect(() => {
    setFilteredBriefings(briefings);
  }, [briefings]);
  return <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full h-full px-4 py-4 space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-foreground">Central de Briefing</h1>
                <p className="text-muted-foreground">
                  Gerencie briefings e diretrizes para campanhas de marketing
                </p>
              </div>
              <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Novo Briefing
              </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardCard 
                title="Briefings Ativos" 
                value={statsLoading ? "..." : stats?.briefings.active || 0} 
                description="em desenvolvimento" 
                icon={FileText} 
                trend={{ value: 15.2, isPositive: true }} 
              />
              <DashboardCard 
                title="Pendentes Aprovação" 
                value={statsLoading ? "..." : stats?.briefings.pending || 0} 
                description="aguardando review" 
                icon={Clock} 
                trend={{ value: 8.3, isPositive: false }} 
              />
              <DashboardCard 
                title="Aprovados este mês" 
                value={statsLoading ? "..." : stats?.briefings.approved || 0} 
                description="prontos para execução" 
                icon={CheckCircle} 
                trend={{ value: 22.1, isPositive: true }} 
              />
              <DashboardCard 
                title="Total de Briefings" 
                value={statsLoading ? "..." : stats?.briefings.total || 0} 
                description="no sistema" 
                icon={AlertTriangle} 
                trend={{ value: 12.5, isPositive: true }} 
              />
            </div>

            {/* Quick Actions */}
            

            {/* Search and Filters */}
            <SearchFilter searchPlaceholder="Buscar briefings por título, campanha ou descrição..." filters={filterOptions} onSearch={handleSearch} onFilter={handleFilter} onClear={handleClear} />

            {/* Briefings List */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Briefings de Marketing</CardTitle>
                <CardDescription>
                  Todos os briefings e diretrizes de campanhas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {briefingsLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Carregando briefings...
                    </div>
                  ) : filteredBriefings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum briefing encontrado
                    </div>
                  ) : (
                    filteredBriefings.map(briefing => (
                      <div key={briefing.id} className="p-6 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                          <div className="space-y-2 flex-1">
                            <h3 className="text-lg font-semibold text-foreground">{briefing.title}</h3>
                            <p className="text-sm text-muted-foreground">{briefing.description}</p>
                            {briefing.campaign && (
                              <div className="text-xs text-muted-foreground">
                                Campanha: {briefing.campaign}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Badge variant={
                              briefing.status === "Aprovado" ? "default" : 
                              briefing.status === "Em Revisão" ? "secondary" : 
                              briefing.status === "Rejeitado" ? "destructive" : "outline"
                            }>
                              {briefing.status}
                            </Badge>
                            <Badge variant={
                              briefing.priority === "Alta" ? "destructive" : 
                              briefing.priority === "Média" ? "secondary" : "outline"
                            }>
                              {briefing.priority}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-muted-foreground mb-2">Entregáveis:</div>
                            <div className="flex flex-wrap gap-1">
                              {briefing.deliverables?.map((deliverable, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {deliverable}
                                </Badge>
                              )) || <span className="text-sm text-muted-foreground">Nenhum entregável definido</span>}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground mb-2">Público-alvo:</div>
                            <div className="text-sm">{briefing.target_audience || "Não definido"}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6 text-sm">
                            {briefing.created_by_name && (
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>{briefing.created_by_name}</span>
                              </div>
                            )}
                            {briefing.deadline && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>Prazo: {new Date(briefing.deadline).toLocaleDateString('pt-BR')}</span>
                              </div>
                            )}
                            {briefing.budget && (
                              <div className="font-medium">
                                Budget: R$ {briefing.budget.toLocaleString('pt-BR')}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              Ver Briefing
                            </Button>
                            <Button variant="default" size="sm" onClick={() => {
                              setSelectedBriefing(briefing);
                              setIsModalOpen(true);
                            }}>
                              Editar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <MarketingBriefingModal isOpen={isModalOpen} onClose={() => {
            setIsModalOpen(false);
            setSelectedBriefing(null);
          }} initialData={selectedBriefing} />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>;
};
export default MarketingBriefing;