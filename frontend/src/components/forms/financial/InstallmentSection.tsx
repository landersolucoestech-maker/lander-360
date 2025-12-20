import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { formatDateBR } from '@/lib/utils';

interface InstallmentSectionProps {
  installmentCount?: number;
  installmentInterval?: 'mensal' | 'quinzenal' | 'semanal';
  firstInstallmentDate?: Date;
  amount?: number;
  onCountChange: (value: number | undefined) => void;
  onIntervalChange: (value: 'mensal' | 'quinzenal' | 'semanal' | undefined) => void;
  onDateChange: (value: Date | undefined) => void;
}

export const InstallmentSection: React.FC<InstallmentSectionProps> = ({
  installmentCount,
  installmentInterval,
  firstInstallmentDate,
  amount,
  onCountChange,
  onIntervalChange,
  onDateChange
}) => {
  const handleDateInput = (value: string) => {
    const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) {
      const [, day, month, year] = match;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        onDateChange(date);
      }
    }
  };

  const installmentValue = installmentCount && amount 
    ? amount / installmentCount 
    : 0;

  return (
    <Card className="border-dashed border-primary/30 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Configuração do Parcelamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="installment_count">Nº de Parcelas</Label>
            <Input
              id="installment_count"
              type="number"
              min="2"
              max="60"
              placeholder="Ex: 5"
              value={installmentCount || ''}
              onChange={(e) => onCountChange(e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>

          <div className="space-y-2">
            <Label>Intervalo</Label>
            <Select
              value={installmentInterval || ''}
              onValueChange={(value) => onIntervalChange(value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border z-50">
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="quinzenal">Quinzenal</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Data da 1ª Parcela</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="DD/MM/AAAA"
                value={firstInstallmentDate ? formatDateBR(firstInstallmentDate) : ''}
                onChange={(e) => handleDateInput(e.target.value)}
                className="flex-1"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" type="button">
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarComponent
                    mode="single"
                    selected={firstInstallmentDate}
                    onSelect={onDateChange}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {installmentCount && amount && (
          <div className="text-sm text-muted-foreground bg-muted/50 rounded-md p-3">
            <strong>Prévia:</strong> {installmentCount} parcelas de{' '}
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(installmentValue)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
