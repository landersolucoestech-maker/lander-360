import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchFilter } from "@/components/filters/SearchFilter";
import { MarketingBriefingModal } from "@/components/modals/MarketingBriefingModal";
import { FileText, Plus, Clock, CheckCircle, AlertTriangle, User } from "lucide-react";
import { useMarketingBriefings } from "@/hooks/useMarketing";
import { formatDateBR, translateStatus, translatePriority } from "@/lib/utils";

const MarketingBriefing = () => {
  const { data: briefingsData = [], isLoading: briefingsLoading } = useMarketingBriefings();
  
  const briefings = briefingsData;
  
  const briefingStats = {
    active: briefings.filter(b => b.status === "Em Revisão" || b.status === "in_review").length,
    pending: briefings.filter(b => b.status === "Pendente" || b.status === "pending" || b.status === "draft").length,
    approved: briefings.filter(b => b.status === "Aprovado" || b.status === "approved").length,
    total: briefings.length
  };
  
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
          return true;
        });
      }
    });
    setFilteredBriefings(filtered);
  };

  useEffect(() => {
    setFilteredBriefings(briefingsData);
  }, [briefingsData]);

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
                  <h1 className="text-3xl font-bold text-foreground">Central de Briefing</h1>
                  <p className="text-muted-foreground">
                    Gerencie briefings e diretrizes para campanhas de marketing
                  </p>
                </div>
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
                value={briefingStats.active} 
                description="em desenvolvimento" 
                icon={FileText} 
              />
              <DashboardCard 
                title="Pendentes Aprovação" 
                value={briefingStats.pending} 
                description="aguardando review" 
                icon={Clock} 
              />
              <DashboardCard 
                title="Aprovados este mês" 
                value={briefingStats.approved} 
                description="prontos para execução" 
                icon={CheckCircle} 
              />
              <DashboardCard 
                title="Total de Briefings" 
                value={briefingStats.total} 
                description="no sistema" 
                icon={AlertTriangle} 
              />
            </div>

            {/* Search and Filters */}
            <SearchFilter 
              searchPlaceholder="Buscar briefings por título, campanha ou descrição..." 
              filters={filterOptions} 
              onSearch={handleSearch} 
              onFilter={handleFilter} 
              onClear={handleClear} 
            />

            {/* Briefings List */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Briefings de Marketing</CardTitle>
                <CardDescription>
                  Todos os briefings e diretrizes de campanhas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {briefingsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Carregando briefings...
                  </div>
                ) : filteredBriefings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Nenhum briefing cadastrado
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Comece a criar briefings para suas campanhas
                    </p>
                    <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Adicionar Briefing
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredBriefings.map(briefing => (
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
                              briefing.status === "Aprovado" || briefing.status === "approved" ? "default" : 
                              briefing.status === "Em Revisão" || briefing.status === "in_review" ? "secondary" : 
                              briefing.status === "Rejeitado" || briefing.status === "rejected" ? "destructive" : "outline"
                            }>
                              {translateStatus(briefing.status)}
                            </Badge>
                            <Badge variant={
                              briefing.priority === "Alta" || briefing.priority === "high" ? "destructive" : 
                              briefing.priority === "Média" || briefing.priority === "medium" ? "secondary" : "outline"
                            }>
                              {translatePriority(briefing.priority)}
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
                                <span>Prazo: {formatDateBR(briefing.deadline)}</span>
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
                              Ver
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => {
                              setSelectedBriefing(briefing);
                              setIsModalOpen(true);
                            }}>
                              Editar
                            </Button>
                            <Button variant="outline" size="sm">
                              Excluir
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <MarketingBriefingModal 
              isOpen={isModalOpen} 
              onClose={() => {
                setIsModalOpen(false);
                setSelectedBriefing(null);
              }} 
              initialData={selectedBriefing} 
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MarketingBriefing;