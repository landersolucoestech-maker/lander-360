import { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchFilter } from "@/components/filters/SearchFilter";
import { Calendar as CalendarIcon, Plus, Clock, MapPin, Users, CheckSquare, FileText } from "lucide-react";
import { AgendaEventModal } from "@/components/modals/AgendaEventModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { mockEvents } from "@/data/mockData";

interface AgendaEvent {
  id: string;
  event_name: string;
  start_date: string;
  start_time?: string;
  end_date?: string;
  end_time?: string;
  location?: string;
  event_type: 'sessoes_estudio' | 'ensaios' | 'sessoes_fotos' | 'shows' | 'entrevistas' | 'podcasts' | 'programas_tv' | 'radio' | 'producao_conteudo' | 'reunioes';
  status: 'agendado' | 'cancelado' | 'pendente' | 'concluido' | 'confirmado';
  artist_id?: string;
  description?: string;
  observations?: string;
}

const Agenda = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | undefined>();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<AgendaEvent | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  
  const { toast } = useToast();

  const events: any[] = mockEvents;

  const isLoading = false;

  const handleNewEvent = () => {
    setSelectedEvent(undefined);
    setIsModalOpen(true);
  };

  const handleEditEvent = (event: AgendaEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleDeleteEvent = (event: AgendaEvent) => {
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
  };

  const handleSubmitEvent = async (data: any) => {
    try {
      toast({
        title: 'Sucesso',
        description: 'Evento salvo com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao salvar evento. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const confirmDelete = async () => {
    if (eventToDelete) {
      try {
        // TODO: Implement actual delete API call
        setIsDeleteModalOpen(false);
        setEventToDelete(null);
        toast({
          title: 'Sucesso',
          description: 'Evento removido com sucesso.',
        });
      } catch (error) {
        console.error('Error deleting event:', error);
        toast({
          title: 'Erro',
          description: 'Falha ao remover evento. Tente novamente.',
          variant: 'destructive',
        });
      }
    }
  };

  const filterOptions = [
    {
      key: "event_type",
      label: "Tipo",
      options: ["sessoes_estudio", "ensaios", "sessoes_fotos", "shows", "entrevistas", "podcasts", "programas_tv", "radio", "producao_conteudo", "reunioes"]
    },
    {
      key: "status",
      label: "Status",
      options: ["agendado", "cancelado", "pendente", "concluido", "confirmado"]
    }
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

  // Filter events based on search and filters
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

  // Get events for today's date (since we removed selectedDate)
  const todayEvents = filteredEvents.filter(event => 
    isSameDay(new Date(event.start_date), new Date())
  );

  // Calculate stats
  const totalEvents = events.length;
  const confirmedEvents = events.filter(e => e.status === 'confirmado').length;
  const upcomingEvents = events.filter(e => new Date(e.start_date) > new Date()).length;
  const todayEventsCount = events.filter(e => isSameDay(new Date(e.start_date), new Date())).length;

  const eventTypeLabels = {
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

  const statusLabels = {
    agendado: 'Agendado',
    cancelado: 'Cancelado',
    pendente: 'Pendente',
    concluido: 'Concluído',
    confirmado: 'Confirmado'
  };


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
              <Button className="gap-2" onClick={handleNewEvent}>
                <Plus className="h-4 w-4" />
                Novo Evento
              </Button>
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
                {/* Search and Filters */}
                <SearchFilter
                  searchPlaceholder="Buscar eventos por nome ou local..."
                  filters={filterOptions}
                  onSearch={handleSearch}
                  onFilter={handleFilter}
                  onClear={handleClear}
                />

                {/* Eventos de Hoje */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Eventos de Hoje - {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </CardTitle>
                    <CardDescription>
                      {todayEvents.length} evento(s) para hoje
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {isLoading ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">Carregando eventos...</p>
                        </div>
                      ) : todayEvents.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">Nenhum evento encontrado para hoje.</p>
                        </div>
                      ) : (
                        todayEvents.map((event) => (
                          <div
                            key={event.id}
                            className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
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
                                <h3 className="font-medium text-foreground">{event.event_name}</h3>
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
                                {event.location && (
                                   <p className="text-sm text-muted-foreground flex items-center gap-1">
                                     <MapPin className="h-3 w-3" />
                                     {event.location}
                                   </p>
                                 )}
                               </div>
                             </div>
                            
                            <div className="flex items-center gap-6">
                              {event.start_time && (
                                <div className="text-center">
                                  <div className="text-sm text-muted-foreground">Horário</div>
                                  <div className="font-medium flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {event.start_time}
                                    {event.end_time && ` - ${event.end_time}`}
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEditEvent(event)}
                                >
                                  Editar
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDeleteEvent(event)}
                                >
                                  Excluir
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
            </div>
          </div>
        </SidebarInset>
      </div>

      {/* Modals */}
      <AgendaEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={selectedEvent}
        onSubmit={handleSubmitEvent}
        isLoading={false}
      />

      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Excluir Evento"
        description={`Tem certeza que deseja excluir o evento "${eventToDelete?.event_name}"? Esta ação não pode ser desfeita.`}
        isLoading={false}
      />
    </SidebarProvider>
  );
};

export default Agenda;