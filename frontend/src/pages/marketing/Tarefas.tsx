import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchFilter } from "@/components/filters/SearchFilter";
import { MarketingTaskModal } from "@/components/modals/MarketingTaskModal";
import { CheckSquare, Plus, Clock, Users, CheckCircle, Calendar } from "lucide-react";
import { useMarketingTasks } from "@/hooks/useMarketing";
import { getTodayDateString, formatDateBR } from "@/lib/utils";

const MarketingTarefas = () => {
  const { data: dbTasks = [], isLoading: tasksLoading } = useMarketingTasks();

  const tasks = dbTasks;
  
  const taskStats = {
    pending: tasks.filter(t => t.status === "Pendente" || t.status === "pending").length,
    inProgress: tasks.filter(t => t.status === "Em Andamento" || t.status === "in_progress").length,
    completed: tasks.filter(t => t.status === "Concluída" || t.status === "completed").length,
    total: tasks.length
  };

  const [filteredTasks, setFilteredTasks] = useState(tasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const filterOptions = [
    {
      key: "status",
      label: "Status",
      options: ["Pendente", "Em Andamento", "Concluída", "Atrasada"]
    },
    {
      key: "priority",
      label: "Prioridade",
      options: ["Alta", "Média", "Baixa"]
    },
    {
      key: "category",
      label: "Categoria",
      options: ["Design", "Publicidade", "Vídeo", "Social Media", "Copywriting"]
    }
  ];

  const handleSearch = (searchTerm: string) => {
    filterTasks(searchTerm, {});
  };

  const handleFilter = (filters: Record<string, string>) => {
    filterTasks("", filters);
  };

  const handleClear = () => {
    setFilteredTasks(tasks);
  };

  const filterTasks = (searchTerm: string, filters: Record<string, string>) => {
    let filtered = tasks;

    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (task.campaign && task.campaign.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(task => {
          if (key === "status") return task.status === value;
          if (key === "priority") return task.priority === value;
          if (key === "category") return task.category === value;
          return true;
        });
      }
    });

    setFilteredTasks(filtered);
  };

  useEffect(() => {
    setFilteredTasks(dbTasks);
  }, [dbTasks]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full h-full px-4 py-3 space-y-3">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="h-9 w-9" />
                <div className="flex flex-col gap-2">
                  <h1 className="text-3xl font-bold text-foreground">Gestão de Tarefas</h1>
                  <p className="text-muted-foreground">
                    Organize e acompanhe todas as tarefas de marketing
                  </p>
                </div>
              </div>
              <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Nova Tarefa
              </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardCard
                title="Tarefas Pendentes"
                value={taskStats.pending}
                description="aguardando execução"
                icon={Clock}
              />
              <DashboardCard
                title="Em Andamento"
                value={taskStats.inProgress}
                description="sendo executadas"
                icon={CheckSquare}
              />
              <DashboardCard
                title="Concluídas"
                value={taskStats.completed}
                description="este mês"
                icon={CheckCircle}
              />
              <DashboardCard
                title="Taxa de Conclusão"
                value={taskStats.total > 0 ? `${Math.min(Math.round((taskStats.completed / taskStats.total) * 100), 100)}%` : "0%"}
                description="no prazo"
                icon={Users}
              />
            </div>

            {/* Quick Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{filteredTasks.filter(t => t.due_date === getTodayDateString()).length}</div>
                  <p className="text-xs text-muted-foreground">vencendo hoje</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{filteredTasks.length}</div>
                  <p className="text-xs text-muted-foreground">para entregar</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{filteredTasks.filter(t => t.status === 'Atrasada').length}</div>
                  <p className="text-xs text-muted-foreground">precisam atenção</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Produtividade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.min(Math.round((filteredTasks.filter(t => t.status === 'Concluída' || t.status === 'completed').length / Math.max(filteredTasks.length, 1)) * 100), 100)}%</div>
                  <p className="text-xs text-muted-foreground">vs semana passada</p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <SearchFilter
              searchPlaceholder="Buscar tarefas por título, descrição ou campanha..."
              filters={filterOptions}
              onSearch={handleSearch}
              onFilter={handleFilter}
              onClear={handleClear}
            />

            {/* Tasks List */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Lista de Tarefas</CardTitle>
                <CardDescription>
                  Gerencie todas as tarefas de marketing e seus prazos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Carregando tarefas...
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Nenhuma tarefa cadastrada
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Comece a organizar suas tarefas de marketing
                    </p>
                    <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Adicionar Tarefa
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="space-y-1 flex-1">
                            <h3 className="font-medium text-foreground">{task.title}</h3>
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                            {task.campaign && (
                              <div className="text-xs text-muted-foreground">
                                Campanha: {task.campaign}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Badge 
                              variant={
                                task.status === "Concluída" || task.status === "completed" ? "default" :
                                task.status === "Em Andamento" || task.status === "in_progress" ? "secondary" :
                                task.status === "Atrasada" ? "destructive" : "outline"
                              }
                            >
                              {task.status}
                            </Badge>
                            <Badge 
                              variant={
                                task.priority === "Alta" || task.priority === "high" ? "destructive" :
                                task.priority === "Média" || task.priority === "medium" ? "secondary" : "outline"
                              }
                            >
                              {task.priority}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6 text-sm">
                            {task.assignee_name && (
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>{task.assignee_name}</span>
                              </div>
                            )}
                            {task.due_date && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{formatDateBR(task.due_date)}</span>
                              </div>
                            )}
                            {task.category && (
                              <Badge variant="outline" className="text-xs">
                                {task.category}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="text-sm text-muted-foreground">
                              {task.progress || 0}% concluída
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedTask(task);
                                setIsModalOpen(true);
                              }}
                            >
                              Ver
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                            >
                              Editar
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                            >
                              Excluir
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <MarketingTaskModal
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedTask(null);
              }}
              initialData={selectedTask}
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MarketingTarefas;