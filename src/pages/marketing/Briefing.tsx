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

// Mock briefings data
const mockBriefings = [
  {
    id: "1",
    title: "Lançamento Single 'Novo Amanhecer'",
    description: "Briefing completo para campanha de lançamento do novo single do artista principal",
    campaign: "Campanha Novo Amanhecer",
    status: "Aprovado",
    priority: "Alta",
    deliverables: ["Vídeo Teaser", "Posts Instagram", "Stories", "Press Release"],
    target_audience: "Jovens 18-35, fãs de pop brasileiro",
    created_by_name: "Ana Silva",
    deadline: "2024-02-15",
    budget: 25000
  },
  {
    id: "2",
    title: "Campanha Verão 2024",
    description: "Estratégia de marketing para turnê de verão com foco em festivais",
    campaign: "Verão Total 2024",
    status: "Em Revisão",
    priority: "Alta",
    deliverables: ["Banner Digital", "Flyer Impresso", "Vídeo Promocional", "Kit Imprensa"],
    target_audience: "Público geral, frequentadores de festivais",
    created_by_name: "Carlos Mendes",
    deadline: "2024-01-30",
    budget: 50000
  },
  {
    id: "3",
    title: "Parceria com Marca de Moda",
    description: "Briefing para colaboração com marca de streetwear para coleção especial",
    campaign: "Collab Fashion",
    status: "Pendente",
    priority: "Média",
    deliverables: ["Fotos Campanha", "Behind the Scenes", "Conteúdo TikTok"],
    target_audience: "Público jovem, interessados em moda urbana",
    created_by_name: "Marina Costa",
    deadline: "2024-02-28",
    budget: 35000
  },
  {
    id: "4",
    title: "Lançamento Álbum 'Ecos'",
    description: "Campanha completa para lançamento do novo álbum de estúdio",
    campaign: "Álbum Ecos",
    status: "Aprovado",
    priority: "Alta",
    deliverables: ["Videoclipe", "EPK", "Entrevistas", "Listening Party", "Outdoor"],
    target_audience: "Fãs dedicados e novos ouvintes",
    created_by_name: "Ana Silva",
    deadline: "2024-03-20",
    budget: 120000
  },
  {
    id: "5",
    title: "Ação Social #MúsicaParaTodos",
    description: "Projeto social de música em comunidades carentes",
    campaign: "Música Para Todos",
    status: "Em Revisão",
    priority: "Média",
    deliverables: ["Documentário Curto", "Posts Sociais", "Cobertura Eventos"],
    target_audience: "Público geral, foco em responsabilidade social",
    created_by_name: "Roberto Alves",
    deadline: "2024-04-10",
    budget: 15000
  },
  {
    id: "6",
    title: "Rebranding Visual Artista",
    description: "Atualização completa da identidade visual do artista para nova fase",
    campaign: "Nova Era",
    status: "Pendente",
    priority: "Baixa",
    deliverables: ["Logo", "Paleta de Cores", "Guidelines", "Templates"],
    target_audience: "Equipe interna e parceiros",
    created_by_name: "Marina Costa",
    deadline: "2024-05-01",
    budget: 18000
  },
  {
    id: "7",
    title: "Campanha Dia das Mães",
    description: "Ação especial de marketing para o Dia das Mães com mensagem emotiva",
    campaign: "Especial Mães",
    status: "Rejeitado",
    priority: "Média",
    deliverables: ["Vídeo Emotivo", "Posts Temáticos", "Playlist Especial"],
    target_audience: "Público familiar, mulheres 30-55",
    created_by_name: "Carlos Mendes",
    deadline: "2024-05-12",
    budget: 8000
  },
  {
    id: "8",
    title: "Live Acústica YouTube",
    description: "Briefing para transmissão ao vivo especial no canal do artista",
    campaign: "Acústico Live",
    status: "Aprovado",
    priority: "Alta",
    deliverables: ["Arte Thumbnail", "Roteiro", "Divulgação Prévia", "Edição VOD"],
    target_audience: "Inscritos do canal e fãs engajados",
    created_by_name: "Ana Silva",
    deadline: "2024-02-05",
    budget: 12000
  }
];

// Mock stats data
const mockStats = {
  briefings: {
    active: 5,
    pending: 2,
    approved: 4,
    total: 8
  }
};

const MarketingBriefing = () => {
  const { data: briefingsData = [], isLoading: briefingsLoading } = useMarketingBriefings();
  const { data: statsData, isLoading: statsLoading } = useMarketingStats();
  
  // Use mock data as fallback
  const briefings = briefingsData.length > 0 ? briefingsData : mockBriefings;
  const stats = statsData?.briefings?.total ? statsData : mockStats;
  
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