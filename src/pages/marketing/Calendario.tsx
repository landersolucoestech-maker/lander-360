import { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchFilter } from "@/components/filters/SearchFilter";
import { MarketingContentModal } from "@/components/modals/MarketingContentModal";
import { Calendar, Plus, Clock, FileText, Image, Video, TrendingUp } from "lucide-react";
const MarketingCalendario = () => {
  const allContent: any[] = [];
  const [filteredContent, setFilteredContent] = useState(allContent);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [contentType, setContentType] = useState<string>("");
  const filterOptions = [{
    key: "platform",
    label: "Plataforma",
    options: ["Instagram", "TikTok", "Facebook", "YouTube", "Twitter"]
  }, {
    key: "status",
    label: "Status",
    options: ["Agendado", "Rascunho", "Publicado", "Pausado"]
  }, {
    key: "type",
    label: "Tipo",
    options: ["Post", "Stories", "Vídeo", "Anúncio", "Carrossel"]
  }, {
    key: "contentType",
    label: "Formato",
    options: ["Imagem", "Vídeo", "Carrossel", "Texto"]
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
      filtered = filtered.filter(content => content.title.toLowerCase().includes(searchTerm.toLowerCase()) || content.campaign.toLowerCase().includes(searchTerm.toLowerCase()) || content.description.toLowerCase().includes(searchTerm.toLowerCase()));
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
  return <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full h-full px-4 py-4 space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-foreground">Calendário de Conteúdo</h1>
                <p className="text-muted-foreground">
                  Planeje e agende todo o conteúdo das redes sociais
                </p>
              </div>
              <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Novo Conteúdo
              </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardCard title="Conteúdos Agendados" value={0} description="próximos 7 dias" icon={Calendar} trend={{
              value: 0,
              isPositive: true
            }} />
              <DashboardCard title="Posts Publicados" value={0} description="este mês" icon={FileText} trend={{
              value: 0,
              isPositive: true
            }} />
              <DashboardCard title="Taxa de Engajamento" value="0%" description="média das plataformas" icon={TrendingUp} trend={{
              value: 0,
              isPositive: true
            }} />
              <DashboardCard title="Alcance Total" value="0" description="últimos 30 dias" icon={TrendingUp} trend={{
              value: 0,
              isPositive: true
            }} />
            </div>

            {/* Search and Filters */}
            <SearchFilter searchPlaceholder="Buscar conteúdo por título, campanha ou descrição..." filters={filterOptions} onSearch={handleSearch} onFilter={handleFilter} onClear={handleClear} />

            {/* Content Calendar */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Calendário de Publicações</CardTitle>
                <CardDescription>
                  Todos os conteúdos programados e histórico de publicações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredContent.map(content => <div key={content.id} className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="space-y-1 flex-1">
                          <h3 className="font-medium text-foreground">{content.title}</h3>
                          <p className="text-sm text-muted-foreground">{content.description}</p>
                          <div className="text-xs text-muted-foreground">
                            Campanha: {content.campaign}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge variant={content.status === "Publicado" ? "success" : content.status === "Agendado" ? "info" : content.status === "Rascunho" ? "secondary" : "warning"}>
                            {content.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {content.platform}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {content.type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {content.contentType}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-sm text-muted-foreground">
                            {content.publishDate} às {content.publishTime}
                          </div>
                          <Button variant="outline" size="sm" onClick={() => {
                        setSelectedContent(content);
                        setIsModalOpen(true);
                      }}>
                            Editar
                          </Button>
                        </div>
                      </div>
                    </div>)}
                </div>
              </CardContent>
            </Card>

            {/* Content Planning Cards */}
            

            <MarketingContentModal isOpen={isModalOpen} onClose={() => {
            setIsModalOpen(false);
            setSelectedContent(null);
            setContentType("");
          }} initialData={selectedContent} contentType={contentType} />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>;
};
export default MarketingCalendario;