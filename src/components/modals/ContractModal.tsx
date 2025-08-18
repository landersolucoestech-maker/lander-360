import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ContractForm } from '@/components/forms/ContractForm';
import { useCreateContract, useUpdateContract } from '@/hooks/useContracts';
import { useArtists } from '@/hooks/useArtists';
import { useProjects } from '@/hooks/useProjects';
import { Contract } from '@/types/database';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract?: Contract;
}

export const ContractModal: React.FC<ContractModalProps> = ({
  isOpen,
  onClose,
  contract,
}) => {
  const createContract = useCreateContract();
  const updateContract = useUpdateContract();
  const { data: artists = [] } = useArtists();
  const { data: projects = [] } = useProjects();
  
  const companies = [
    // Companies will be loaded from database
  ];

  const isEditing = !!contract;
  const isLoading = createContract.isPending || updateContract.isPending;

  const handleSubmit = async (data: any) => {
    try {
      if (isEditing) {
        await updateContract.mutateAsync({
          id: contract.id,
          data: {
            ...data,
            involved_parties: data.involved_parties,
            attachments: data.attachments || null,
          },
        });
      } else {
        await createContract.mutateAsync({
          ...data,
          involved_parties: data.involved_parties,
          attachments: data.attachments || null,
        });
      }
      onClose();
    } catch (error) {
      console.error('Error saving contract:', error);
    }
  };

  const initialData = contract ? {
    title: (contract as any).title || contract.contract_type || '',
    client_type: (contract as any).client_type as 'artista' | 'empresa' | undefined,
    service_type: (contract as any).service_type as any,
    artist_id: contract.artist_id || undefined,
    project_id: (contract as any).project_id || undefined,
    responsible_person: (contract as any).responsible_person || '',
    status: (contract as any).status as 'pendente' | 'assinado' | 'expirado' | 'rescindido' | 'rascunho',
    start_date: contract.effective_from ? new Date(contract.effective_from) : undefined,
    end_date: contract.effective_to ? new Date(contract.effective_to) : undefined,
    registry_office: (contract as any).registry_office || false,
    registry_date: (contract as any).registry_date ? new Date((contract as any).registry_date) : undefined,
    fixed_value: (contract as any).fixed_value || undefined,
    royalties_percentage: contract.royalty_rate || undefined,
    advance_payment: contract.advance_amount || undefined,
    observations: contract.notes || undefined,
    terms: (contract as any).terms || undefined,
    involved_parties: (contract as any).involved_parties as any || [],
  } : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Contrato' : 'Novo Contrato'}
          </DialogTitle>
        </DialogHeader>
        
        <ContractForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          initialData={initialData}
          isLoading={isLoading}
          artists={artists.map(artist => ({
            id: artist.id,
            name: artist.name
          }))}
          companies={companies}
          projects={projects.map(project => ({
            id: project.id,
            name: project.name
          }))}
        />
      </DialogContent>
    </Dialog>
  );
};