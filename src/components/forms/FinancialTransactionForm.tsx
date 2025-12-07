import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn, formatDateBR } from '@/lib/utils';

const financialTransactionSchema = z.object({
  client_type: z.enum(['empresa', 'artista'], { required_error: 'Selecione empresa ou artista' }),
  client_id: z.string().optional(),
  description: z.string().min(1, 'Descrição é obrigatória'),
  transaction_type: z.enum(['receitas', 'despesas'], { required_error: 'Selecione o tipo' }),
  amount: z.number().positive('Valor deve ser positivo'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  transaction_date: z.date({ required_error: 'Data é obrigatória' }),
  status: z.enum(['pendente', 'aprovado', 'pago', 'cancelado']).default('pendente'),
});

type FinancialTransactionFormData = z.infer<typeof financialTransactionSchema>;

interface FinancialTransactionFormProps {
  onSubmit: (data: FinancialTransactionFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<FinancialTransactionFormData>;
  isLoading?: boolean;
  artists?: Array<{ id: string; name: string }>;
  companies?: Array<{ id: string; name: string }>;
}

export const FinancialTransactionForm: React.FC<FinancialTransactionFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
  artists = [],
  companies = []
}) => {
  const form = useForm<FinancialTransactionFormData>({
    resolver: zodResolver(financialTransactionSchema),
    defaultValues: {
      transaction_type: 'receitas',
      client_type: 'empresa',
      status: 'pendente',
      ...initialData,
    },
  });

  const watchedType = form.watch('transaction_type');
  const watchedClientType = form.watch('client_type');

  const receitasCategories = {
    venda_musicas: 'Venda de Músicas',
    streaming: 'Streaming',
    shows: 'Shows',
    licenciamento: 'Licenciamento',
    merchandising: 'Merchandising',
    publicidade: 'Publicidade',
    producao: 'Produção',
    distribuicao: 'Distribuição',
    gestao: 'Gestão'
  };

  const despesasCategories = {
    produtores: 'Produtores',
    caches: 'Cachês',
    marketing: 'Marketing',
    equipe: 'Equipe',
    infraestrutura: 'Infraestrutura',
    registros: 'Registros',
    juridicos: 'Jurídicos',
    salarios: 'Salários',
    aluguel: 'Aluguel',
    manutencao: 'Manutenção',
    viagens: 'Viagens',
    licencas: 'Licenças',
    contabilidade: 'Contabilidade',
    estudio: 'Estúdio',
    equipamentos: 'Equipamentos',
    servicos: 'Serviços'
  };

  const availableCategories = watchedType === 'receitas' ? receitasCategories : despesasCategories;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nova Transação Financeira</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo de Transação: empresa/artista */}
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={form.watch('client_type')}
                onValueChange={(value) => form.setValue('client_type', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  <SelectItem value="empresa">Empresa</SelectItem>
                  <SelectItem value="artista">Artista</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.client_type && (
                <p className="text-sm text-destructive">{form.formState.errors.client_type.message}</p>
              )}
            </div>

            {/* Dropdown condicional: Empresa ou Artista */}
            {watchedClientType === 'empresa' && companies.length > 0 && (
              <div className="space-y-2">
                <Label>Nome da Empresa/Cliente</Label>
                <Select
                  value={form.watch('client_id')}
                  onValueChange={(value) => form.setValue('client_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma empresa" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border z-50">
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {watchedClientType === 'artista' && (
              <div className="space-y-2">
                <Label>Nome do Artista</Label>
                <Select
                  value={form.watch('client_id')}
                  onValueChange={(value) => form.setValue('client_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={artists.length > 0 ? "Selecione um artista" : "Nenhum artista cadastrado"} />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border z-50">
                    {artists.length > 0 ? (
                      artists.map((artist) => (
                        <SelectItem key={artist.id} value={artist.id}>{artist.name}</SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1 text-sm text-muted-foreground">
                        Nenhum artista cadastrado
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Tipo: receitas/despesas */}
            <div className="space-y-2">
              <Label>Tipo de Transação</Label>
              <Select
                value={form.watch('transaction_type')}
                onValueChange={(value) => {
                  form.setValue('transaction_type', value as any);
                  form.setValue('category', ''); // Reset category when type changes
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  <SelectItem value="receitas">Receitas</SelectItem>
                  <SelectItem value="despesas">Despesas</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.transaction_type && (
                <p className="text-sm text-destructive">{form.formState.errors.transaction_type.message}</p>
              )}
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={form.watch('category')}
                onValueChange={(value) => form.setValue('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  {Object.entries(availableCategories).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                  <SelectItem value="investimentos">Investimentos</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>
              )}
            </div>

            {/* Valor */}
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                {...form.register('amount', { valueAsNumber: true })}
              />
              {form.formState.errors.amount && (
                <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
              )}
            </div>

            {/* Data da Transação */}
            <div className="space-y-2">
              <Label>Data da Transação</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch('transaction_date') && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch('transaction_date') ? 
                      formatDateBR(form.watch('transaction_date')!) : 
                      "Selecionar data"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={form.watch('transaction_date')}
                    onSelect={(date) => form.setValue('transaction_date', date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.transaction_date && (
                <p className="text-sm text-destructive">{form.formState.errors.transaction_date.message}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.watch('status')}
                onValueChange={(value) => form.setValue('status', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="text-sm text-destructive">{form.formState.errors.status.message}</p>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva a transação"
              {...form.register('description')}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar Transação'}
        </Button>
      </div>
    </form>
  );
};