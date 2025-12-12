import { useToast } from '@/hooks/use-toast';
import XLSX from 'xlsx-js-style';
import { formatDateBR } from '@/lib/utils';

// Status color mapping for Excel export
const statusColorMap: Record<string, { fgColor: string; bgColor: string }> = {
  // Yellow - Em análise na distribuidora
  'em análise': { fgColor: '000000', bgColor: 'FFEB3B' },
  'em analise': { fgColor: '000000', bgColor: 'FFEB3B' },
  'em análise na distribuidora': { fgColor: '000000', bgColor: 'FFEB3B' },
  'analyzing': { fgColor: '000000', bgColor: 'FFEB3B' },
  'analysis': { fgColor: '000000', bgColor: 'FFEB3B' },
  
  // Red - Em espera
  'em espera': { fgColor: 'FFFFFF', bgColor: 'F44336' },
  'espera': { fgColor: 'FFFFFF', bgColor: 'F44336' },
  'waiting': { fgColor: 'FFFFFF', bgColor: 'F44336' },
  'pendente': { fgColor: 'FFFFFF', bgColor: 'F44336' },
  'pending': { fgColor: 'FFFFFF', bgColor: 'F44336' },
  
  // Blue - Música lançada
  'lançada': { fgColor: 'FFFFFF', bgColor: '2196F3' },
  'lancada': { fgColor: 'FFFFFF', bgColor: '2196F3' },
  'lançado': { fgColor: 'FFFFFF', bgColor: '2196F3' },
  'lancado': { fgColor: 'FFFFFF', bgColor: '2196F3' },
  'released': { fgColor: 'FFFFFF', bgColor: '2196F3' },
  'published': { fgColor: 'FFFFFF', bgColor: '2196F3' },
  
  // Green - Pronta para registro
  'pronta': { fgColor: 'FFFFFF', bgColor: '4CAF50' },
  'pronto': { fgColor: 'FFFFFF', bgColor: '4CAF50' },
  'ready': { fgColor: 'FFFFFF', bgColor: '4CAF50' },
  'completed': { fgColor: 'FFFFFF', bgColor: '4CAF50' },
  'concluído': { fgColor: 'FFFFFF', bgColor: '4CAF50' },
  'concluido': { fgColor: 'FFFFFF', bgColor: '4CAF50' },
  'ativo': { fgColor: 'FFFFFF', bgColor: '4CAF50' },
  'active': { fgColor: 'FFFFFF', bgColor: '4CAF50' },
  'aprovado': { fgColor: 'FFFFFF', bgColor: '4CAF50' },
  'approved': { fgColor: 'FFFFFF', bgColor: '4CAF50' },
  
  // Purple/Brown - Takedown
  'takedown': { fgColor: 'FFFFFF', bgColor: '9C27B0' },
  'removido': { fgColor: 'FFFFFF', bgColor: '9C27B0' },
  'removed': { fgColor: 'FFFFFF', bgColor: '9C27B0' },
  'cancelado': { fgColor: 'FFFFFF', bgColor: '9C27B0' },
  'cancelled': { fgColor: 'FFFFFF', bgColor: '9C27B0' },
};

// Get status color for a value
const getStatusColor = (value: string): { fgColor: string; bgColor: string } | null => {
  if (!value) return null;
  const normalizedValue = value.toLowerCase().trim();
  return statusColorMap[normalizedValue] || null;
};

// Column mappings for each entity type with Portuguese labels
const artistColumns = {
  id: 'ID',
  name: 'Nome Artístico',
  full_name: 'Nome Completo',
  genre: 'Gênero Musical',
  email: 'E-mail',
  phone: 'Telefone',
  profile_type: 'Tipo de Perfil',
  contract_status: 'Status Contrato',
  cpf_cnpj: 'CPF/CNPJ',
  rg: 'RG',
  birth_date: 'Data Nascimento',
  full_address: 'Endereço Completo',
  bank: 'Banco',
  agency: 'Agência',
  account: 'Conta',
  pix_key: 'Chave PIX',
  account_holder: 'Titular da Conta',
  manager_name: 'Nome Empresário',
  manager_phone: 'Telefone Empresário',
  manager_email: 'E-mail Empresário',
  distributors: 'Distribuidores',
  instagram: 'Instagram',
  spotify_url: 'Spotify',
  youtube_url: 'YouTube',
  tiktok: 'TikTok',
  soundcloud: 'SoundCloud',
  distrokid_email: 'Email de Share Distrokid',
  onerpm_email: 'Email de Share ONErpm',
  bio: 'Biografia',
  observations: 'Observações',
  created_at: 'Data Cadastro',
};

const projectColumns = {
  name: 'Nome do Projeto',
  artist_name: 'Artista',
  release_type: 'Tipo de Lançamento',
  status: 'Status',
  song_name: 'Nome da Música',
  collaboration_type: 'Solo/Feat',
  track_type: 'Original/Remix',
  instrumental: 'Instrumental',
  duration: 'Duração',
  genre: 'Gênero Musical',
  language: 'Idioma',
  composers: 'Compositores',
  performers: 'Intérpretes',
  producers: 'Produtores',
  lyrics: 'Letra',
  observations: 'Observações',
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
  sector: 'Setor',
  category: 'Categoria',
  quantity: 'Quantidade',
  location: 'Localização',
  responsible: 'Responsável',
  status: 'Status',
  purchase_location: 'Local de Compra',
  invoice_number: 'Número da Nota',
  entry_date: 'Data de Entrada',
  unit_value: 'Valor Unitário',
  total_value: 'Valor Total',
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

// Columns that should have status coloring applied
const statusColumns = ['Status', 'Status Contrato'];

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
  if (key.includes('value') || key.includes('amount') || key === 'budget' || key === 'unit_value' || key === 'total_value' || key === 'ticket_price') {
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
    
    // Handle special case for artist distributor emails
    if (entityType === 'artists' && item.distributor_emails) {
      const distributorEmails = typeof item.distributor_emails === 'string' 
        ? JSON.parse(item.distributor_emails) 
        : item.distributor_emails;
      item.distrokid_email = distributorEmails?.distrokid || '';
      item.onerpm_email = distributorEmails?.onerpm || '';
    }
    
    // Handle instagram field mapping (use instagram or instagram_url)
    if (entityType === 'artists') {
      item.instagram = item.instagram || item.instagram_url || '';
    }
    
    // Calculate total value for inventory items
    if (entityType === 'inventory') {
      const quantity = item.quantity || 0;
      const unitValue = item.unit_value || 0;
      item.total_value = quantity * unitValue;
    }
    
    Object.entries(columns).forEach(([key, label]) => {
      if (item[key] !== undefined) {
        transformed[label] = formatValue(item[key], key);
      } else {
        transformed[label] = '';
      }
    });
    
    return transformed;
  });
};

// Apply cell styling for status columns
const applyStatusColoring = (worksheet: XLSX.WorkSheet, data: any[]): void => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  
  // Find status column indices
  const statusColumnIndices: number[] = [];
  headers.forEach((header, index) => {
    if (statusColumns.includes(header)) {
      statusColumnIndices.push(index);
    }
  });
  
  if (statusColumnIndices.length === 0) return;
  
  // Apply styling to each status cell
  data.forEach((row, rowIndex) => {
    statusColumnIndices.forEach(colIndex => {
      const header = headers[colIndex];
      const cellValue = row[header];
      const color = getStatusColor(String(cellValue));
      
      if (color) {
        const cellAddress = XLSX.utils.encode_cell({ r: rowIndex + 1, c: colIndex }); // +1 for header row
        
        if (!worksheet[cellAddress]) {
          worksheet[cellAddress] = { v: cellValue };
        }
        
        worksheet[cellAddress].s = {
          fill: {
            patternType: 'solid',
            fgColor: { rgb: color.bgColor },
            bgColor: { rgb: color.bgColor },
          },
          font: {
            color: { rgb: color.fgColor },
            bold: true,
          },
          alignment: {
            horizontal: 'center',
            vertical: 'center',
          },
        };
      }
    });
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
    
    // Apply status coloring
    applyStatusColoring(worksheet, exportData);
    
    // Auto-size columns
    const colWidths = Object.keys(exportData[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    worksheet['!cols'] = colWidths;
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Write with styles support
    XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`, {
      cellStyles: true,
    });

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
