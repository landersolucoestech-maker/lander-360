import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { formatDateBR } from '@/lib/utils';

// Column mappings for each entity type with Portuguese labels
const artistColumns = {
  name: 'Nome Artístico',
  full_name: 'Nome Completo',
  email: 'E-mail',
  phone: 'Telefone',
  genre: 'Gênero Musical',
  bio: 'Biografia',
  profile_type: 'Tipo de Perfil',
  contract_status: 'Status do Contrato',
  birth_date: 'Data de Nascimento',
  cpf_cnpj: 'CPF/CNPJ',
  rg: 'RG',
  full_address: 'Endereço Completo',
  bank: 'Banco',
  agency: 'Agência',
  account: 'Conta',
  pix_key: 'Chave PIX',
  account_holder: 'Titular da Conta',
  manager_name: 'Nome do Empresário',
  manager_phone: 'Telefone do Empresário',
  manager_email: 'E-mail do Empresário',
  distributors: 'Distribuidoras',
  spotify_url: 'Spotify URL',
  instagram_url: 'Instagram URL',
  youtube_url: 'YouTube URL',
  tiktok: 'TikTok',
  soundcloud: 'SoundCloud',
  observations: 'Observações',
  created_at: 'Data de Cadastro',
};

const projectColumns = {
  name: 'Nome do Projeto',
  description: 'Descrição',
  status: 'Status',
  start_date: 'Data de Início',
  end_date: 'Data de Término',
  budget: 'Orçamento',
  created_at: 'Data de Criação',
};

const releaseColumns = {
  title: 'Título',
  type: 'Tipo',
  release_type: 'Tipo de Lançamento',
  status: 'Status',
  release_date: 'Data de Lançamento',
  genre: 'Gênero',
  language: 'Idioma',
  label: 'Gravadora',
  copyright: 'Copyright',
  distributors: 'Distribuidoras',
  created_at: 'Data de Criação',
};

const contractColumns = {
  title: 'Título',
  contract_type: 'Tipo de Contrato',
  client_type: 'Tipo de Cliente',
  service_type: 'Tipo de Serviço',
  status: 'Status',
  start_date: 'Data de Início',
  end_date: 'Data de Término',
  effective_from: 'Vigência Início',
  effective_to: 'Vigência Fim',
  value: 'Valor',
  fixed_value: 'Valor Fixo',
  royalties_percentage: 'Royalties (%)',
  advance_amount: 'Adiantamento',
  payment_type: 'Tipo de Pagamento',
  responsible_person: 'Responsável',
  contractor_contact: 'Contato do Contratante',
  registry_office: 'Registro em Cartório',
  registry_date: 'Data de Registro',
  terms: 'Termos',
  observations: 'Observações',
  notes: 'Notas',
  created_at: 'Data de Criação',
};

const agendaColumns = {
  title: 'Título',
  event_type: 'Tipo de Evento',
  status: 'Status',
  start_date: 'Data de Início',
  end_date: 'Data de Término',
  start_time: 'Hora de Início',
  end_time: 'Hora de Término',
  location: 'Local',
  venue_name: 'Nome do Local',
  venue_address: 'Endereço do Local',
  venue_capacity: 'Capacidade do Local',
  venue_contact: 'Contato do Local',
  ticket_price: 'Preço do Ingresso',
  expected_audience: 'Público Esperado',
  description: 'Descrição',
  observations: 'Observações',
  created_at: 'Data de Criação',
};

const crmColumns = {
  name: 'Nome',
  company: 'Empresa',
  email: 'E-mail',
  phone: 'Telefone',
  contact_type: 'Tipo de Contato',
  position: 'Cargo',
  status: 'Status',
  priority: 'Prioridade',
  document: 'Documento',
  address: 'Endereço',
  city: 'Cidade',
  state: 'Estado',
  zip_code: 'CEP',
  artist_name: 'Artista Associado',
  next_action: 'Próxima Ação',
  notes: 'Notas',
  created_at: 'Data de Criação',
};

const musicRegistryColumns = {
  title: 'Título',
  status: 'Status',
  genre: 'Gênero',
  abramus_code: 'Código ABRAMUS',
  ecad_code: 'Código ECAD',
  isrc: 'ISRC',
  iswc: 'ISWC',
  key: 'Tonalidade',
  bpm: 'BPM',
  duration: 'Duração (segundos)',
  release_date: 'Data de Lançamento',
  writers: 'Compositores',
  publishers: 'Editoras',
  created_at: 'Data de Criação',
};

const phonogramColumns = {
  title: 'Título',
  status: 'Status',
  genre: 'Gênero',
  isrc: 'ISRC',
  duration: 'Duração (segundos)',
  language: 'Idioma',
  label: 'Gravadora',
  master_owner: 'Proprietário do Master',
  version_type: 'Tipo de Versão',
  is_remix: 'É Remix',
  remix_artist: 'Artista do Remix',
  recording_date: 'Data de Gravação',
  recording_studio: 'Estúdio de Gravação',
  recording_location: 'Local de Gravação',
  created_at: 'Data de Criação',
};

const inventoryColumns = {
  name: 'Nome',
  description: 'Descrição',
  category: 'Categoria',
  status: 'Status',
  quantity: 'Quantidade',
  unit_value: 'Valor Unitário',
  location: 'Localização',
  sector: 'Setor',
  responsible: 'Responsável',
  purchase_location: 'Local de Compra',
  invoice_number: 'Número da Nota',
  entry_date: 'Data de Entrada',
  observations: 'Observações',
  created_at: 'Data de Criação',
};

type EntityType = 'artists' | 'projects' | 'releases' | 'contracts' | 'agenda' | 'crm' | 'music_registry' | 'phonograms' | 'inventory';

const columnMappings: Record<EntityType, Record<string, string>> = {
  artists: artistColumns,
  projects: projectColumns,
  releases: releaseColumns,
  contracts: contractColumns,
  agenda: agendaColumns,
  crm: crmColumns,
  music_registry: musicRegistryColumns,
  phonograms: phonogramColumns,
  inventory: inventoryColumns,
};

const formatValue = (value: any, key: string): any => {
  if (value === null || value === undefined) return '';
  
  // Format dates
  if (key.includes('date') || key === 'created_at' || key === 'updated_at') {
    return formatDateBR(value);
  }
  
  // Format arrays
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  
  // Format booleans
  if (typeof value === 'boolean') {
    return value ? 'Sim' : 'Não';
  }
  
  // Format numbers (currency)
  if (key.includes('value') || key.includes('amount') || key === 'budget' || key === 'unit_value' || key === 'ticket_price') {
    if (typeof value === 'number') {
      return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }
  }
  
  return value;
};

const transformDataForExport = (data: any[], entityType: EntityType, artistsMap?: Record<string, string>): any[] => {
  const columns = columnMappings[entityType];
  
  return data.map(item => {
    const transformed: Record<string, any> = {};
    
    // Add artist name if available
    if (artistsMap && item.artist_id && artistsMap[item.artist_id]) {
      transformed['Artista'] = artistsMap[item.artist_id];
    }
    
    Object.entries(columns).forEach(([key, label]) => {
      if (item[key] !== undefined) {
        transformed[label] = formatValue(item[key], key);
      }
    });
    
    return transformed;
  });
};

export const useDataExport = () => {
  const { toast } = useToast();

  const exportToExcel = (
    data: any[], 
    filename: string, 
    sheetName: string = 'Dados',
    entityType?: EntityType,
    artistsMap?: Record<string, string>
  ) => {
    if (data.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há registros para exportar.",
        variant: "destructive",
      });
      return;
    }

    let exportData = data;
    
    if (entityType) {
      exportData = transformDataForExport(data, entityType, artistsMap);
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Auto-size columns
    const colWidths = Object.keys(exportData[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    worksheet['!cols'] = colWidths;
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({
      title: "Exportação concluída",
      description: `${data.length} registros exportados com sucesso.`,
    });
  };

  const parseExcelFile = async (file: File): Promise<any[]> => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  };

  return {
    exportToExcel,
    parseExcelFile,
  };
};

export type { EntityType };
