import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TransactionTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
  onCategoryReset?: () => void;
}

export const TransactionTypeSelect: React.FC<TransactionTypeSelectProps> = ({
  value,
  onChange,
  onCategoryReset
}) => {
  const handleChange = (newValue: string) => {
    onChange(newValue);
    onCategoryReset?.();
  };

  return (
    <div className="space-y-2">
      <Label>Tipo de Transação</Label>
      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o tipo" />
        </SelectTrigger>
        <SelectContent className="bg-background border border-border z-50">
          <SelectItem value="despesas">Despesas</SelectItem>
          <SelectItem value="receitas">Receitas</SelectItem>
          <SelectItem value="investimentos">Investimentos</SelectItem>
          <SelectItem value="impostos">Impostos</SelectItem>
          <SelectItem value="transferencias">Transferências</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
