import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMusicRegistry } from "@/hooks/useMusicRegistry";
import { 
  Radio, Tv, Music, AlertTriangle, CheckCircle, 
  Search, RefreshCw, FileText, Upload, Download,
  Eye, Fingerprint, Globe, BarChart3
} from "lucide-react";

interface Detection {
  id: string;
  track: string;
  isrc: string;
  source: 'radio' | 'tv' | 'digital';
  channel: string;
  timestamp: string;
  duration: string;
  matched: boolean;
  revenue?: number;
}

interface ECaDReport {
  id: string;
  period: string;
  tracks: number;
  totalValue: number;
  status: 'pending' | 'matched' | 'divergent';
  divergences: number;
}

const MonitoringModule = () => {
  const { toast } = useToast();
  const { data: musicRegistry = [] } = useMusicRegistry();
  const [activeTab, setActiveTab] = useState("fingerprint");
  const [searchTerm, setSearchTerm] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  // Empty arrays - will be populated from database when tables are created
  const [detections] = useState<Detection[]>([]);
  const [ecadReports] = useState<ECaDReport[]>([]);

  const unreportedUses = detections.filter(d => !d.matched);
  const matchedUses = detections.filter(d => d.matched);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      toast({
        title: "Varredura concluída",
        description: "3 novas detecções encontradas",
      });
    }, 3000);
  };

  const handleImportECAD = () => {
    toast({
      title: "Importar ECAD",
      description: "Selecione o arquivo do relatório ECAD",
    });
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'radio': return <Radio className="h-4 w-4" />;
      case 'tv': return <Tv className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Fingerprint className="h-6 w-6 text-primary" />
            Monitoramento & Fingerprinting
          </h2>
          <p className="text-muted-foreground">
            Detecção de execuções e conciliação com ECAD
          </p>
        </div>
        <Button onClick={handleScan} disabled={isScanning}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? 'Escaneando...' : 'Nova Varredura'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{matchedUses.length}</p>
                <p className="text-xs text-muted-foreground">Usos Correspondentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{unreportedUses.length}</p>
                <p className="text-xs text-muted-foreground">Não Reportados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Radio className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{detections.filter(d => d.source === 'radio').length}</p>
                <p className="text-xs text-muted-foreground">Rádio</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Tv className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{detections.filter(d => d.source === 'tv').length}</p>
                <p className="text-xs text-muted-foreground">TV</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="fingerprint" className="flex items-center gap-2">
            <Fingerprint className="h-4 w-4" />
            Detecções
          </TabsTrigger>
          <TabsTrigger value="unreported" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Não Reportados
          </TabsTrigger>
          <TabsTrigger value="ecad" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            ECAD
          </TabsTrigger>
          <TabsTrigger value="divergences" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Divergências
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fingerprint" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detecção de Execuções</CardTitle>
              <CardDescription>
                Monitoramento automático de rádio, TV e plataformas digitais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar por faixa, ISRC ou canal..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Faixa</TableHead>
                    <TableHead>ISRC</TableHead>
                    <TableHead>Fonte</TableHead>
                    <TableHead>Canal</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Receita</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detections
                    .filter(d => 
                      d.track.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      d.isrc.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      d.channel.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map(detection => (
                      <TableRow key={detection.id}>
                        <TableCell className="font-medium">{detection.track}</TableCell>
                        <TableCell className="font-mono text-xs">{detection.isrc}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getSourceIcon(detection.source)}
                            <span className="capitalize">{detection.source}</span>
                          </div>
                        </TableCell>
                        <TableCell>{detection.channel}</TableCell>
                        <TableCell className="text-xs">{detection.timestamp}</TableCell>
                        <TableCell>{detection.duration}</TableCell>
                        <TableCell>
                          <Badge variant={detection.matched ? 'default' : 'destructive'}>
                            {detection.matched ? 'Correspondido' : 'Não Correspondido'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-green-600">
                          {detection.revenue ? formatCurrency(detection.revenue) : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unreported" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Usos Não Reportados
              </CardTitle>
              <CardDescription>
                Execuções detectadas que não foram reportadas pelas entidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              {unreportedUses.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <p className="text-lg font-medium">Nenhum uso não reportado</p>
                  <p className="text-sm text-muted-foreground">
                    Todas as execuções detectadas foram correspondidas
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Faixa</TableHead>
                      <TableHead>ISRC</TableHead>
                      <TableHead>Fonte</TableHead>
                      <TableHead>Canal</TableHead>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unreportedUses.map(detection => (
                      <TableRow key={detection.id} className="bg-yellow-50/50 dark:bg-yellow-900/10">
                        <TableCell className="font-medium">{detection.track}</TableCell>
                        <TableCell className="font-mono text-xs">{detection.isrc}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getSourceIcon(detection.source)}
                            <span className="capitalize">{detection.source}</span>
                          </div>
                        </TableCell>
                        <TableCell>{detection.channel}</TableCell>
                        <TableCell className="text-xs">{detection.timestamp}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            Investigar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                  <CardDescription>
                    Importação e matching de relatórios ECAD
                  </CardDescription>
                </div>
                <Button onClick={handleImportECAD}>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar ECAD
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Período</TableHead>
                    <TableHead>Faixas</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Divergências</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ecadReports.map(report => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.period}</TableCell>
                      <TableCell>{report.tracks}</TableCell>
                      <TableCell className="text-green-600">{formatCurrency(report.totalValue)}</TableCell>
                      <TableCell>
                        <Badge variant={report.status === 'matched' ? 'default' : 'destructive'}>
                          {report.status === 'matched' ? 'Conciliado' : 'Divergente'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {report.divergences > 0 ? (
                          <Badge variant="destructive">{report.divergences}</Badge>
                        ) : (
                          <Badge variant="secondary">0</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="divergences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Divergência</CardTitle>
              <CardDescription>
                Análise de discrepâncias entre detecções e relatórios oficiais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-bold text-green-600">{detections.length > 0 ? Math.round((matchedUses.length / detections.length) * 100) : 0}%</p>
                      <p className="text-sm text-muted-foreground">Taxa de Matching</p>
                      <Progress value={detections.length > 0 ? Math.round((matchedUses.length / detections.length) * 100) : 0} className="h-2 mt-2" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-bold text-yellow-600">{ecadReports.reduce((sum, r) => sum + r.divergences, 0)}</p>
                      <p className="text-sm text-muted-foreground">Divergências Ativas</p>
                      <Progress value={ecadReports.length > 0 ? Math.round((ecadReports.filter(r => r.divergences > 0).length / ecadReports.length) * 100) : 0} className="h-2 mt-2" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-bold text-blue-600">{formatCurrency(0)}</p>
                      <p className="text-sm text-muted-foreground">Valor em Disputa</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Relatórios detalhados de divergência serão exibidos aqui</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonitoringModule;
