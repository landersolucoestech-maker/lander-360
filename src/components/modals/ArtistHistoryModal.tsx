import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Calendar, 
  Music, 
  FileText, 
  Users,
  Trophy,
  Info,
  MapPin,
  Disc3,
  FolderKanban,
  Mic2
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDateBR } from "@/lib/utils";

interface ArtistHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artist: any;
}

export function ArtistHistoryModal({
  open,
  onOpenChange,
  artist,
}: ArtistHistoryModalProps) {
  if (!artist) return null;

  // Buscar lançamentos do artista (por artist_id e por nome nas tracks)
  const { data: releases, isLoading: releasesLoading } = useQuery({
    queryKey: ['artist-releases', artist.id, artist.name, artist.stage_name],
    queryFn: async () => {
      // Buscar por artist_id
      const { data: byId, error: errorById } = await supabase
        .from('releases')
        .select('*')
        .eq('artist_id', artist.id)
        .order('release_date', { ascending: false });
      
      if (errorById) throw errorById;

      // Buscar todos para filtrar por nome nas tracks
      const { data: all, error: errorAll } = await supabase
        .from('releases')
        .select('*')
        .order('release_date', { ascending: false });
      
      if (errorAll) throw errorAll;

      const artistNames = [artist.name, artist.stage_name, artist.full_name].filter(Boolean).map(n => n?.toLowerCase());
      
      const byName = (all || []).filter(release => {
        const tracks = release.tracks as any[] || [];
        
        return tracks.some((track: any) => {
          const allParticipants = [
            ...(track.composers || []),
            ...(track.performers || []),
            ...(track.producers || [])
          ];
          return allParticipants.some((p: any) => 
            artistNames.includes(typeof p === 'string' ? p?.toLowerCase() : p?.name?.toLowerCase())
          );
        });
      });

      // Combinar e remover duplicados
      const combined = [...(byId || []), ...byName];
      const unique = combined.filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
      );
      
      return unique;
    },
    enabled: open && !!artist.id
  });

  // Buscar shows/eventos do artista
  const { data: shows, isLoading: showsLoading } = useQuery({
    queryKey: ['artist-shows', artist.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agenda_events')
        .select('*')
        .eq('artist_id', artist.id)
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: open && !!artist.id
  });

  // Buscar contratos do artista
  const { data: contracts, isLoading: contractsLoading } = useQuery({
    queryKey: ['artist-contracts', artist.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('artist_id', artist.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: open && !!artist.id
  });

  // Buscar projetos do artista (por artist_id e por nome nos participantes)
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['artist-projects', artist.id, artist.name, artist.stage_name],
    queryFn: async () => {
      // Buscar por artist_id
      const { data: byId, error: errorById } = await supabase
        .from('projects')
        .select('*')
        .eq('artist_id', artist.id)
        .order('created_at', { ascending: false });
      
      if (errorById) throw errorById;

      // Buscar todos os projetos para filtrar por nome nos participantes
      const { data: allProjects, error: errorAll } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (errorAll) throw errorAll;

      const artistNames = [artist.name, artist.stage_name, artist.full_name].filter(Boolean).map(n => n?.toLowerCase());
      
      const byName = (allProjects || []).filter(project => {
        if (!project.audio_files) return false;
        const audioFiles = project.audio_files as any;
        const songs = audioFiles?.songs || [];
        
        return songs.some((song: any) => {
          const allParticipants = [
            ...(song.composers || []),
            ...(song.performers || []),
            ...(song.producers || [])
          ];
          return allParticipants.some((p: any) => 
            artistNames.includes(p?.name?.toLowerCase())
          );
        });
      });

      // Combinar e remover duplicados
      const combined = [...(byId || []), ...byName];
      const unique = combined.filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
      );
      
      return unique;
    },
    enabled: open && !!artist.id
  });

  // Buscar obras musicais do artista (por artist_id e por nome nos participantes)
  const { data: musicRegistry, isLoading: musicLoading } = useQuery({
    queryKey: ['artist-music', artist.id, artist.name, artist.stage_name],
    queryFn: async () => {
      // Buscar por artist_id
      const { data: byId, error: errorById } = await supabase
        .from('music_registry')
        .select('*')
        .eq('artist_id', artist.id)
        .order('created_at', { ascending: false });
      
      if (errorById) throw errorById;

      // Buscar todos para filtrar por nome nos participantes
      const { data: all, error: errorAll } = await supabase
        .from('music_registry')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (errorAll) throw errorAll;

      const artistNames = [artist.name, artist.stage_name, artist.full_name].filter(Boolean).map(n => n?.toLowerCase());
      
      const byName = (all || []).filter(music => {
        const participants = music.participants as any[] || [];
        const writers = music.writers || [];
        const publishers = music.publishers || [];
        
        const allNames = [
          ...participants.map((p: any) => p?.name?.toLowerCase()),
          ...writers.map((w: string) => w?.toLowerCase()),
          ...publishers.map((p: string) => p?.toLowerCase())
        ];
        
        return artistNames.some(name => allNames.includes(name));
      });

      // Combinar e remover duplicados
      const combined = [...(byId || []), ...byName];
      const unique = combined.filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
      );
      
      return unique;
    },
    enabled: open && !!artist.id
  });

  // Buscar fonogramas do artista (por artist_id e por nome nos participantes)
  const { data: phonograms, isLoading: phonogramsLoading } = useQuery({
    queryKey: ['artist-phonograms', artist.id, artist.name, artist.stage_name],
    queryFn: async () => {
      // Buscar por artist_id
      const { data: byId, error: errorById } = await supabase
        .from('phonograms')
        .select('*')
        .eq('artist_id', artist.id)
        .order('created_at', { ascending: false });
      
      if (errorById) throw errorById;

      // Buscar todos para filtrar por nome nos participantes
      const { data: all, error: errorAll } = await supabase
        .from('phonograms')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (errorAll) throw errorAll;

      const artistNames = [artist.name, artist.stage_name, artist.full_name].filter(Boolean).map(n => n?.toLowerCase());
      
      const byName = (all || []).filter(phonogram => {
        const participants = phonogram.participants as any[] || [];
        
        return participants.some((p: any) => 
          artistNames.includes(p?.name?.toLowerCase())
        );
      });

      // Combinar e remover duplicados
      const combined = [...(byId || []), ...byName];
      const unique = combined.filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
      );
      
      return unique;
    },
    enabled: open && !!artist.id
  });

  const isLoading = releasesLoading || showsLoading || contractsLoading || projectsLoading || musicLoading || phonogramsLoading;

  const formatHistoryDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Não informado';
    return formatDateBR(dateString);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "released":
      case "lançado":
      case "concluído":
      case "realizado":
        return "bg-green-500";
      case "pending":
      case "pendente":
      case "planning":
      case "planejando":
        return "bg-yellow-500";
      case "cancelled":
      case "cancelado":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case "released": return "Lançado";
      case "pending": return "Pendente";
      case "planning": return "Planejando";
      case "cancelled": return "Cancelado";
      case "completed": return "Concluído";
      case "em_analise": return "Em Análise";
      case "registrado": return "Registrado";
      case "aprovado": return "Aprovado";
      case "rejeitado": return "Rejeitado";
      case "ativo": return "Ativo";
      case "inativo": return "Inativo";
      case "concluido": return "Concluído";
      case "em_andamento": return "Em Andamento";
      default: return status?.replace(/_/g, ' ') || "Não informado";
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type?.toLowerCase()) {
      case "show": return "Show";
      case "meeting": return "Reunião";
      case "recording": return "Gravação";
      case "release": return "Lançamento";
      case "interview": return "Entrevista";
      default: return type || "Evento";
    }
  };

  // Combinar e ordenar timeline
  const timelineItems = [
    ...(releases?.map(r => ({
      id: r.id,
      type: 'release',
      title: r.title,
      description: `${r.type || r.release_type || 'Lançamento'} - ${getStatusLabel(r.status || '')}`,
      date: r.release_date,
      status: r.status,
      icon: Music
    })) || []),
    ...(shows?.map(s => ({
      id: s.id,
      type: 'show',
      title: s.title,
      description: s.location ? `${getEventTypeLabel(s.event_type || '')} - ${s.location}` : getEventTypeLabel(s.event_type || ''),
      date: s.start_date,
      status: s.event_type,
      icon: s.event_type === 'show' ? Users : Calendar
    })) || [])
  ].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Histórico - {artist.name}</DialogTitle>
          <DialogDescription className="text-sm">
            Histórico de atividades e marcos do artista
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Resumo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo do Histórico</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="text-center">
                    <FolderKanban className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-xl font-bold">{projects?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Projetos</div>
                  </div>
                  <div className="text-center">
                    <Music className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-xl font-bold">{musicRegistry?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Obras</div>
                  </div>
                  <div className="text-center">
                    <Mic2 className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-xl font-bold">{phonograms?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Fonogramas</div>
                  </div>
                  <div className="text-center">
                    <Disc3 className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-xl font-bold">{releases?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Lançamentos</div>
                  </div>
                  <div className="text-center">
                    <FileText className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-xl font-bold">{contracts?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Contratos</div>
                  </div>
                  <div className="text-center">
                    <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-xl font-bold">{shows?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Eventos</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informações do Cadastro */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações do Cadastro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Data de Cadastro:</span>
                  <span>{formatHistoryDate(artist.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Última Atualização:</span>
                  <span>{formatHistoryDate(artist.updated_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projetos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FolderKanban className="h-5 w-5" />
                Projetos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : projects && projects.length > 0 ? (
                <div className="space-y-3">
                  {projects.map((project) => (
                    <div key={project.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10">
                          <FolderKanban className="h-5 w-5 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium">{project.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {project.description || 'Sem descrição'} • {formatHistoryDate(project.created_at)}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(project.status || '')} text-white`}>
                        {getStatusLabel(project.status || '')}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                  <FolderKanban className="h-8 w-8 mb-2" />
                  <p className="text-sm">Nenhum projeto registrado</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Obras Musicais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Music className="h-5 w-5" />
                Obras Musicais
              </CardTitle>
            </CardHeader>
            <CardContent>
              {musicLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : musicRegistry && musicRegistry.length > 0 ? (
                <div className="space-y-3">
                  {musicRegistry.map((music) => (
                    <div key={music.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10">
                          <Music className="h-5 w-5 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium">{music.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {music.genre || 'Gênero não informado'} • ISRC: {music.isrc || 'N/A'} • ISWC: {music.iswc || 'N/A'}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(music.status || '')} text-white`}>
                        {getStatusLabel(music.status || '')}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                  <Music className="h-8 w-8 mb-2" />
                  <p className="text-sm">Nenhuma obra musical registrada</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fonogramas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mic2 className="h-5 w-5" />
                Fonogramas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {phonogramsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : phonograms && phonograms.length > 0 ? (
                <div className="space-y-3">
                  {phonograms.map((phonogram) => (
                    <div key={phonogram.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10">
                          <Mic2 className="h-5 w-5 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium">{phonogram.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          ISRC: {phonogram.isrc || 'N/A'} • {phonogram.label || 'Sem gravadora'} • {formatHistoryDate(phonogram.recording_date)}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(phonogram.status || '')} text-white`}>
                        {getStatusLabel(phonogram.status || '')}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                  <Mic2 className="h-8 w-8 mb-2" />
                  <p className="text-sm">Nenhum fonograma registrado</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contratos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Contratos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contractsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : contracts && contracts.length > 0 ? (
                <div className="space-y-3">
                  {contracts.map((contract) => (
                    <div key={contract.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium">{contract.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {contract.contract_type || 'Tipo não informado'} • {formatHistoryDate(contract.start_date)} a {formatHistoryDate(contract.end_date)}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(contract.status || '')} text-white`}>
                        {getStatusLabel(contract.status || '')}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                  <FileText className="h-8 w-8 mb-2" />
                  <p className="text-sm">Nenhum contrato registrado</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lançamentos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Disc3 className="h-5 w-5" />
                Lançamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {releasesLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : releases && releases.length > 0 ? (
                <div className="space-y-3">
                  {releases.map((release) => (
                    <div key={release.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10">
                          <Disc3 className="h-5 w-5 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium">{release.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {release.type || release.release_type || 'Lançamento'} • {formatHistoryDate(release.release_date)}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(release.status || '')} text-white`}>
                        {getStatusLabel(release.status || '')}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                  <Disc3 className="h-8 w-8 mb-2" />
                  <p className="text-sm">Nenhum lançamento registrado</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shows e Eventos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Shows e Eventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : shows && shows.length > 0 ? (
                <div className="space-y-3">
                  {shows.map((show) => (
                    <div key={show.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10">
                          {show.event_type === 'show' ? (
                            <Users className="h-5 w-5 text-primary" />
                          ) : (
                            <Calendar className="h-5 w-5 text-primary" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium">{show.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatHistoryDate(show.start_date)}</span>
                          {show.location && (
                            <>
                              <MapPin className="h-3 w-3 ml-2" />
                              <span>{show.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {getEventTypeLabel(show.event_type || '')}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                  <Users className="h-8 w-8 mb-2" />
                  <p className="text-sm">Nenhum show ou evento registrado</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline de Atividades */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timeline Geral</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : timelineItems.length > 0 ? (
                <div className="space-y-3">
                  {timelineItems.slice(0, 10).map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatHistoryDate(item.date)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Info className="h-12 w-12 mb-4" />
                  <p className="text-center">Nenhuma atividade registrada ainda.</p>
                  <p className="text-sm text-center mt-2">
                    As atividades do artista aparecerão aqui conforme forem registradas no sistema.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
