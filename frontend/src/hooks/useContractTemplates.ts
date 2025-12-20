import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ContractTemplatesService, ContractTemplate, ContractTemplateInsert, ContractTemplateUpdate } from '@/services/contractTemplates';
import { useToast } from '@/hooks/use-toast';

const queryKeys = {
  all: ['contractTemplates'] as const,
  detail: (id: string) => ['contractTemplates', id] as const,
  byType: (type: string) => ['contractTemplates', 'type', type] as const,
};

export function useContractTemplates() {
  return useQuery({
    queryKey: queryKeys.all,
    queryFn: () => ContractTemplatesService.getAll(),
  });
}

export function useContractTemplate(id: string) {
  return useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => ContractTemplatesService.getById(id),
    enabled: !!id,
  });
}

export function useContractTemplateByType(templateType: string) {
  return useQuery({
    queryKey: queryKeys.byType(templateType),
    queryFn: () => ContractTemplatesService.getByType(templateType),
    enabled: !!templateType,
  });
}

export function useCreateContractTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: ContractTemplateInsert) => ContractTemplatesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      toast({
        title: 'Template criado',
        description: 'O template de contrato foi criado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateContractTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ContractTemplateUpdate }) => 
      ContractTemplatesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      toast({
        title: 'Template atualizado',
        description: 'O template de contrato foi atualizado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteContractTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => ContractTemplatesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      toast({
        title: 'Template excluído',
        description: 'O template de contrato foi excluído com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
