import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateInput } from '@/components/ui/date-input';
import { ContractTemplate } from '@/services/contractTemplates';

const contractSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  client_type: z.enum(['artista', 'empresa', 'pessoa'], { required_error: 'Tipo de cliente é obrigatório' }),
  service_type: z.enum([
    'empresariamento',
    'empresariamento_suporte',
    'gestao',
    'agenciamento',
    'edicao',
    'distribuicao',
    'marketing',
    'producao_musical',
    'producao_audiovisual',
    'licenciamento',
    'publicidade',
    'parceria',
    'shows',
    'outros',
  ], { required_error: 'Tipo de serviço é obrigatório' }),
  artist_id: z.string().optional(),
  company_id: z.string().optional(),
  project_id: z.string().optional(),
  contractor_contact: z.string().optional(),
  responsible_person: z.string().optional(),
  status: z.enum(['pendente', 'assinado', 'expirado', 'rescindido', 'rascunho']).default('rascunho'),
  start_date: z.date({ required_error: 'Data de início é obrigatória' }),
  end_date: z.date().optional(),
  registry_office: z.boolean().optional(),
  registry_date: z.date().optional(),
  payment_type: z.enum(['valor_fixo', 'royalties']).optional(),
  fixed_value: z.number().optional(),
  royalties_percentage: z.number().min(0).max(100).optional(),
  advance_payment: z.number().optional(),
  financial_support: z.number().optional(),
  observations: z.string().optional(),
  terms: z.string().optional(),
});

type ContractFormData = z.infer<typeof contractSchema>;

interface ContractFormProps {
  onSubmit: (data: ContractFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<ContractFormData>;
  isLoading?: boolean;
  artists?: Array<{ id: string; name: string; full_name?: string; stage_name?: string; cpf_cnpj?: string; rg?: string; full_address?: string; artist_types?: string[] }>;
  companies?: Array<{ id: string; name: string }>;
  projects?: Array<{ id: string; name: string }>;
  contacts?: Array<{ id: string; name: string; company?: string | null; document?: string; address?: string; city?: string; state?: string; zip_code?: string; position?: string }>;
  templates?: ContractTemplate[];
}

export const ContractForm: React.FC<ContractFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
  artists = [],
  companies = [],
  projects = [],
  contacts = [],
  templates = []
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);

  const form = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      status: 'rascunho',
      registry_office: false,
      ...initialData,
    },
  });

  // Reset form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      form.reset({
        status: 'rascunho',
        registry_office: false,
        ...initialData,
      });
    }
  }, [initialData, form]);

  // Load template when service_type changes
  const watchedServiceType = form.watch('service_type');
  
  useEffect(() => {
    if (watchedServiceType && templates.length > 0) {
      const template = templates.find(t => t.template_type === watchedServiceType && t.is_active);
      if (template) {
        setSelectedTemplate(template);
      } else {
        setSelectedTemplate(null);
      }
    } else {
      setSelectedTemplate(null);
    }
  }, [watchedServiceType, templates]);

  const handleSubmit = (data: ContractFormData) => {
    const submitData = {
      ...data,
      template_id: selectedTemplate?.id,
    };
    onSubmit(submitData);
  };

  const handleManualSubmit = () => {
    form.handleSubmit(handleSubmit)();
  };

  const artistaServiceTypeLabels = {
    empresariamento: 'Empresariamento',
    empresariamento_suporte: 'Empresariamento com suporte',
    gestao: 'Gestão',
    agenciamento: 'Agenciamento',
    edicao: 'Edição',
    distribuicao: 'Distribuição',
    marketing: 'Marketing',
    producao_musical: 'Produção Musical',
    producao_audiovisual: 'Produção Audiovisual',
    licenciamento: 'Licenciamento'
  };

  const empresaServiceTypeLabels = {
    producao_musical: 'Produção Musical',
    marketing: 'Marketing',
    producao_audiovisual: 'Produção Audiovisual',
    publicidade: 'Publicidade',
    parceria: 'Parceria',
    shows: 'Shows',
    licenciamento: 'Licenciamento',
    outros: 'Outros'
  };

  const empresaServiceTypes = Object.keys(empresaServiceTypeLabels);
  
  const getFilteredServiceTypes = () => {
    const clientType = form.watch('client_type');
    if (clientType === 'empresa') {
      return Object.entries(empresaServiceTypeLabels);
    }
    return Object.entries(artistaServiceTypeLabels);
  };

  const statusLabels = {
    pendente: 'Pendente',
    assinado: 'Assinado',
    expirado: 'Expirado',
    rescindido: 'Rescindido',
    rascunho: 'Rascunho'
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label>Título do Contrato</Label>
              <Select
                value={form.watch('title')}
                onValueChange={(value) => {
                  form.setValue('title', value);
                  // Find the template and set service_type accordingly
                  const template = templates.find(t => t.name === value);
                  if (template) {
                    form.setValue('service_type', template.template_type as any);
                    setSelectedTemplate(template);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o template de contrato" />
                </SelectTrigger>
                <SelectContent>
                  {templates.filter(t => t.is_active).map((template) => (
                    <SelectItem key={template.id} value={template.name || `template-${template.id}`}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tipo de Cliente</Label>
              <Select
                value={form.watch('client_type')}
                onValueChange={(value) => {
                  form.setValue('client_type', value as any);
                  const currentServiceType = form.watch('service_type');
                  if (value === 'empresa' && currentServiceType && !empresaServiceTypes.includes(currentServiceType)) {
                    form.setValue('service_type', undefined as any);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="artista">Artista</SelectItem>
                  <SelectItem value="empresa">Empresa</SelectItem>
                  <SelectItem value="pessoa">Pessoa</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.client_type && (
                <p className="text-sm text-destructive">{form.formState.errors.client_type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tipo de Serviço</Label>
              <Select
                value={form.watch('service_type')}
                onValueChange={(value) => form.setValue('service_type', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de serviço" />
                </SelectTrigger>
                <SelectContent>
                  {getFilteredServiceTypes().map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.service_type && (
                <p className="text-sm text-destructive">{form.formState.errors.service_type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.watch('status')}
                onValueChange={(value) => form.setValue('status', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(form.watch('client_type') === 'empresa' || form.watch('client_type') === 'pessoa') && (
              <div className="space-y-2">
                <Label>Contratante/Contato</Label>
                <Select
                  value={form.watch('contractor_contact')}
                  onValueChange={(value) => form.setValue('contractor_contact', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={contacts.length > 0 ? "Selecione um contato" : "Nenhum contato cadastrado"} />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border z-50">
                    {contacts.length > 0 ? (
                      contacts.map((contact) => (
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

            {form.watch('client_type') === 'artista' && (
              <div className="space-y-2">
                <Label>Cliente/Artista</Label>
                <Select
                  value={form.watch('artist_id')}
                  onValueChange={(value) => form.setValue('artist_id', value)}
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

            {form.watch('client_type') === 'empresa' && companies.length > 0 && (
              <div className="space-y-2">
                <Label>Cliente/Empresa</Label>
                <Select
                  value={form.watch('company_id')}
                  onValueChange={(value) => form.setValue('company_id', value)}
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

            <div className="space-y-2">
              <Label htmlFor="responsible_person">Responsável</Label>
              <Input
                id="responsible_person"
                {...form.register('responsible_person')}
                placeholder="Nome do responsável"
              />
              {form.formState.errors.responsible_person && (
                <p className="text-sm text-destructive">{form.formState.errors.responsible_person.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label>Data de Início</Label>
              <DateInput
                value={form.watch('start_date')}
                onChange={(date) => form.setValue('start_date', date)}
              />
            </div>

            <div className="space-y-2">
              <Label>Data de Término</Label>
              <DateInput
                value={form.watch('end_date')}
                onChange={(date) => form.setValue('end_date', date)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="registry_office"
                checked={form.watch('registry_office')}
                onCheckedChange={(checked) => form.setValue('registry_office', checked as boolean)}
              />
              <Label htmlFor="registry_office">Registrado em cartório</Label>
            </div>
          </div>

          {form.watch('registry_office') && (
            <div className="space-y-2">
              <Label>Data de Registro em Cartório</Label>
              <DateInput
                value={form.watch('registry_date')}
                onChange={(date) => form.setValue('registry_date', date)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Valores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {/* Empresa: Valor do Contrato */}
            {form.watch('client_type') === 'empresa' && (
              <div className="space-y-2">
                <Label htmlFor="fixed_value">Valor do Contrato (R$)</Label>
                <Input
                  id="fixed_value"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  {...form.register('fixed_value', { valueAsNumber: true })}
                />
              </div>
            )}

            {/* Artista + Agenciamento/Gestão/Empresariamento: Royalties e Adiantamento */}
            {form.watch('client_type') === 'artista' && 
             ['agenciamento', 'gestao', 'empresariamento', 'empresariamento_suporte'].includes(form.watch('service_type') || '') && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="royalties_percentage">Royalties (%)</Label>
                  <Input
                    id="royalties_percentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0,00"
                    {...form.register('royalties_percentage', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="advance_payment">Adiantamento (R$)</Label>
                  <Input
                    id="advance_payment"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    {...form.register('advance_payment', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="financial_support">Suporte Financeiro Mensal (R$)</Label>
                  <Input
                    id="financial_support"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    {...form.register('financial_support', { valueAsNumber: true })}
                  />
                </div>
              </>
            )}

            {/* Artista + Produção Musical/Edição/Distribuição: Tipo de Pagamento */}
            {form.watch('client_type') === 'artista' && 
             ['producao_musical', 'edicao', 'distribuicao'].includes(form.watch('service_type') || '') && (
              <>
                <div className="space-y-2">
                  <Label>Tipo de Pagamento</Label>
                  <Select
                    value={form.watch('payment_type')}
                    onValueChange={(value) => form.setValue('payment_type', value as 'valor_fixo' | 'royalties')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="valor_fixo">Valor Fixo</SelectItem>
                      <SelectItem value="royalties">Royalties</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {form.watch('payment_type') === 'valor_fixo' && (
                  <div className="space-y-2">
                    <Label htmlFor="fixed_value">Valor do Serviço (R$)</Label>
                    <Input
                      id="fixed_value"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      {...form.register('fixed_value', { valueAsNumber: true })}
                    />
                  </div>
                )}

                {form.watch('payment_type') === 'royalties' && (
                  <div className="space-y-2">
                    <Label htmlFor="royalties_percentage">Royalties (%)</Label>
                    <Input
                      id="royalties_percentage"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="0,00"
                      {...form.register('royalties_percentage', { valueAsNumber: true })}
                    />
                  </div>
                )}
              </>
            )}

            {/* Artista + Produção Audiovisual/Marketing: Valor Fixo do Serviço */}
            {form.watch('client_type') === 'artista' && 
             ['producao_audiovisual', 'marketing'].includes(form.watch('service_type') || '') && (
              <div className="space-y-2">
                <Label htmlFor="fixed_value">Valor Fixo do Serviço (R$)</Label>
                <Input
                  id="fixed_value"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  {...form.register('fixed_value', { valueAsNumber: true })}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Observações e Termos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              {...form.register('observations')}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="terms">Termos</Label>
            <Textarea
              id="terms"
              {...form.register('terms')}
              placeholder="Termos do contrato..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Cancelar
          </Button>
        )}
        <Button 
          type="button" 
          disabled={isLoading}
          onClick={handleManualSubmit}
          className="w-full sm:w-auto"
        >
          {isLoading ? 'Salvando...' : 'Salvar Contrato'}
        </Button>
      </div>
    </form>
  );
};
