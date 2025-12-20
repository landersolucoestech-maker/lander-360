import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ServiceTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Record<string, string>;
  label?: string;
}

export const ServiceTypeSelect: React.FC<ServiceTypeSelectProps> = ({
  value,
  onChange,
  options,
  label = 'Tipo de Serviço'
}) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value || ''} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o tipo" />
        </SelectTrigger>
        <SelectContent className="bg-background border border-border z-50">
          {Object.entries(options).map(([key, optionLabel]) => (
            <SelectItem key={key} value={key}>{optionLabel}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
