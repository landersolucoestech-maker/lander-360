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
import { useContractTemplates } from '@/hooks/useContractTemplates';
import { Contract } from '@/types/database';
import { formatDateForDB } from '@/lib/utils';

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
  const { data: templates = [] } = useContractTemplates();
  
  const companies = [
    // Companies will be loaded from database
  ];

  const isEditing = !!contract;
  const isLoading = createContract.isPending || updateContract.isPending;

  const handleSubmit = async (data: any) => {
    console.log('ContractModal handleSubmit called with data:', data);
    try {
      // Map form data to database columns
      const contractData = {
        title: data.title,
        client_type: data.client_type || null,
        service_type: data.service_type || null,
        artist_id: data.artist_id || null,
        project_id: data.project_id || null,
        contractor_contact: data.contractor_contact || null,
        responsible_person: data.responsible_person || null,
        status: data.status || 'rascunho',
        effective_from: formatDateForDB(data.start_date),
        effective_to: formatDateForDB(data.end_date),
        start_date: formatDateForDB(data.start_date),
        end_date: formatDateForDB(data.end_date),
        registry_office: data.registry_office || false,
        registry_date: formatDateForDB(data.registry_date),
        payment_type: data.payment_type || null,
        fixed_value: data.fixed_value || null,
        value: data.fixed_value || null,
        royalty_rate: data.royalties_percentage || null,
        royalties_percentage: data.royalties_percentage || null,
        advance_amount: data.advance_payment || null,
        financial_support: data.financial_support || null,
        notes: data.observations || null,
        observations: data.observations || null,
        terms: data.terms || null,
        template_id: data.template_id || null,
        // Store template data as generated_document_content for later use
        generated_document_content: data.template_data ? JSON.stringify(data.template_data) : null,
      };

      console.log('ContractModal contractData to save:', contractData);
      console.log('isEditing:', isEditing, 'contract.id:', contract?.id);

      if (isEditing && contract) {
        console.log('Calling updateContract.mutateAsync');
        await updateContract.mutateAsync({
          id: contract.id,
          data: contractData,
        });
        console.log('updateContract completed successfully');
      } else {
        console.log('Calling createContract.mutateAsync');
        await createContract.mutateAsync(contractData);
        console.log('createContract completed successfully');
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
    financial_support: (contract as any).financial_support || undefined,
    observations: (contract as any).observations || contract.notes || undefined,
    terms: (contract as any).terms || undefined,
  } : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {isEditing ? 'Editar Contrato' : 'Novo Contrato'}
          </DialogTitle>
        </DialogHeader>
        
        <ContractForm
          key={contract?.id || 'new'}
          onSubmit={handleSubmit}
          onCancel={onClose}
          initialData={initialData}
          isLoading={isLoading}
          artists={artists.map(artist => ({
            id: artist.id,
            name: artist.name,
            full_name: artist.full_name || undefined,
            name: artist.name || undefined,
            // Note: cpf_cnpj, rg, full_address moved to artist_sensitive_data table (admin only)
            cpf_cnpj: undefined,
            rg: undefined,
            full_address: undefined,
            artist_types: artist.artist_types || undefined,
          }))}
          companies={companies}
          projects={projects.map(project => ({
            id: project.id,
            name: project.name
          }))}
          contacts={crmContacts.map(contact => ({
            id: contact.id,
            name: contact.name,
            company: contact.company,
            document: contact.document || undefined,
            address: contact.address || undefined,
            city: contact.city || undefined,
            state: contact.state || undefined,
            zip_code: contact.zip_code || undefined,
            position: contact.position || undefined,
          }))}
          templates={templates}
        />
      </DialogContent>
    </Dialog>
  );
};