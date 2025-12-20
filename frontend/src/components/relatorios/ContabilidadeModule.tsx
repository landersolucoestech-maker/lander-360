import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, DollarSign, TrendingUp, TrendingDown, FileText, Users, FolderOpen, RefreshCw, Download, CheckCircle2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useArtists } from "@/hooks/useArtists";
import { useProjects } from "@/hooks/useProjects";
import { useFinancialTransactions } from "@/hooks/useFinancial";

const ContabilidadeModule = () => {
  const [activeTab, setActiveTab] = useState("fechamento");
  const [selectedPeriod, setSelectedPeriod] = useState("2024-01");
  const [selectedArtist, setSelectedArtist] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const { toast } = useToast();
  
  const { data: artists = [] } = useArtists();
  const { data: projects = [] } = useProjects();
  const { data: transactions = [] } = useFinancialTransactions();

  // Calculate totals
  const totalReceitas = transactions
    .filter((t: any) => t.type === 'receitas' || t.type === 'income')
    .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
  
  const totalDespesas = transactions
    .filter((t: any) => t.type === 'despesas' || t.type === 'expense')
    .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
  
  const lucroLiquido = totalReceitas - totalDespesas;

  // Empty arrays - will be populated from database when tables are created
  const [closedPeriods] = useState<any[]>([]);
  const [recoupmentData] = useState<any[]>([]);

  const handleClosePeriod = () => {
    toast({
      title: "Fechamento iniciado",
      description: `Processando fechamento do período ${selectedPeriod}...`,
    });
  };

  const handleExportPL = (type: string) => {
    toast({
      title: "Exportação iniciada",
      description: `Exportando P&L por ${type}...`,
    });
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receitas</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalReceitas)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Despesas</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDespesas)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lucro Líquido</p>
                <p className={`text-2xl font-bold ${lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(lucroLiquido)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Períodos Fechados</p>
                <p className="text-2xl font-bold">{closedPeriods.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="fechamento" className="gap-2">
            <Calendar className="h-4 w-4" />
            Fechamento de Período
          </TabsTrigger>
          <TabsTrigger value="pl-projeto" className="gap-2">
            <FolderOpen className="h-4 w-4" />
            P&L por Projeto
          </TabsTrigger>
          <TabsTrigger value="pl-artista" className="gap-2">
            <Users className="h-4 w-4" />
            P&L por Artista
          </TabsTrigger>
          <TabsTrigger value="recoupment" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Recoupment
          </TabsTrigger>
        </TabsList>

        {/* Fechamento de Período */}
        <TabsContent value="fechamento" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Fechamento Automático de Períodos</CardTitle>
                  <CardDescription>Gere demonstrativos contábeis por período</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024-02">Fevereiro/2024</SelectItem>
                      <SelectItem value="2024-01">Janeiro/2024</SelectItem>
                      <SelectItem value="2023-12">Dezembro/2023</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleClosePeriod}>Fechar Período</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Período</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Fechamento</TableHead>
                    <TableHead className="text-right">Receitas</TableHead>
                    <TableHead className="text-right">Despesas</TableHead>
                    <TableHead className="text-right">Resultado</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {closedPeriods.map((period) => (
                    <TableRow key={period.period}>
                      <TableCell className="font-medium">{period.period}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-500/20 text-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Fechado
                        </Badge>
                      </TableCell>
                      <TableCell>{period.date}</TableCell>
                      <TableCell className="text-right text-green-600">{formatCurrency(period.receitas)}</TableCell>
                      <TableCell className="text-right text-red-600">{formatCurrency(period.despesas)}</TableCell>
                      <TableCell className={`text-right font-medium ${period.resultado >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(period.resultado)}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Exportar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* P&L por Projeto */}
        <TabsContent value="pl-projeto" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>P&L por Projeto</CardTitle>
                  <CardDescription>Análise de receitas e custos por projeto</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Selecionar projeto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os projetos</SelectItem>
                      {projects.map((project: any) => (
                        <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => handleExportPL('projeto')}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum projeto encontrado.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Projeto</TableHead>
                      <TableHead>Artista</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Orçamento</TableHead>
                      <TableHead className="text-right">Receitas</TableHead>
                      <TableHead className="text-right">Custos</TableHead>
                      <TableHead className="text-right">Resultado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project: any) => {
                      const artist = artists.find((a: any) => a.id === project.artist_id);
                      const projectTransactions = transactions.filter((t: any) => t.project_id === project.id);
                      const receitas = projectTransactions
                        .filter((t: any) => t.type === 'receitas' || t.type === 'income')
                        .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
                      const custos = projectTransactions
                        .filter((t: any) => t.type === 'despesas' || t.type === 'expense')
                        .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
                      const resultado = receitas - custos;
                      
                      return (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">{project.name}</TableCell>
                          <TableCell>{artist?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{project.status || 'Em andamento'}</Badge>
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(project.budget || 0)}</TableCell>
                          <TableCell className="text-right text-green-600">{formatCurrency(receitas)}</TableCell>
                          <TableCell className="text-right text-red-600">{formatCurrency(custos)}</TableCell>
                          <TableCell className={`text-right font-medium ${resultado >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(resultado)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* P&L por Artista */}
        <TabsContent value="pl-artista" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>P&L por Artista</CardTitle>
                  <CardDescription>Análise de lucratividade por artista</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedArtist} onValueChange={setSelectedArtist}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Selecionar artista" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os artistas</SelectItem>
                      {artists.map((artist: any) => (
                        <SelectItem key={artist.id} value={artist.id}>{artist.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => handleExportPL('artista')}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {artists.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum artista encontrado.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Artista</TableHead>
                      <TableHead>Projetos</TableHead>
                      <TableHead className="text-right">Receitas</TableHead>
                      <TableHead className="text-right">Custos</TableHead>
                      <TableHead className="text-right">Resultado</TableHead>
                      <TableHead className="text-right">Margem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {artists.map((artist: any) => {
                      const artistTransactions = transactions.filter((t: any) => t.artist_id === artist.id);
                      const artistProjects = projects.filter((p: any) => p.artist_id === artist.id);
                      const receitas = artistTransactions
                        .filter((t: any) => t.type === 'receitas' || t.type === 'income')
                        .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
                      const custos = artistTransactions
                        .filter((t: any) => t.type === 'despesas' || t.type === 'expense')
                        .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
                      const resultado = receitas - custos;
                      const margem = receitas > 0 ? ((resultado / receitas) * 100).toFixed(1) : '0.0';
                      
                      return (
                        <TableRow key={artist.id}>
                          <TableCell className="font-medium">{artist.name}</TableCell>
                          <TableCell>{artistProjects.length}</TableCell>
                          <TableCell className="text-right text-green-600">{formatCurrency(receitas)}</TableCell>
                          <TableCell className="text-right text-red-600">{formatCurrency(custos)}</TableCell>
                          <TableCell className={`text-right font-medium ${resultado >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(resultado)}
                          </TableCell>
                          <TableCell className={`text-right ${Number(margem) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {margem}%
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recoupment */}
        <TabsContent value="recoupment" className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Recoupment Tracking</CardTitle>
                <CardDescription>Acompanhe a recuperação de adiantamentos</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Artista</TableHead>
                    <TableHead>Contrato</TableHead>
                    <TableHead className="text-right">Adiantamento</TableHead>
                    <TableHead className="text-right">Recoupado</TableHead>
                    <TableHead className="text-right">Pendente</TableHead>
                    <TableHead>Progresso</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recoupmentData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.artist}</TableCell>
                      <TableCell>{item.contract}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.advance)}</TableCell>
                      <TableCell className="text-right text-green-600">{formatCurrency(item.recouped)}</TableCell>
                      <TableCell className="text-right text-yellow-600">{formatCurrency(item.remaining)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${item.percentage === 100 ? 'bg-green-500' : 'bg-primary'}`}
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm">{item.percentage}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.percentage === 100 ? (
                          <Badge className="bg-green-500/20 text-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Quitado
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-500/20 text-yellow-600">
                            <Clock className="h-3 w-3 mr-1" />
                            Em andamento
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContabilidadeModule;
