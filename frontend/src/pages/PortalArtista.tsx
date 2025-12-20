import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useArtists } from "@/hooks/useArtists";
import { useProjects } from "@/hooks/useProjects";
import { useReleases } from "@/hooks/useReleases";
import { useContracts } from "@/hooks/useContracts";
import { useMusicRegistry } from "@/hooks/useMusicRegistry";
import { usePhonograms } from "@/hooks/usePhonograms";
import { 
  User, Music, Disc, Upload, FileText, DollarSign, 
  TrendingUp, Calendar, Play, BarChart3, Clock, CheckCircle
} from "lucide-react";
import { formatDateBR, translateStatus } from "@/lib/utils";

const PortalArtista = () => {
  const { user } = useAuth();
  const { data: artists = [] } = useArtists();
  const { data: projects = [] } = useProjects();
  const { data: releases = [] } = useReleases();
  const { data: contracts = [] } = useContracts();
  const { data: musicRegistry = [] } = useMusicRegistry();
  const { data: phonograms = [] } = usePhonograms();
  
  const [activeTab, setActiveTab] = useState("overview");

  // Find artist linked to current user (based on email match or artist profile)
  const myArtist = artists.find(a => 
    a.email?.toLowerCase() === user?.email?.toLowerCase()
  );

  // Filter data for this artist only
  const myProjects = myArtist ? projects.filter(p => p.artist_id === myArtist.id) : [];
  const myReleases = myArtist ? releases.filter(r => r.artist_id === myArtist.id) : [];
  const myContracts = myArtist ? contracts.filter(c => c.artist_id === myArtist.id) : [];
  const myMusic = myArtist ? musicRegistry.filter(m => m.artist_id === myArtist.id) : [];
  const myPhonograms = myArtist ? phonograms.filter(p => p.artist_id === myArtist.id) : [];

  // Calculate stats
  const totalStreams = myReleases.reduce((sum, r) => sum + ((r as any).streams || 0), 0);
  const pendingReleases = myReleases.filter(r => r.status === 'planning' || r.status === 'pending');
  const activeContracts = myContracts.filter(c => c.status === 'active' || c.status === 'signed');

  if (!myArtist) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <div className="w-full h-full px-4 py-3 space-y-3">
              <div className="flex items-center gap-3 mb-6">
                <SidebarTrigger className="h-9 w-9" />
                <h1 className="text-3xl font-bold">Portal do Artista</h1>
              </div>
              <Card className="max-w-lg mx-auto mt-20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Acesso Restrito
                  </CardTitle>
                  <CardDescription>
                    Seu perfil de artista não foi encontrado no sistema. Entre em contato com a administração para vincular sua conta.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Email atual: {user?.email}
                  </p>
                </CardContent>
              </Card>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full h-full px-4 py-3 space-y-3">
            {/* Header */}
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-9 w-9" />
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground">
                  Portal do Artista
                </h1>
                <p className="text-muted-foreground">
                  Bem-vindo, {myArtist.stage_name || myArtist.name}
                </p>
              </div>
              {myArtist.image_url && (
                <img 
                  src={myArtist.image_url} 
                  alt={myArtist.name} 
                  className="h-12 w-12 rounded-full object-cover"
                />
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Music className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{myMusic.length}</p>
                      <p className="text-xs text-muted-foreground">Obras</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Upload className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{myReleases.length}</p>
                      <p className="text-xs text-muted-foreground">Lançamentos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Play className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{totalStreams.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Streams</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{activeContracts.length}</p>
                      <p className="text-xs text-muted-foreground">Contratos Ativos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/50 p-1">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger value="releases" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Lançamentos
                </TabsTrigger>
                <TabsTrigger value="royalties" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Royalties
                </TabsTrigger>
                <TabsTrigger value="contracts" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Contratos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Pending Releases */}
                {pendingReleases.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Clock className="h-5 w-5 text-yellow-500" />
                        Lançamentos Pendentes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {pendingReleases.map(release => (
                          <div key={release.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{release.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {release.release_date ? formatDateBR(release.release_date) : 'Data não definida'}
                              </p>
                            </div>
                            <Badge variant={release.status === 'pending' ? 'secondary' : 'default'}>
                              {translateStatus(release.status)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Releases */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Últimos Lançamentos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {myReleases.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        Nenhum lançamento encontrado
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {myReleases.slice(0, 5).map(release => (
                          <div key={release.id} className="flex items-center gap-4 p-3 border rounded-lg">
                            {release.cover_url ? (
                              <img src={release.cover_url} alt={release.title} className="h-12 w-12 rounded object-cover" />
                            ) : (
                              <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                                <Disc className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-medium">{release.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {release.release_type} • {((release as any).streams || 0).toLocaleString()} streams
                              </p>
                            </div>
                            <Badge>{translateStatus(release.status)}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Active Contracts Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                      Contratos Ativos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {activeContracts.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        Nenhum contrato ativo
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {activeContracts.map(contract => (
                          <div key={contract.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{contract.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {contract.service_type} • Válido até {contract.end_date ? formatDateBR(contract.end_date) : 'Indeterminado'}
                              </p>
                            </div>
                            <Badge variant="default" className="bg-green-500">Ativo</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="releases" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Meus Lançamentos</CardTitle>
                    <CardDescription>Todos os seus lançamentos registrados no sistema</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {myReleases.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        Nenhum lançamento encontrado
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {myReleases.map(release => (
                          <div key={release.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            {release.cover_url ? (
                              <img src={release.cover_url} alt={release.title} className="h-16 w-16 rounded object-cover" />
                            ) : (
                              <div className="h-16 w-16 rounded bg-muted flex items-center justify-center">
                                <Disc className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-semibold">{release.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {release.release_type} • {release.genre || 'Gênero não definido'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Lançamento: {release.release_date ? formatDateBR(release.release_date) : 'Não definido'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">{((release as any).streams || 0).toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">streams</p>
                              <Badge className="mt-2">{translateStatus(release.status)}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="royalties" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Royalties e Repasses
                    </CardTitle>
                    <CardDescription>Acompanhe seus ganhos e repasses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-lg font-medium text-muted-foreground">
                        Módulo de Royalties em desenvolvimento
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Em breve você poderá acompanhar seus royalties aqui
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contracts" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Meus Contratos</CardTitle>
                    <CardDescription>Contratos vinculados ao seu perfil</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {myContracts.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        Nenhum contrato encontrado
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {myContracts.map(contract => (
                          <div key={contract.id} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold">{contract.title}</p>
                                <p className="text-sm text-muted-foreground">{contract.service_type}</p>
                              </div>
                              <Badge variant={contract.status === 'active' || contract.status === 'signed' ? 'default' : 'secondary'}>
                                {translateStatus(contract.status)}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Início</p>
                                <p>{contract.start_date ? formatDateBR(contract.start_date) : 'Não definido'}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Término</p>
                                <p>{contract.end_date ? formatDateBR(contract.end_date) : 'Indeterminado'}</p>
                              </div>
                              {contract.royalties_percentage && (
                                <div>
                                  <p className="text-muted-foreground">Royalties</p>
                                  <p>{contract.royalties_percentage}%</p>
                                </div>
                              )}
                              {contract.value && (
                                <div>
                                  <p className="text-muted-foreground">Valor</p>
                                  <p>R$ {Number(contract.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                </div>
                              )}
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

export default PortalArtista;
