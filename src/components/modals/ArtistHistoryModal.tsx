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
  Disc3
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

  // Buscar lançamentos do artista
  const { data: releases, isLoading: releasesLoading } = useQuery({
    queryKey: ['artist-releases', artist.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('releases')
        .select('*')
        .eq('artist_id', artist.id)
        .order('release_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
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
    queryKey: ['artist-contracts-count', artist.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('artist_id', artist.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: open && !!artist.id
  });

  const isLoading = releasesLoading || showsLoading || contractsLoading;

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Não informado';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
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
      default: return status || "Não informado";
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Histórico - {artist.name}</DialogTitle>
          <DialogDescription>
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <Music className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-xl font-bold">{releases?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Lançamentos</div>
                  </div>
                  <div className="text-center">
                    <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-xl font-bold">
                      {shows?.filter(s => s.event_type === 'show').length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Shows</div>
                  </div>
                  <div className="text-center">
                    <FileText className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-xl font-bold">{contracts?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Contratos</div>
                  </div>
                  <div className="text-center">
                    <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
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
                  <span>{formatDate(artist.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Última Atualização:</span>
                  <span>{formatDate(artist.updated_at)}</span>
                </div>
              </div>
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
                          <Music className="h-5 w-5 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium">{release.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {release.type || release.release_type || 'Lançamento'} • {formatDate(release.release_date)}
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
                  <Music className="h-8 w-8 mb-2" />
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
                          <span>{formatDate(show.start_date)}</span>
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
                          {formatDate(item.date)}
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
