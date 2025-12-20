import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CrmService } from '@/services/crm';
import { useToast } from '@/hooks/use-toast';

// Query keys
export const crmQueryKeys = {
  all: ['crm'] as const,
  lists: () => [...crmQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...crmQueryKeys.lists(), { filters }] as const,
  details: () => [...crmQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...crmQueryKeys.details(), id] as const,
  search: (query: string) => [...crmQueryKeys.all, 'search', query] as const,
};

// Get all CRM contacts
export const useCrmContacts = () => {
  return useQuery({
    queryKey: crmQueryKeys.lists(),
    queryFn: CrmService.getAll,
  });
};

// Get CRM contact by ID
export const useCrmContact = (id: string) => {
  return useQuery({
    queryKey: crmQueryKeys.detail(id),
    queryFn: () => CrmService.getById(id),
    enabled: !!id,
  });
};

// Get contacts by type
export const useCrmContactsByType = (contactType: string) => {
  return useQuery({
    queryKey: crmQueryKeys.list({ contactType }),
    queryFn: () => CrmService.getByType(contactType),
    enabled: !!contactType,
  });
};

// Search contacts
export const useSearchCrmContacts = (query: string) => {
  return useQuery({
    queryKey: crmQueryKeys.search(query),
    queryFn: () => CrmService.search(query),
    enabled: query.length > 0,
  });
};

// CRM contact data type
interface CrmContactData {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  contact_type?: string;
  position?: string;
  document?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
  status?: string;
  priority?: string;
  next_action?: string;
  image_url?: string;
  artist_name?: string;
  interactions?: any[];
}

// Create CRM contact mutation
export const useCreateCrmContact = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CrmContactData) => CrmService.create(data),
    onSuccess: (newContact) => {
      queryClient.invalidateQueries({ queryKey: crmQueryKeys.lists() });
      toast({
        title: 'Sucesso',
        description: `Contato "${newContact.name}" criado com sucesso.`,
      });
    },
    onError: (error) => {
      console.error('Error creating CRM contact:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao criar contato no CRM. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};

// Update CRM contact mutation
export const useUpdateCrmContact = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<CrmContactData>) =>
      CrmService.update(id, data),
    onSuccess: (updatedContact) => {
      queryClient.invalidateQueries({ queryKey: crmQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: crmQueryKeys.detail(updatedContact.id) });
      toast({
        title: 'Sucesso',
        description: `Contato "${updatedContact.name}" atualizado com sucesso.`,
      });
    },
    onError: (error) => {
      console.error('Error updating CRM contact:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar contato no CRM. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};

// Delete CRM contact mutation
export const useDeleteCrmContact = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => CrmService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmQueryKeys.lists() });
      toast({
        title: 'Sucesso',
        description: 'Contato removido do CRM com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error deleting CRM contact:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao remover contato do CRM. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};