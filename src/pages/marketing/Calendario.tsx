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
  const mockContent = [
    {
      id: "1",
      title: "Teaser do novo single",
      description: "Vídeo curto com prévia da música 'Noite Estrelada'",
      campaign: "Lançamento Single 'Noite Estrelada'",
      platform: "Instagram",
      status: "Agendado",
      type: "Stories",
      contentType: "Vídeo",
      publishDate: "10/12/2024",
      publishTime: "18:00"
    },
    {
      id: "2",
      title: "Carrossel bastidores do clipe",
      description: "10 fotos dos bastidores da gravação do novo clipe",
      campaign: "Lançamento Clipe Oficial",
      platform: "Instagram",
      status: "Rascunho",
      type: "Carrossel",
      contentType: "Imagem",
      publishDate: "12/12/2024",
      publishTime: "12:00"
    },
    {
      id: "3",
      title: "Vídeo viral TikTok - Dance Challenge",
      description: "Coreografia oficial para challenge da nova música",
      campaign: "Promoção Álbum Completo",
      platform: "TikTok",
      status: "Publicado",
      type: "Vídeo",
      contentType: "Vídeo",
      publishDate: "05/12/2024",
      publishTime: "20:00"
    },
    {
      id: "4",
      title: "Anúncio da turnê - Save the Date",
      description: "Post oficial anunciando datas da turnê 2025",
      campaign: "Turnê Nacional 2025",
      platform: "Instagram",
      status: "Agendado",
      type: "Post",
      contentType: "Imagem",
      publishDate: "15/12/2024",
      publishTime: "10:00"
    },
    {
      id: "5",
      title: "YouTube Shorts - Trecho acústico",
      description: "Versão acústica de 60 segundos da música",
      campaign: "Lançamento Single 'Noite Estrelada'",
      platform: "YouTube",
      status: "Agendado",
      type: "Vídeo",
      contentType: "Vídeo",
      publishDate: "11/12/2024",
      publishTime: "14:00"
    },
    {
      id: "6",
      title: "Post de agradecimento - 1M streams",
      description: "Comemoração de 1 milhão de streams no Spotify",
      campaign: "Promoção Álbum Completo",
      platform: "Instagram",
      status: "Publicado",
      type: "Post",
      contentType: "Imagem",
      publishDate: "03/12/2024",
      publishTime: "16:00"
    },
    {
      id: "7",
      title: "Reels - Making of do álbum",
      description: "Compilação de momentos do estúdio",
      campaign: "Promoção Álbum Completo",
      platform: "Instagram",
      status: "Publicado",
      type: "Vídeo",
      contentType: "Vídeo",
      publishDate: "01/12/2024",
      publishTime: "19:00"
    },
    {
      id: "8",
      title: "Thread Twitter - História da música",
      description: "Storytelling sobre a composição da nova música",
      campaign: "Lançamento Single 'Noite Estrelada'",
      platform: "Twitter",
      status: "Rascunho",
      type: "Post",
      contentType: "Texto",
      publishDate: "13/12/2024",
      publishTime: "11:00"
    },
    {
      id: "9",
      title: "Anúncio patrocinado - Ingressos",
      description: "Ads para venda de ingressos da turnê",
      campaign: "Turnê Nacional 2025",
      platform: "Facebook",
      status: "Pausado",
      type: "Anúncio",
      contentType: "Vídeo",
      publishDate: "08/12/2024",
      publishTime: "09:00"
    },
    {
      id: "10",
      title: "Stories Q&A com fãs",
      description: "Sessão de perguntas e respostas nos stories",
      campaign: "Promoção Álbum Completo",
      platform: "Instagram",
      status: "Agendado",
      type: "Stories",
      contentType: "Vídeo",
      publishDate: "14/12/2024",
      publishTime: "21:00"
    }
  ];

  const allContent = mockContent;
  const [filteredContent, setFilteredContent] = useState(allContent);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [contentType, setContentType] = useState<string>("");

  // Calcular KPIs
  const agendados = allContent.filter(c => c.status === "Agendado").length;
  const publicados = allContent.filter(c => c.status === "Publicado").length;

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
              <DashboardCard title="Conteúdos Agendados" value={agendados} description="próximos 7 dias" icon={Calendar} trend={{
              value: 15,
              isPositive: true
            }} />
              <DashboardCard title="Posts Publicados" value={publicados} description="este mês" icon={FileText} trend={{
              value: 22,
              isPositive: true
            }} />
              <DashboardCard title="Taxa de Engajamento" value="4.8%" description="média das plataformas" icon={TrendingUp} trend={{
              value: 8.5,
              isPositive: true
            }} />
              <DashboardCard title="Alcance Total" value="2.5M" description="últimos 30 dias" icon={TrendingUp} trend={{
              value: 32,
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
                  {filteredContent.map(content => (
                    <div key={content.id} className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Info principal */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-semibold text-foreground truncate">{content.title}</h3>
                            <Badge variant={content.status === "Publicado" ? "success" : content.status === "Agendado" ? "info" : content.status === "Rascunho" ? "secondary" : "warning"} className="text-xs shrink-0">
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

                        {/* Badges de tipo */}
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{content.platform}</Badge>
                          <Badge variant="outline" className="text-xs">{content.type}</Badge>
                          <Badge variant="outline" className="text-xs">{content.contentType}</Badge>
                        </div>

                        {/* Ações */}
                        <div className="flex items-center gap-2 shrink-0">
                          <Button variant="outline" size="sm">Ver</Button>
                          <Button variant="outline" size="sm" onClick={() => {
                            setSelectedContent(content);
                            setIsModalOpen(true);
                          }}>Editar</Button>
                          <Button variant="outline" size="sm">Excluir</Button>
                        </div>
                      </div>
                    </div>
                  ))}
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