import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchFilter } from "@/components/filters/SearchFilter";
import { ProjectModal } from "@/components/modals/ProjectModal";
import { ProjectViewModal } from "@/components/modals/ProjectViewModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import { PlayCircle, Plus, TrendingUp, Calendar, Music, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProjects, useDeleteProject } from "@/hooks/useProjects";

const Projetos = () => {
  const { data: projects = [], isLoading, error } = useProjects();
  const deleteProjectMutation = useDeleteProject();
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const { toast } = useToast();

  // Update filtered projects when projects data changes
  useEffect(() => {
    setFilteredProjects(projects);
  }, [projects]);

  const filterOptions = [
    {
      key: "status",
      label: "Status",
      options: ["Concluído", "Em Andamento", "Rascunho", "Cancelado"]
    },
  ];

  const handleSearch = (searchTerm: string) => {
    filterProjects(searchTerm, {});
  };

  const handleFilter = (filters: Record<string, string>) => {
    filterProjects("", filters);
  };

  const handleClear = () => {
    setFilteredProjects(projects);
  };

  const handleEditProject = (project: any) => {
    setSelectedProject(project);
    setEditModalOpen(true);
  };

  const handleViewProject = (project: any) => {
    setSelectedProject(project);
    setViewModalOpen(true);
  };

  const handleDeleteProject = (project: any) => {
    setSelectedProject(project);
    setDeleteModalOpen(true);
  };

  const confirmDeleteProject = async () => {
    if (selectedProject) {
      try {
        await deleteProjectMutation.mutateAsync(selectedProject.id);
        setDeleteModalOpen(false);
        setSelectedProject(null);
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const filterProjects = (searchTerm: string, filters: Record<string, string>) => {
    let filtered = projects;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(project => {
          if (key === "status") {
            const statusTranslation: Record<string, string> = {
              'Concluído': 'completed',
              'Em Andamento': 'in_progress',
              'Rascunho': 'draft',
              'Cancelado': 'cancelled'
            };
            return project.status === statusTranslation[value];
          }
          return true;
        });
      }
    });
    setFilteredProjects(filtered);
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Rascunho",
      in_progress: "Em Andamento",
      completed: "Concluído",
      cancelled: "Cancelado"
    };
    return labels[status] || status;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "in_progress": return "secondary";
      case "draft": return "outline";
      case "cancelled": return "destructive";
      default: return "secondary";
    }
  };

  // Parse audio_files JSON to get project details
  const getProjectDetails = (project: any) => {
    try {
      if (project.audio_files && typeof project.audio_files === 'string') {
        return JSON.parse(project.audio_files);
      }
      if (project.audio_files && typeof project.audio_files === 'object') {
        return project.audio_files;
      }
    } catch (e) {
      console.error('Error parsing audio_files:', e);
    }
    return null;
  };

  if (error) {
    console.error('Error loading projects:', error);
  }

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
                value={projects.filter(p => p.status === "in_progress").length}
                description="em desenvolvimento"
                icon={PlayCircle}
              />
              <DashboardCard
                title="Concluídos"
                value={projects.filter(p => p.status === "completed").length}
                description="projetos finalizados"
                icon={TrendingUp}
              />
              <DashboardCard
                title="Rascunhos"
                value={projects.filter(p => p.status === "draft").length}
                description="em planejamento"
                icon={Calendar}
              />
              <DashboardCard
                title="Total de Projetos"
                value={projects.length}
                description="cadastrados no sistema"
                icon={Music}
              />
            </div>

            {/* Search and Filters */}
            <SearchFilter
              searchPlaceholder="Buscar projetos por nome ou descrição..."
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
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : projects.length === 0 ? (
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
                    {filteredProjects.map(project => {
                      const details = getProjectDetails(project);
                      const firstSong = details?.songs?.[0];
                      
                      return (
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
                                <Badge variant={getStatusVariant(project.status)}>
                                  {getStatusLabel(project.status)}
                                </Badge>
                                {details?.release_type && (
                                  <Badge variant="secondary">
                                    {details.release_type === 'single' ? 'Single' : 
                                     details.release_type === 'ep' ? 'EP' : 'Álbum'}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 text-sm">
                            {firstSong && (
                              <>
                                <div className="text-center">
                                  <div className="text-muted-foreground">Compositores</div>
                                  <div className="font-medium">
                                    {firstSong.composers?.map((c: any) => c.name).filter(Boolean).join(', ') || '-'}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-muted-foreground">Intérpretes</div>
                                  <div className="font-medium">
                                    {firstSong.performers?.map((p: any) => p.name).filter(Boolean).join(', ') || '-'}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-muted-foreground">Produtores</div>
                                  <div className="font-medium">
                                    {firstSong.producers?.map((p: any) => p.name).filter(Boolean).join(', ') || '-'}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-muted-foreground">Gênero</div>
                                  <div className="font-medium">{firstSong.genre || '-'}</div>
                                </div>
                              </>
                            )}
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleViewProject(project)}>
                                Ver
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleEditProject(project)}>
                                Editar
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleDeleteProject(project)}
                              >
                                Excluir
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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

            <ProjectViewModal
              open={viewModalOpen}
              onOpenChange={setViewModalOpen}
              project={selectedProject}
            />

            <DeleteConfirmationModal
              open={deleteModalOpen}
              onOpenChange={setDeleteModalOpen}
              onConfirm={confirmDeleteProject}
              title="Excluir Projeto"
              description={`Tem certeza que deseja excluir o projeto "${selectedProject?.name}"? Esta ação não pode ser desfeita.`}
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Projetos;
