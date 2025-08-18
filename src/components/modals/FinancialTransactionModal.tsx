import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FinancialTransactionForm } from '@/components/forms/FinancialTransactionForm';
import { useArtists } from '@/hooks/useArtists';
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
  const isEditing = !!transaction;

  const companies = [
    // Companies will be loaded from database
  ];

  const handleSubmit = async (data: any) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const initialData = transaction ? {
    client_type: 'empresa' as 'empresa' | 'artista', // Default since field doesn't exist in current DB
    description: transaction.description,
    transaction_type: (transaction.transaction_type === 'entrada' ? 'receitas' : 'despesas') as 'receitas' | 'despesas',
    amount: transaction.amount,
    category: transaction.category || '',
    transaction_date: transaction.transaction_date ? new Date(transaction.transaction_date) : new Date(),
    status: (transaction.status || 'pendente') as 'pendente' | 'aprovado' | 'pago' | 'cancelado',
  } : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
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
          companies={companies}
        />
      </DialogContent>
    </Dialog>
  );
};