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
import { Upload, Search, User, Building } from 'lucide-react';
import { DateInput } from '@/components/ui/date-input';
import { ContractTemplate } from '@/services/contractTemplates';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

const contractSchema = z.object({
  title: z.string().optional(),
  client_type: z.enum(['artista', 'empresa']).optional(),
  service_type: z.enum(['empresariamento', 'gestao', 'agenciamento', 'edicao', 'distribuicao', 'marketing', 'producao_musical', 'producao_audiovisual', 'licenciamento', 'publicidade', 'parceria', 'shows', 'outros']).optional(),
  artist_id: z.string().optional(),
  company_id: z.string().optional(),
  project_id: z.string().optional(),
  contractor_contact: z.string().optional(),
  responsible_person: z.string().optional(),
  status: z.enum(['pendente', 'assinado', 'expirado', 'rescindido', 'rascunho']).optional(),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  registry_office: z.boolean().optional(),
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
  const [attachments, setAttachments] = React.useState<File[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [artistSearchOpen, setArtistSearchOpen] = useState(false);
  const [crmSearchOpen, setCrmSearchOpen] = useState(false);
  
  // Template data states
  const [companyData, setCompanyData] = useState({
    company_name: '',
    company_type: '',
    cnpj: '',
    company_address: '',
    representative_name: '',
    representative_nationality: '',
    representative_marital_status: '',
    representative_profession: '',
    representative_rg: '',
    representative_cpf: '',
    representative_address: '',
  });

  const [contractedPartyData, setContractedPartyData] = useState({
    full_name: '',
    nationality: 'brasileiro(a)',
    age: '',
    profession: '',
    rg: '',
    rg_issuer: '',
    cpf: '',
    stage_name: '',
    address: '',
  });
  
  const [artistSelected, setArtistSelected] = useState(false);

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

  // Load template data when service_type changes
  const watchedServiceType = form.watch('service_type');
  
  useEffect(() => {
    if (watchedServiceType && templates.length > 0) {
      const template = templates.find(t => t.template_type === watchedServiceType && t.is_active);
      if (template) {
        setSelectedTemplate(template);
        
        // Load company data from template
        if (template.default_fields?.company_data) {
          setCompanyData(template.default_fields.company_data);
        }
        
        // Load contracted party data from template
        if (template.default_fields?.contracted_party_data) {
          setContractedPartyData(template.default_fields.contracted_party_data);
          setArtistSelected(!!template.default_fields.contracted_party_data.stage_name);
        }
      } else {
        setSelectedTemplate(null);
      }
    } else {
      setSelectedTemplate(null);
    }
  }, [watchedServiceType, templates]);

  // Handle artist selection from search
  const handleSelectArtist = (artist: any) => {
    setContractedPartyData({
      full_name: artist.full_name || artist.name || '',
      nationality: 'brasileiro(a)',
      age: '',
      profession: artist.artist_types?.join(', ') || 'artista',
      rg: artist.rg || '',
      rg_issuer: '',
      cpf: artist.cpf_cnpj || '',
      stage_name: artist.stage_name || artist.name || '',
      address: artist.full_address || '',
    });
    form.setValue('artist_id', artist.id);
    setArtistSelected(true);
    setArtistSearchOpen(false);
  };

  // Handle CRM contact selection
  const handleSelectCrmContact = (contact: any) => {
    setContractedPartyData({
      full_name: contact.name || '',
      nationality: 'brasileiro(a)',
      age: '',
      profession: contact.position || '',
      rg: '',
      rg_issuer: '',
      cpf: contact.document || '',
      stage_name: '',
      address: contact.address ? `${contact.address}, ${contact.city || ''} - ${contact.state || ''}, CEP ${contact.zip_code || ''}` : '',
    });
    form.setValue('contractor_contact', contact.id);
    setArtistSelected(false);
    setCrmSearchOpen(false);
  };

  const handleSubmit = (data: ContractFormData) => {
    console.log('ContractForm handleSubmit called with data:', data);
    // Include template data in submission
    const submitData = {
      ...data,
      template_id: selectedTemplate?.id,
      template_data: selectedTemplate ? {
        company_data: companyData,
        contracted_party_data: contractedPartyData,
      } : undefined,
    };
    onSubmit(submitData);
  };

  const handleManualSubmit = () => {
    const values = form.getValues();
    console.log('Manual submit with values:', values);
    // Include template data in submission
    const submitData = {
      ...values,
      template_id: selectedTemplate?.id,
      template_data: selectedTemplate ? {
        company_data: companyData,
        contracted_party_data: contractedPartyData,
      } : undefined,
    };
    onSubmit(submitData);
  };

  // Debug: log form errors
  React.useEffect(() => {
    if (Object.keys(form.formState.errors).length > 0) {
      console.log('ContractForm validation errors:', form.formState.errors);
    }
  }, [form.formState.errors]);

  const artistaServiceTypeLabels = {
    empresariamento: 'Empresariamento',
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

            {form.watch('client_type') === 'empresa' && (
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

      {/* Template Fields - Only show when a template is selected */}
      {selectedTemplate && (
        <>
          {/* Company Data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dados da Empresa (Contratado/Contratante/Representante)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome da Empresa</Label>
                  <Input
                    value={companyData.company_name}
                    onChange={(e) => setCompanyData({ ...companyData, company_name: e.target.value })}
                    placeholder="Ex: Lander Produtora"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo Jurídico</Label>
                  <Input
                    value={companyData.company_type}
                    onChange={(e) => setCompanyData({ ...companyData, company_type: e.target.value })}
                    placeholder="Ex: pessoa jurídica de direito privado"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input
                    value={companyData.cnpj}
                    onChange={(e) => setCompanyData({ ...companyData, cnpj: e.target.value })}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Endereço da Empresa</Label>
                  <Input
                    value={companyData.company_address}
                    onChange={(e) => setCompanyData({ ...companyData, company_address: e.target.value })}
                    placeholder="Rua, número, bairro, cidade/UF, CEP"
                  />
                </div>
              </div>

              <div className="border-t border-border pt-4 mt-4">
                <h4 className="font-medium text-sm mb-4">Representante Legal</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <Input
                      value={companyData.representative_name}
                      onChange={(e) => setCompanyData({ ...companyData, representative_name: e.target.value })}
                      placeholder="Nome do representante"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nacionalidade</Label>
                    <Input
                      value={companyData.representative_nationality}
                      onChange={(e) => setCompanyData({ ...companyData, representative_nationality: e.target.value })}
                      placeholder="Ex: brasileiro"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label>Estado Civil</Label>
                    <Input
                      value={companyData.representative_marital_status}
                      onChange={(e) => setCompanyData({ ...companyData, representative_marital_status: e.target.value })}
                      placeholder="Ex: solteiro"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Profissão</Label>
                    <Input
                      value={companyData.representative_profession}
                      onChange={(e) => setCompanyData({ ...companyData, representative_profession: e.target.value })}
                      placeholder="Ex: empresário"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>RG</Label>
                    <Input
                      value={companyData.representative_rg}
                      onChange={(e) => setCompanyData({ ...companyData, representative_rg: e.target.value })}
                      placeholder="Número do RG"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label>CPF</Label>
                    <Input
                      value={companyData.representative_cpf}
                      onChange={(e) => setCompanyData({ ...companyData, representative_cpf: e.target.value })}
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Endereço</Label>
                    <Input
                      value={companyData.representative_address}
                      onChange={(e) => setCompanyData({ ...companyData, representative_address: e.target.value })}
                      placeholder="Endereço completo"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contracted Party Data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Dados da Outra Parte (Contratante/Contratado)</span>
                <div className="flex gap-2">
                  {form.watch('client_type') === 'artista' && (
                    <Popover open={artistSearchOpen} onOpenChange={setArtistSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" size="sm">
                          <User className="h-4 w-4 mr-2" />
                          Buscar Artista
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0" align="end">
                        <Command>
                          <CommandInput placeholder="Buscar artista..." />
                          <CommandList>
                            <CommandEmpty>Nenhum artista encontrado.</CommandEmpty>
                            <CommandGroup>
                              {artists.map((artist) => (
                                <CommandItem
                                  key={artist.id}
                                  value={artist.name}
                                  onSelect={() => handleSelectArtist(artist)}
                                >
                                  <User className="h-4 w-4 mr-2" />
                                  {artist.stage_name || artist.name}
                                  {artist.full_name && artist.full_name !== artist.name && (
                                    <span className="text-muted-foreground ml-2">({artist.full_name})</span>
                                  )}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                  
                  {form.watch('client_type') === 'empresa' && (
                    <Popover open={crmSearchOpen} onOpenChange={setCrmSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" size="sm">
                          <Building className="h-4 w-4 mr-2" />
                          Buscar Contato CRM
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0" align="end">
                        <Command>
                          <CommandInput placeholder="Buscar contato..." />
                          <CommandList>
                            <CommandEmpty>Nenhum contato encontrado.</CommandEmpty>
                            <CommandGroup>
                              {contacts.map((contact) => (
                                <CommandItem
                                  key={contact.id}
                                  value={contact.name}
                                  onSelect={() => handleSelectCrmContact(contact)}
                                >
                                  <Building className="h-4 w-4 mr-2" />
                                  {contact.name}
                                  {contact.company && (
                                    <span className="text-muted-foreground ml-2">({contact.company})</span>
                                  )}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input
                    value={contractedPartyData.full_name}
                    onChange={(e) => setContractedPartyData({ ...contractedPartyData, full_name: e.target.value })}
                    placeholder="Nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nacionalidade</Label>
                  <Input
                    value={contractedPartyData.nationality}
                    onChange={(e) => setContractedPartyData({ ...contractedPartyData, nationality: e.target.value })}
                    placeholder="Ex: brasileiro(a)"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Idade</Label>
                  <Input
                    value={contractedPartyData.age}
                    onChange={(e) => setContractedPartyData({ ...contractedPartyData, age: e.target.value })}
                    placeholder="Ex: maior"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Profissão</Label>
                  <Input
                    value={contractedPartyData.profession}
                    onChange={(e) => setContractedPartyData({ ...contractedPartyData, profession: e.target.value })}
                    placeholder="Ex: artista"
                  />
                </div>
                <div className="space-y-2">
                  <Label>RG</Label>
                  <Input
                    value={contractedPartyData.rg}
                    onChange={(e) => setContractedPartyData({ ...contractedPartyData, rg: e.target.value })}
                    placeholder="Número do RG"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Órgão Emissor RG</Label>
                  <Input
                    value={contractedPartyData.rg_issuer}
                    onChange={(e) => setContractedPartyData({ ...contractedPartyData, rg_issuer: e.target.value })}
                    placeholder="Ex: SSP/MG"
                  />
                </div>
                <div className="space-y-2">
                  <Label>CPF</Label>
                  <Input
                    value={contractedPartyData.cpf}
                    onChange={(e) => setContractedPartyData({ ...contractedPartyData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                  />
                </div>
                {artistSelected && (
                  <div className="space-y-2">
                    <Label>Nome Artístico</Label>
                    <Input
                      value={contractedPartyData.stage_name}
                      onChange={(e) => setContractedPartyData({ ...contractedPartyData, stage_name: e.target.value })}
                      placeholder="Nome artístico"
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Endereço Completo</Label>
                <Input
                  value={contractedPartyData.address}
                  onChange={(e) => setContractedPartyData({ ...contractedPartyData, address: e.target.value })}
                  placeholder="Rua, número, bairro, cidade/UF, CEP"
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}

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
        <Button type="button" onClick={handleManualSubmit}>
          {isLoading ? 'Salvando...' : 'Salvar Contrato'}
        </Button>
      </div>
    </form>
  );
};