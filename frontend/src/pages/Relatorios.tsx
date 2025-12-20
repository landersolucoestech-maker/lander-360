import { useState, useMemo } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportConfigModal } from "@/components/modals/ReportConfigModal";

import UnifiedAIAnalysis from "@/components/ai/UnifiedAIAnalysis";
import AuditoriaModule from "@/components/relatorios/AuditoriaModule";
import { AdvancedAnalytics } from "@/components/analytics/AdvancedAnalytics";

import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Users, Palette, Search, Filter, Calendar as CalendarIcon, Package, X, Loader2, Music, DollarSign, Disc, FileSignature, Warehouse, UserCheck, Folder, Brain, FileSearch, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { cn, formatDateBR, formatDateTimeBR, translateStatus, translatePriority, translateCategory } from "@/lib/utils";
import XLSX from "xlsx-js-style";
import {
  useFinancialReport,
  useArtistsReport,
  useMusicReport,
  useReleasesReport,
  useInventoryReport,
  useCrmReport,
  usePhonogramsReport,
  useContractsReport,
  useProjectsReport,
} from "@/hooks/useReports";


const Relatorios = () => {
  const [activeTab, setActiveTab] = useState("relatorios");
  const [reportConfigOpen, setReportConfigOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState("");
  const [selectedData, setSelectedData] = useState([]);
  const [viewReportOpen, setViewReportOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

  // Fetch real data from database
  const { data: financialData = [], isLoading: loadingFinancial } = useFinancialReport();
  const { data: artistsData = [], isLoading: loadingArtists } = useArtistsReport();
  const { data: musicData = [], isLoading: loadingMusic } = useMusicReport();
  const { data: releasesData = [], isLoading: loadingReleases } = useReleasesReport();
  const { data: inventoryData = [], isLoading: loadingInventory } = useInventoryReport();
  const { data: crmData = [], isLoading: loadingCrm } = useCrmReport();
  const { data: phonogramsData = [], isLoading: loadingPhonograms } = usePhonogramsReport();
  const { data: contractsData = [], isLoading: loadingContracts } = useContractsReport();
  const { data: projectsData = [], isLoading: loadingProjects } = useProjectsReport();
  const { data: artistsList = [] } = useArtistsReport();

  const isLoading = loadingFinancial || loadingArtists || loadingMusic || loadingReleases || loadingInventory || loadingCrm || loadingPhonograms || loadingContracts || loadingProjects;

  // Generate report types based on real data
  const reportTypes = useMemo(() => [
    {
      id: "financeiro",
      name: "Relatório Financeiro",
      description: "Transações financeiras, receitas e despesas",
      type: "Financeiro",
      icon: DollarSign,
      count: financialData.length,
      status: financialData.length > 0 ? "Disponível" : "Sem dados",
    },
    {
      id: "artistas",
      name: "Catálogo de Artistas",
      description: "Lista completa de artistas cadastrados",
      type: "Artistas",
      icon: Users,
      count: artistsData.length,
      status: artistsData.length > 0 ? "Disponível" : "Sem dados",
    },
    {
      id: "musicas",
      name: "Registro de Obras Musicais",
      description: "Todas as obras registradas no sistema",
      type: "Músicas",
      icon: Music,
      count: musicData.length,
      status: musicData.length > 0 ? "Disponível" : "Sem dados",
    },
    {
      id: "fonogramas",
      name: "Registro de Fonogramas",
      description: "Todos os fonogramas registrados",
      type: "Fonogramas",
      icon: Disc,
      count: phonogramsData.length,
      status: phonogramsData.length > 0 ? "Disponível" : "Sem dados",
    },
    {
      id: "lancamentos",
      name: "Lançamentos",
      description: "Resumo de lançamentos musicais",
      type: "Lançamentos",
      icon: Music,
      count: releasesData.length,
      status: releasesData.length > 0 ? "Disponível" : "Sem dados",
    },
    {
      id: "contratos",
      name: "Contratos",
      description: "Lista de contratos ativos e histórico",
      type: "Contratos",
      icon: FileSignature,
      count: contractsData.length,
      status: contractsData.length > 0 ? "Disponível" : "Sem dados",
    },
    {
      id: "inventario",
      name: "Inventário de Equipamentos",
      description: "Lista de equipamentos e patrimônio",
      type: "Inventário",
      icon: Warehouse,
      count: inventoryData.length,
      status: inventoryData.length > 0 ? "Disponível" : "Sem dados",
    },
    {
      id: "crm",
      name: "Contatos CRM",
      description: "Lista de contatos e clientes",
      type: "CRM",
      icon: UserCheck,
      count: crmData.length,
      status: crmData.length > 0 ? "Disponível" : "Sem dados",
    },
    {
      id: "projetos",
      name: "Projetos",
      description: "Projetos musicais e suas músicas",
      type: "Projetos",
      icon: Folder,
      count: projectsData.length,
      status: projectsData.length > 0 ? "Disponível" : "Sem dados",
    },
  ], [financialData, artistsData, musicData, releasesData, inventoryData, crmData, phonogramsData, contractsData, projectsData]);

  const handleCustomReport = (reportType: string, data: any[] = []) => {
    setSelectedReportType(reportType);
    setSelectedData(data);
    setReportConfigOpen(true);
  };

  const handleDownloadPDF = (report: any) => {
    toast({
      title: "Download iniciado",
      description: `Baixando ${report.name} em formato PDF...`,
    });
  };

  const handleDownloadExcel = (report: any) => {
    const data = getReportData(report);
    
    
    if (data.length === 0) {
      toast({
        title: "Sem dados",
        description: "Não há dados para exportar neste relatório.",
        variant: "destructive",
      });
      return;
    }

    // Status color mapping
    const statusColorMap: Record<string, { fgColor: string; bgColor: string }> = {
      'em análise': { fgColor: '000000', bgColor: 'FFEB3B' },
      'em analise': { fgColor: '000000', bgColor: 'FFEB3B' },
      'em análise na distribuidora': { fgColor: '000000', bgColor: 'FFEB3B' },
      'em espera': { fgColor: 'FFFFFF', bgColor: 'F44336' },
      'espera': { fgColor: 'FFFFFF', bgColor: 'F44336' },
      'pendente': { fgColor: 'FFFFFF', bgColor: 'F44336' },
      'lançada': { fgColor: 'FFFFFF', bgColor: '2196F3' },
      'lancada': { fgColor: 'FFFFFF', bgColor: '2196F3' },
      'lançado': { fgColor: 'FFFFFF', bgColor: '2196F3' },
      'lancado': { fgColor: 'FFFFFF', bgColor: '2196F3' },
      'música lançada': { fgColor: 'FFFFFF', bgColor: '2196F3' },
      'pronta': { fgColor: 'FFFFFF', bgColor: '4CAF50' },
      'pronto': { fgColor: 'FFFFFF', bgColor: '4CAF50' },
      'concluído': { fgColor: 'FFFFFF', bgColor: '4CAF50' },
      'concluido': { fgColor: 'FFFFFF', bgColor: '4CAF50' },
      'ativo': { fgColor: 'FFFFFF', bgColor: '4CAF50' },
      'aprovado': { fgColor: 'FFFFFF', bgColor: '4CAF50' },
      'pronta para registro': { fgColor: 'FFFFFF', bgColor: '4CAF50' },
      'takedown': { fgColor: 'FFFFFF', bgColor: '9C27B0' },
      'removido': { fgColor: 'FFFFFF', bgColor: '9C27B0' },
      'cancelado': { fgColor: 'FFFFFF', bgColor: '9C27B0' },
    };

    const getStatusColor = (value: string) => {
      if (!value) return null;
      const normalizedValue = value.toLowerCase().trim();
      return statusColorMap[normalizedValue] || null;
    };

    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Find status column to get status value for each row
    const headers = Object.keys(data[0]);
    const statusColumnLabels = ['Status', 'status', 'Status Contrato'];
    let statusColumnIndex = -1;
    headers.forEach((header, index) => {
      if (statusColumnLabels.some(label => header.toLowerCase().includes(label.toLowerCase()))) {
        statusColumnIndex = index;
      }
    });

    // Apply styling to ALL cells in each row based on status
    if (statusColumnIndex !== -1) {
      data.forEach((row, rowIndex) => {
        const statusHeader = headers[statusColumnIndex];
        const statusValue = row[statusHeader];
        const color = getStatusColor(String(statusValue || ''));
        
        if (color) {
          // Apply color to ALL columns in this row
          headers.forEach((header, colIndex) => {
            const cellAddress = XLSX.utils.encode_cell({ r: rowIndex + 1, c: colIndex });
            
            if (!worksheet[cellAddress]) {
              worksheet[cellAddress] = { v: row[header] || '' };
            }
            
            worksheet[cellAddress].s = {
              fill: {
                patternType: 'solid',
                fgColor: { rgb: color.bgColor },
                bgColor: { rgb: color.bgColor },
              },
              font: {
                color: { rgb: color.fgColor },
                bold: colIndex === statusColumnIndex,
              },
              alignment: {
                horizontal: 'center',
                vertical: 'center',
              },
            };
          });
        }
      });
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, report.type);
    XLSX.writeFile(workbook, `relatorio_${report.id}_${new Date().toISOString().split('T')[0]}.xlsx`, { cellStyles: true });

    toast({
      title: "Exportação concluída",
      description: `${data.length} registros exportados com sucesso.`,
    });
  };

  const handleViewReport = (report: any) => {
    setSelectedReport(report);
    setViewReportOpen(true);
  };

  // Get real data for report view
  const getReportData = (report: any) => {
    switch (report.type) {
      case "Financeiro":
        return financialData.map((t: any) => ({
          id: t.id?.slice(0, 8) || "N/A",
          descricao: t.description || "N/A",
          tipo: translateStatus(t.type) || "N/A",
          valor: `R$ ${Number(t.amount || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
          categoria: translateCategory(t.category) || "N/A",
          data: t.date ? formatDateBR(t.date) : "N/A",
          status: translateStatus(t.status) || "N/A",
          pagamento: t.payment_method || "N/A",
        }));
      case "Artistas":
        const getDistributorEmail = (emails: any, key: string) => {
          if (!emails) return "N/A";
          const parsed = typeof emails === 'string' ? JSON.parse(emails) : emails;
          return parsed?.[key] || "N/A";
        };
        return artistsData.map((a: any) => ({
          "ID": a.id || "N/A",
          "Nome Artístico": a.name || "N/A",
          "Nome Completo": a.full_name || "N/A",
          "Gênero Musical": a.genre || "N/A",
          "E-mail": a.email || "N/A",
          "Telefone": a.phone || "N/A",
          "Tipo de Perfil": a.profile_type || "N/A",
          "Status Contrato": translateStatus(a.contract_status) || "Ativo",
          "CPF/CNPJ": a.cpf_cnpj || "N/A",
          "RG": a.rg || "N/A",
          "Data Nascimento": a.birth_date ? formatDateBR(a.birth_date) : "N/A",
          "Endereço Completo": a.full_address || "N/A",
          "Banco": a.bank || "N/A",
          "Agência": a.agency || "N/A",
          "Conta": a.account || "N/A",
          "Chave PIX": a.pix_key || "N/A",
          "Titular da Conta": a.account_holder || "N/A",
          "Nome Empresário": a.manager_name || "N/A",
          "Telefone Empresário": a.manager_phone || "N/A",
          "E-mail Empresário": a.manager_email || "N/A",
          "Distribuidores": Array.isArray(a.distributors) ? a.distributors.join(", ") : "N/A",
          "Instagram": a.instagram || a.instagram_url || "N/A",
          "Spotify": a.spotify_url || "N/A",
          "YouTube": a.youtube_url || "N/A",
          "TikTok": a.tiktok || "N/A",
          "SoundCloud": a.soundcloud || "N/A",
          "Email de Share Distrokid": getDistributorEmail(a.distributor_emails, 'distrokid'),
          "Email de Share ONErpm": getDistributorEmail(a.distributor_emails, 'onerpm'),
          "Biografia": a.bio || "N/A",
          "Observações": a.observations || "N/A",
          "Data Cadastro": a.created_at ? formatDateBR(a.created_at) : "N/A",
        }));
      case "Músicas":
        return musicData.map((m: any) => ({
          id: m.id?.slice(0, 8) || "N/A",
          titulo: m.title || "N/A",
          artista: m.artists?.stage_name || m.artists?.name || "N/A",
          genero: m.genre || "N/A",
          isrc: m.isrc || "N/A",
          iswc: m.iswc || "N/A",
          abramus: m.abramus_code || "N/A",
          ecad: m.ecad_code || "N/A",
          status: translateStatus(m.status) || "N/A",
        }));
      case "Fonogramas":
        return phonogramsData.map((p: any) => ({
          id: p.id?.slice(0, 8) || "N/A",
          titulo: p.title || "N/A",
          artista: p.artists?.stage_name || p.artists?.name || "N/A",
          isrc: p.isrc || "N/A",
          genero: p.genre || "N/A",
          label: p.label || "N/A",
          status: translateStatus(p.status) || "N/A",
          gravacao: p.recording_date ? formatDateBR(p.recording_date) : "N/A",
        }));
      case "Lançamentos":
        return releasesData.map((r: any) => ({
          id: r.id?.slice(0, 8) || "N/A",
          titulo: r.title || "N/A",
          artista: r.artists?.stage_name || r.artists?.name || "N/A",
          tipo: r.release_type || r.type || "N/A",
          data_lancamento: r.release_date ? formatDateBR(r.release_date) : "N/A",
          status: translateStatus(r.status) || "N/A",
          genero: r.genre || "N/A",
          label: r.label || "N/A",
          distribuidores: r.distributors?.join(", ") || "N/A",
        }));
      case "Contratos":
        return contractsData.map((c: any) => ({
          id: c.id?.slice(0, 8) || "N/A",
          titulo: c.title || "N/A",
          artista: c.artists?.stage_name || c.artists?.name || "N/A",
          tipo_contrato: c.contract_type || "N/A",
          tipo_servico: c.service_type || "N/A",
          status: translateStatus(c.status) || "N/A",
          inicio: c.start_date ? formatDateBR(c.start_date) : "N/A",
          fim: c.end_date ? formatDateBR(c.end_date) : "N/A",
          valor: c.value ? `R$ ${Number(c.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "N/A",
        }));
      case "Inventário":
        return inventoryData.map((i: any) => ({
          id: i.id?.slice(0, 8) || "N/A",
          item: i.name || "N/A",
          categoria: i.category || "N/A",
          quantidade: i.quantity?.toString() || "0",
          status: translateStatus(i.status) || "N/A",
          localizacao: i.location || "N/A",
          setor: i.sector || "N/A",
          valor_unitario: i.unit_value ? `R$ ${Number(i.unit_value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "N/A",
          valor_total: i.unit_value && i.quantity ? `R$ ${(Number(i.unit_value) * Number(i.quantity)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "N/A",
          responsavel: i.responsible || "N/A",
        }));
      case "CRM":
        return crmData.map((c: any) => ({
          id: c.id?.slice(0, 8) || "N/A",
          nome: c.name || "N/A",
          email: c.email || "N/A",
          telefone: c.phone || "N/A",
          empresa: c.company || "N/A",
          cargo: c.position || "N/A",
          tipo: c.contact_type || "N/A",
          status: translateStatus(c.status) || "N/A",
          prioridade: translatePriority(c.priority) || "N/A",
          cidade: c.city || "N/A",
        }));
      case "Projetos":
        // Create artists map for lookup
        const artistsMap: Record<string, string> = {};
        artistsList.forEach((a: any) => {
          artistsMap[a.id] = a.stage_name || a.name || '';
        });

        const getStatusLabel = (status: string) => {
          const labels: Record<string, string> = {
            draft: "Rascunho",
            in_progress: "Em Andamento",
            completed: "Concluído",
            cancelled: "Cancelado"
          };
          return labels[status] || status;
        };

        const getProjectDetails = (project: any) => {
          try {
            if (project.audio_files && typeof project.audio_files === 'string') {
              return JSON.parse(project.audio_files);
            }
            if (project.audio_files && typeof project.audio_files === 'object') {
              return project.audio_files;
            }
          } catch (e) {
            console.error('Error parsing audio_files:', e);
          }
          return null;
        };

        return projectsData.flatMap((project: any) => {
          const details = getProjectDetails(project);
          const songs = details?.songs || [];
          const artistName = project.artist_id ? artistsMap[project.artist_id] || '' : (project.artists?.stage_name || project.artists?.name || '');
          
          if (songs.length > 0) {
            return songs.map((song: any) => ({
              'Nome do Projeto': project.name || "N/A",
              'Artista': artistName || "N/A",
              'Tipo de Lançamento': details?.release_type === 'single' ? 'Single' : details?.release_type === 'ep' ? 'EP' : details?.release_type === 'album' ? 'Álbum' : details?.release_type || "N/A",
              'Status': getStatusLabel(project.status || ''),
              'Nome da Música': song.song_name || "N/A",
              'Solo/Feat': song.collaboration_type === 'solo' ? 'Solo' : song.collaboration_type === 'feat' ? 'Feat' : song.collaboration_type || "N/A",
              'Original/Remix': song.track_type === 'original' ? 'Original' : song.track_type === 'remix' ? 'Remix' : song.track_type || "N/A",
              'Instrumental': song.instrumental === 'sim' ? 'Sim' : song.instrumental === 'nao' ? 'Não' : song.instrumental || "N/A",
              'Duração': song.duration_minutes !== undefined ? `${song.duration_minutes}:${String(song.duration_seconds || 0).padStart(2, '0')}` : "N/A",
              'Gênero Musical': song.genre || "N/A",
              'Idioma': song.language || "N/A",
              'Compositores': song.composers?.map((c: any) => c.name).filter(Boolean).join(', ') || "N/A",
              'Intérpretes': song.performers?.map((p: any) => p.name).filter(Boolean).join(', ') || "N/A",
              'Produtores': song.producers?.map((p: any) => p.name).filter(Boolean).join(', ') || "N/A",
              'Letra': song.lyrics || "N/A",
              'Observações': details?.observations || "N/A",
              'Data de Cadastro': project.created_at ? formatDateTimeBR(project.created_at) : "N/A",
            }));
          }
          
          return [{
            'Nome do Projeto': project.name || "N/A",
            'Artista': artistName || "N/A",
            'Tipo de Lançamento': details?.release_type === 'single' ? 'Single' : details?.release_type === 'ep' ? 'EP' : details?.release_type === 'album' ? 'Álbum' : details?.release_type || "N/A",
            'Status': getStatusLabel(project.status || ''),
            'Nome da Música': "N/A",
            'Solo/Feat': "N/A",
            'Original/Remix': "N/A",
            'Instrumental': "N/A",
            'Duração': "N/A",
            'Gênero Musical': "N/A",
            'Idioma': "N/A",
            'Compositores': "N/A",
            'Intérpretes': "N/A",
            'Produtores': "N/A",
            'Letra': "N/A",
            'Observações': details?.observations || "N/A",
            'Data de Cadastro': project.created_at ? formatDateTimeBR(project.created_at) : "N/A",
          }];
        });
      default:
        return [];
    }
  };

  // Filter reports
  const filteredReports = useMemo(() => {
    return reportTypes.filter((report) => {
      const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || report.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [reportTypes, searchTerm, filterType]);

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
                  <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
                  <p className="text-muted-foreground">
                    Gere relatórios com dados reais do sistema
                  </p>
                </div>
              </div>
              <Button className="gap-2" onClick={() => handleCustomReport("custom", [])}>
                <Palette className="h-4 w-4" />
                Criar Relatório Personalizado
              </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="relatorios" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Relatórios
                </TabsTrigger>
                <TabsTrigger value="analytics" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="ia-insights" className="gap-2">
                  <Brain className="h-4 w-4" />
                  IA & Insights
                </TabsTrigger>
                <TabsTrigger value="auditoria" className="gap-2">
                  <FileSearch className="h-4 w-4" />
                  Auditoria
                </TabsTrigger>
              </TabsList>

              <TabsContent value="analytics" className="space-y-4">
                <AdvancedAnalytics />
              </TabsContent>

              <TabsContent value="relatorios" className="space-y-4">
                <div className="flex flex-col gap-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar relatórios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="Financeiro">Financeiro</SelectItem>
                      <SelectItem value="Artistas">Artistas</SelectItem>
                      <SelectItem value="Músicas">Músicas</SelectItem>
                      <SelectItem value="Fonogramas">Fonogramas</SelectItem>
                      <SelectItem value="Lançamentos">Lançamentos</SelectItem>
                      <SelectItem value="Contratos">Contratos</SelectItem>
                      <SelectItem value="Inventário">Inventário</SelectItem>
                      <SelectItem value="CRM">CRM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Carregando dados...</span>
              </div>
            ) : (
              /* Reports List */
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold text-foreground">
                    Relatórios Disponíveis ({filteredReports.length})
                  </h2>
                </div>

                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="text-left p-4 font-medium text-muted-foreground">Relatório</th>
                            <th className="text-left p-4 font-medium text-muted-foreground">Tipo</th>
                            <th className="text-left p-4 font-medium text-muted-foreground">Registros</th>
                            <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                            <th className="text-right p-4 font-medium text-muted-foreground">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredReports.map((report) => {
                            const Icon = report.icon;
                            return (
                              <tr key={report.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                      <Icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-foreground">{report.name}</p>
                                      <p className="text-xs text-muted-foreground">{report.description}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <Badge variant="outline">{report.type}</Badge>
                                </td>
                                <td className="p-4">
                                  <Badge variant={report.count > 0 ? "default" : "secondary"}>
                                    {report.count}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <Badge variant={report.count > 0 ? "default" : "secondary"} className={report.count > 0 ? "bg-green-500/20 text-green-600 border-green-500/30" : ""}>
                                    {report.status}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={report.count === 0}
                                      onClick={() => handleViewReport(report)}
                                    >
                                      Ver
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={report.count === 0}
                                      onClick={() => handleDownloadExcel(report)}
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {filteredReports.length === 0 && (
                  <Card className="text-center py-8">
                    <CardContent>
                      <div className="flex flex-col items-center gap-3">
                        <Search className="h-12 w-12 text-muted-foreground" />
                        <h3 className="text-lg font-medium">Nenhum relatório encontrado</h3>
                        <p className="text-muted-foreground">
                          Tente ajustar os filtros de busca.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
              </TabsContent>


              <TabsContent value="ia-insights" className="space-y-4">
                <UnifiedAIAnalysis defaultCategory="business" />
              </TabsContent>

              <TabsContent value="auditoria" className="space-y-4">
                <AuditoriaModule />
              </TabsContent>

            </Tabs>
          </div>
        </SidebarInset>
      </div>

      <ReportConfigModal open={reportConfigOpen} onOpenChange={setReportConfigOpen} reportType={selectedReportType} data={selectedData} />

      {/* Modal de Visualização do Relatório */}
      <Dialog open={viewReportOpen} onOpenChange={setViewReportOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              {selectedReport?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedReport?.description}
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              {/* Informações do relatório */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 bg-muted/30 rounded border">
                  <p className="text-muted-foreground mb-1">Tipo</p>
                  <p className="font-medium">{selectedReport.type}</p>
                </div>
                <div className="p-2 bg-muted/30 rounded border">
                  <p className="text-muted-foreground mb-1">Total de Registros</p>
                  <p className="font-medium">{selectedReport.count}</p>
                </div>
                <div className="p-2 bg-muted/30 rounded border">
                  <p className="text-muted-foreground mb-1">Gerado em</p>
                  <p className="font-medium">{formatDateBR(new Date().toISOString())}</p>
                </div>
              </div>

              {/* Tabela estilo planilha */}
              <div className="overflow-auto max-h-[60vh] border border-border rounded-md bg-background">
                <div className="min-w-full">
                  {(() => {
                    const data = getReportData(selectedReport);
                    if (data.length === 0) {
                      return (
                        <div className="p-8 text-center text-muted-foreground">
                          Nenhum dado disponível para este relatório.
                        </div>
                      );
                    }

                    const columns = Object.keys(data[0]);

                    return (
                      <>
                        {/* Cabeçalho estilo Excel */}
                        <div
                          className="border-b bg-muted/50 sticky top-0"
                          style={{ display: "grid", gridTemplateColumns: `50px repeat(${columns.length}, minmax(100px, 1fr))` }}
                        >
                          <div className="p-2 border-r text-xs font-semibold text-center bg-muted/70">#</div>
                          {columns.map((column) => (
                            <div key={column} className="p-2 border-r text-xs font-semibold bg-muted/70 capitalize truncate">
                              {column.replace(/_/g, " ")}
                            </div>
                          ))}
                        </div>

                        {/* Dados estilo planilha */}
                        {data.map((row, index) => (
                          <div
                            key={index}
                            className="border-b hover:bg-muted/30 transition-colors"
                            style={{ display: "grid", gridTemplateColumns: `50px repeat(${columns.length}, minmax(100px, 1fr))` }}
                          >
                            <div className="p-2 border-r text-xs text-center font-mono bg-muted/20 text-muted-foreground">
                              {String(index + 1).padStart(2, "0")}
                            </div>
                            {columns.map((column) => (
                              <div key={column} className="p-2 border-r text-xs truncate" title={String(row[column as keyof typeof row])}>
                                {row[column as keyof typeof row]}
                              </div>
                            ))}
                          </div>
                        ))}

                        {/* Linha de totais/resumo */}
                        {(() => {
                          // Calculate total value for inventory report
                          let totalInventoryValue = 0;
                          if (selectedReport?.type === "Inventário") {
                            totalInventoryValue = inventoryData.reduce((sum: number, item: any) => {
                              return sum + ((Number(item.unit_value) || 0) * (Number(item.quantity) || 0));
                            }, 0);
                          }

                          return (
                            <div
                              className="border-t-2 bg-muted/40 font-semibold"
                              style={{ display: "grid", gridTemplateColumns: `50px repeat(${columns.length}, minmax(100px, 1fr))` }}
                            >
                              <div className="p-2 border-r text-xs text-center bg-muted/60"></div>
                              <div className="p-2 border-r text-xs">TOTAL</div>
                              <div className="p-2 border-r text-xs font-mono">{data.length} itens</div>
                              {columns.slice(2).map((column, i) => (
                                <div key={i} className="p-2 border-r text-xs font-mono">
                                  {column === "valor_total" && selectedReport?.type === "Inventário" 
                                    ? `R$ ${totalInventoryValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                                    : ""}
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Ações do relatório */}
              <div className="flex justify-between items-center pt-2 border-t">
                <div className="text-xs text-muted-foreground">
                  Relatório gerado em tempo real • {getReportData(selectedReport).length} registros
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadPDF(selectedReport)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadExcel(selectedReport)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setViewReportOpen(false)}
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Relatorios;
