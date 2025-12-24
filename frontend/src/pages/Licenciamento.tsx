import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSyncLicenses, SyncLicense } from "@/hooks/useSyncLicenses";
import { useArtists } from "@/hooks/useArtists";
import { useMusicRegistry } from "@/hooks/useMusicRegistry";
import { Plus, Search, Film, Tv, Gamepad2, Music, DollarSign, FileText, Calendar, Building2, Eye, Pencil, Trash2 } from "lucide-react";
import { formatDateBR } from "@/lib/utils";

const statusColors: Record<string, string> = {
  proposta: "bg-blue-500/20 text-blue-400",
  negociacao: "bg-yellow-500/20 text-yellow-400",
  aprovado: "bg-green-500/20 text-green-400",
  ativo: "bg-emerald-500/20 text-emerald-400",
  expirado: "bg-gray-500/20 text-gray-400",
  cancelado: "bg-red-500/20 text-red-400",
};

const mediaTypeIcons: Record<string, any> = {
  tv: Tv,
  cinema: Film,
  games: Gamepad2,
  ads: Building2,
  streaming: Music,
};

const Licenciamento = () => {
  const { licenses, isLoading, createLicense, updateLicense, deleteLicense } = useSyncLicenses();
  const artistsQuery = useArtists();
  const musicQuery = useMusicRegistry();
  const artists = artistsQuery.data || [];
  const musicList = musicQuery.data || [];
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMediaType, setFilterMediaType] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<SyncLicense | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    license_type: "sync",
    media_type: "",
    territory: "worldwide",
    duration: "",
    exclusivity: false,
    artist_id: "",
    music_registry_id: "",
    license_fee: "",
    advance_payment: "",
    royalty_percentage: "",
    status: "proposta",
    proposal_date: "",
    start_date: "",
    end_date: "",
    usage_description: "",
    project_name: "",
    client_name: "",
    client_company: "",
  });

  const filteredLicenses = licenses.filter(license => {
    const matchesSearch = license.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.project_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || license.status === filterStatus;
    const matchesMedia = filterMediaType === "all" || license.media_type === filterMediaType;
    return matchesSearch && matchesStatus && matchesMedia;
  });

  const handleSubmit = () => {
    const payload = {
      ...formData,
      license_fee: formData.license_fee ? parseFloat(formData.license_fee) : null,
      advance_payment: formData.advance_payment ? parseFloat(formData.advance_payment) : null,
      royalty_percentage: formData.royalty_percentage ? parseFloat(formData.royalty_percentage) : null,
      artist_id: formData.artist_id || null,
      music_registry_id: formData.music_registry_id || null,
    };

    if (editingLicense) {
      updateLicense.mutate({ id: editingLicense.id, ...payload });
    } else {
      createLicense.mutate(payload);
    }
    setIsFormOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      license_type: "sync",
      media_type: "",
      territory: "worldwide",
      duration: "",
      exclusivity: false,
      artist_id: "",
      music_registry_id: "",
      license_fee: "",
      advance_payment: "",
      royalty_percentage: "",
      status: "proposta",
      proposal_date: "",
      start_date: "",
      end_date: "",
      usage_description: "",
      project_name: "",
      client_name: "",
      client_company: "",
    });
    setEditingLicense(null);
  };

  const openEdit = (license: SyncLicense) => {
    setEditingLicense(license);
    setFormData({
      title: license.title,
      description: license.description || "",
      license_type: license.license_type,
      media_type: license.media_type || "",
      territory: license.territory || "worldwide",
      duration: license.duration || "",
      exclusivity: license.exclusivity || false,
      artist_id: license.artist_id || "",
      music_registry_id: license.music_registry_id || "",
      license_fee: license.license_fee?.toString() || "",
      advance_payment: license.advance_payment?.toString() || "",
      royalty_percentage: license.royalty_percentage?.toString() || "",
      status: license.status,
      proposal_date: license.proposal_date || "",
      start_date: license.start_date || "",
      end_date: license.end_date || "",
      usage_description: license.usage_description || "",
      project_name: license.project_name || "",
      client_name: license.client_name || "",
      client_company: license.client_company || "",
    });
    setIsFormOpen(true);
  };

  // KPIs
  const totalValue = licenses.reduce((sum, l) => sum + (l.license_fee || 0), 0);
  const activeCount = licenses.filter(l => l.status === 'ativo').length;
  const proposalCount = licenses.filter(l => l.status === 'proposta' || l.status === 'negociacao').length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full h-full px-4 py-3 space-y-3">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-9 w-9" />
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Licenciamento & Sync</h1>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Licenças</p>
                      <p className="text-2xl font-bold">{licenses.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <Music className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Licenças Ativas</p>
                      <p className="text-2xl font-bold">{activeCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-500/10">
                      <Calendar className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Em Negociação</p>
                      <p className="text-2xl font-bold">{proposalCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <DollarSign className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valor Total</p>
                      <p className="text-2xl font-bold">R$ {totalValue.toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="catalog" className="space-y-4">
              <TabsList>
                <TabsTrigger value="catalog">Catálogo de Licenças</TabsTrigger>
                <TabsTrigger value="proposals">Propostas</TabsTrigger>
                <TabsTrigger value="active">Licenças Ativas</TabsTrigger>
              </TabsList>

              <TabsContent value="catalog" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Todas as Licenças</CardTitle>
                    <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) resetForm(); }}>
                      <DialogTrigger asChild>
                        <Button><Plus className="h-4 w-4 mr-2" /> Nova Licença</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{editingLicense ? "Editar Licença" : "Nova Licença de Sync"}</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                          <div className="col-span-2">
                            <Label>Título *</Label>
                            <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Nome da licença" />
                          </div>
                          <div>
                            <Label>Tipo de Licença</Label>
                            <Select value={formData.license_type} onValueChange={v => setFormData({...formData, license_type: v})}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sync">Sync (Sincronização)</SelectItem>
                                <SelectItem value="master">Master</SelectItem>
                                <SelectItem value="both">Sync + Master</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Tipo de Mídia</Label>
                            <Select value={formData.media_type} onValueChange={v => setFormData({...formData, media_type: v})}>
                              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="tv">TV</SelectItem>
                                <SelectItem value="cinema">Cinema</SelectItem>
                                <SelectItem value="ads">Publicidade</SelectItem>
                                <SelectItem value="games">Games</SelectItem>
                                <SelectItem value="streaming">Streaming</SelectItem>
                                <SelectItem value="social">Redes Sociais</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Artista</Label>
                            <Select value={formData.artist_id} onValueChange={v => setFormData({...formData, artist_id: v})}>
                              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                              <SelectContent>
                                {artists.map(a => (
                                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Obra</Label>
                            <Select value={formData.music_registry_id} onValueChange={v => setFormData({...formData, music_registry_id: v})}>
                              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                              <SelectContent>
                                {musicList.map(m => (
                                  <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Cliente</Label>
                            <Input value={formData.client_name} onChange={e => setFormData({...formData, client_name: e.target.value})} placeholder="Nome do cliente" />
                          </div>
                          <div>
                            <Label>Empresa</Label>
                            <Input value={formData.client_company} onChange={e => setFormData({...formData, client_company: e.target.value})} placeholder="Empresa do cliente" />
                          </div>
                          <div>
                            <Label>Projeto/Produção</Label>
                            <Input value={formData.project_name} onChange={e => setFormData({...formData, project_name: e.target.value})} placeholder="Nome do projeto" />
                          </div>
                          <div>
                            <Label>Território</Label>
                            <Select value={formData.territory} onValueChange={v => setFormData({...formData, territory: v})}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="worldwide">Mundial</SelectItem>
                                <SelectItem value="brazil">Brasil</SelectItem>
                                <SelectItem value="latam">América Latina</SelectItem>
                                <SelectItem value="north_america">América do Norte</SelectItem>
                                <SelectItem value="europe">Europa</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Duração</Label>
                            <Select value={formData.duration} onValueChange={v => setFormData({...formData, duration: v})}>
                              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="perpetuo">Perpétuo</SelectItem>
                                <SelectItem value="1_ano">1 Ano</SelectItem>
                                <SelectItem value="2_anos">2 Anos</SelectItem>
                                <SelectItem value="5_anos">5 Anos</SelectItem>
                                <SelectItem value="custom">Personalizado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Taxa de Licença (R$)</Label>
                            <Input type="number" value={formData.license_fee} onChange={e => setFormData({...formData, license_fee: e.target.value})} placeholder="0,00" />
                          </div>
                          <div>
                            <Label>Adiantamento (R$)</Label>
                            <Input type="number" value={formData.advance_payment} onChange={e => setFormData({...formData, advance_payment: e.target.value})} placeholder="0,00" />
                          </div>
                          <div>
                            <Label>Royalties (%)</Label>
                            <Input type="number" value={formData.royalty_percentage} onChange={e => setFormData({...formData, royalty_percentage: e.target.value})} placeholder="0" />
                          </div>
                          <div>
                            <Label>Status</Label>
                            <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="proposta">Proposta</SelectItem>
                                <SelectItem value="negociacao">Em Negociação</SelectItem>
                                <SelectItem value="aprovado">Aprovado</SelectItem>
                                <SelectItem value="ativo">Ativo</SelectItem>
                                <SelectItem value="expirado">Expirado</SelectItem>
                                <SelectItem value="cancelado">Cancelado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Data da Proposta</Label>
                            <Input type="date" value={formData.proposal_date} onChange={e => setFormData({...formData, proposal_date: e.target.value})} />
                          </div>
                          <div>
                            <Label>Data Início</Label>
                            <Input type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
                          </div>
                          <div>
                            <Label>Data Fim</Label>
                            <Input type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
                          </div>
                          <div className="col-span-2">
                            <Label>Descrição do Uso</Label>
                            <Textarea value={formData.usage_description} onChange={e => setFormData({...formData, usage_description: e.target.value})} placeholder="Descreva como a música será utilizada" />
                          </div>
                          <div className="col-span-2">
                            <Label>Descrição</Label>
                            <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Observações gerais" />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
                          <Button onClick={handleSubmit} disabled={!formData.title}>Salvar</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 mb-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Buscar licenças..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                      </div>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="proposta">Proposta</SelectItem>
                          <SelectItem value="negociacao">Negociação</SelectItem>
                          <SelectItem value="aprovado">Aprovado</SelectItem>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="expirado">Expirado</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterMediaType} onValueChange={setFilterMediaType}>
                        <SelectTrigger className="w-40"><SelectValue placeholder="Mídia" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          <SelectItem value="tv">TV</SelectItem>
                          <SelectItem value="cinema">Cinema</SelectItem>
                          <SelectItem value="ads">Publicidade</SelectItem>
                          <SelectItem value="games">Games</SelectItem>
                          <SelectItem value="streaming">Streaming</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Título</TableHead>
                          <TableHead>Artista/Obra</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Mídia</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLicenses.map(license => {
                          const MediaIcon = mediaTypeIcons[license.media_type || ''] || FileText;
                          return (
                            <TableRow key={license.id}>
                              <TableCell className="font-medium">{license.title}</TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <p>{license.artists?.name || license.artists?.name || '-'}</p>
                                  <p className="text-muted-foreground">{license.music_registry?.title || '-'}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <p>{license.client_name || '-'}</p>
                                  <p className="text-muted-foreground">{license.client_company || ''}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <MediaIcon className="h-4 w-4" />
                                  <span className="capitalize">{license.media_type || '-'}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {license.license_fee ? `R$ ${license.license_fee.toLocaleString('pt-BR')}` : '-'}
                              </TableCell>
                              <TableCell>
                                <Badge className={statusColors[license.status] || ''}>
                                  {license.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="icon" onClick={() => openEdit(license)}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => deleteLicense.mutate(license.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {filteredLicenses.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                              Nenhuma licença encontrada
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="proposals">
                <Card>
                  <CardHeader>
                    <CardTitle>Propostas em Andamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {licenses.filter(l => l.status === 'proposta' || l.status === 'negociacao').map(license => (
                        <div key={license.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{license.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {license.client_name} - {license.project_name}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-medium">{license.license_fee ? `R$ ${license.license_fee.toLocaleString('pt-BR')}` : 'A definir'}</p>
                              <p className="text-sm text-muted-foreground">{license.proposal_date ? formatDateBR(license.proposal_date) : '-'}</p>
                            </div>
                            <Badge className={statusColors[license.status]}>{license.status}</Badge>
                          </div>
                        </div>
                      ))}
                      {licenses.filter(l => l.status === 'proposta' || l.status === 'negociacao').length === 0 && (
                        <p className="text-center text-muted-foreground py-8">Nenhuma proposta em andamento</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="active">
                <Card>
                  <CardHeader>
                    <CardTitle>Licenças Ativas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {licenses.filter(l => l.status === 'ativo').map(license => (
                        <div key={license.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{license.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {license.artists?.name || license.artists?.name} - {license.music_registry?.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-medium">{license.license_fee ? `R$ ${license.license_fee.toLocaleString('pt-BR')}` : '-'}</p>
                              <p className="text-sm text-muted-foreground">
                                {license.start_date && license.end_date ? 
                                  `${formatDateBR(license.start_date)} - ${formatDateBR(license.end_date)}` : 
                                  'Perpétuo'
                                }
                              </p>
                            </div>
                            <Badge className={statusColors[license.status]}>{license.status}</Badge>
                          </div>
                        </div>
                      ))}
                      {licenses.filter(l => l.status === 'ativo').length === 0 && (
                        <p className="text-center text-muted-foreground py-8">Nenhuma licença ativa</p>
                      )}
                    </div>
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

export default Licenciamento;
