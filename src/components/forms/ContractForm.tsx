import React from 'react';
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
import { CalendarIcon, Upload } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const contractSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  client_type: z.enum(['artista', 'empresa'], { required_error: 'Selecione o tipo de cliente' }),
  service_type: z.enum(['empresariamento', 'gestao', 'agenciamento', 'edicao', 'distribuicao', 'marketing', 'producao_musical', 'producao_audiovisual'], { required_error: 'Selecione o tipo de serviço' }),
  artist_id: z.string().optional(),
  company_id: z.string().optional(),
  project_id: z.string().optional(),
  responsible_person: z.string().min(1, 'Responsável é obrigatório'),
  status: z.enum(['pendente', 'assinado', 'expirado', 'rescindido', 'rascunho']).default('rascunho'),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  registry_office: z.boolean().default(false),
  registry_date: z.date().optional(),
  payment_type: z.enum(['valor_fixo', 'royalties']).optional(),
  fixed_value: z.number().optional(),
  royalties_percentage: z.number().min(0).max(100).optional(),
  advance_payment: z.number().optional(),
  observations: z.string().optional(),
  terms: z.string().optional(),
});

type ContractFormData = z.infer<typeof contractSchema>;

interface ContractFormProps {
  onSubmit: (data: ContractFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<ContractFormData>;
  isLoading?: boolean;
  artists?: Array<{ id: string; name: string }>;
  companies?: Array<{ id: string; name: string }>;
  projects?: Array<{ id: string; name: string }>;
}

export const ContractForm: React.FC<ContractFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
  artists = [],
  companies = [],
  projects = []
}) => {
  const [attachments, setAttachments] = React.useState<File[]>([]);

  const form = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      status: 'rascunho',
      registry_office: false,
      ...initialData,
    },
  });

  const handleSubmit = (data: ContractFormData) => {
    onSubmit(data);
  };

  const serviceTypeLabels = {
    empresariamento: 'Empresariamento',
    gestao: 'Gestão',
    agenciamento: 'Agenciamento',
    edicao: 'Edição',
    distribuicao: 'Distribuição',
    marketing: 'Marketing',
    producao_musical: 'Produção Musical',
    producao_audiovisual: 'Produção Audiovisual'
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Contrato</Label>
              <Input
                id="title"
                {...form.register('title')}
                placeholder="Digite o título do contrato"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tipo de Cliente</Label>
              <Select
                value={form.watch('client_type')}
                onValueChange={(value) => form.setValue('client_type', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="artista">Artista</SelectItem>
                  <SelectItem value="empresa">Empresa</SelectItem>
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
                  {Object.entries(serviceTypeLabels).map(([value, label]) => (
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

            {projects.length > 0 && (
              <div className="space-y-2">
                <Label>Projeto</Label>
                <Select
                  value={form.watch('project_id')}
                  onValueChange={(value) => form.setValue('project_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um projeto" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border z-50">
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Data de Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch('start_date') && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch('start_date') ? format(form.watch('start_date')!, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={form.watch('start_date')}
                    onSelect={(date) => form.setValue('start_date', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Data de Término</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch('end_date') && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch('end_date') ? format(form.watch('end_date')!, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={form.watch('end_date')}
                    onSelect={(date) => form.setValue('end_date', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch('registry_date') && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch('registry_date') ? format(form.watch('registry_date')!, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={form.watch('registry_date')}
                    onSelect={(date) => form.setValue('registry_date', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Valores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
             ['agenciamento', 'gestao', 'empresariamento'].includes(form.watch('service_type')) && (
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
              </>
            )}

            {/* Artista + Produção Musical/Edição/Distribuição: Tipo de Pagamento */}
            {form.watch('client_type') === 'artista' && 
             ['producao_musical', 'edicao', 'distribuicao'].includes(form.watch('service_type')) && (
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
             ['producao_audiovisual', 'marketing'].includes(form.watch('service_type')) && (
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
              placeholder="Observações adicionais sobre o contrato"
              {...form.register('observations')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="terms">Termos do Contrato</Label>
            <Textarea
              id="terms"
              placeholder="Termos e condições do contrato"
              rows={6}
              {...form.register('terms')}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar Contrato'}
        </Button>
      </div>
    </form>
  );
};