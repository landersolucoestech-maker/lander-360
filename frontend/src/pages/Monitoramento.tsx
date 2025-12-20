import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Radio, Tv, AlertTriangle, CheckCircle2, Clock, Upload, Search, RefreshCw, FileText, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  useTodayDetections, 
  useDetectionStats, 
  useEcadReports, 
  useOpenDivergences,
  useCreateEcadReport 
} from "@/hooks/useMonitoramento";
import { formatDateTimeBR } from "@/lib/utils";

const Monitoramento = () => {
  const [activeTab, setActiveTab] = useState("deteccao");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: detections = [], isLoading: loadingDetections, refetch: refetchDetections } = useTodayDetections();
  const { data: stats, isLoading: loadingStats } = useDetectionStats();
  const { data: ecadReports = [], isLoading: loadingReports, refetch: refetchReports } = useEcadReports();
  const { data: divergences = [], isLoading: loadingDivergences } = useOpenDivergences();
  const createEcadReport = useCreateEcadReport();

  const handleImportECAD = () => {
    // Simulate creating a new ECAD report for import
    createEcadReport.mutate({
      report_period: new Date().toISOString().slice(0, 7), // YYYY-MM format
      report_type: 'monthly',
      import_status: 'processing',
    });
    
    toast({
      title: "Importação iniciada",
      description: "O relatório ECAD está sendo processado...",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Verificado</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">Pendente</Badge>;
      case "unreported":
        return <Badge className="bg-red-500/20 text-red-600 border-red-500/30">Não Reportado</Badge>;
      case "disputed":
        return <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/30">Disputado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getImportStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-600">Importado</Badge>;
      case "processing":
        return <Badge className="bg-blue-500/20 text-blue-600">Processando</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-600">Pendente</Badge>;
      case "error":
        return <Badge className="bg-red-500/20 text-red-600">Erro</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredDetections = detections.filter(d => 
    d.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.artist_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.station_channel?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full h-full px-4 py-3 space-y-3">
            {/* Header */}
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-9 w-9" />
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                  <Radio className="h-7 w-7 text-primary" />
                  Monitoramento & Fingerprinting
                </h1>
                <p className="text-muted-foreground">
                  Detecte execuções em rádio, TV e reconcilie com ECAD
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Detecções Hoje</p>
                      {loadingStats ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        <p className="text-2xl font-bold">{stats?.totalToday || 0}</p>
                      )}
                    </div>
                    <Radio className="h-8 w-8 text-primary/50" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pendentes</p>
                      {loadingStats ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        <p className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</p>
                      )}
                    </div>
                    <Clock className="h-8 w-8 text-yellow-500/50" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Não Reportados</p>
                      {loadingStats ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        <p className="text-2xl font-bold text-red-600">{stats?.unreported || 0}</p>
                      )}
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-500/50" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Taxa de Match</p>
                      {loadingStats ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        <p className="text-2xl font-bold text-green-600">{Math.round(stats?.matchRate || 0)}%</p>
                      )}
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-500/50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="deteccao" className="gap-2">
                  <Radio className="h-4 w-4" />
                  Detecção Rádio/TV
                </TabsTrigger>
                <TabsTrigger value="ecad" className="gap-2">
                  <FileText className="h-4 w-4" />
                  ECAD
                </TabsTrigger>
                <TabsTrigger value="divergencias" className="gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Divergências ({divergences.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="deteccao" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Detecções de Execução</CardTitle>
                        <CardDescription>Execuções detectadas em rádio e TV via fingerprinting</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="Buscar..." 
                            className="pl-9 w-64" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        <Button variant="outline" size="icon" onClick={() => refetchDetections()}>
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingDetections ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                          <Skeleton key={i} className="h-20 w-full" />
                        ))}
                      </div>
                    ) : filteredDetections.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Radio className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="font-medium">Nenhuma detecção encontrada hoje</p>
                        <p className="text-sm mt-1">As detecções de execução aparecerão aqui quando configurar um provedor de fingerprinting.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredDetections.map((detection) => (
                          <div key={detection.id} className="flex items-center justify-between p-4 rounded-lg border">
                            <div className="flex items-center gap-4">
                              <div className="p-2 rounded-lg bg-primary/10">
                                {detection.platform === "tv" ? (
                                  <Tv className="h-5 w-5 text-primary" />
                                ) : (
                                  <Radio className="h-5 w-5 text-primary" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{detection.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {detection.artist_name} • {detection.station_channel}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right text-sm">
                                <p>{formatDateTimeBR(detection.detected_at)}</p>
                                {detection.confidence_score && (
                                  <p className="text-muted-foreground">{detection.confidence_score}% confiança</p>
                                )}
                              </div>
                              {getStatusBadge(detection.status)}
                              <Button size="sm" variant="outline">Detalhes</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ecad" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Conciliação ECAD</CardTitle>
                        <CardDescription>Importe e reconcilie relatórios do ECAD</CardDescription>
                      </div>
                      <Button onClick={handleImportECAD} className="gap-2" disabled={createEcadReport.isPending}>
                        <Upload className="h-4 w-4" />
                        Importar Relatório ECAD
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingReports ? (
                      <div className="space-y-3">
                        {[1, 2].map(i => (
                          <Skeleton key={i} className="h-20 w-full" />
                        ))}
                      </div>
                    ) : ecadReports.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="font-medium">Nenhum relatório ECAD importado</p>
                        <p className="text-sm mt-1">Importe um relatório do ECAD para iniciar a conciliação.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {ecadReports.map((report) => (
                          <div key={report.id} className="flex items-center justify-between p-4 rounded-lg border">
                            <div className="flex items-center gap-4">
                              <FileText className="h-5 w-5 text-primary" />
                              <div>
                                <p className="font-medium">Período: {report.report_period}</p>
                                <p className="text-sm text-muted-foreground">
                                  {report.total_records} registros • {report.matched_records} matches • {report.divergent_records} divergências
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getImportStatusBadge(report.import_status)}
                              <Button size="sm" variant="outline">Ver Detalhes</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="divergencias" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Relatório de Divergências</CardTitle>
                    <CardDescription>Discrepâncias entre execuções detectadas e reportadas ao ECAD</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingDivergences ? (
                      <div className="space-y-3">
                        {[1, 2].map(i => (
                          <Skeleton key={i} className="h-20 w-full" />
                        ))}
                      </div>
                    ) : divergences.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" />
                        <p className="font-medium">Nenhuma divergência em aberto</p>
                        <p className="text-sm mt-1">Todas as execuções estão reconciliadas com o ECAD.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {divergences.map((div) => (
                          <div key={div.id} className="flex items-center justify-between p-4 rounded-lg border border-orange-500/30 bg-orange-500/5">
                            <div className="flex items-center gap-4">
                              <AlertTriangle className="h-5 w-5 text-orange-500" />
                              <div>
                                <p className="font-medium">
                                  {div.divergence_type === 'not_in_ecad' && 'Execução não reportada ao ECAD'}
                                  {div.divergence_type === 'not_detected' && 'Registro ECAD sem detecção'}
                                  {div.divergence_type === 'value_mismatch' && 'Divergência de valor'}
                                  {div.divergence_type === 'count_mismatch' && 'Divergência de quantidade'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Detectado: {div.detected_count || '-'} | ECAD: {div.ecad_count || '-'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-orange-500/20 text-orange-600">{div.status}</Badge>
                              <Button size="sm" variant="outline">Resolver</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Monitoramento;
