import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  categories: Record<string, string>;
}

export const CategorySelect: React.FC<CategorySelectProps> = ({
  value,
  onChange,
  categories
}) => {
  return (
    <div className="space-y-2">
      <Label>Categoria</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione a categoria" />
        </SelectTrigger>
        <SelectContent className="bg-background border border-border z-50">
          {Object.entries(categories).map(([key, label]) => (
            <SelectItem key={key} value={key}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
