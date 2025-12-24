import { useState, useRef, useMemo } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchFilter } from "@/components/filters/SearchFilter";
import { Calendar as CalendarIcon, Plus, Clock, MapPin, Users, CheckSquare, FileText, Upload, Download, Loader2, Trash2 } from "lucide-react";
import { AgendaEventModal } from "@/components/modals/AgendaEventModal";
import { AgendaViewModal } from "@/components/modals/AgendaViewModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import { useToast } from "@/hooks/use-toast";
import { isSameDay } from "date-fns";
import { formatDateFullBR, formatDateForDB } from "@/lib/utils";
import { useAgenda, useCreateAgendaEvent, useUpdateAgendaEvent, useDeleteAgendaEvent } from "@/hooks/useAgenda";
import { useArtists } from "@/hooks/useArtists";
import { useDataExport } from "@/hooks/useDataExport";
import { useImportExport } from "@/hooks/useImportExport";
import { useQueryClient } from "@tanstack/react-query";
import { useArtistFilter } from "@/hooks/useLinkedArtist";

interface AgendaEvent {
  id: string;
  event_name: string;
  start_date: string;
  start_time?: string;
  end_date?: string;
  end_time?: string;
  location?: string;
  venue_name?: string;
  venue_address?: string;
  venue_contact?: string;
  venue_capacity?: number;
  ticket_price?: number;
  expected_audience?: number;
  event_type: 'sessoes_estudio' | 'ensaios' | 'sessoes_fotos' | 'shows' | 'entrevistas' | 'podcasts' | 'programas_tv' | 'radio' | 'producao_conteudo' | 'reunioes';
  status: 'agendado' | 'cancelado' | 'pendente' | 'concluido' | 'confirmado';
  artist_id?: string;
  artists?: { id: string; name: string; stage_name?: string };
  description?: string;
  observations?: string;
}

const Agenda = () => {
  // Filtro de artista
  const { shouldFilter, artistId, isArtistUser } = useArtistFilter();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | undefined>();
  const [eventToView, setEventToView] = useState<AgendaEvent | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<AgendaEvent | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: allAgendaEvents = [], isLoading } = useAgenda();
  const { data: allArtists = [] } = useArtists();
  const createEvent = useCreateAgendaEvent();
  const updateEvent = useUpdateAgendaEvent();
  const deleteEvent = useDeleteAgendaEvent();
  const { exportToExcel } = useDataExport();
  const { parseExcelFile, parseAgendaImportRow } = useImportExport();

  // Aplicar filtro de artista
  const agendaEvents = useMemo(() => {
    if (shouldFilter && artistId) {
      return allAgendaEvents.filter((e: any) => e.artist_id === artistId);
    }
    return allAgendaEvents;
  }, [allAgendaEvents, shouldFilter, artistId]);

  const artists = useMemo(() => {
    if (shouldFilter && artistId) {
      return allArtists.filter((a: any) => a.id === artistId);
    }
    return allArtists;
  }, [allArtists, shouldFilter, artistId]);

  const events: AgendaEvent[] = agendaEvents.map((e: any) => ({
    id: e.id,
    event_name: e.title,
    start_date: e.start_date,
    start_time: e.start_time,
    end_date: e.end_date,
    end_time: e.end_time,
    location: e.location,
    venue_name: e.venue_name,
    venue_address: e.venue_address,
    venue_contact: e.venue_contact,
    venue_capacity: e.venue_capacity,
    ticket_price: e.ticket_price,
    expected_audience: e.expected_audience,
    event_type: e.event_type || 'reunioes',
    status: e.status || 'agendado',
    artist_id: e.artist_id,
    artists: e.artists,
    description: e.description,
    observations: e.observations,
  }));

  const handleNewEvent = () => { setSelectedEvent(undefined); setIsModalOpen(true); };
  const handleEditEvent = (event: AgendaEvent) => { setSelectedEvent(event); setIsModalOpen(true); };
  const handleViewEvent = (event: AgendaEvent) => { setEventToView(event); setIsViewModalOpen(true); };
  const handleDeleteEvent = (event: AgendaEvent) => { setEventToDelete(event); setIsDeleteModalOpen(true); };

  const handleSubmitEvent = async (data: any) => {
    try {
      // Usa formatDateForDB para manter a data correta no fuso de Brasília
      const startDateForDB = data.start_date instanceof Date 
        ? formatDateForDB(data.start_date) 
        : data.start_date;
      const endDateForDB = data.end_date instanceof Date 
        ? formatDateForDB(data.end_date) 
        : data.end_date || null;
        
      const eventData = {
        title: data.event_name,
        event_name: data.event_name,
        start_date: startDateForDB,
        end_date: endDateForDB,
        start_time: data.start_time || null,
        end_time: data.end_time || null,
        location: data.location || null,
        venue_name: data.venue_name || null,
        venue_address: data.venue_address || null,
        venue_contact: data.venue_contact || null,
        venue_capacity: data.venue_capacity || null,
        ticket_price: data.ticket_price || null,
        expected_audience: data.expected_audience || null,
        event_type: data.event_type || 'reunioes',
        status: data.status || 'agendado',
        artist_id: data.artist_id || null,
        description: data.description || null,
        observations: data.observations || null,
      };

      if (selectedEvent) {
        await updateEvent.mutateAsync({ id: selectedEvent.id, data: eventData });
      } else {
        await createEvent.mutateAsync(eventData);
      }
      
      setIsModalOpen(false);
      setSelectedEvent(undefined);
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const confirmDelete = async () => {
    if (eventToDelete) {
      try {
        await deleteEvent.mutateAsync(eventToDelete.id);
        setIsDeleteModalOpen(false);
        setEventToDelete(null);
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  // Tipos de compromisso formatados e ordenados alfabeticamente
  const eventTypeOptions = [
    "Ensaios",
    "Entrevistas",
    "Podcasts",
    "Produção de Conteúdo",
    "Programas de TV",
    "Rádio",
    "Reuniões",
    "Sessões de Estúdio",
    "Sessões de Fotos",
    "Shows",
  ];

  // Status ordenados alfabeticamente
  const statusOptions = [
    "Agendado",
    "Cancelado",
    "Concluído",
    "Confirmado",
    "Pendente",
  ];

  // Mapeamentos reversos
  const eventTypeLabelToValue: Record<string, string> = {
    "Ensaios": "ensaios",
    "Entrevistas": "entrevistas",
    "Podcasts": "podcasts",
    "Produção de Conteúdo": "producao_conteudo",
    "Programas de TV": "programas_tv",
    "Rádio": "radio",
    "Reuniões": "reunioes",
    "Sessões de Estúdio": "sessoes_estudio",
    "Sessões de Fotos": "sessoes_fotos",
    "Shows": "shows",
  };

  const statusLabelToValue: Record<string, string> = {
    "Agendado": "agendado",
    "Cancelado": "cancelado",
    "Concluído": "concluido",
    "Confirmado": "confirmado",
    "Pendente": "pendente",
  };

  const filterOptions = [
    { key: "event_type", label: "Tipo de Compromisso", options: eventTypeOptions },
    { key: "status", label: "Status", options: statusOptions }
  ];

  const handleSearch = (term: string) => setSearchTerm(term);
  const handleFilter = (newFilters: Record<string, string>) => setFilters(newFilters);
  const handleClear = () => { setSearchTerm(""); setFilters({}); };

  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchTerm || event.event_name.toLowerCase().includes(searchTerm.toLowerCase()) || (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilters = Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      if (key === 'event_type') {
        const dbValue = eventTypeLabelToValue[value] || value.toLowerCase().replace(/ /g, '_');
        return event.event_type === dbValue;
      }
      if (key === 'status') {
        const dbValue = statusLabelToValue[value] || value.toLowerCase();
        return event.status === dbValue;
      }
      return true;
    });
    return matchesSearch && matchesFilters;
  });

  const totalEvents = events.length;
  const confirmedEvents = events.filter(e => e.status === 'confirmado').length;
  const upcomingEvents = events.filter(e => new Date(e.start_date) > new Date()).length;
  const todayEventsCount = events.filter(e => isSameDay(new Date(e.start_date), new Date())).length;

  const eventTypeLabels: Record<string, string> = {
    sessoes_estudio: 'Sessões de estúdio', ensaios: 'Ensaios', sessoes_fotos: 'Sessões de fotos', shows: 'Shows',
    entrevistas: 'Entrevistas', podcasts: 'Podcasts', programas_tv: 'Programas de TV', radio: 'Rádio',
    producao_conteudo: 'Produção de conteúdo', reunioes: 'Reuniões'
  };

  const statusLabels: Record<string, string> = {
    agendado: 'Agendado', cancelado: 'Cancelado', pendente: 'Pendente', concluido: 'Concluído', confirmado: 'Confirmado'
  };

  const handleSelectAll = (checked: boolean) => setSelectedItems(checked ? filteredEvents.map(e => e.id) : []);
  const handleSelectItem = (itemId: string, checked: boolean) => setSelectedItems(checked ? [...selectedItems, itemId] : selectedItems.filter(id => id !== itemId));

  const confirmBulkDelete = async () => {
    setIsDeletingBulk(true);
    try {
      for (const id of selectedItems) await deleteEvent.mutateAsync(id);
      toast({ title: "Eventos excluídos", description: `${selectedItems.length} eventos foram excluídos com sucesso.` });
      setSelectedItems([]);
      setIsBulkDeleteModalOpen(false);
    } catch (error) {
      toast({ title: "Erro ao excluir", description: "Não foi possível excluir alguns eventos.", variant: "destructive" });
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const handleExport = () => {
    const rawEvents = events.map(e => ({
      ...e,
      title: e.event_name,
    }));
    exportToExcel(rawEvents, "agenda", "Eventos", "agenda");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    
    try {
      const data = await parseExcelFile(file);
      
      // Build artists map for lookup
      const artistsMap: Record<string, string> = {};
      artists.forEach((artist: any) => {
        if (artist.name) artistsMap[artist.name.toLowerCase()] = artist.id;
        if (artist.stage_name) artistsMap[artist.stage_name.toLowerCase()] = artist.id;
      });

      let successCount = 0;
      let errorCount = 0;

      for (const row of data) {
        try {
          const eventData = parseAgendaImportRow(row, artistsMap);
          if (eventData) {
            await createEvent.mutateAsync(eventData);
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error('Error importing agenda row:', error);
          errorCount++;
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['agenda'] });

      toast({ 
        title: "Importação concluída", 
        description: `${successCount} eventos importados com sucesso.${errorCount > 0 ? ` ${errorCount} erros.` : ''}` 
      });
    } catch (error) {
      console.error('Error importing agenda:', error);
      toast({ title: "Erro na importação", description: "Não foi possível ler o arquivo.", variant: "destructive" });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full h-full px-4 py-3 space-y-3">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="h-9 w-9" />
                <div className="flex flex-col gap-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Agenda</h1>
                  <p className="text-sm text-muted-foreground">Gerencie eventos, shows e compromissos</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <input type="file" ref={fileInputRef} accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
                <Button variant="outline" size="sm" className="gap-1" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
                  {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  <span className="hidden sm:inline">Importar</span>
                </Button>
                <Button variant="outline" size="sm" className="gap-1" onClick={handleExport} disabled={events.length === 0}>
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Exportar</span>
                </Button>
                <Button size="sm" className="gap-1" onClick={handleNewEvent}>
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Novo Evento</span>
                </Button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <DashboardCard title="Total de Eventos" value={totalEvents.toString()} description="este mês" icon={CalendarIcon} trend={{ value: 0, isPositive: true }} />
              <DashboardCard title="Eventos Confirmados" value={confirmedEvents.toString()} description="confirmados" icon={CheckSquare} trend={{ value: 0, isPositive: true }} />
              <DashboardCard title="Próximos Eventos" value={upcomingEvents.toString()} description="nos próximos dias" icon={Clock} trend={{ value: 0, isPositive: true }} />
              <DashboardCard title="Hoje" value={todayEventsCount.toString()} description="eventos hoje" icon={Users} trend={{ value: 0, isPositive: true }} />
            </div>

            {/* Lista de Eventos */}
            <div className="space-y-4">
              <SearchFilter searchPlaceholder="Buscar eventos por nome ou local..." filters={filterOptions} onSearch={handleSearch} onFilter={handleFilter} onClear={handleClear} />

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Todos os Eventos</CardTitle>
                      <CardDescription>{filteredEvents.length} evento(s) cadastrado(s)</CardDescription>
                    </div>
                    {selectedItems.length > 0 && (
                      <Button variant="destructive" size="sm" className="gap-2" onClick={() => setIsBulkDeleteModalOpen(true)}>
                        <Trash2 className="h-4 w-4" />
                        Excluir Selecionados ({selectedItems.length})
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoading ? (
                      <div className="text-center py-8"><p className="text-muted-foreground">Carregando eventos...</p></div>
                    ) : filteredEvents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum evento cadastrado</h3>
                        <p className="text-muted-foreground mb-4">Comece agendando seu primeiro evento</p>
                        <Button onClick={handleNewEvent} className="gap-2"><Plus className="h-4 w-4" />Agendar Primeiro Evento</Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                          <Checkbox checked={selectedItems.length === filteredEvents.length && filteredEvents.length > 0} onCheckedChange={(checked) => handleSelectAll(!!checked)} />
                          <span className="text-sm font-medium text-muted-foreground">{selectedItems.length > 0 ? `${selectedItems.length} de ${filteredEvents.length} selecionados` : "Selecionar todos"}</span>
                        </div>
                        {filteredEvents.map((event) => {
                          const artistData = (event as any).artists;
                          const artistName = artistData?.stage_name || artistData?.name || '';
                          return (
                          <div key={event.id} className="flex flex-col sm:flex-row sm:items-start gap-3">
                            <Checkbox checked={selectedItems.includes(event.id)} onCheckedChange={(checked) => handleSelectItem(event.id, !!checked)} className="mt-4 sm:mt-6" />
                            <div className="flex-1 flex flex-col lg:flex-row lg:items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors gap-3">
                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  event.event_type === "shows" ? "bg-purple-100 dark:bg-purple-900/20" :
                                  event.event_type === "sessoes_estudio" ? "bg-red-100 dark:bg-red-900/20" :
                                  event.event_type === "ensaios" ? "bg-blue-100 dark:bg-blue-900/20" : "bg-green-100 dark:bg-green-900/20"
                                }`}>
                                  {event.event_type === "shows" ? <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" /> :
                                   event.event_type === "sessoes_estudio" ? <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" /> :
                                   event.event_type === "ensaios" ? <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" /> :
                                   <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />}
                                </div>
                                <div className="space-y-1 min-w-0">
                                  <h3 className="font-medium text-foreground text-sm sm:text-base truncate">{event.event_name}</h3>
                                  <div className="flex flex-wrap items-center gap-1">
                                    <Badge variant="secondary" className="text-xs">{eventTypeLabels[event.event_type as keyof typeof eventTypeLabels]}</Badge>
                                    <Badge variant={event.status === "confirmado" ? "default" : event.status === "cancelado" ? "destructive" : "secondary"} className="text-xs">{statusLabels[event.status]}</Badge>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Info + Actions */}
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pl-12 lg:pl-0">
                                <div className="hidden sm:flex items-center gap-4 text-xs">
                                  <div className="text-center">
                                    <div className="text-muted-foreground">Data</div>
                                    <div className="font-medium">{formatDateFullBR(new Date(event.start_date))}</div>
                                  </div>
                                  {event.start_time && <div className="text-center"><div className="text-muted-foreground">Horário</div><div className="font-medium">{event.start_time}{event.end_time ? ` - ${event.end_time}` : ''}</div></div>}
                                  {(event.venue_name || event.location) && <div className="text-center max-w-[120px]"><div className="text-muted-foreground">Local</div><div className="font-medium truncate">{event.venue_name || event.location}</div></div>}
                                  {artistName && <div className="text-center max-w-[100px]"><div className="text-muted-foreground">Artista</div><div className="font-medium truncate">{artistName}</div></div>}
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" className="text-xs" onClick={() => handleViewEvent(event)}>Ver</Button>
                                  <Button variant="outline" size="sm" className="text-xs" onClick={() => handleEditEvent(event)}>Editar</Button>
                                  <Button variant="outline" size="sm" className="text-xs" onClick={() => handleDeleteEvent(event)}>Excluir</Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )})}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>

      <AgendaEventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSubmitEvent} event={selectedEvent} />
      <AgendaViewModal open={isViewModalOpen} onOpenChange={setIsViewModalOpen} event={eventToView} />
      <DeleteConfirmationModal open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen} onConfirm={confirmDelete} title="Excluir Evento" description={`Tem certeza que deseja excluir o evento "${eventToDelete?.event_name}"? Esta ação não pode ser desfeita.`} />
      <DeleteConfirmationModal open={isBulkDeleteModalOpen} onOpenChange={setIsBulkDeleteModalOpen} onConfirm={confirmBulkDelete} title="Excluir Eventos" description={`Tem certeza que deseja excluir ${selectedItems.length} eventos? Esta ação não pode ser desfeita.`} isLoading={isDeletingBulk} />
    </SidebarProvider>
  );
};

export default Agenda;
