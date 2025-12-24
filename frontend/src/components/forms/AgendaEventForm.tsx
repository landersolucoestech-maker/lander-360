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
import { CalendarIcon, Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { ptBR } from 'date-fns/locale';
import { cn, formatDateBR } from '@/lib/utils';

const agendaEventSchema = z.object({
  event_name: z.string().min(1, 'Título do evento é obrigatório'),
  event_type: z.enum(['sessoes_estudio', 'ensaios', 'sessoes_fotos', 'shows', 'entrevistas', 'podcasts', 'programas_tv', 'radio', 'producao_conteudo', 'reunioes'], { required_error: 'Selecione o tipo de evento' }),
  artist_id: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['agendado', 'cancelado', 'pendente', 'concluido', 'confirmado']).default('agendado'),
  start_date: z.date({ required_error: 'Data de início é obrigatória' }),
  start_time: z.string().optional(),
  end_date: z.date().optional(),
  end_time: z.string().optional(),
  location: z.string().optional(),
  venue_name: z.string().optional(),
  venue_address: z.string().optional(),
  venue_contact: z.string().optional(),
  venue_capacity: z.union([z.number(), z.nan()]).optional().transform(val => val && !isNaN(val) ? val : undefined),
  ticket_price: z.union([z.number(), z.nan()]).optional().transform(val => val && !isNaN(val) ? val : undefined),
  expected_audience: z.union([z.number(), z.nan()]).optional().transform(val => val && !isNaN(val) ? val : undefined),
  observations: z.string().optional(),
});

type AgendaEventFormData = z.infer<typeof agendaEventSchema>;

interface AgendaEventFormProps {
  onSubmit: (data: AgendaEventFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<AgendaEventFormData>;
  isLoading?: boolean;
  artists?: Array<{ id: string; name: string }>;
}

export const AgendaEventForm: React.FC<AgendaEventFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
  artists = []
}) => {
  const form = useForm<AgendaEventFormData>({
    resolver: zodResolver(agendaEventSchema),
    defaultValues: {
      status: 'agendado',
      ...initialData,
    },
  });

  const eventTypeLabels = {
    ensaios: 'Ensaios',
    entrevistas: 'Entrevistas',
    podcasts: 'Podcasts',
    producao_conteudo: 'Produção de conteúdo',
    programas_tv: 'Programas de TV',
    radio: 'Rádio',
    reunioes: 'Reuniões',
    sessoes_estudio: 'Sessões de estúdio',
    sessoes_fotos: 'Sessões de fotos',
    shows: 'Shows'
  };

  const statusLabels = {
    agendado: 'Agendado',
    cancelado: 'Cancelado',
    concluido: 'Concluído',
    confirmado: 'Confirmado',
    pendente: 'Pendente'
  };

  const eventType = form.watch('event_type');
  const artistRelatedTypes = ['sessoes_estudio', 'ensaios', 'sessoes_fotos', 'shows', 'entrevistas', 'podcasts', 'programas_tv', 'radio', 'producao_conteudo'];
  const showArtistField = artistRelatedTypes.includes(eventType);
  const isShowEvent = eventType === 'shows';
  const showVenueFields = artistRelatedTypes.includes(eventType) || eventType === 'reunioes';

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Novo Evento na Agenda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Título do Evento */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="event_name">Título do Evento</Label>
              <Input
                id="event_name"
                {...form.register('event_name')}
                placeholder="Digite o título do evento"
              />
              {form.formState.errors.event_name && (
                <p className="text-sm text-destructive">{form.formState.errors.event_name.message}</p>
              )}
            </div>

            {/* Tipo de Evento */}
            <div className="space-y-2">
              <Label>Tipo de Evento</Label>
              <Select
                value={form.watch('event_type')}
                onValueChange={(value) => form.setValue('event_type', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  {Object.entries(eventTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.event_type && (
                <p className="text-sm text-destructive">{form.formState.errors.event_type.message}</p>
              )}
            </div>

            {/* Artista - só aparece para tipos relacionados a artista */}
            {showArtistField && artists.length > 0 && (
              <div className="space-y-2">
                <Label>Artista</Label>
                <Select
                  value={form.watch('artist_id')}
                  onValueChange={(value) => form.setValue('artist_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um artista" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border z-50">
                    {artists.map((artist) => (
                      <SelectItem key={artist.id} value={artist.id}>{artist.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data de Início */}
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
                    {form.watch('start_date') ? 
                      formatDateBR(form.watch('start_date')!) : 
                      "Selecionar data"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={form.watch('start_date')}
                    onSelect={(date) => form.setValue('start_date', date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.start_date && (
                <p className="text-sm text-destructive">{form.formState.errors.start_date.message}</p>
              )}
            </div>

            {/* Horário de Início */}
            <div className="space-y-2">
              <Label htmlFor="start_time">Horário de Início</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="start_time"
                  type="time"
                  className="pl-10"
                  {...form.register('start_time')}
                />
              </div>
            </div>

            {/* Data de Fim */}
            <div className="space-y-2">
              <Label>Data de Fim</Label>
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
                    {form.watch('end_date') ? 
                      format(form.watch('end_date')!, "dd/MM/yyyy", { locale: ptBR }) : 
                      "Selecionar data (opcional)"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={form.watch('end_date')}
                    onSelect={(date) => form.setValue('end_date', date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Horário de Fim */}
            <div className="space-y-2">
              <Label htmlFor="end_time">Horário de Fim</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="end_time"
                  type="time"
                  className="pl-10"
                  {...form.register('end_time')}
                />
              </div>
            </div>


            {/* Campos específicos para eventos com artistas e reuniões */}
            {showVenueFields && (
              <>
                {/* Nome do Local/Venue */}
                <div className="space-y-2">
                  <Label htmlFor="venue_name">Nome do Local</Label>
                  <Input
                    id="venue_name"
                    {...form.register('venue_name')}
                    placeholder={eventType === 'reunioes' ? 'Nome do local da reunião' : 'Nome do venue/casa de show'}
                  />
                </div>

                {/* Endereço Completo */}
                <div className="space-y-2">
                  <Label htmlFor="venue_address">Endereço Completo</Label>
                  <Input
                    id="venue_address"
                    {...form.register('venue_address')}
                    placeholder="Endereço completo do local"
                  />
                </div>

                {/* Número de Contato */}
                <div className="space-y-2">
                  <Label htmlFor="venue_contact">Contato do Local</Label>
                  <Input
                    id="venue_contact"
                    {...form.register('venue_contact')}
                    placeholder="Telefone/WhatsApp do local"
                  />
                </div>

                {/* Campos específicos para Shows */}
                {isShowEvent && (
                  <>
                    {/* Capacidade */}
                    <div className="space-y-2">
                      <Label htmlFor="venue_capacity">Capacidade do Público</Label>
                      <Input
                        id="venue_capacity"
                        type="number"
                        {...form.register('venue_capacity', { valueAsNumber: true })}
                        placeholder="Capacidade máxima do local"
                      />
                    </div>

                    {/* Valor do Cachê */}
                    <div className="space-y-2">
                      <Label htmlFor="ticket_price">Valor do Cachê (R$)</Label>
                      <Input
                        id="ticket_price"
                        type="number"
                        step="0.01"
                        {...form.register('ticket_price', { valueAsNumber: true })}
                        placeholder="Valor do cachê"
                      />
                    </div>

                    {/* Público Esperado */}
                    <div className="space-y-2">
                      <Label htmlFor="expected_audience">Público Esperado</Label>
                      <Input
                        id="expected_audience"
                        type="number"
                        {...form.register('expected_audience', { valueAsNumber: true })}
                        placeholder="Quantidade de pessoas esperadas"
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descrição do evento"
              {...form.register('description')}
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              placeholder="Observações sobre o evento"
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
          {isLoading ? 'Salvando...' : 'Salvar Evento'}
        </Button>
      </div>
    </form>
  );
};