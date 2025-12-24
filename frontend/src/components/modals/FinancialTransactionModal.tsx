import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FinancialTransactionForm } from '@/components/forms/FinancialTransactionForm';
import { useArtists } from '@/hooks/useArtists';
import { useCrmContacts } from '@/hooks/useCrm';
import { useContracts } from '@/hooks/useContracts';
import { useProjects } from '@/hooks/useProjects';
import { useAgenda } from '@/hooks/useAgenda';
import { FinancialTransaction } from '@/types/database';

interface FinancialTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: FinancialTransaction;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export const FinancialTransactionModal: React.FC<FinancialTransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onSubmit,
  isLoading = false
 }) => {
  const { data: artists = [] } = useArtists();
  const { data: crmContacts = [] } = useCrmContacts();
  const { data: contracts = [] } = useContracts();
  const { data: projects = [] } = useProjects();
  const { data: agendaEvents = [] } = useAgenda();
  const isEditing = !!transaction;

  const handleSubmit = async (data: any) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  // Map old status values to new ones
  const mapStatus = (status: string | null | undefined): 'pendente' | 'aprovado' | 'pago' | 'cancelado' | 'atrasado' => {
    if (!status) return 'pendente';
    if (status === 'recebido') return 'pago';
    if (['pendente', 'aprovado', 'pago', 'cancelado', 'atrasado'].includes(status)) {
      return status as 'pendente' | 'aprovado' | 'pago' | 'cancelado' | 'atrasado';
    }
    return 'pendente';
  };

  // Filter shows from agenda events
  const showEvents = agendaEvents.filter(event => 
    event.event_type === 'show' || event.event_type === 'shows' || event.event_type === 'apresentacao'
  );

  const initialData = transaction ? {
    client_type: (transaction.artist_id ? 'artista' : 'empresa') as 'empresa' | 'artista' | 'pessoa',
    client_id: transaction.artist_id || undefined,
    description: transaction.description,
    transaction_type: (transaction.transaction_type === 'entrada' ? 'receitas' : 
      transaction.transaction_type === 'saida' ? 'despesas' : 
      (transaction.transaction_type || 'despesas')) as 'receitas' | 'despesas' | 'investimentos' | 'impostos' | 'transferencias',
    amount: transaction.amount,
    category: transaction.category || '',
    transaction_date: transaction.transaction_date ? new Date(transaction.transaction_date) : new Date(),
    status: mapStatus(transaction.status),
    payment_method: (transaction as any).payment_method || undefined,
    contract_id: (transaction as any).contract_id || undefined,
    crm_contact_id: (transaction as any).crm_contact_id || undefined,
    attachment_url: (transaction as any).attachment_url || undefined,
    observations: (transaction as any).observations || undefined,
    project_id: (transaction as any).project_id || undefined,
    primary_link_type: (transaction as any).project_id ? 'projeto' as const : 
      (transaction as any).contract_id ? 'contrato' as const : 
      transaction.artist_id ? 'artista' as const : 'nenhum' as const,
    secondary_artist_id: undefined,
  } : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {isEditing ? 'Editar Transação' : 'Nova Transação Financeira'}
          </DialogTitle>
        </DialogHeader>
        
        <FinancialTransactionForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          initialData={initialData}
          isLoading={isLoading}
          artists={artists.map(artist => ({
            id: artist.id,
            name: artist.name
          }))}
          companies={[]}
          crmContacts={crmContacts.map(contact => ({
            id: contact.id,
            name: contact.name,
            company: contact.company,
            contact_type: contact.contact_type
          }))}
          contracts={contracts.map(contract => ({
            id: contract.id,
            title: contract.title
          }))}
          projects={projects.map(project => ({
            id: project.id,
            name: project.name,
            artist_id: project.artist_id || null
          }))}
          events={showEvents.map(event => ({
            id: event.id,
            title: event.title,
            artist_name: (event as any).artists?.name || (event as any).artists?.name || null,
            artist_id: event.artist_id || null
          }))}
        />
      </DialogContent>
    </Dialog>
  );
};
