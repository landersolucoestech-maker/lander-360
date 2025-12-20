import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Import refactored components
import {
  TransactionTypeSelect,
  ClientTypeSelect,
  CategorySelect,
  ServiceTypeSelect,
  LinkTypeSelect,
  EntitySelect,
  PaymentMethodSelect,
  InstallmentSection,
  AttachmentUpload,
  DatePickerField
} from './financial';

// Import category constants and helpers
import {
  getAvailableCategories,
  getEmpresaVinculacaoOptions,
  getPessoaVinculacaoOptions,
  subcategoriesByCategory,
  TransactionType,
  ClientType
} from '@/lib/financial-categories';

const financialTransactionSchema = z.object({
  client_type: z.enum(['empresa', 'artista', 'pessoa'], { required_error: 'Selecione o tipo' }),
  client_id: z.string().optional(),
  artist_id: z.string().optional(),
  crm_contact_id: z.string().optional(),
  description: z.string().min(1, 'Descrição é obrigatória'),
  transaction_type: z.enum(['receitas', 'despesas', 'investimentos', 'impostos', 'transferencias'], { required_error: 'Selecione o tipo' }),
  amount: z.number().positive('Valor deve ser positivo'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  subcategory: z.string().optional(),
  transaction_date: z.date({ required_error: 'Data é obrigatória' }),
  status: z.enum(['pendente', 'aprovado', 'pago', 'cancelado', 'atrasado']).default('pendente'),
  payment_method: z.string().optional(),
  payment_type: z.string().optional(),
  installment_count: z.number().min(2).optional(),
  installment_interval: z.enum(['mensal', 'quinzenal', 'semanal']).optional(),
  first_installment_date: z.date().optional(),
  recurring_frequency: z.enum(['mensal', 'quinzenal', 'semanal', 'anual']).optional(),
  recurring_start_date: z.date().optional(),
  recurring_end_date: z.date().optional(),
  primary_link_type: z.string().optional(),
  event_id: z.string().optional(),
  contract_id: z.string().optional(),
  project_id: z.string().optional(),
  secondary_artist_id: z.string().optional(),
  attachment_url: z.string().optional(),
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
  crmContacts?: Array<{ id: string; name: string; company?: string | null; contact_type?: string | null }>;
  contracts?: Array<{ id: string; title: string }>;
  projects?: Array<{ id: string; name: string; artist_id?: string | null; artist_name?: string | null }>;
  events?: Array<{ id: string; title: string; artist_name?: string | null; artist_id?: string | null }>;
}

export const FinancialTransactionForm: React.FC<FinancialTransactionFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
  artists = [],
  companies = [],
  crmContacts = [],
  contracts = [],
  projects = [],
  events = []
}) => {
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [travelReason, setTravelReason] = useState<string>('');

  const form = useForm<FinancialTransactionFormData>({
    resolver: zodResolver(financialTransactionSchema),
    defaultValues: {
      transaction_type: 'despesas',
      client_type: 'empresa',
      status: 'pendente',
      primary_link_type: 'nenhum',
      ...initialData,
    },
  });

  const watchedType = form.watch('transaction_type') as TransactionType;
  const watchedClientType = form.watch('client_type') as ClientType;
  const watchedPaymentType = form.watch('payment_type');
  const watchedCategory = form.watch('category');
  const watchedPrimaryLinkType = form.watch('primary_link_type');
  const watchedSecondaryArtistId = form.watch('secondary_artist_id');

  // =====================================================
  // LÓGICA CONDICIONAL PARA DESPESAS - EMPRESA
  // =====================================================
  
  const isEmpresaDespesa = watchedType === 'despesas' && watchedClientType === 'empresa';
  
  // Categoria SERVIÇOS - tipos que requerem Artista + Projeto obrigatórios
  const servicosTypesWithArtistProject = [
    'design_grafico',
    'producao_audiovisual',
    'licenciamento_obras',
    'licenciamento_beat',
    'direitos_autorais',
    'fotografia_audiovisual',
    'sampling_clearance'
  ];
  
  // Categoria MARKETING - tipos que requerem Artista obrigatório + Projeto opcional
  const marketingTypesWithArtist = [
    'marketing_pr_trafego',
    'anuncios',
    'brindes_promocionais'
  ];
  
  // Categoria VIAGENS - tipos que requerem Artista + Motivo da Viagem
  const viagensTypesWithArtistReason = [
    'passagens',
    'hospedagem',
    'alimentacao',
    'transporte',
    'locacao_equipamentos'
  ];
  
  // Categoria PRODUTOS - Equipamentos e Merchandising (só Artista)
  const produtosTypesWithArtistOnly = [
    'equipamentos',
    'merchandising'
  ];
  
  // Categoria PRODUTOS - Produção de Show/Evento (Artista + Show/Evento)
  const produtosTypesWithArtistEvent = [
    'cenografia_palco',
    'pirotecnia_efeitos'
  ];

  // Determinar qual tipo de campos condicionais mostrar
  const shouldShowServicosFields = 
    isEmpresaDespesa && 
    watchedCategory === 'servicos' && 
    servicosTypesWithArtistProject.includes(watchedPrimaryLinkType || '');

  const shouldShowMarketingFields = 
    isEmpresaDespesa && 
    watchedCategory === 'marketing' && 
    marketingTypesWithArtist.includes(watchedPrimaryLinkType || '');

  const shouldShowViagensFields = 
    isEmpresaDespesa && 
    watchedCategory === 'viagens' && 
    viagensTypesWithArtistReason.includes(watchedPrimaryLinkType || '');

  const shouldShowProdutosArtistOnlyFields = 
    isEmpresaDespesa && 
    watchedCategory === 'produtos' && 
    produtosTypesWithArtistOnly.includes(watchedPrimaryLinkType || '');

  const shouldShowProdutosEventFields = 
    isEmpresaDespesa && 
    watchedCategory === 'produtos' && 
    produtosTypesWithArtistEvent.includes(watchedPrimaryLinkType || '');

  // Reset campos condicionais quando categoria ou subcategoria muda
  useEffect(() => {
    form.setValue('subcategory', undefined);
    form.setValue('secondary_artist_id', undefined);
    form.setValue('project_id', undefined);
    form.setValue('event_id', undefined);
    setTravelReason('');
  }, [watchedCategory, form]);

  // Reset campos quando tipo de serviço (primary_link_type) muda
  useEffect(() => {
    form.setValue('secondary_artist_id', undefined);
    form.setValue('project_id', undefined);
    form.setValue('event_id', undefined);
    setTravelReason('');
  }, [watchedPrimaryLinkType, form]);

  // Get available categories based on transaction type and client type
  const availableCategories = getAvailableCategories(watchedType, watchedClientType);

  // Get subcategories for current category
  const availableSubcategories = watchedCategory && subcategoriesByCategory[watchedCategory] 
    ? subcategoriesByCategory[watchedCategory] 
    : null;

  // Get vinculação options based on client type
  const empresaVinculacaoOptions = watchedClientType === 'empresa' 
    ? getEmpresaVinculacaoOptions(watchedType, watchedCategory) 
    : null;
  
  const pessoaVinculacaoOptions = watchedClientType === 'pessoa' 
    ? getPessoaVinculacaoOptions(watchedType, watchedCategory) 
    : null;

  // Filter events by selected artist
  const filteredEvents = watchedSecondaryArtistId
    ? events.filter(e => e.artist_id === watchedSecondaryArtistId)
    : events;

  // Handle link type reset
  const handleLinkReset = (excludeType: string) => {
    if (excludeType !== 'projeto') form.setValue('project_id', undefined);
    if (excludeType !== 'contrato') form.setValue('contract_id', undefined);
    if (excludeType !== 'artista') form.setValue('secondary_artist_id', undefined);
    if (excludeType !== 'show') form.setValue('event_id', undefined);
  };

  // Handle category reset when transaction type changes
  const handleCategoryReset = () => {
    form.setValue('category', '');
    form.setValue('subcategory', undefined);
  };

  // Handle client reset
  const handleClientReset = () => {
    form.setValue('client_id', undefined);
    form.setValue('crm_contact_id', undefined);
  };

  // Handle form submission with travel reason
  const handleFormSubmit = (data: FinancialTransactionFormData) => {
    // Se há motivo de viagem, adiciona às observações
    if (shouldShowViagensFields && travelReason) {
      const existingObs = data.observations || '';
      const travelPrefix = `[Motivo da Viagem: ${travelReason}]`;
      data.observations = existingObs 
        ? `${travelPrefix}\n${existingObs}` 
        : travelPrefix;
    }
    onSubmit(data);
  };

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nova Transação Financeira</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Row 1: Tipo de Transação + Tipo Cliente */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TransactionTypeSelect
              value={watchedType}
              onChange={(value) => form.setValue('transaction_type', value as any)}
              onCategoryReset={handleCategoryReset}
            />

            {watchedType !== 'impostos' && (
              <ClientTypeSelect
                value={watchedClientType}
                onChange={(value) => form.setValue('client_type', value as any)}
                isReceita={watchedType === 'receitas'}
                onReset={handleClientReset}
              />
            )}
          </div>

          {/* Row 2: Categoria + Tipo de Serviço/Vinculação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CategorySelect
              value={watchedCategory}
              onChange={(value) => form.setValue('category', value)}
              categories={availableCategories}
            />

            {watchedCategory === 'suporte_financeiro' ? (
              <EntitySelect
                value={form.watch('secondary_artist_id') || ''}
                onChange={(value) => form.setValue('secondary_artist_id', value || undefined)}
                label="Artista"
                placeholder="Selecionar artista..."
                options={artists.map(a => ({ id: a.id, name: a.name }))}
                allowNone
              />
            ) : empresaVinculacaoOptions ? (
              <ServiceTypeSelect
                value={form.watch('primary_link_type') || ''}
                onChange={(value) => form.setValue('primary_link_type', value)}
                options={empresaVinculacaoOptions}
              />
            ) : pessoaVinculacaoOptions ? (
              <ServiceTypeSelect
                value={form.watch('primary_link_type') || ''}
                onChange={(value) => form.setValue('primary_link_type', value)}
                options={pessoaVinculacaoOptions}
              />
            ) : (
              <LinkTypeSelect
                value={form.watch('primary_link_type') || ''}
                onChange={(value) => form.setValue('primary_link_type', value)}
                clientType={watchedClientType}
                category={watchedCategory}
                onLinkReset={handleLinkReset}
              />
            )}
          </div>

          {/* Row 3: Subcategoria + Seleção dinâmica de vinculação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {availableSubcategories && watchedClientType !== 'empresa' && watchedClientType !== 'pessoa' && (
              <ServiceTypeSelect
                value={form.watch('subcategory') || ''}
                onChange={(value) => form.setValue('subcategory', value)}
                options={availableSubcategories}
                label="Subcategoria / Serviço"
              />
            )}

            {watchedPrimaryLinkType === 'projeto' && (
              <EntitySelect
                value={form.watch('project_id') || ''}
                onChange={(value) => form.setValue('project_id', value || undefined)}
                label="Projeto/Música"
                placeholder="Selecionar projeto..."
                options={projects.map(p => ({ id: p.id, name: p.name, subtitle: p.artist_name }))}
              />
            )}

            {watchedPrimaryLinkType === 'contrato' && (
              <EntitySelect
                value={form.watch('contract_id') || ''}
                onChange={(value) => form.setValue('contract_id', value || undefined)}
                label="Contrato"
                placeholder="Selecionar contrato..."
                options={contracts.map(c => ({ id: c.id, name: c.title }))}
              />
            )}

            {watchedPrimaryLinkType === 'artista' && (
              <EntitySelect
                value={form.watch('secondary_artist_id') || ''}
                onChange={(value) => form.setValue('secondary_artist_id', value || undefined)}
                label="Artista Vinculado"
                placeholder="Selecionar artista..."
                options={artists.map(a => ({ id: a.id, name: a.name }))}
              />
            )}
          </div>

          {/* Row 3b: SERVIÇOS - Artista (obrigatório) + Projeto (obrigatório) */}
          {shouldShowServicosFields && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <EntitySelect
                value={form.watch('secondary_artist_id') || ''}
                onChange={(value) => {
                  form.setValue('secondary_artist_id', value || undefined);
                  // Reset project when artist changes
                  if (!value) form.setValue('project_id', undefined);
                }}
                label="Artista Vinculado *"
                placeholder="Selecionar artista..."
                options={artists.map(a => ({ id: a.id, name: a.name }))}
              />

              <EntitySelect
                value={form.watch('project_id') || ''}
                onChange={(value) => form.setValue('project_id', value || undefined)}
                label="Projeto Vinculado *"
                placeholder={
                  watchedSecondaryArtistId
                    ? (projects.filter(p => p.artist_id === watchedSecondaryArtistId).length > 0
                        ? "Selecionar projeto..."
                        : "Nenhum projeto para este artista")
                    : "Selecione um artista primeiro"
                }
                options={watchedSecondaryArtistId 
                  ? projects.filter(p => p.artist_id === watchedSecondaryArtistId).map(p => ({ id: p.id, name: p.name }))
                  : projects.map(p => ({ id: p.id, name: p.name, subtitle: p.artist_name }))
                }
              />
            </div>
          )}

          {/* Row 3c: MARKETING - Artista (obrigatório) + Projeto (opcional) */}
          {shouldShowMarketingFields && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <EntitySelect
                value={form.watch('secondary_artist_id') || ''}
                onChange={(value) => {
                  form.setValue('secondary_artist_id', value || undefined);
                  if (!value) form.setValue('project_id', undefined);
                }}
                label="Artista Vinculado *"
                placeholder="Selecionar artista..."
                options={artists.map(a => ({ id: a.id, name: a.name }))}
              />

              <EntitySelect
                value={form.watch('project_id') || ''}
                onChange={(value) => form.setValue('project_id', value || undefined)}
                label="Projeto Vinculado (opcional)"
                placeholder={
                  watchedSecondaryArtistId
                    ? (projects.filter(p => p.artist_id === watchedSecondaryArtistId).length > 0
                        ? "Selecionar projeto..."
                        : "Nenhum projeto para este artista")
                    : "Selecione um artista primeiro"
                }
                options={watchedSecondaryArtistId 
                  ? projects.filter(p => p.artist_id === watchedSecondaryArtistId).map(p => ({ id: p.id, name: p.name }))
                  : []
                }
                allowNone
              />
            </div>
          )}

          {/* Row 3d: VIAGENS - Artista (obrigatório) + Motivo da Viagem (obrigatório) */}
          {shouldShowViagensFields && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <EntitySelect
                value={form.watch('secondary_artist_id') || ''}
                onChange={(value) => form.setValue('secondary_artist_id', value || undefined)}
                label="Artista Vinculado *"
                placeholder="Selecionar artista..."
                options={artists.map(a => ({ id: a.id, name: a.name }))}
              />

              <div className="space-y-2">
                <Label htmlFor="travel_reason">Motivo da Viagem *</Label>
                <Input
                  id="travel_reason"
                  value={travelReason}
                  onChange={(e) => setTravelReason(e.target.value)}
                  placeholder="Ex.: Show em São Paulo, Gravação de clipe..."
                />
              </div>
            </div>
          )}

          {/* Row 3e: PRODUTOS - Equipamentos/Merchandising - Artista (obrigatório) */}
          {shouldShowProdutosArtistOnlyFields && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <EntitySelect
                value={form.watch('secondary_artist_id') || ''}
                onChange={(value) => form.setValue('secondary_artist_id', value || undefined)}
                label="Artista Vinculado *"
                placeholder="Selecionar artista..."
                options={artists.map(a => ({ id: a.id, name: a.name }))}
              />
            </div>
          )}

          {/* Row 3f: PRODUTOS - Cenografia/Pirotecnia - Artista (obrigatório) + Show/Evento (obrigatório) */}
          {shouldShowProdutosEventFields && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <EntitySelect
                value={form.watch('secondary_artist_id') || ''}
                onChange={(value) => {
                  form.setValue('secondary_artist_id', value || undefined);
                  if (!value) form.setValue('event_id', undefined);
                }}
                label="Artista Vinculado *"
                placeholder="Selecionar artista..."
                options={artists.map(a => ({ id: a.id, name: a.name }))}
              />

              {watchedSecondaryArtistId && (
                <EntitySelect
                  value={form.watch('event_id') || ''}
                  onChange={(value) => form.setValue('event_id', value || undefined)}
                  label="Show/Evento Vinculado *"
                  placeholder={
                    filteredEvents.length > 0 
                      ? "Selecionar evento..." 
                      : "Nenhum evento para este artista"
                  }
                  options={filteredEvents.map(e => ({ id: e.id, name: e.title }))}
                />
              )}
            </div>
          )}

          {/* Row 4: Show/Evento quando aplicável (para outros casos não cobertos acima) */}
          {watchedPrimaryLinkType === 'show' && 
           watchedCategory !== 'suporte_financeiro' && 
           !shouldShowProdutosEventFields && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <EntitySelect
                value={form.watch('secondary_artist_id') || ''}
                onChange={(value) => form.setValue('secondary_artist_id', value || undefined)}
                label="Artista"
                placeholder="Selecionar artista..."
                options={artists.map(a => ({ id: a.id, name: a.name }))}
                allowNone
              />

              <EntitySelect
                value={form.watch('event_id') || ''}
                onChange={(value) => form.setValue('event_id', value || undefined)}
                label="Show/Evento"
                placeholder={filteredEvents.length > 0 ? "Selecionar evento..." : "Nenhum evento disponível"}
                options={filteredEvents.map(e => ({ id: e.id, name: e.title, subtitle: e.artist_name }))}
                allowNone
              />
            </div>
          )}

          {/* Row 5: Fornecedor/Cliente + Forma de Pagamento */}
          {(watchedClientType === 'empresa' || watchedClientType === 'pessoa' || watchedType === 'impostos') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <EntitySelect
                value={form.watch('crm_contact_id') || ''}
                onChange={(value) => form.setValue('crm_contact_id', value || undefined)}
                label={watchedType === 'impostos' ? 'Órgão Arrecadador' : 'Fornecedor/Cliente'}
                placeholder={
                  watchedType === 'impostos' 
                    ? (crmContacts.filter(c => c.contact_type === 'orgao_arrecadador').length > 0 
                        ? "Selecione o órgão" 
                        : "Nenhum órgão cadastrado")
                    : (crmContacts.length > 0 ? "Selecione um contato" : "Nenhum contato cadastrado")
                }
                options={(watchedType === 'impostos' 
                  ? crmContacts.filter(c => c.contact_type === 'orgao_arrecadador')
                  : crmContacts
                ).map(c => ({ id: c.id, name: c.name, subtitle: c.company }))}
              />

              <PaymentMethodSelect
                methodValue={form.watch('payment_method')}
                typeValue={form.watch('payment_type')}
                onMethodChange={(value) => form.setValue('payment_method', value)}
                onTypeChange={(value) => {
                  form.setValue('payment_type', value);
                  if (value !== 'parcelado') {
                    form.setValue('installment_count', undefined);
                    form.setValue('installment_interval', undefined);
                    form.setValue('first_installment_date', undefined);
                  }
                }}
                showType={false}
              />
            </div>
          )}

          {/* Row 5b: Forma de Pagamento para artista */}
          {watchedClientType === 'artista' && watchedType !== 'impostos' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PaymentMethodSelect
                methodValue={form.watch('payment_method')}
                typeValue={form.watch('payment_type')}
                onMethodChange={(value) => form.setValue('payment_method', value)}
                onTypeChange={() => {}}
                showType={false}
              />
            </div>
          )}

          {/* Row 6: Valor + Tipo de Pagamento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label>Tipo de Pagamento</Label>
              <Select
                value={form.watch('payment_type') || ''}
                onValueChange={(value) => {
                  form.setValue('payment_type', value);
                  if (value !== 'parcelado') {
                    form.setValue('installment_count', undefined);
                    form.setValue('installment_interval', undefined);
                    form.setValue('first_installment_date', undefined);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  <SelectItem value="a_vista">À Vista</SelectItem>
                  <SelectItem value="parcelado">Parcelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 7: Data da Transação + Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DatePickerField
              value={form.watch('transaction_date')}
              onChange={(date) => form.setValue('transaction_date', date as Date)}
              label="Data da Transação"
              error={form.formState.errors.transaction_date?.message}
            />

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
            </div>
          </div>

          {/* Parcelamento */}
          {watchedPaymentType === 'parcelado' && (
            <InstallmentSection
              installmentCount={form.watch('installment_count')}
              installmentInterval={form.watch('installment_interval')}
              firstInstallmentDate={form.watch('first_installment_date')}
              amount={form.watch('amount')}
              onCountChange={(value) => form.setValue('installment_count', value)}
              onIntervalChange={(value) => form.setValue('installment_interval', value)}
              onDateChange={(date) => form.setValue('first_installment_date', date)}
            />
          )}

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex.: Pagamento de capa musical para single 'Nome da Música'"
              {...form.register('description')}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
            )}
          </div>

          {/* Anexo */}
          <AttachmentUpload
            attachmentUrl={form.watch('attachment_url')}
            attachmentName={attachmentName}
            onUpload={(url, name) => {
              form.setValue('attachment_url', url);
              setAttachmentName(name);
            }}
            onRemove={() => {
              form.setValue('attachment_url', undefined);
              setAttachmentName(null);
            }}
          />

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observations">Observação</Label>
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
