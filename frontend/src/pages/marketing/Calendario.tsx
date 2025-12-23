import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchFilter } from "@/components/filters/SearchFilter";
import { MarketingContentModal } from "@/components/modals/MarketingContentModal";
import { Calendar, Plus, Clock, FileText, TrendingUp } from "lucide-react";

const MarketingCalendario = () => {
  // Empty content array - no mock data
  const allContent: any[] = [];
  const [filteredContent, setFilteredContent] = useState(allContent);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [contentType, setContentType] = useState<string>("");

  // Calculate KPIs
  const agendados = allContent.filter(c => c.status === "Agendado").length;
  const publicados = allContent.filter(c => c.status === "Publicado").length;

  // Plataformas ordenadas alfabeticamente
  const platformOptions = [
    "Facebook",
    "Instagram",
    "TikTok",
    "Twitter",
    "YouTube",
  ];

  // Status ordenados alfabeticamente
  const statusOptions = [
    "Agendado",
    "Pausado",
    "Publicado",
    "Rascunho",
  ];

  // Tipos ordenados alfabeticamente
  const typeOptions = [
    "Anúncio",
    "Carrossel",
    "Post",
    "Stories",
    "Vídeo",
  ];

  // Formatos ordenados alfabeticamente
  const formatOptions = [
    "Carrossel",
    "Imagem",
    "Texto",
    "Vídeo",
  ];

  const filterOptions = [{
    key: "platform",
    label: "Plataforma",
    options: platformOptions
  }, {
    key: "status",
    label: "Status",
    options: statusOptions
  }, {
    key: "type",
    label: "Tipo",
    options: typeOptions
  }, {
    key: "contentType",
    label: "Formato",
    options: formatOptions
  }];

  const handleSearch = (searchTerm: string) => {
    filterContent(searchTerm, {});
  };

  const handleFilter = (filters: Record<string, string>) => {
    filterContent("", filters);
  };

  const handleClear = () => {
    setFilteredContent(allContent);
  };

  const filterContent = (searchTerm: string, filters: Record<string, string>) => {
    let filtered = allContent;
    if (searchTerm) {
      filtered = filtered.filter(content => 
        content.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        content.campaign.toLowerCase().includes(searchTerm.toLowerCase()) || 
        content.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(content => {
          if (key === "platform") return content.platform === value;
          if (key === "status") return content.status === value;
          if (key === "type") return content.type === value;
          if (key === "contentType") return content.contentType === value;
          return true;
        });
      }
    });
    setFilteredContent(filtered);
  };

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
                  <h1 className="text-3xl font-bold text-foreground">Calendário de Conteúdo</h1>
                  <p className="text-muted-foreground">
                    Planeje e agende todo o conteúdo das redes sociais
                  </p>
                </div>
              </div>
              <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Novo Conteúdo
              </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardCard 
                title="Conteúdos Agendados" 
                value={agendados} 
                description="próximos 7 dias" 
                icon={Calendar} 
              />
              <DashboardCard 
                title="Posts Publicados" 
                value={publicados} 
                description="este mês" 
                icon={FileText} 
              />
              <DashboardCard 
                title="Taxa de Engajamento" 
                value="0%" 
                description="média das plataformas" 
                icon={TrendingUp} 
              />
              <DashboardCard 
                title="Alcance Total" 
                value="0" 
                description="últimos 30 dias" 
                icon={TrendingUp} 
              />
            </div>

            {/* Search and Filters */}
            <SearchFilter 
              searchPlaceholder="Buscar conteúdo por título, campanha ou descrição..." 
              filters={filterOptions} 
              onSearch={handleSearch} 
              onFilter={handleFilter} 
              onClear={handleClear} 
            />

            {/* Content Calendar */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Calendário de Publicações</CardTitle>
                <CardDescription>
                  Todos os conteúdos programados e histórico de publicações
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredContent.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Nenhum conteúdo cadastrado
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Comece a planejar seu calendário de conteúdo
                    </p>
                    <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Adicionar Conteúdo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredContent.map(content => (
                      <div key={content.id} className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-base font-semibold text-foreground truncate">{content.title}</h3>
                              <Badge 
                                variant={
                                  content.status === "Publicado" ? "success" : 
                                  content.status === "Agendado" ? "info" : 
                                  content.status === "Rascunho" ? "secondary" : "warning"
                                } 
                                className="text-xs shrink-0"
                              >
                                {content.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">{content.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Campanha: {content.campaign}</span>
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {content.publishDate} às {content.publishTime}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{content.platform}</Badge>
                            <Badge variant="outline" className="text-xs">{content.type}</Badge>
                            <Badge variant="outline" className="text-xs">{content.contentType}</Badge>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Button variant="outline" size="sm">Ver</Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setSelectedContent(content);
                                setIsModalOpen(true);
                              }}
                            >
                              Editar
                            </Button>
                            <Button variant="outline" size="sm">Excluir</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <MarketingContentModal 
              isOpen={isModalOpen} 
              onClose={() => {
                setIsModalOpen(false);
                setSelectedContent(null);
                setContentType("");
              }} 
              initialData={selectedContent} 
              contentType={contentType} 
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MarketingCalendario;