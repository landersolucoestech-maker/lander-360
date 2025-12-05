import { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchFilter } from "@/components/filters/SearchFilter";
import { ProjectModal } from "@/components/modals/ProjectModal";
import { PlayCircle, Plus, TrendingUp, Calendar, Music } from "lucide-react";
import { mockProjects } from "@/data/mockData";

const Projetos = () => {
  const allProjects = mockProjects;

  const [filteredProjects, setFilteredProjects] = useState(allProjects);
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const filterOptions = [
    {
      key: "status",
      label: "Status",
      options: ["Concluído", "Em Andamento", "Planejamento"]
    },
    {
      key: "type",
      label: "Tipo",
      options: ["Single", "EP", "Álbum"]
    },
    {
      key: "genre",
      label: "Gênero",
      options: ["Rock", "Pop", "MPB", "Sertanejo", "Funk"]
    }
  ];

  const handleSearch = (searchTerm: string) => {
    filterProjects(searchTerm, {});
  };

  const handleFilter = (filters: Record<string, string>) => {
    filterProjects("", filters);
  };

  const handleClear = () => {
    setFilteredProjects(allProjects);
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setEditModalOpen(true);
  };

  const filterProjects = (searchTerm: string, filters: Record<string, string>) => {
    let filtered = allProjects;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.compositors.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.interpreters.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.djProducer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(project => {
          if (key === "status") return project.status === value;
          if (key === "type") return project.type === value;
          if (key === "genre") return project.genre === value;
          return true;
        });
      }
    });

    setFilteredProjects(filtered);
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
                <h1 className="text-3xl font-bold text-foreground">Projetos</h1>
                <p className="text-muted-foreground">
                  Gestão completa de projetos musicais
                </p>
              </div>
              <Button className="gap-2" onClick={() => setNewProjectModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Novo Projeto
              </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardCard
                title="Projetos Ativos"
                value={0}
                description="em desenvolvimento"
                icon={PlayCircle}
                trend={{ value: 0, isPositive: true }}
              />
              <DashboardCard
                title="Concluídos Este Mês"
                value={0}
                description="projetos finalizados"
                icon={TrendingUp}
                trend={{ value: 0, isPositive: true }}
              />
              <DashboardCard
                title="Tempo Médio"
                value="0"
                description="dias por projeto"
                icon={Calendar}
                trend={{ value: 0, isPositive: false }}
              />
              <DashboardCard
                title="Taxa de Sucesso"
                value="0%"
                description="projetos lançados"
                icon={Music}
                trend={{ value: 0, isPositive: true }}
              />
            </div>

            {/* Search and Filters */}
            <SearchFilter
              searchPlaceholder="Buscar projetos por nome, compositor, intérprete ou produtor..."
              filters={filterOptions}
              onSearch={handleSearch}
              onFilter={handleFilter}
              onClear={handleClear}
            />

            {/* Projects List */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Lista de Projetos</CardTitle>
                <CardDescription>
                  Acompanhe o desenvolvimento de todos os projetos musicais
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allProjects.length === 0 ? (
                  <div className="text-center py-12">
                    <PlayCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhum projeto cadastrado</h3>
                    <p className="text-muted-foreground mb-4">
                      Comece criando seu primeiro projeto musical
                    </p>
                    <Button onClick={() => setNewProjectModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Projeto
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProjects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <PlayCircle className="h-6 w-6 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-medium text-foreground">{project.name}</h3>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={
                                  project.status === "Concluído" ? "default" :
                                  project.status === "Em Andamento" ? "secondary" : "outline"
                                }
                              >
                                {project.status}
                              </Badge>
                              <Badge variant="secondary">{project.type}</Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <div className="text-muted-foreground">Compositores</div>
                            <div className="font-medium">{project.compositors}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground">Intérpretes</div>
                            <div className="font-medium">{project.interpreters}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground">Gênero</div>
                            <div className="font-medium">{project.genre}</div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleEditProject(project)}>
                            Editar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <ProjectModal 
              open={newProjectModalOpen}
              onOpenChange={setNewProjectModalOpen}
              project={null}
              mode="create"
            />

            <ProjectModal 
              open={editModalOpen}
              onOpenChange={setEditModalOpen}
              project={selectedProject}
              mode="edit"
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Projetos;