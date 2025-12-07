import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Upload, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn, formatDateBR } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const financialTransactionSchema = z.object({
  client_type: z.enum(['empresa', 'artista'], { required_error: 'Selecione empresa ou artista' }),
  client_id: z.string().optional(),
  crm_contact_id: z.string().optional(),
  description: z.string().min(1, 'Descrição é obrigatória'),
  transaction_type: z.enum(['receitas', 'despesas', 'investimentos'], { required_error: 'Selecione o tipo' }),
  amount: z.number().positive('Valor deve ser positivo'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  transaction_date: z.date({ required_error: 'Data é obrigatória' }),
  status: z.enum(['pendente', 'aprovado', 'pago', 'cancelado']).default('pendente'),
  payment_method: z.string().optional(),
  contract_id: z.string().optional(),
  attachment_url: z.string().optional(),
  responsible_by: z.string().optional(),
  authorized_by: z.string().optional(),
  observations: z.string().optional(),
});

type FinancialTransactionFormData = z.infer<typeof financialTransactionSchema>;

interface FinancialTransactionFormProps {
  onSubmit: (data: FinancialTransactionFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<FinancialTransactionFormData>;
  isLoading?: boolean;
  artists?: Array<{ id: string; name: string }>;
  companies?: Array<{ id: string; name: string }>;
  crmContacts?: Array<{ id: string; name: string; company?: string | null }>;
  contracts?: Array<{ id: string; title: string }>;
}

export const FinancialTransactionForm: React.FC<FinancialTransactionFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
  artists = [],
  companies = [],
  crmContacts = [],
  contracts = []
}) => {
  const { toast } = useToast();
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);

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

  const investimentosCategories = {
    producao_musical: 'Produção Musical',
    marketing_digital: 'Marketing Digital',
    equipamentos: 'Equipamentos',
    estudio: 'Estúdio',
    clipes: 'Clipes/Vídeos',
    turnê: 'Turnê',
    capacitacao: 'Capacitação'
  };

  const paymentMethods = [
    { value: 'pix', label: 'Pix' },
    { value: 'ted', label: 'TED' },
    { value: 'boleto', label: 'Boleto' },
    { value: 'cartao', label: 'Cartão' },
    { value: 'dinheiro', label: 'Dinheiro' },
  ];

  const availableCategories = watchedType === 'receitas' 
    ? receitasCategories 
    : watchedType === 'investimentos' 
      ? investimentosCategories 
      : despesasCategories;

  // Handle attachment upload
  const handleAttachmentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Tipo de arquivo inválido',
        description: 'Apenas PDF, JPG, PNG e WebP são permitidos.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O arquivo deve ter no máximo 10MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploadingAttachment(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `financial-attachments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('artist-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('artist-documents')
        .getPublicUrl(filePath);

      form.setValue('attachment_url', publicUrl);
      setAttachmentName(file.name);
      toast({
        title: 'Upload concluído',
        description: 'Comprovante anexado com sucesso.',
      });
    } catch (error) {
      console.error('Error uploading attachment:', error);
      toast({
        title: 'Erro no upload',
        description: 'Falha ao anexar comprovante. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setUploadingAttachment(false);
    }
  };

  const removeAttachment = () => {
    form.setValue('attachment_url', undefined);
    setAttachmentName(null);
  };

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
                onValueChange={(value) => {
                  form.setValue('client_type', value as any);
                  form.setValue('client_id', undefined);
                  form.setValue('crm_contact_id', undefined);
                }}
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

            {/* Fornecedor/Cliente (CRM) - quando empresa está selecionada */}
            {watchedClientType === 'empresa' && (
              <div className="space-y-2">
                <Label>Fornecedor/Cliente</Label>
                <Select
                  value={form.watch('crm_contact_id') || ''}
                  onValueChange={(value) => form.setValue('crm_contact_id', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={crmContacts.length > 0 ? "Selecione um contato" : "Nenhum contato cadastrado"} />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border z-50">
                    {crmContacts.length > 0 ? (
                      crmContacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.name}{contact.company ? ` - ${contact.company}` : ''}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1 text-sm text-muted-foreground">
                        Nenhum contato cadastrado
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Artista dropdown */}
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
                  form.setValue('category', '');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  <SelectItem value="receitas">Receitas</SelectItem>
                  <SelectItem value="despesas">Despesas</SelectItem>
                  <SelectItem value="investimentos">Investimentos</SelectItem>
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

            {/* Forma de Pagamento */}
            <div className="space-y-2">
              <Label>Forma de Pagamento</Label>
              <Select
                value={form.watch('payment_method')}
                onValueChange={(value) => form.setValue('payment_method', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a forma de pagamento" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data da Transação */}
            <div className="space-y-2">
              <Label>Data da Transação</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="DD/MM/AAAA"
                  value={form.watch('transaction_date') ? formatDateBR(form.watch('transaction_date')!) : ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Parse DD/MM/YYYY format
                    const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
                    if (match) {
                      const [, day, month, year] = match;
                      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                      if (!isNaN(date.getTime())) {
                        form.setValue('transaction_date', date);
                      }
                    }
                  }}
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
                      selected={form.watch('transaction_date')}
                      onSelect={(date) => form.setValue('transaction_date', date)}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
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

            {/* Contrato Vinculado */}
            {/* Contrato Vinculado */}
            <div className="space-y-2">
              <Label>Contrato Vinculado (opcional)</Label>
              <Select
                value={form.watch('contract_id') || 'none'}
                onValueChange={(value) => form.setValue('contract_id', value === 'none' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar contrato..." />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  <SelectItem value="none">Nenhum</SelectItem>
                  {contracts.map((contract) => (
                    <SelectItem key={contract.id} value={contract.id}>{contract.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Responsável pelo lançamento */}
            <div className="space-y-2">
              <Label htmlFor="responsible_by">Responsável pelo Lançamento</Label>
              <Input
                id="responsible_by"
                placeholder="Nome do responsável"
                {...form.register('responsible_by')}
              />
            </div>

            {/* Autorizado por */}
            <div className="space-y-2">
              <Label htmlFor="authorized_by">Autorizado por (opcional)</Label>
              <Input
                id="authorized_by"
                placeholder="Nome de quem autorizou"
                {...form.register('authorized_by')}
              />
            </div>
          </div>

          {/* Descrição curta */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex.: Pagamento de mix/mastering, Receita Spotify mês de julho"
              {...form.register('description')}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
            )}
          </div>

          {/* Anexo de Comprovante */}
          <div className="space-y-2">
            <Label>Anexo de Comprovante (PDF, JPG, PNG)</Label>
            <div className="flex items-center gap-4">
              {!form.watch('attachment_url') ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={handleAttachmentUpload}
                    disabled={uploadingAttachment}
                    className="max-w-xs"
                  />
                  {uploadingAttachment && (
                    <span className="text-sm text-muted-foreground">Carregando...</span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm">{attachmentName || 'Arquivo anexado'}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeAttachment}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              placeholder="Observações adicionais sobre a transação"
              {...form.register('observations')}
            />
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
