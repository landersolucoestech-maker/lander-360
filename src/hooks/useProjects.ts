import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectsService } from '@/services/projects';
import { Project, ProjectInsert, ProjectUpdate } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

// Query keys
export const projectsQueryKeys = {
  all: ['projects'] as const,
  lists: () => [...projectsQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...projectsQueryKeys.lists(), { filters }] as const,
  details: () => [...projectsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectsQueryKeys.details(), id] as const,
  search: (query: string) => [...projectsQueryKeys.all, 'search', query] as const,
};

// Get all projects
export const useProjects = () => {
  return useQuery({
    queryKey: projectsQueryKeys.lists(),
    queryFn: ProjectsService.getAll,
  });
};

// Get project by ID
export const useProject = (id: string) => {
  return useQuery({
    queryKey: projectsQueryKeys.detail(id),
    queryFn: () => ProjectsService.getById(id),
    enabled: !!id,
  });
};

// Get project with details
export const useProjectWithDetails = (id: string) => {
  return useQuery({
    queryKey: [...projectsQueryKeys.detail(id), 'with-details'],
    queryFn: () => ProjectsService.getWithDetails(id),
    enabled: !!id,
  });
};

// Get projects by user
export const useProjectsByUser = (userId: string) => {
  return useQuery({
    queryKey: projectsQueryKeys.list({ userId }),
    queryFn: () => ProjectsService.getByUser(userId),
    enabled: !!userId,
  });
};

// Filter projects by status
export const useProjectsByStatus = (status: string) => {
  return useQuery({
    queryKey: projectsQueryKeys.list({ status }),
    queryFn: () => ProjectsService.filterByStatus(status),
    enabled: !!status,
  });
};

// Search projects
export const useSearchProjects = (query: string) => {
  return useQuery({
    queryKey: projectsQueryKeys.search(query),
    queryFn: () => ProjectsService.search(query),
    enabled: query.length > 0,
  });
};

// Create project mutation
export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: ProjectInsert) => ProjectsService.create(data),
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: projectsQueryKeys.lists() });
      toast({
        title: 'Sucesso',
        description: `Projeto "${newProject.name}" criado com sucesso.`,
      });
    },
    onError: (error) => {
      console.error('Error creating project:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao criar projeto. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};

// Update project mutation
export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProjectUpdate }) =>
      ProjectsService.update(id, data),
    onSuccess: (updatedProject) => {
      queryClient.invalidateQueries({ queryKey: projectsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectsQueryKeys.detail(updatedProject.id) });
      toast({
        title: 'Sucesso',
        description: `Projeto "${updatedProject.name}" atualizado com sucesso.`,
      });
    },
    onError: (error) => {
      console.error('Error updating project:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar projeto. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};

// Delete project mutation
export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => ProjectsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsQueryKeys.lists() });
      toast({
        title: 'Sucesso',
        description: 'Projeto removido com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error deleting project:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao remover projeto. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};