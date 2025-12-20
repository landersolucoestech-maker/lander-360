import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ClientTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
  isReceita?: boolean;
  onReset?: () => void;
}

export const ClientTypeSelect: React.FC<ClientTypeSelectProps> = ({
  value,
  onChange,
  isReceita = false,
  onReset
}) => {
  const handleChange = (newValue: string) => {
    onChange(newValue);
    onReset?.();
  };

  return (
    <div className="space-y-2">
      <Label>{isReceita ? 'Tipo (receber)' : 'Tipo (pra quem pagar)'}</Label>
      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o tipo" />
        </SelectTrigger>
        <SelectContent className="bg-background border border-border z-50">
          <SelectItem value="empresa">Empresa</SelectItem>
          <SelectItem value="artista">Artista</SelectItem>
          <SelectItem value="pessoa">Pessoa</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
