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
import { useTakedowns, Takedown } from "@/hooks/useTakedowns";
import { useArtists } from "@/hooks/useArtists";
import { useReleases } from "@/hooks/useReleases";
import { Plus, Search, AlertTriangle, CheckCircle, Clock, XCircle, Shield, ArrowDownCircle, ArrowUpCircle, Pencil, Trash2 } from "lucide-react";
import { formatDateBR } from "@/lib/utils";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  submitted: "bg-blue-500/20 text-blue-400",
  processing: "bg-purple-500/20 text-purple-400",
  resolved: "bg-green-500/20 text-green-400",
  rejected: "bg-red-500/20 text-red-400",
};

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  submitted: "Enviado",
  processing: "Em Processamento",
  resolved: "Resolvido",
  rejected: "Rejeitado",
};

const reasonLabels: Record<string, string> = {
  copyright: "Violação de Copyright",
  content_id: "Content ID",
  trademark: "Marca Registrada",
  request: "Solicitação do Artista",
  legal: "Ação Legal",
};

const platformIcons: Record<string, string> = {
  youtube: "🎬",
  spotify: "🎵",
  apple: "🍎",
  deezer: "🎧",
  tiktok: "📱",
  instagram: "📷",
  other: "🌐",
};

const Takedowns = () => {
  const { takedowns, isLoading, createTakedown, updateTakedown, deleteTakedown, stats } = useTakedowns();
  const artistsQuery = useArtists();
  const releasesQuery = useReleases();
  const artists = artistsQuery.data || [];
  const releases = releasesQuery.data || [];
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTakedown, setEditingTakedown] = useState<Takedown | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    reason: "",
    platform: "",
    artist_id: "",
    release_id: "",
    content_url: "",
    infringing_party: "",
    description: "",
    status: "pending",
    request_date: new Date().toISOString().split('T')[0],
    is_incoming: false,
  });

  const filteredTakedowns = takedowns.filter(takedown => {
    const matchesSearch = takedown.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      takedown.infringing_party?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || takedown.status === filterStatus;
    const matchesType = filterType === "all" || 
      (filterType === "incoming" && takedown.is_incoming) || 
      (filterType === "outgoing" && !takedown.is_incoming);
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSubmit = () => {
    const payload = {
      ...formData,
      artist_id: formData.artist_id || null,
      release_id: formData.release_id || null,
    };

    if (editingTakedown) {
      updateTakedown.mutate({ id: editingTakedown.id, ...payload });
    } else {
      createTakedown.mutate(payload);
    }
    setIsFormOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      reason: "",
      platform: "",
      artist_id: "",
      release_id: "",
      content_url: "",
      infringing_party: "",
      description: "",
      status: "pending",
      request_date: new Date().toISOString().split('T')[0],
      is_incoming: false,
    });
    setEditingTakedown(null);
  };

  const openEdit = (takedown: Takedown) => {
    setEditingTakedown(takedown);
    setFormData({
      title: takedown.title,
      reason: takedown.reason,
      platform: takedown.platform,
      artist_id: takedown.artist_id || "",
      release_id: takedown.release_id || "",
      content_url: takedown.content_url || "",
      infringing_party: takedown.infringing_party || "",
      description: takedown.description || "",
      status: takedown.status,
      request_date: takedown.request_date,
      is_incoming: takedown.is_incoming,
    });
    setIsFormOpen(true);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full h-full px-4 py-3 space-y-3">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-9 w-9" />
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Takedowns</h1>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-500/10">
                      <Clock className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pendentes</p>
                      <p className="text-2xl font-bold">{stats.pending}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Resolvidos</p>
                      <p className="text-2xl font-bold">{stats.resolved}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <ArrowUpCircle className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Enviados</p>
                      <p className="text-2xl font-bold">{stats.outgoing}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/10">
                      <ArrowDownCircle className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Recebidos</p>
                      <p className="text-2xl font-bold">{stats.incoming}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="outgoing">Enviados por Nós</TabsTrigger>
                <TabsTrigger value="incoming">Recebidos (Claims)</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Todos os Takedowns</CardTitle>
                    <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) resetForm(); }}>
                      <DialogTrigger asChild>
                        <Button><Plus className="h-4 w-4 mr-2" /> Novo Takedown</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-xl">
                        <DialogHeader>
                          <DialogTitle>{editingTakedown ? "Editar Takedown" : "Registrar Takedown"}</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                          <div className="col-span-2">
                            <Label>Título *</Label>
                            <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Descrição breve" />
                          </div>
                          <div>
                            <Label>Tipo</Label>
                            <Select value={formData.is_incoming ? "incoming" : "outgoing"} onValueChange={v => setFormData({...formData, is_incoming: v === "incoming"})}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="outgoing">Enviado por Nós</SelectItem>
                                <SelectItem value="incoming">Recebido (Claim)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Motivo *</Label>
                            <Select value={formData.reason} onValueChange={v => setFormData({...formData, reason: v})}>
                              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="copyright">Violação de Copyright</SelectItem>
                                <SelectItem value="content_id">Content ID</SelectItem>
                                <SelectItem value="trademark">Marca Registrada</SelectItem>
                                <SelectItem value="request">Solicitação do Artista</SelectItem>
                                <SelectItem value="legal">Ação Legal</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Plataforma *</Label>
                            <Select value={formData.platform} onValueChange={v => setFormData({...formData, platform: v})}>
                              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="youtube">YouTube</SelectItem>
                                <SelectItem value="spotify">Spotify</SelectItem>
                                <SelectItem value="apple">Apple Music</SelectItem>
                                <SelectItem value="deezer">Deezer</SelectItem>
                                <SelectItem value="tiktok">TikTok</SelectItem>
                                <SelectItem value="instagram">Instagram</SelectItem>
                                <SelectItem value="other">Outra</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Status</Label>
                            <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pendente</SelectItem>
                                <SelectItem value="submitted">Enviado</SelectItem>
                                <SelectItem value="processing">Em Processamento</SelectItem>
                                <SelectItem value="resolved">Resolvido</SelectItem>
                                <SelectItem value="rejected">Rejeitado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Artista</Label>
                            <Select value={formData.artist_id} onValueChange={v => setFormData({...formData, artist_id: v})}>
                              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                              <SelectContent>
                                {artists.map(a => (
                                  <SelectItem key={a.id} value={a.id}>{a.stage_name || a.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Lançamento</Label>
                            <Select value={formData.release_id} onValueChange={v => setFormData({...formData, release_id: v})}>
                              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                              <SelectContent>
                                {releases.map(r => (
                                  <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Parte Infratora</Label>
                            <Input value={formData.infringing_party} onChange={e => setFormData({...formData, infringing_party: e.target.value})} placeholder="Nome/canal/perfil" />
                          </div>
                          <div>
                            <Label>Data da Solicitação</Label>
                            <Input type="date" value={formData.request_date} onChange={e => setFormData({...formData, request_date: e.target.value})} />
                          </div>
                          <div className="col-span-2">
                            <Label>URL do Conteúdo</Label>
                            <Input value={formData.content_url} onChange={e => setFormData({...formData, content_url: e.target.value})} placeholder="https://" />
                          </div>
                          <div className="col-span-2">
                            <Label>Descrição</Label>
                            <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Detalhes adicionais" />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
                          <Button onClick={handleSubmit} disabled={!formData.title || !formData.reason || !formData.platform}>Salvar</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 mb-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Buscar takedowns..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                      </div>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="submitted">Enviado</SelectItem>
                          <SelectItem value="processing">Processando</SelectItem>
                          <SelectItem value="resolved">Resolvido</SelectItem>
                          <SelectItem value="rejected">Rejeitado</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-40"><SelectValue placeholder="Tipo" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="outgoing">Enviados</SelectItem>
                          <SelectItem value="incoming">Recebidos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Título</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Plataforma</TableHead>
                          <TableHead>Motivo</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTakedowns.map(takedown => (
                          <TableRow key={takedown.id}>
                            <TableCell className="font-medium">
                              <div>
                                <p>{takedown.title}</p>
                                <p className="text-sm text-muted-foreground">{takedown.artists?.stage_name || takedown.artists?.name || '-'}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {takedown.is_incoming ? (
                                <Badge variant="outline" className="text-red-400 border-red-400">
                                  <ArrowDownCircle className="h-3 w-3 mr-1" /> Recebido
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-blue-400 border-blue-400">
                                  <ArrowUpCircle className="h-3 w-3 mr-1" /> Enviado
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="flex items-center gap-2">
                                {platformIcons[takedown.platform] || '🌐'} {takedown.platform}
                              </span>
                            </TableCell>
                            <TableCell>{reasonLabels[takedown.reason] || takedown.reason}</TableCell>
                            <TableCell>{formatDateBR(takedown.request_date)}</TableCell>
                            <TableCell>
                              <Badge className={statusColors[takedown.status] || ''}>
                                {statusLabels[takedown.status] || takedown.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" onClick={() => openEdit(takedown)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => deleteTakedown.mutate(takedown.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredTakedowns.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                              Nenhum takedown encontrado
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="outgoing">
                <Card>
                  <CardHeader>
                    <CardTitle>Takedowns Enviados por Nós</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {takedowns.filter(t => !t.is_incoming).map(takedown => (
                        <div key={takedown.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <span className="text-2xl">{platformIcons[takedown.platform] || '🌐'}</span>
                            <div>
                              <p className="font-medium">{takedown.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {takedown.infringing_party || 'Parte não identificada'} • {reasonLabels[takedown.reason]}
                              </p>
                            </div>
                          </div>
                          <Badge className={statusColors[takedown.status]}>{statusLabels[takedown.status]}</Badge>
                        </div>
                      ))}
                      {takedowns.filter(t => !t.is_incoming).length === 0 && (
                        <p className="text-center text-muted-foreground py-8">Nenhum takedown enviado</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="incoming">
                <Card>
                  <CardHeader>
                    <CardTitle>Claims Recebidos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {takedowns.filter(t => t.is_incoming).map(takedown => (
                        <div key={takedown.id} className="flex items-center justify-between p-4 border rounded-lg border-red-500/20">
                          <div className="flex items-center gap-4">
                            <AlertTriangle className="h-6 w-6 text-red-500" />
                            <div>
                              <p className="font-medium">{takedown.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {takedown.artists?.stage_name || takedown.artists?.name} • {reasonLabels[takedown.reason]}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge className={statusColors[takedown.status]}>{statusLabels[takedown.status]}</Badge>
                            <Button variant="outline" size="sm" onClick={() => openEdit(takedown)}>Disputar</Button>
                          </div>
                        </div>
                      ))}
                      {takedowns.filter(t => t.is_incoming).length === 0 && (
                        <p className="text-center text-muted-foreground py-8">Nenhum claim recebido</p>
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

export default Takedowns;
