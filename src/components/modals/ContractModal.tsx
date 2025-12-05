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
import { useCrmContacts } from '@/hooks/useCrm';
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
  const { data: crmContacts = [] } = useCrmContacts();
  
  const companies = [
    // Companies will be loaded from database
  ];

  const isEditing = !!contract;
  const isLoading = createContract.isPending || updateContract.isPending;

  const handleSubmit = async (data: any) => {
    try {
      // Map form data to database columns
      const contractData = {
        title: data.title,
        client_type: data.client_type,
        service_type: data.service_type,
        artist_id: data.artist_id || null,
        project_id: data.project_id || null,
        contractor_contact: data.contractor_contact || null,
        responsible_person: data.responsible_person,
        status: data.status,
        effective_from: data.start_date ? data.start_date.toISOString().split('T')[0] : null,
        effective_to: data.end_date ? data.end_date.toISOString().split('T')[0] : null,
        registry_office: data.registry_office || false,
        registry_date: data.registry_date ? data.registry_date.toISOString().split('T')[0] : null,
        payment_type: data.payment_type || null,
        fixed_value: data.fixed_value || null,
        value: data.fixed_value || null,
        royalty_rate: data.royalties_percentage || null,
        royalties_percentage: data.royalties_percentage || null,
        advance_amount: data.advance_payment || null,
        notes: data.observations || null,
        observations: data.observations || null,
        terms: data.terms || null,
      };

      if (isEditing) {
        await updateContract.mutateAsync({
          id: contract.id,
          data: contractData,
        });
      } else {
        await createContract.mutateAsync(contractData);
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
    contractor_contact: (contract as any).contractor_contact || undefined,
    responsible_person: (contract as any).responsible_person || '',
    status: ((contract as any).status || 'rascunho') as 'pendente' | 'assinado' | 'expirado' | 'rescindido' | 'rascunho',
    start_date: contract.effective_from ? new Date(contract.effective_from) : undefined,
    end_date: contract.effective_to ? new Date(contract.effective_to) : undefined,
    registry_office: (contract as any).registry_office || false,
    registry_date: (contract as any).registry_date ? new Date((contract as any).registry_date) : undefined,
    payment_type: (contract as any).payment_type as 'valor_fixo' | 'royalties' | undefined,
    fixed_value: (contract as any).fixed_value || (contract as any).value || undefined,
    royalties_percentage: (contract as any).royalties_percentage || contract.royalty_rate || undefined,
    advance_payment: (contract as any).advance_amount || contract.advance_amount || undefined,
    observations: (contract as any).observations || contract.notes || undefined,
    terms: (contract as any).terms || undefined,
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
          contacts={crmContacts.map(contact => ({
            id: contact.id,
            name: contact.name,
            company: contact.company
          }))}
        />
      </DialogContent>
    </Dialog>
  );
};