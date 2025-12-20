import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LinkTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
  clientType: 'empresa' | 'artista' | 'pessoa';
  category: string;
  disabled?: boolean;
  onLinkReset?: (excludeType: string) => void;
}

export const LinkTypeSelect: React.FC<LinkTypeSelectProps> = ({
  value,
  onChange,
  clientType,
  category,
  disabled = false,
  onLinkReset
}) => {
  const handleChange = (newValue: string) => {
    onChange(newValue);
    onLinkReset?.(newValue);
  };

  const renderOptions = () => {
    if (clientType === 'artista') {
      return (
        <>
          <SelectItem value="nenhum">Nenhum</SelectItem>
          <SelectItem value="show">Show/Evento</SelectItem>
        </>
      );
    }

    return (
      <>
        <SelectItem value="nenhum">Nenhum</SelectItem>
        <SelectItem value="projeto">Projeto</SelectItem>
        <SelectItem value="artista">Artista</SelectItem>
        <SelectItem value="contrato">Contrato</SelectItem>
        {(category === 'caches' || category === 'shows') && (
          <SelectItem value="show">Show/Evento</SelectItem>
        )}
      </>
    );
  };

  return (
    <div className="space-y-2">
      <Label>Tipo</Label>
      <Select
        value={value || ''}
        onValueChange={handleChange}
        disabled={disabled || !category}
      >
        <SelectTrigger>
          <SelectValue placeholder={category ? "Selecione o tipo" : "Selecione uma categoria primeiro"} />
        </SelectTrigger>
        <SelectContent className="bg-background border border-border z-50">
          {category && renderOptions()}
        </SelectContent>
      </Select>
    </div>
  );
};
