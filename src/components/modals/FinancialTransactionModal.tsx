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
  const isEditing = !!transaction;

  const handleSubmit = async (data: any) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const initialData = transaction ? {
    client_type: 'empresa' as 'empresa' | 'artista' | 'pessoa',
    description: transaction.description,
    transaction_type: (transaction.transaction_type === 'entrada' ? 'receitas' : 
      transaction.transaction_type === 'saida' ? 'despesas' : 
      (transaction.transaction_type || 'receitas')) as 'receitas' | 'despesas' | 'investimentos' | 'impostos' | 'transferencias',
    amount: transaction.amount,
    category: transaction.category || '',
    transaction_date: transaction.transaction_date ? new Date(transaction.transaction_date) : new Date(),
    status: (transaction.status || 'pendente') as 'pendente' | 'recebido' | 'pago' | 'cancelado' | 'atrasado',
    payment_method: (transaction as any).payment_method || undefined,
    contract_id: (transaction as any).contract_id || undefined,
    crm_contact_id: (transaction as any).crm_contact_id || undefined,
    attachment_url: (transaction as any).attachment_url || undefined,
    responsible_by: (transaction as any).responsible_by || undefined,
    authorized_by: (transaction as any).authorized_by || undefined,
    observations: (transaction as any).observations || undefined,
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
            company: contact.company
          }))}
          contracts={contracts.map(contract => ({
            id: contract.id,
            title: contract.title
          }))}
        />
      </DialogContent>
    </Dialog>
  );
};
