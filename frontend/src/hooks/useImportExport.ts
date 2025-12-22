import { useToast } from '@/hooks/use-toast';
import XLSX from 'xlsx-js-style';
import { formatDateBR } from '@/lib/utils';

// Normalize header: remove accents, lowercase, trim
const normalizeHeader = (header: string): string => {
  return header
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

// Helper to check if value has content
const hasValue = (val: any): boolean => val !== undefined && val !== null && val !== '';

// Parse date from Excel (supports serial dates and string formats)
const parseExcelDate = (value: any): string | null => {
  if (!value) return null;
  
  if (typeof value === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
    return date.toISOString().split('T')[0];
  }
  
  if (typeof value === 'string') {
    // dd/mm/yyyy format
    const ddmmyyyy = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
      const [, day, month, year] = ddmmyyyy;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    // yyyy-mm-dd format
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }
    // Try parsing as Date
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
  }
  
  return null;
};

// Parse currency value (R$ 1.234,56 -> 1234.56)
const parseCurrency = (value: any): number | null => {
  if (!value) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[R$\s.]/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }
  return null;
};

// Parse percentage (50% -> 50)
const parsePercentage = (value: any): number | null => {
  if (!value) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace('%', '').trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }
  return null;
};

// Parse boolean (Sim/Yes/true/1 -> true)
const parseBoolean = (value: any): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const v = value.toLowerCase().trim();
    return v === 'sim' || v === 'yes' || v === 'true' || v === '1' || v === 's';
  }
  return false;
};

// Parse duration (3:45 -> 225 seconds)
const parseDuration = (value: any): number | null => {
  if (!value) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parts = value.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0]) || 0;
      const seconds = parseInt(parts[1]) || 0;
      return minutes * 60 + seconds;
    }
    const num = parseInt(value);
    return isNaN(num) ? null : num;
  }
  return null;
};

// Parse list (comma or semicolon separated)
const parseList = (value: any): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') {
    return value.split(/[,;]/).map(s => s.trim()).filter(Boolean);
  }
  return [];
};

// Build row index from normalized headers
const buildRowIndex = (row: any): Record<string, any> => {
  const index: Record<string, any> = {};
  Object.entries(row).forEach(([key, value]) => {
    index[normalizeHeader(key)] = value;
  });
  return index;
};

// Pick first available value from aliases
const pick = (idx: Record<string, any>, ...aliases: string[]): any => {
  for (const alias of aliases) {
    const normalized = normalizeHeader(alias);
    if (hasValue(idx[normalized])) {
      return idx[normalized];
    }
  }
  return undefined;
};

// Convert to string or null
const toText = (val: any): string | null => {
  if (!hasValue(val)) return null;
  return String(val).trim();
};

// === FIELD MAPPINGS FOR EACH ENTITY ===

// Project field aliases
const projectFieldMappings = {
  name: ['nome do projeto', 'projeto', 'nome', 'name', 'title'],
  artist: ['artista', 'artista responsavel', 'nome do artista', 'artist'],
  release_type: ['tipo de lancamento', 'tipo', 'release_type', 'type'],
  ep_album_name: ['nome do ep/album', 'nome do album', 'ep_album_name', 'album_name'],
  song_name: ['nome da musica', 'musica', 'song_name', 'song', 'titulo'],
  collaboration_type: ['solo/feat', 'solo_feat', 'collaboration', 'tipo colaboracao'],
  track_type: ['original/remix', 'original_remix', 'track_type'],
  instrumental: ['instrumental'],
  duration: ['duracao', 'duration', 'tempo'],
  genre: ['genero musical', 'genero', 'genre'],
  language: ['idioma', 'language', 'lingua'],
  composers: ['compositores', 'composers', 'compositor'],
  performers: ['interpretes', 'performers', 'interprete'],
  producers: ['produtores', 'producers', 'produtor'],
  lyrics: ['letra', 'lyrics'],
  observations: ['observacoes', 'observations', 'obs', 'notas'],
  status: ['status'],
};

// Music Registry field aliases
const musicRegistryFieldMappings = {
  title: ['titulo', 'titulo da obra', 'title', 'nome'],
  abramus_code: ['codigo abramus', 'abramus_code', 'abramus'],
  ecad_code: ['codigo ecad', 'ecad_code', 'ecad'],
  genre: ['genero', 'genre'],
  language: ['idioma', 'language'],
  duration: ['duracao', 'duration'],
  isrc: ['isrc'],
  iswc: ['iswc'],
  status: ['status'],
  artist: ['artista', 'artista responsavel', 'artist'],
  project: ['projeto', 'projeto vinculado', 'project'],
  composers: ['compositores', 'composers'],
  publishers: ['editoras', 'publishers', 'editora'],
  lyrics: ['letra', 'lyrics'],
  is_instrumental: ['instrumental', 'is_instrumental'],
  is_ai_created: ['criada por ia', 'ia', 'ai', 'is_ai_created'],
};

// Phonogram field aliases
const phonogramFieldMappings = {
  title: ['titulo', 'title', 'nome'],
  work_id: ['obra vinculada', 'obra', 'work', 'work_id'],
  abramus_code: ['codigo abramus', 'abramus_code', 'abramus'],
  ecad_code: ['codigo ecad', 'ecad_code', 'ecad'],
  isrc: ['isrc'],
  artist: ['artista', 'artist'],
  label: ['agregadora', 'gravadora', 'label', 'aggregator'],
  emission_date: ['data de emissao', 'emissao', 'emission_date'],
  recording_date: ['data de gravacao', 'gravacao', 'recording_date'],
  release_date: ['data de lancamento', 'lancamento', 'release_date'],
  duration: ['duracao', 'duration'],
  genre: ['genero', 'genre'],
  classification: ['classificacao', 'versao', 'classification', 'version_type'],
  media: ['midia', 'media'],
  is_national: ['nacional', 'is_national'],
  origin_country: ['pais de origem', 'origem', 'origin_country'],
  publication_country: ['pais de publicacao', 'publicacao', 'publication_country'],
  status: ['status'],
  producers: ['produtores fonograficos', 'produtores', 'producers'],
  interpreters: ['interpretes', 'interpreters'],
  musicians: ['musicos acompanhantes', 'musicos', 'musicians'],
};

// Release field aliases
const releaseFieldMappings = {
  title: ['titulo', 'titulo do lancamento', 'title', 'nome'],
  project: ['projeto', 'projeto vinculado', 'project'],
  artist: ['artista', 'nome do artista', 'artist'],
  release_type: ['tipo', 'tipo de lancamento', 'release_type', 'type'],
  release_date: ['data de lancamento', 'data', 'release_date'],
  status: ['status'],
  distributors: ['distribuidora', 'distribuidoras', 'distributors'],
  distribution_notes: ['notas de distribuicao', 'notas', 'distribution_notes'],
  upc: ['upc', 'codigo upc'],
  genre: ['genero', 'genre'],
  language: ['idioma', 'language'],
  label: ['gravadora', 'label'],
  copyright: ['copyright'],
  cover_url: ['capa', 'cover', 'cover_url'],
};

// Contract field aliases - campos do formulário ContractForm
const contractFieldMappings = {
  title: ['titulo', 'titulo do contrato', 'title', 'nome'],
  client_type: ['tipo de cliente', 'cliente', 'client_type'],
  service_type: ['tipo de servico', 'servico', 'service_type'],
  artist_name: ['cliente artista', 'artista', 'artist_name', 'artist'],
  contractor_contact_name: ['contratante contato', 'contratante', 'contato', 'contractor_contact_name'],
  responsible_person: ['responsavel', 'responsible_person', 'responsible'],
  status: ['status'],
  start_date: ['data de inicio', 'inicio', 'start_date'],
  end_date: ['data de termino', 'termino', 'end_date'],
  registry_office: ['registrado em cartorio', 'registro em cartorio', 'cartorio', 'registry_office'],
  registry_date: ['data de registro em cartorio', 'data de registro', 'registry_date'],
  payment_type: ['tipo de pagamento', 'payment_type', 'pagamento'],
  fixed_value: ['valor do contrato', 'valor fixo', 'valor', 'fixed_value'],
  royalties_percentage: ['royalties', 'royalties_percentage', 'percentual'],
  advance_amount: ['adiantamento', 'advance_amount', 'advance'],
  financial_support: ['suporte financeiro mensal', 'suporte financeiro', 'financial_support'],
  observations: ['observacoes', 'observations', 'obs'],
  terms: ['termos', 'terms'],
};

// Financial field aliases
const financialFieldMappings = {
  description: ['descricao', 'description', 'nome'],
  type: ['tipo', 'type', 'transaction_type', 'tipo de transacao'],
  amount: ['valor', 'amount', 'quantia'],
  date: ['data', 'date', 'transaction_date', 'data da transacao'],
  category: ['categoria', 'category'],
  subcategory: ['subcategoria', 'subcategory'],
  status: ['status'],
  payment_method: ['metodo de pagamento', 'forma de pagamento', 'payment_method'],
  payment_type: ['tipo de pagamento', 'payment_type'],
  artist: ['artista', 'artist'],
  project: ['projeto', 'project'],
  contract: ['contrato', 'contract'],
  event: ['evento', 'event', 'show'],
  crm_contact: ['contato', 'empresa', 'crm_contact'],
  observations: ['observacoes', 'observations', 'obs'],
};

// Agenda field aliases
const agendaFieldMappings = {
  title: ['titulo', 'title', 'nome do evento', 'evento'],
  event_type: ['tipo de evento', 'tipo', 'event_type'],
  status: ['status'],
  start_date: ['data de inicio', 'data', 'start_date'],
  end_date: ['data de termino', 'data fim', 'end_date'],
  start_time: ['hora de inicio', 'hora', 'horario', 'start_time'],
  end_time: ['hora de termino', 'end_time'],
  location: ['local', 'location', 'localizacao'],
  venue_name: ['nome do local', 'venue_name', 'venue'],
  venue_address: ['endereco do local', 'endereco', 'venue_address'],
  venue_capacity: ['capacidade', 'capacidade do local', 'venue_capacity'],
  venue_contact: ['contato do local', 'venue_contact'],
  ticket_price: ['preco do ingresso', 'ingresso', 'ticket_price'],
  expected_audience: ['publico esperado', 'publico', 'expected_audience'],
  description: ['descricao', 'description'],
  observations: ['observacoes', 'observations', 'obs'],
  artist: ['artista', 'artist'],
};

// Inventory field aliases
const inventoryFieldMappings = {
  name: ['nome', 'item', 'name'],
  sector: ['setor', 'sector'],
  category: ['categoria', 'category'],
  quantity: ['quantidade', 'quantity', 'qtd'],
  location: ['localizacao', 'local', 'location'],
  responsible: ['responsavel', 'responsible'],
  status: ['status'],
  purchase_location: ['local de compra', 'compra', 'purchase_location'],
  invoice_number: ['nota fiscal', 'numero da nota', 'nf', 'invoice_number'],
  entry_date: ['data de entrada', 'entrada', 'entry_date'],
  unit_value: ['valor unitario', 'valor', 'unit_value'],
  observations: ['observacoes', 'observations', 'obs'],
};

// CRM field aliases
const crmFieldMappings = {
  name: ['nome', 'name'],
  company: ['empresa', 'company'],
  email: ['email', 'e_mail'],
  phone: ['telefone', 'phone', 'tel'],
  contact_type: ['tipo de contato', 'tipo', 'contact_type', 'type'],
  position: ['cargo', 'position'],
  status: ['status'],
  priority: ['prioridade', 'priority'],
  document: ['documento', 'cpf', 'cnpj', 'document'],
  address: ['endereco', 'address'],
  city: ['cidade', 'city'],
  state: ['estado', 'uf', 'state'],
  zip_code: ['cep', 'zip_code', 'codigo_postal'],
  artist_name: ['artista associado', 'artista', 'artist_name'],
  next_action: ['proxima acao', 'next_action'],
  notes: ['notas', 'observacoes', 'notes'],
};

// Service field aliases
const serviceFieldMappings = {
  grupo: ['grupo', 'group'],
  category: ['categoria', 'category'],
  service_type: ['tipo', 'service_type', 'tipo de servico'],
  description: ['descricao', 'descricao do servico', 'description'],
  cost_price: ['valor custo', 'custo', 'cost_price'],
  margin: ['margem', 'margin'],
  sale_price: ['valor venda', 'venda', 'sale_price'],
  discount_value: ['desconto', 'discount_value'],
  final_price: ['valor total', 'valor final', 'final_price'],
  observations: ['observacoes', 'observations', 'obs'],
};

// === IMPORT FUNCTIONS ===

export interface ImportResult {
  success: number;
  errors: number;
  total: number;
}

export const useImportExport = () => {
  const { toast } = useToast();

  const parseExcelFile = async (file: File): Promise<any[]> => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  };

  // Generic import parser that maps Excel columns to entity fields
  const parseImportRow = (
    row: any,
    fieldMappings: Record<string, string[]>,
    lookupMaps?: Record<string, Record<string, string>>
  ): Record<string, any> => {
    const idx = buildRowIndex(row);
    const result: Record<string, any> = {};

    Object.entries(fieldMappings).forEach(([field, aliases]) => {
      const value = pick(idx, ...aliases);
      if (hasValue(value)) {
        result[field] = value;
      }
    });

    return result;
  };

  // Parse project import row
  const parseProjectImportRow = (
    row: any,
    artistsMap: Record<string, string>
  ): any => {
    const idx = buildRowIndex(row);
    
    const artistName = toText(pick(idx, ...projectFieldMappings.artist));
    const artistId = artistName ? artistsMap[artistName.toLowerCase()] : undefined;

    const releaseTypeRaw = toText(pick(idx, ...projectFieldMappings.release_type)) || '';
    const releaseTypeMap: Record<string, string> = {
      'single': 'single', 'ep': 'ep', 'album': 'album', 'álbum': 'album',
    };
    const releaseType = releaseTypeMap[releaseTypeRaw.toLowerCase()] || 'single';

    const statusRaw = toText(pick(idx, ...projectFieldMappings.status)) || 'draft';
    const statusMap: Record<string, string> = {
      'concluido': 'completed', 'concluído': 'completed', 'completed': 'completed',
      'em andamento': 'in_progress', 'in_progress': 'in_progress',
      'rascunho': 'draft', 'draft': 'draft',
      'cancelado': 'cancelled', 'cancelled': 'cancelled',
    };
    const status = statusMap[statusRaw.toLowerCase()] || 'draft';

    const songName = toText(pick(idx, ...projectFieldMappings.song_name));
    const projectName = toText(pick(idx, ...projectFieldMappings.name)) || 
                       toText(pick(idx, ...projectFieldMappings.ep_album_name)) ||
                       songName;

    if (!projectName) return null;

    const collabRaw = toText(pick(idx, ...projectFieldMappings.collaboration_type)) || '';
    const trackTypeRaw = toText(pick(idx, ...projectFieldMappings.track_type)) || '';
    const instrumentalRaw = toText(pick(idx, ...projectFieldMappings.instrumental)) || '';
    const durationRaw = toText(pick(idx, ...projectFieldMappings.duration)) || '';

    // Parse duration
    let durationMinutes = 0;
    let durationSeconds = 0;
    if (durationRaw && durationRaw.includes(':')) {
      const parts = durationRaw.split(':');
      durationMinutes = parseInt(parts[0]) || 0;
      durationSeconds = parseInt(parts[1]) || 0;
    }

    // Parse composers, performers, producers
    const composersList = parseList(pick(idx, ...projectFieldMappings.composers));
    const performersList = parseList(pick(idx, ...projectFieldMappings.performers));
    const producersList = parseList(pick(idx, ...projectFieldMappings.producers));

    const songs = songName ? [{
      song_name: songName,
      genre: toText(pick(idx, ...projectFieldMappings.genre)) || '',
      language: toText(pick(idx, ...projectFieldMappings.language)) || '',
      collaboration_type: collabRaw.toLowerCase().includes('feat') ? 'feat' : 'solo',
      track_type: trackTypeRaw.toLowerCase().includes('remix') ? 'remix' : 'original',
      instrumental: instrumentalRaw.toLowerCase() === 'sim' || instrumentalRaw.toLowerCase() === 'yes' ? 'sim' : 'nao',
      duration_minutes: durationMinutes,
      duration_seconds: durationSeconds,
      composers: composersList.map(name => ({ name })),
      performers: performersList.map(name => ({ name })),
      producers: producersList.map(name => ({ name })),
      lyrics: toText(pick(idx, ...projectFieldMappings.lyrics)) || '',
    }] : [];

    return {
      name: projectName,
      artist_id: artistId,
      status,
      audio_files: JSON.stringify({
        release_type: releaseType,
        ep_album_name: toText(pick(idx, ...projectFieldMappings.ep_album_name)) || '',
        songs,
        observations: toText(pick(idx, ...projectFieldMappings.observations)) || '',
      }),
    };
  };

  // Parse music registry import row
  const parseMusicRegistryImportRow = (
    row: any,
    artistsMap: Record<string, string>,
    projectsMap: Record<string, string>
  ): any => {
    const idx = buildRowIndex(row);

    const title = toText(pick(idx, ...musicRegistryFieldMappings.title));
    if (!title) return null;

    const artistName = toText(pick(idx, ...musicRegistryFieldMappings.artist));
    const artistId = artistName ? artistsMap[artistName.toLowerCase()] : undefined;

    const projectName = toText(pick(idx, ...musicRegistryFieldMappings.project));
    const projectId = projectName ? projectsMap[projectName.toLowerCase()] : undefined;

    const composersList = parseList(pick(idx, ...musicRegistryFieldMappings.composers));
    const publishersList = parseList(pick(idx, ...musicRegistryFieldMappings.publishers));

    return {
      title,
      abramus_code: toText(pick(idx, ...musicRegistryFieldMappings.abramus_code)),
      ecad_code: toText(pick(idx, ...musicRegistryFieldMappings.ecad_code)),
      genre: toText(pick(idx, ...musicRegistryFieldMappings.genre)),
      language: toText(pick(idx, ...musicRegistryFieldMappings.language)),
      duration: parseDuration(pick(idx, ...musicRegistryFieldMappings.duration)),
      isrc: toText(pick(idx, ...musicRegistryFieldMappings.isrc)),
      iswc: toText(pick(idx, ...musicRegistryFieldMappings.iswc)),
      status: toText(pick(idx, ...musicRegistryFieldMappings.status)) || 'pendente',
      artist_id: artistId,
      project_id: projectId,
      writers: composersList.length > 0 ? composersList : null,
      publishers: publishersList.length > 0 ? publishersList : null,
      lyrics: toText(pick(idx, ...musicRegistryFieldMappings.lyrics)),
      is_instrumental: parseBoolean(pick(idx, ...musicRegistryFieldMappings.is_instrumental)),
      is_ai_created: parseBoolean(pick(idx, ...musicRegistryFieldMappings.is_ai_created)),
    };
  };

  // Parse phonogram import row
  const parsePhonogramImportRow = (
    row: any,
    artistsMap: Record<string, string>,
    worksMap: Record<string, string>
  ): any => {
    const idx = buildRowIndex(row);

    const title = toText(pick(idx, ...phonogramFieldMappings.title));
    if (!title) return null;

    const artistName = toText(pick(idx, ...phonogramFieldMappings.artist));
    const artistId = artistName ? artistsMap[artistName.toLowerCase()] : undefined;

    const workName = toText(pick(idx, ...phonogramFieldMappings.work_id));
    const workId = workName ? worksMap[workName.toLowerCase()] : undefined;

    // Parse participants
    const producersList = parseList(pick(idx, ...phonogramFieldMappings.producers));
    const interpretersList = parseList(pick(idx, ...phonogramFieldMappings.interpreters));
    const musiciansList = parseList(pick(idx, ...phonogramFieldMappings.musicians));

    const participants: any[] = [];
    producersList.forEach(name => participants.push({ name, role: 'produtor_fonografico' }));
    interpretersList.forEach(name => participants.push({ name, role: 'interprete' }));
    musiciansList.forEach(name => participants.push({ name, role: 'musico_acompanhante' }));

    return {
      title,
      work_id: workId,
      abramus_code: toText(pick(idx, ...phonogramFieldMappings.abramus_code)),
      ecad_code: toText(pick(idx, ...phonogramFieldMappings.ecad_code)),
      isrc: toText(pick(idx, ...phonogramFieldMappings.isrc)),
      artist_id: artistId,
      label: toText(pick(idx, ...phonogramFieldMappings.label)),
      emission_date: parseExcelDate(pick(idx, ...phonogramFieldMappings.emission_date)),
      recording_date: parseExcelDate(pick(idx, ...phonogramFieldMappings.recording_date)),
      release_date: parseExcelDate(pick(idx, ...phonogramFieldMappings.release_date)),
      duration: parseDuration(pick(idx, ...phonogramFieldMappings.duration)),
      genre: toText(pick(idx, ...phonogramFieldMappings.genre)),
      version_type: toText(pick(idx, ...phonogramFieldMappings.classification)),
      media: toText(pick(idx, ...phonogramFieldMappings.media)),
      is_national: parseBoolean(pick(idx, ...phonogramFieldMappings.is_national)),
      origin_country: toText(pick(idx, ...phonogramFieldMappings.origin_country)),
      publication_country: toText(pick(idx, ...phonogramFieldMappings.publication_country)),
      status: toText(pick(idx, ...phonogramFieldMappings.status)) || 'pendente',
      participants: participants.length > 0 ? participants : null,
    };
  };

  // Parse release import row
  const parseReleaseImportRow = (
    row: any,
    artistsMap: Record<string, string>,
    projectsMap: Record<string, string>
  ): any => {
    const idx = buildRowIndex(row);

    const title = toText(pick(idx, ...releaseFieldMappings.title));
    if (!title) return null;

    const artistName = toText(pick(idx, ...releaseFieldMappings.artist));
    const artistId = artistName ? artistsMap[artistName.toLowerCase()] : undefined;

    const projectName = toText(pick(idx, ...releaseFieldMappings.project));
    const projectId = projectName ? projectsMap[projectName.toLowerCase()] : undefined;

    const releaseTypeRaw = toText(pick(idx, ...releaseFieldMappings.release_type)) || '';
    const releaseTypeMap: Record<string, string> = {
      'single': 'single', 'ep': 'ep', 'album': 'album', 'álbum': 'album',
    };

    const distributorsList = parseList(pick(idx, ...releaseFieldMappings.distributors));
    const distributorMap: Record<string, string> = {
      'onerpm': 'onerpm', 'distrokid': 'distrokid', '30por1': '30por1',
      'cd baby': 'cd_baby', 'tunecore': 'tunecore', 'outras': 'outras_distribuidoras',
    };
    const distributors = distributorsList.map(d => distributorMap[d.toLowerCase()] || d);

    return {
      title,
      artist_id: artistId,
      project_id: projectId,
      release_type: releaseTypeMap[releaseTypeRaw.toLowerCase()] || 'single',
      release_date: parseExcelDate(pick(idx, ...releaseFieldMappings.release_date)),
      status: toText(pick(idx, ...releaseFieldMappings.status)) || 'planning',
      distributors: distributors.length > 0 ? distributors : null,
      distribution_notes: toText(pick(idx, ...releaseFieldMappings.distribution_notes)),
      upc: toText(pick(idx, ...releaseFieldMappings.upc)),
      genre: toText(pick(idx, ...releaseFieldMappings.genre)),
      language: toText(pick(idx, ...releaseFieldMappings.language)),
      label: toText(pick(idx, ...releaseFieldMappings.label)),
      copyright: toText(pick(idx, ...releaseFieldMappings.copyright)),
      cover_url: toText(pick(idx, ...releaseFieldMappings.cover_url)),
    };
  };

  // Parse contract import row
  const parseContractImportRow = (
    row: any,
    artistsMap: Record<string, string>
  ): any => {
    const idx = buildRowIndex(row);

    const title = toText(pick(idx, ...contractFieldMappings.title));
    if (!title) return null;

    const artistName = toText(pick(idx, ...contractFieldMappings.artist_name));
    const artistId = artistName ? artistsMap[artistName.toLowerCase()] : undefined;

    return {
      title,
      artist_id: artistId,
      client_type: toText(pick(idx, ...contractFieldMappings.client_type)),
      service_type: toText(pick(idx, ...contractFieldMappings.service_type)),
      status: toText(pick(idx, ...contractFieldMappings.status)) || 'rascunho',
      start_date: parseExcelDate(pick(idx, ...contractFieldMappings.start_date)),
      end_date: parseExcelDate(pick(idx, ...contractFieldMappings.end_date)),
      fixed_value: parseCurrency(pick(idx, ...contractFieldMappings.fixed_value)),
      royalties_percentage: parsePercentage(pick(idx, ...contractFieldMappings.royalties_percentage)),
      advance_amount: parseCurrency(pick(idx, ...contractFieldMappings.advance_amount)),
      financial_support: parseCurrency(pick(idx, ...contractFieldMappings.financial_support)),
      payment_type: toText(pick(idx, ...contractFieldMappings.payment_type)),
      responsible_person: toText(pick(idx, ...contractFieldMappings.responsible_person)),
      contractor_contact: toText(pick(idx, ...contractFieldMappings.contractor_contact_name)),
      registry_office: toText(pick(idx, ...contractFieldMappings.registry_office)),
      registry_date: parseExcelDate(pick(idx, ...contractFieldMappings.registry_date)),
      terms: toText(pick(idx, ...contractFieldMappings.terms)),
      observations: toText(pick(idx, ...contractFieldMappings.observations)),
    };
  };

  // Parse agenda import row
  const parseAgendaImportRow = (
    row: any,
    artistsMap: Record<string, string>
  ): any => {
    const idx = buildRowIndex(row);

    const title = toText(pick(idx, ...agendaFieldMappings.title));
    if (!title) return null;

    const artistName = toText(pick(idx, ...agendaFieldMappings.artist));
    const artistId = artistName ? artistsMap[artistName.toLowerCase()] : undefined;

    const eventTypeRaw = toText(pick(idx, ...agendaFieldMappings.event_type)) || 'reunioes';
    const eventTypeMap: Record<string, string> = {
      'sessoes de estudio': 'sessoes_estudio', 'sessoes estudio': 'sessoes_estudio',
      'ensaios': 'ensaios', 'ensaio': 'ensaios',
      'sessoes de fotos': 'sessoes_fotos', 'fotos': 'sessoes_fotos',
      'shows': 'shows', 'show': 'shows',
      'entrevistas': 'entrevistas', 'entrevista': 'entrevistas',
      'podcasts': 'podcasts', 'podcast': 'podcasts',
      'programas de tv': 'programas_tv', 'tv': 'programas_tv',
      'radio': 'radio', 'rádio': 'radio',
      'producao de conteudo': 'producao_conteudo', 'conteudo': 'producao_conteudo',
      'reunioes': 'reunioes', 'reuniao': 'reunioes', 'reunião': 'reunioes',
    };

    return {
      title,
      artist_id: artistId,
      event_type: eventTypeMap[eventTypeRaw.toLowerCase()] || 'reunioes',
      status: toText(pick(idx, ...agendaFieldMappings.status)) || 'agendado',
      start_date: parseExcelDate(pick(idx, ...agendaFieldMappings.start_date)) || new Date().toISOString().split('T')[0],
      end_date: parseExcelDate(pick(idx, ...agendaFieldMappings.end_date)),
      start_time: toText(pick(idx, ...agendaFieldMappings.start_time)),
      end_time: toText(pick(idx, ...agendaFieldMappings.end_time)),
      location: toText(pick(idx, ...agendaFieldMappings.location)),
      venue_name: toText(pick(idx, ...agendaFieldMappings.venue_name)),
      venue_address: toText(pick(idx, ...agendaFieldMappings.venue_address)),
      venue_capacity: parseInt(pick(idx, ...agendaFieldMappings.venue_capacity)) || null,
      venue_contact: toText(pick(idx, ...agendaFieldMappings.venue_contact)),
      ticket_price: parseCurrency(pick(idx, ...agendaFieldMappings.ticket_price)),
      expected_audience: parseInt(pick(idx, ...agendaFieldMappings.expected_audience)) || null,
      description: toText(pick(idx, ...agendaFieldMappings.description)),
      observations: toText(pick(idx, ...agendaFieldMappings.observations)),
    };
  };

  // Parse inventory import row
  const parseInventoryImportRow = (row: any): any => {
    const idx = buildRowIndex(row);

    const name = toText(pick(idx, ...inventoryFieldMappings.name));
    if (!name) return null;

    return {
      name,
      sector: toText(pick(idx, ...inventoryFieldMappings.sector)),
      category: toText(pick(idx, ...inventoryFieldMappings.category)) || 'Outros',
      quantity: parseInt(pick(idx, ...inventoryFieldMappings.quantity)) || 1,
      location: toText(pick(idx, ...inventoryFieldMappings.location)),
      responsible: toText(pick(idx, ...inventoryFieldMappings.responsible)),
      status: toText(pick(idx, ...inventoryFieldMappings.status)) || 'Disponível',
      purchase_location: toText(pick(idx, ...inventoryFieldMappings.purchase_location)),
      invoice_number: toText(pick(idx, ...inventoryFieldMappings.invoice_number)),
      entry_date: parseExcelDate(pick(idx, ...inventoryFieldMappings.entry_date)),
      unit_value: parseCurrency(pick(idx, ...inventoryFieldMappings.unit_value)),
      observations: toText(pick(idx, ...inventoryFieldMappings.observations)),
    };
  };

  // Parse CRM import row
  const parseCrmImportRow = (row: any): any => {
    const idx = buildRowIndex(row);

    const name = toText(pick(idx, ...crmFieldMappings.name));
    if (!name) return null;

    return {
      name,
      company: toText(pick(idx, ...crmFieldMappings.company)),
      email: toText(pick(idx, ...crmFieldMappings.email)),
      phone: toText(pick(idx, ...crmFieldMappings.phone)),
      contact_type: toText(pick(idx, ...crmFieldMappings.contact_type)),
      position: toText(pick(idx, ...crmFieldMappings.position)),
      status: toText(pick(idx, ...crmFieldMappings.status)) || 'frio',
      priority: toText(pick(idx, ...crmFieldMappings.priority)) || 'media',
      document: toText(pick(idx, ...crmFieldMappings.document)),
      address: toText(pick(idx, ...crmFieldMappings.address)),
      city: toText(pick(idx, ...crmFieldMappings.city)),
      state: toText(pick(idx, ...crmFieldMappings.state)),
      zip_code: toText(pick(idx, ...crmFieldMappings.zip_code)),
      artist_name: toText(pick(idx, ...crmFieldMappings.artist_name)),
      next_action: toText(pick(idx, ...crmFieldMappings.next_action)),
      notes: toText(pick(idx, ...crmFieldMappings.notes)),
    };
  };

  // Parse service import row
  const parseServiceImportRow = (row: any): any => {
    const idx = buildRowIndex(row);

    const description = toText(pick(idx, ...serviceFieldMappings.description));
    if (!description) return null;

    const costPrice = parseCurrency(pick(idx, ...serviceFieldMappings.cost_price)) || 0;
    const margin = parsePercentage(pick(idx, ...serviceFieldMappings.margin)) || 0;
    const salePrice = parseCurrency(pick(idx, ...serviceFieldMappings.sale_price)) || (costPrice + (costPrice * margin / 100));
    const discountValue = parsePercentage(pick(idx, ...serviceFieldMappings.discount_value)) || 0;
    let finalPrice = parseCurrency(pick(idx, ...serviceFieldMappings.final_price)) || 0;
    if (!finalPrice) {
      finalPrice = salePrice - (salePrice * discountValue / 100);
    }

    return {
      grupo: toText(pick(idx, ...serviceFieldMappings.grupo)) || 'agenciamento',
      category: toText(pick(idx, ...serviceFieldMappings.category)) || 'consultoria',
      service_type: toText(pick(idx, ...serviceFieldMappings.service_type)) || 'avulso',
      description,
      cost_price: costPrice,
      margin,
      sale_price: salePrice,
      discount_value: discountValue,
      discount_type: 'percentage',
      final_price: Math.max(0, finalPrice),
      observations: toText(pick(idx, ...serviceFieldMappings.observations)),
    };
  };

  // Parse financial import row
  const parseFinancialImportRow = (
    row: any,
    artistsMap: Record<string, string>,
    projectsMap: Record<string, string>,
    contractsMap: Record<string, string>,
    eventsMap: Record<string, string>,
    contactsMap: Record<string, string>
  ): any => {
    const idx = buildRowIndex(row);

    const description = toText(pick(idx, ...financialFieldMappings.description));
    if (!description) return null;

    const artistName = toText(pick(idx, ...financialFieldMappings.artist));
    const artistId = artistName ? artistsMap[artistName.toLowerCase()] : undefined;

    const projectName = toText(pick(idx, ...financialFieldMappings.project));
    const projectId = projectName ? projectsMap[projectName.toLowerCase()] : undefined;

    const contractName = toText(pick(idx, ...financialFieldMappings.contract));
    const contractId = contractName ? contractsMap[contractName.toLowerCase()] : undefined;

    const eventName = toText(pick(idx, ...financialFieldMappings.event));
    const eventId = eventName ? eventsMap[eventName.toLowerCase()] : undefined;

    const contactName = toText(pick(idx, ...financialFieldMappings.crm_contact));
    const contactId = contactName ? contactsMap[contactName.toLowerCase()] : undefined;

    const typeRaw = toText(pick(idx, ...financialFieldMappings.type)) || 'despesas';
    const typeMap: Record<string, string> = {
      'receita': 'receitas', 'receitas': 'receitas', 'entrada': 'receitas',
      'despesa': 'despesas', 'despesas': 'despesas', 'saida': 'despesas',
      'investimento': 'investimentos', 'investimentos': 'investimentos',
    };

    return {
      description,
      type: typeMap[typeRaw.toLowerCase()] || 'despesas',
      transaction_type: typeMap[typeRaw.toLowerCase()] || 'despesas',
      amount: parseCurrency(pick(idx, ...financialFieldMappings.amount)) || 0,
      date: parseExcelDate(pick(idx, ...financialFieldMappings.date)) || new Date().toISOString().split('T')[0],
      transaction_date: parseExcelDate(pick(idx, ...financialFieldMappings.date)) || new Date().toISOString().split('T')[0],
      category: toText(pick(idx, ...financialFieldMappings.category)) || 'outros',
      subcategory: toText(pick(idx, ...financialFieldMappings.subcategory)),
      status: toText(pick(idx, ...financialFieldMappings.status)) || 'pendente',
      payment_method: toText(pick(idx, ...financialFieldMappings.payment_method)),
      payment_type: toText(pick(idx, ...financialFieldMappings.payment_type)),
      artist_id: artistId,
      project_id: projectId,
      contract_id: contractId,
      event_id: eventId,
      crm_contact_id: contactId,
      observations: toText(pick(idx, ...financialFieldMappings.observations)),
    };
  };

  return {
    parseExcelFile,
    parseProjectImportRow,
    parseMusicRegistryImportRow,
    parsePhonogramImportRow,
    parseReleaseImportRow,
    parseContractImportRow,
    parseAgendaImportRow,
    parseInventoryImportRow,
    parseCrmImportRow,
    parseServiceImportRow,
    parseFinancialImportRow,
  };
};
