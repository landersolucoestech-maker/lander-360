import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EntitySelectProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  options: Array<{ id: string; name: string; subtitle?: string | null }>;
  allowNone?: boolean;
}

export const EntitySelect: React.FC<EntitySelectProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Selecione...',
  options,
  allowNone = false
}) => {
  const handleChange = (newValue: string) => {
    onChange(newValue === 'nenhum' ? '' : newValue);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value || (allowNone ? 'nenhum' : '')} onValueChange={handleChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-background border border-border z-50">
          {allowNone && <SelectItem value="nenhum">Nenhum</SelectItem>}
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.name}{option.subtitle ? ` - ${option.subtitle}` : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
