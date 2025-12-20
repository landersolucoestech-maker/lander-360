import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { paymentMethods, paymentTypes } from '@/lib/financial-categories';

interface PaymentMethodSelectProps {
  methodValue?: string;
  typeValue?: string;
  onMethodChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  showMethod?: boolean;
  showType?: boolean;
}

export const PaymentMethodSelect: React.FC<PaymentMethodSelectProps> = ({
  methodValue,
  typeValue,
  onMethodChange,
  onTypeChange,
  showMethod = true,
  showType = true
}) => {
  return (
    <>
      {showMethod && (
        <div className="space-y-2">
          <Label>Forma de Pagamento</Label>
          <Select value={methodValue || ''} onValueChange={onMethodChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a forma" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border z-50">
              {paymentMethods.map((method) => (
                <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showType && (
        <div className="space-y-2">
          <Label>Tipo de Pagamento</Label>
          <Select value={typeValue || ''} onValueChange={onTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border z-50">
              {paymentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  );
};
