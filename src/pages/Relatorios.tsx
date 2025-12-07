import { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReportConfigModal } from "@/components/modals/ReportConfigModal";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, DollarSign, Users, Music, Palette, BarChart3, Plus, TrendingUp, Search, Filter, Calendar as CalendarIcon, Package, X } from "lucide-react";
import { format } from "date-fns";
import { cn, formatDateBR } from "@/lib/utils";
import { mockReports } from "@/data/mockData";

const Relatorios = () => {
  const [reportConfigOpen, setReportConfigOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState("");
  const [selectedData, setSelectedData] = useState([]);
  const [viewReportOpen, setViewReportOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();
  
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
    // Aqui seria implementada a lógica real de download do PDF
  };

  const handleDownloadExcel = (report: any) => {
    toast({
      title: "Download iniciado",
      description: `Baixando ${report.name} em formato Excel...`,
    });
    // Aqui seria implementada a lógica real de download do Excel
  };

  const handleViewReport = (report: any) => {
    setSelectedReport(report);
    setViewReportOpen(true);
  };

  // Função para gerar dados realistas do relatório baseado no tipo
  const getReportData = (report: any) => {
    switch (report.type) {
      case "Financeiro":
        return [
          {
            id: "FIN001",
            descricao: "Receita com Streams - Spotify",
            tipo: "receitas",
            valor: "R$ 15.230,00",
            categoria: "streaming",
            data: "2024-01-15",
            status: "pago",
            cliente: "Spotify Brasil",
            observacoes: "Pagamento mensal de streams"
          },
          {
            id: "FIN002",
            descricao: "Show em São Paulo - Festa Junina",
            tipo: "receitas",
            valor: "R$ 82.500,00",
            categoria: "shows",
            data: "2024-01-20",
            status: "aprovado",
            cliente: "Empresa XYZ",
            observacoes: "Cachê do show + transporte"
          },
          {
            id: "FIN003",
            descricao: "Produção Musical - Estúdio ABC",
            tipo: "despesas",
            valor: "R$ 8.450,00",
            categoria: "producao",
            data: "2024-01-10",
            status: "pago",
            cliente: "Estúdio ABC",
            observacoes: "Gravação e mixagem"
          },
        ];
      case "Artistas":
        return [
          {
            id: "ART001",
            nome_artistico: "João Silva",
            nome_completo: "João da Silva Santos",
            genero: "Sertanejo",
            email: "joao@email.com",
            telefone: "(11) 99999-1111",
            cpf_cnpj: "123.456.789-00",
            banco: "Nubank",
            agencia: "0001",
            conta: "12345-6",
            status: "Ativo",
            spotify: "3.2M streams",
            instagram: "@joaosilva",
            data_cadastro: "2023-06-15"
          },
          {
            id: "ART002",
            nome_artistico: "Maria Santos",
            nome_completo: "Maria Santos Oliveira",
            genero: "Pop",
            email: "maria@email.com",
            telefone: "(11) 99999-2222",
            cpf_cnpj: "987.654.321-00",
            banco: "Itaú",
            agencia: "0234",
            conta: "67890-1",
            status: "Ativo",
            spotify: "1.8M streams",
            instagram: "@mariasantos",
            data_cadastro: "2023-07-20"
          },
        ];
      case "Músicas":
        return [
          {
            id: "MUS001",
            titulo: "Verão 2024",
            artista: "João Silva",
            genero: "Sertanejo",
            isrc: "BRXXX2401234",
            compositores: "João Silva, Pedro Costa",
            produtores: "Studio XYZ",
            data_lancamento: "2024-01-15",
            plataformas: "Spotify, Apple Music, YouTube",
            streams: "850K",
            status: "Ativo",
            duracao: "3:45",
            album: "EP Verão Total"
          },
          {
            id: "MUS002",
            titulo: "Noite Perdida",
            artista: "Maria Santos",
            genero: "Pop",
            isrc: "BRXXX2401235",
            compositores: "Maria Santos",
            produtores: "Beat Factory",
            data_lancamento: "2024-01-20",
            plataformas: "Spotify, Apple Music, Deezer",
            streams: "650K",
            status: "Ativo",
            duracao: "4:12",
            album: "Single"
          },
        ];
      case "Lançamentos":
        return [
          {
            id: "REL001",
            titulo: "EP Verão Total",
            artista: "João Silva",
            tipo: "EP",
            data_lancamento: "2024-01-15",
            status: "Lançado",
            plataformas: "Spotify, Apple Music, YouTube Music, Deezer",
            distribuidor: "CD Baby",
            total_faixas: "4",
            genero: "Sertanejo",
            label: "Indie Records",
            observacoes: "Lançamento promocional de verão"
          },
          {
            id: "REL002", 
            titulo: "Noite Perdida",
            artista: "Maria Santos",
            tipo: "Single",
            data_lancamento: "2024-02-01",
            status: "Em produção",
            plataformas: "Spotify, Apple Music, Deezer",
            distribuidor: "DistroKid",
            total_faixas: "1",
            genero: "Pop",
            label: "Universal Music",
            observacoes: "Single promocional para novo álbum"
          },
        ];
      case "Inventário":
        return [
          {
            id: "INV001",
            item: "Microfone Shure SM58",
            categoria: "Microfones",
            quantidade: "5",
            status: "Disponível",
            localizacao: "Estúdio A",
            data_aquisicao: "2023-05-10",
            valor_unitario: "R$ 850,00",
            valor_total: "R$ 4.250,00",
            fornecedor: "Music Store",
            observacoes: "Estado excelente"
          },
          {
            id: "INV002",
            item: "Guitarra Fender Stratocaster",
            categoria: "Instrumentos",
            quantidade: "2",
            status: "1 disponível, 1 em manutenção",
            localizacao: "Sala de Instrumentos",
            data_aquisicao: "2023-03-15",
            valor_unitario: "R$ 3.200,00",
            valor_total: "R$ 6.400,00",
            fornecedor: "Musical Brasil",
            observacoes: "Uma unidade necessita troca de cordas"
          },
        ];
      default:
        return [];
    }
  };

  // Use mock reports
  const reports = mockReports;
  
  // Calcular estatísticas para o resumo
  const totalReports = reports.length;
  const completedReports = reports.filter(r => r.status === "Concluído").length;
  const inProgressReports = reports.filter(r => r.status === "Em andamento").length;
  const reportsByType = {};
  const mostUsedType = "Financeiro";
  const totalSize = "7.4 MB";
  const filteredReports = reports;
  return <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full h-full px-4 py-4 space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-foreground">Relatórios Personalizáveis</h1>
                <p className="text-muted-foreground">
                  Configure e gere relatórios com visual totalmente personalizável
                </p>
              </div>
              <Button className="gap-2" onClick={() => handleCustomReport("custom", [])}>
                <Palette className="h-4 w-4" />
                Criar Relatório Personalizado
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar relatórios por nome, descrição ou autor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {/* Data Inicial */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[160px] justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "dd/MM/yyyy") : "Data inicial"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>

                  {/* Data Final */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[160px] justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "dd/MM/yyyy") : "Data final"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>

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
                      <SelectItem value="Lançamentos">Lançamentos</SelectItem>
                      <SelectItem value="Inventário">Inventário</SelectItem>
                      <SelectItem value="CRM">CRM</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="Concluído">Concluído</SelectItem>
                      <SelectItem value="Em andamento">Em andamento</SelectItem>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Limpar filtros de data */}
                  {(startDate || endDate) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setStartDate(undefined);
                        setEndDate(undefined);
                      }}
                      className="h-10 px-2"
                      title="Limpar filtros de data"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-foreground">
                  Relatórios ({filteredReports.length})
                </h2>
                <Badge variant="outline" className="text-sm">
                  {filteredReports.length} de {reports.length} relatórios
                </Badge>
              </div>
              
              {filteredReports.length > 0 ? (
                <div className="grid gap-4">
                  {filteredReports.map((report) => (
                    <Card key={report.id} className="hover:shadow-md transition-all">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <CardTitle className="text-lg">{report.name}</CardTitle>
                              <Badge variant={report.status === "Concluído" ? "default" : "secondary"}>
                                {report.status}
                              </Badge>
                              <Badge variant="outline">{report.type}</Badge>
                            </div>
                            <CardDescription className="text-sm mb-2">
                              {report.description}
                            </CardDescription>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <span>📅</span>
                                {formatDateBR(report.createdAt)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {report.author}
                              </div>
                              <div className="flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                {report.size}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDownloadPDF(report)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Baixar PDF
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDownloadExcel(report)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Baixar Excel
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleViewReport(report)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Visualizar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-8">
                  <CardContent>
                    <div className="flex flex-col items-center gap-3">
                      <Search className="h-12 w-12 text-muted-foreground" />
                      <h3 className="text-lg font-medium">Nenhum relatório encontrado</h3>
                      <p className="text-muted-foreground">
                        Tente ajustar os filtros ou criar um novo relatório.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
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
              {/* Informações do relatório - compactas */}
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="p-2 bg-muted/30 rounded border">
                  <p className="text-muted-foreground mb-1">Tipo</p>
                  <p className="font-medium">{selectedReport.type}</p>
                </div>
                <div className="p-2 bg-muted/30 rounded border">
                  <p className="text-muted-foreground mb-1">Status</p>
                  <p className="font-medium">{selectedReport.status}</p>
                </div>
                <div className="p-2 bg-muted/30 rounded border">
                  <p className="text-muted-foreground mb-1">Criado em</p>
                  <p className="font-medium">{formatDateBR(selectedReport.createdAt)}</p>
                </div>
                <div className="p-2 bg-muted/30 rounded border">
                  <p className="text-muted-foreground mb-1">Autor</p>
                  <p className="font-medium">{selectedReport.author}</p>
                </div>
              </div>

              {/* Tabela estilo planilha */}
              <div className="overflow-auto max-h-[60vh] border border-border rounded-md bg-background">
                <div className="min-w-full">
                  {/* Cabeçalho dinâmico baseado no tipo de relatório */}
                  {(() => {
                    const data = getReportData(selectedReport);
                    if (data.length === 0) return null;
                    
                    const columns = Object.keys(data[0]);
                    const columnCount = columns.length;
                    
                    return (
                      <>
                        {/* Cabeçalho estilo Excel */}
                        <div className={`grid grid-cols-${columnCount + 1} border-b bg-muted/50 sticky top-0`} 
                             style={{ gridTemplateColumns: `50px repeat(${columnCount}, 1fr)` }}>
                          <div className="p-2 border-r text-xs font-semibold text-center bg-muted/70">#</div>
                          {columns.map((column) => (
                            <div key={column} className="p-2 border-r text-xs font-semibold bg-muted/70 capitalize">
                              {column.replace(/_/g, ' ')}
                            </div>
                          ))}
                        </div>
                        
                        {/* Dados estilo planilha */}
                        {data.map((row, index) => (
                          <div key={index} 
                               className={`grid grid-cols-${columnCount + 1} border-b hover:bg-muted/30 transition-colors`}
                               style={{ gridTemplateColumns: `50px repeat(${columnCount}, 1fr)` }}>
                            <div className="p-2 border-r text-xs text-center font-mono bg-muted/20 text-muted-foreground">
                              {String(index + 1).padStart(2, '0')}
                            </div>
                            {columns.map((column) => (
                              <div key={column} className="p-2 border-r text-xs">
                                {row[column as keyof typeof row]}
                              </div>
                            ))}
                          </div>
                        ))}
                        
                        {/* Linha de totais/resumo */}
                        <div className={`grid grid-cols-${columnCount + 1} border-t-2 bg-muted/40 font-semibold`}
                             style={{ gridTemplateColumns: `50px repeat(${columnCount}, 1fr)` }}>
                          <div className="p-2 border-r text-xs text-center bg-muted/60"></div>
                          <div className="p-2 border-r text-xs">TOTAL DE REGISTROS</div>
                          <div className="p-2 border-r text-xs font-mono">{data.length} itens</div>
                          {Array.from({ length: columnCount - 2 }).map((_, i) => (
                            <div key={i} className="p-2 border-r text-xs"></div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Ações do relatório */}
              <div className="flex justify-between items-center pt-2 border-t">
                <div className="text-xs text-muted-foreground">
                  Relatório gerado automaticamente • {getReportData(selectedReport).length} registros
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
    </SidebarProvider>;
};
export default Relatorios;