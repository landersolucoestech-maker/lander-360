import { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchFilter } from "@/components/filters/SearchFilter";
import { Calendar as CalendarIcon, Plus, Clock, MapPin, Users, CheckSquare, FileText, Upload, Download, Trash2 } from "lucide-react";
import * as XLSX from 'xlsx';
import { AgendaEventModal } from "@/components/modals/AgendaEventModal";
import { AgendaViewModal } from "@/components/modals/AgendaViewModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import { useToast } from "@/hooks/use-toast";
import { isSameDay } from "date-fns";
import { formatDateFullBR } from "@/lib/utils";
import { useAgenda, useCreateAgendaEvent, useUpdateAgendaEvent, useDeleteAgendaEvent } from "@/hooks/useAgenda";
import { Checkbox } from "@/components/ui/checkbox";

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
  
  const { toast } = useToast();

  const { data: agendaEvents = [], isLoading } = useAgenda();
  const createEvent = useCreateAgendaEvent();
  const updateEvent = useUpdateAgendaEvent();
  const deleteEvent = useDeleteAgendaEvent();

  const eventTypeLabels: Record<string, string> = {
    sessoes_estudio: 'Sessões de estúdio',
    ensaios: 'Ensaios',
    sessoes_fotos: 'Sessões de fotos',
    shows: 'Shows',
    entrevistas: 'Entrevistas',
    podcasts: 'Podcasts',
    programas_tv: 'Programas de TV',
    radio: 'Rádio',
    producao_conteudo: 'Produção de conteúdo',
    reunioes: 'Reuniões'
  };

  const statusLabels: Record<string, string> = {
    agendado: 'Agendado',
    cancelado: 'Cancelado',
    pendente: 'Pendente',
    concluido: 'Concluído',
    confirmado: 'Confirmado'
  };

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

  const handleExport = () => {
    const dataToExport = filteredEvents.map((event: any) => ({
      'Nome do Evento': event.event_name || '',
      'Tipo': eventTypeLabels[event.event_type as keyof typeof eventTypeLabels] || '',
      'Status': statusLabels[event.status as keyof typeof statusLabels] || '',
      'Data Início': event.start_date || '',
      'Horário Início': event.start_time || '',
      'Data Fim': event.end_date || '',
      'Horário Fim': event.end_time || '',
      'Local': event.location || '',
      'Venue': event.venue_name || '',
      'Artista': event.artists?.stage_name || event.artists?.name || '',
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Agenda');
    XLSX.writeFile(wb, `agenda_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast({ title: 'Sucesso', description: 'Arquivo exportado com sucesso!' });
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        let successCount = 0;
        let errorCount = 0;

        for (const row of jsonData as any[]) {
          try {
            const eventTypeReverseMap: Record<string, string> = {
              'Sessões de estúdio': 'sessoes_estudio',
              'Ensaios': 'ensaios',
              'Sessões de fotos': 'sessoes_fotos',
              'Shows': 'shows',
              'Entrevistas': 'entrevistas',
              'Podcasts': 'podcasts',
              'Programas de TV': 'programas_tv',
              'Rádio': 'radio',
              'Produção de conteúdo': 'producao_conteudo',
              'Reuniões': 'reunioes'
            };

            const statusReverseMap: Record<string, string> = {
              'Agendado': 'agendado',
              'Cancelado': 'cancelado',
              'Pendente': 'pendente',
              'Concluído': 'concluido',
              'Confirmado': 'confirmado'
            };

            await createEvent.mutateAsync({
              title: row['Nome do Evento'] || row['title'] || 'Evento Importado',
              event_type: eventTypeReverseMap[row['Tipo']] || row['event_type'] || 'reunioes',
              start_date: row['Data Início'] ? new Date(row['Data Início']).toISOString() : new Date().toISOString(),
              location: row['Local'] || row['location'] || null,
            });
            });
          } catch (err) {
            errorCount++;
            console.error('Error importing row:', err);
          }
        }

        toast({ 
          title: 'Importação concluída', 
          description: `${successCount} eventos importados com sucesso. ${errorCount > 0 ? `${errorCount} erros.` : ''}` 
        });
      } catch (error) {
        toast({ title: 'Erro', description: 'Erro ao processar arquivo.', variant: 'destructive' });
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = '';
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredEvents.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  const confirmBulkDelete = async () => {
    setIsDeletingBulk(true);
    try {
      for (const id of selectedItems) {
        await deleteEvent.mutateAsync(id);
      }
      toast({
        title: "Eventos excluídos",
        description: `${selectedItems.length} eventos foram excluídos com sucesso.`,
      });
      setSelectedItems([]);
      setIsBulkDeleteModalOpen(false);
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir alguns eventos.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const handleNewEvent = () => {
    setSelectedEvent(undefined);
    setIsModalOpen(true);
  };

  const handleEditEvent = (event: AgendaEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleViewEvent = (event: AgendaEvent) => {
    setEventToView(event);
    setIsViewModalOpen(true);
  };

  const handleDeleteEvent = (event: AgendaEvent) => {
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
  };

  const handleSubmitEvent = async (data: any) => {
    try {
      const eventData = {
        title: data.event_name,
        start_date: data.start_date instanceof Date 
          ? data.start_date.toISOString() 
          : new Date(data.start_date).toISOString(),
        end_date: data.end_date instanceof Date 
          ? data.end_date.toISOString() 
          : data.end_date ? new Date(data.end_date).toISOString() : null,
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

  const filterOptions = [
    { key: "event_type", label: "Tipo", options: ["sessoes_estudio", "ensaios", "sessoes_fotos", "shows", "entrevistas", "podcasts", "programas_tv", "radio", "producao_conteudo", "reunioes"] },
    { key: "status", label: "Status", options: ["agendado", "cancelado", "pendente", "concluido", "confirmado"] }
  ];

  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
  };

  const handleFilter = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
  };

  const handleClear = () => {
    setSearchTerm("");
    setFilters({});
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchTerm || 
      event.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilters = Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      if (key === 'event_type') return event.event_type === value;
      if (key === 'status') return event.status === value;
      return true;
    });

    return matchesSearch && matchesFilters;
  });

  const totalEvents = events.length;
  const confirmedEvents = events.filter(e => e.status === 'confirmado').length;
  const upcomingEvents = events.filter(e => new Date(e.start_date) > new Date()).length;
  const todayEventsCount = events.filter(e => isSameDay(new Date(e.start_date), new Date())).length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full h-full px-4 py-4 space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-foreground">Agenda</h1>
                <p className="text-muted-foreground">
                  Gerencie eventos, shows e compromissos
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedItems.length > 0 && (
                  <Button 
                    variant="destructive" 
                    className="gap-2" 
                    onClick={() => setIsBulkDeleteModalOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir ({selectedItems.length})
                  </Button>
                )}
                <Button variant="outline" className="gap-2" onClick={handleExport}>
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
                <label>
                  <input type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" disabled={isImporting} />
                  <Button variant="outline" className="gap-2" asChild disabled={isImporting}>
                    <span><Upload className="h-4 w-4" />{isImporting ? 'Importando...' : 'Importar'}</span>
                  </Button>
                </label>
                <Button className="gap-2" onClick={handleNewEvent}>
                  <Plus className="h-4 w-4" />
                  Novo Evento
                </Button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardCard
                title="Total de Eventos"
                value={totalEvents.toString()}
                description="este mês"
                icon={CalendarIcon}
                trend={{ value: 0, isPositive: true }}
              />
              <DashboardCard
                title="Eventos Confirmados"
                value={confirmedEvents.toString()}
                description="confirmados"
                icon={CheckSquare}
                trend={{ value: 0, isPositive: true }}
              />
              <DashboardCard
                title="Próximos Eventos"
                value={upcomingEvents.toString()}
                description="nos próximos dias"
                icon={Clock}
                trend={{ value: 0, isPositive: true }}
              />
              <DashboardCard
                title="Hoje"
                value={todayEventsCount.toString()}
                description="eventos hoje"
                icon={Users}
                trend={{ value: 0, isPositive: true }}
              />
            </div>

            {/* Lista de Eventos */}
            <div className="space-y-4">
              <SearchFilter
                searchPlaceholder="Buscar eventos por nome ou local..."
                filters={filterOptions}
                onSearch={handleSearch}
                onFilter={handleFilter}
                onClear={handleClear}
              />

              <Card>
                <CardHeader>
                  <CardTitle>Todos os Eventos</CardTitle>
                  <CardDescription>{filteredEvents.length} evento(s) cadastrado(s)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoading ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Carregando eventos...</p>
                      </div>
                    ) : filteredEvents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum evento cadastrado</h3>
                        <p className="text-muted-foreground mb-4">Comece agendando seu primeiro evento</p>
                        <Button onClick={handleNewEvent} className="gap-2">
                          <Plus className="h-4 w-4" />
                          Agendar Primeiro Evento
                        </Button>
                      </div>
                    ) : (
                      <>
                        {/* Select All */}
                        <div className="flex items-center gap-2 pb-2 border-b">
                          <Checkbox
                            checked={selectedItems.length === filteredEvents.length && filteredEvents.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                          <span className="text-sm text-muted-foreground">Selecionar todos</span>
                        </div>
                        {filteredEvents.map((event) => (
                          <div
                            key={event.id}
                            className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <Checkbox
                                checked={selectedItems.includes(event.id)}
                                onCheckedChange={(checked) => handleSelectItem(event.id, !!checked)}
                              />
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                event.event_type === "shows" ? "bg-purple-100 dark:bg-purple-900/20" :
                                event.event_type === "sessoes_estudio" ? "bg-red-100 dark:bg-red-900/20" :
                                event.event_type === "ensaios" ? "bg-blue-100 dark:bg-blue-900/20" :
                                "bg-green-100 dark:bg-green-900/20"
                              }`}>
                                {event.event_type === "shows" ? (
                                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                ) : event.event_type === "sessoes_estudio" ? (
                                  <CalendarIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                                ) : event.event_type === "ensaios" ? (
                                  <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                ) : (
                                  <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                                )}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium text-foreground">{event.event_name}</h3>
                                  {event.artists && (
                                    <span className="text-muted-foreground">
                                      — {event.artists.stage_name || event.artists.name}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary">
                                    {eventTypeLabels[event.event_type as keyof typeof eventTypeLabels]}
                                  </Badge>
                                  <Badge 
                                    variant={
                                      event.status === "confirmado" ? "default" : 
                                      event.status === "cancelado" ? "destructive" : "secondary"
                                    }
                                  >
                                    {statusLabels[event.status]}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-6 text-sm">
                              {event.location && (
                                <div className="text-center">
                                  <div className="text-muted-foreground">Local</div>
                                  <div className="font-medium flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {event.location}
                                  </div>
                                </div>
                              )}
                              
                              <div className="text-center">
                                <div className="text-muted-foreground">Data</div>
                                <div className="font-medium flex items-center gap-1">
                                  <CalendarIcon className="h-3 w-3" />
                                  {formatDateFullBR(new Date(event.start_date))}
                                </div>
                              </div>
                              
                              {event.start_time && (
                                <div className="text-center">
                                  <div className="text-muted-foreground">Horário</div>
                                  <div className="font-medium flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {event.start_time}
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleViewEvent(event)}>
                                  Ver
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleEditEvent(event)}>
                                  Editar
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleDeleteEvent(event)}>
                                  Excluir
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>

      <AgendaEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={selectedEvent}
        onSubmit={handleSubmitEvent}
      />

      <AgendaViewModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        event={eventToView}
      />

      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Excluir Evento"
        description={`Tem certeza que deseja excluir o evento "${eventToDelete?.event_name}"? Esta ação não pode ser desfeita.`}
      />

      <DeleteConfirmationModal
        open={isBulkDeleteModalOpen}
        onOpenChange={setIsBulkDeleteModalOpen}
        onConfirm={confirmBulkDelete}
        title="Excluir Eventos Selecionados"
        description={`Tem certeza que deseja excluir ${selectedItems.length} eventos? Esta ação não pode ser desfeita.`}
      />
    </SidebarProvider>
  );
};

export default Agenda;