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
// Exporta todos os campos relevantes (inclui campos do cadastro + campos técnicos e, quando disponíveis, campos sensíveis)
const artistColumns = {
  // Identificação / auditoria
  id: 'ID',
  created_at: 'Data de Criação',
  updated_at: 'Última Atualização',

  // Nomes (stage_name e legal_name são mesclados em name e full_name no transform)
  name: 'Nome Artístico',
  full_name: 'Nome Completo',

  // Perfil
  profile_type: 'Tipo de Perfil',
  artist_types: 'Tipos de Artista',
  genre: 'Gênero Musical',
  bio: 'Biografia',
  contract_status: 'Status do Contrato',

  // Dados pessoais
  birth_date: 'Data de Nascimento',

  // Contato
  phone: 'Telefone',
  email: 'E-mail',

  // Perfis / links
  spotify_url: 'Perfil Spotify',
  instagram: 'Instagram',
  youtube_url: 'YouTube',
  tiktok: 'TikTok',
  soundcloud: 'SoundCloud',
  deezer_url: 'Deezer',
  apple_music_url: 'Apple Music',
  documents_url: 'Documentos (URL)',
  image_url: 'Imagem (URL)',

  // Gravadora / contatos
  record_label_name: 'Nome da Gravadora',
  label_contact_name: 'Nome Contato Gravadora',
  label_contact_phone: 'Telefone Contato Gravadora',
  label_contact_email: 'E-mail Contato Gravadora',

  // Empresário / responsável
  manager_name: 'Nome Empresário/Responsável',
  manager_phone: 'Telefone Empresário/Responsável',
  manager_email: 'E-mail Empresário/Responsável',

  // Distribuidoras
  distributors: 'Distribuidores',
  distributor_emails: 'E-mails de Share',

  // Campos sensíveis (aparecem no export apenas quando o usuário tiver permissão de acesso)
  cpf_cnpj: 'CPF/CNPJ',
  rg: 'RG',
  full_address: 'Endereço Completo',
  pix_key: 'Chave PIX',
  bank: 'Banco',
  agency: 'Agência',
  account: 'Conta',
  account_holder: 'Titular da Conta',

  // Observações
  observations: 'Observações',
};

const projectColumns = {
  // Campos do formulário ProjectForm
  release_type: 'Tipo de Lançamento',
  ep_album_name: 'Nome do EP/Álbum',
  artist_name: 'Artista Responsável',
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
  status: 'Status',
};

const releaseColumns = {
  // Campos do formulário ReleaseForm
  project_name: 'Projeto Vinculado',
  title: 'Título do Lançamento',
  artist_name: 'Nome do Artista',
  release_type: 'Tipo de Lançamento',
  release_date: 'Data de Lançamento',
  status: 'Status',
  distributors: 'Distribuidora',
  distribution_notes: 'Notas de Distribuição',
  upc: 'Código UPC',
  genre: 'Gênero',
  language: 'Idioma',
  label: 'Gravadora',
  copyright: 'Copyright',
  tracks_formatted: 'Faixas',
};

const contractColumns = {
  // Campos do formulário ContractForm
  title: 'Título do Contrato',
  client_type: 'Tipo de Cliente',
  service_type: 'Tipo de Serviço',
  artist_name: 'Cliente/Artista',
  contractor_contact_name: 'Contratante/Contato',
  responsible_person: 'Responsável',
  status: 'Status',
  start_date: 'Data de Início',
  end_date: 'Data de Término',
  registry_office: 'Registrado em Cartório',
  registry_date: 'Data de Registro em Cartório',
  payment_type: 'Tipo de Pagamento',
  fixed_value: 'Valor do Contrato',
  royalties_percentage: 'Royalties (%)',
  advance_amount: 'Adiantamento',
  financial_support: 'Suporte Financeiro Mensal',
  observations: 'Observações',
  terms: 'Termos',
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
  // Dados da obra
  title: 'Título da Obra',
  artist_name: 'Artista Responsável',
  project_name: 'Projeto Vinculado',
  status: 'Status',
  
  // Códigos de registro
  abramus_code: 'Código ABRAMUS',
  ecad_code: 'Código ECAD',
  isrc: 'ISRC',
  iswc: 'ISWC',
  
  // Características
  genre: 'Gênero',
  language: 'Idioma',
  duration: 'Duração',
  is_instrumental: 'Instrumental',
  
  // IA
  is_ai_created: 'Criada por IA',
  ai_generation_type: 'Tipo de Geração IA',
  ai_elements_formatted: 'Elementos IA',
  
  // Participação
  participants_formatted: 'Participantes (Nome, Função, %, Link)',
  
  // Outros
  other_titles_formatted: 'Outros Títulos',
  connected_references_formatted: 'Referências Conectadas',
  lyrics: 'Letra',
};

const phonogramColumns = {
  // Campos do formulário PhonogramForm
  // Vincular Obra
  work_abramus_code: 'Código ABRAMUS da Obra',
  work_title: 'Título da Obra Vinculada',
  // Dados do Fonograma
  abramus_code: 'Código ABRAMUS',
  ecad_code: 'Código ECAD',
  aggregator: 'Agregadora/Gravadora',
  isrc: 'ISRC',
  is_ai_created: 'Criada por IA',
  emission_date: 'Data de Emissão',
  recording_date: 'Data de Gravação',
  release_date: 'Data de Lançamento',
  duration: 'Duração',
  is_instrumental: 'Instrumental',
  genre: 'Gênero',
  classification: 'Classificação/Versão',
  media: 'Mídia',
  is_national: 'Nacional',
  simultaneous_publication: 'Publicação Simultânea',
  origin_country: 'País de Origem',
  publication_country: 'País de Publicação',
  status: 'Status',
  // Participação
  producers_formatted: 'Produtores Fonográficos',
  interpreters_formatted: 'Intérpretes',
  musicians_formatted: 'Músicos Acompanhantes',
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

const contractTemplateColumns = {
  name: 'Nome do Template',
  template_type: 'Tipo de Contrato',
  description: 'Descrição',
  is_active: 'Status',
  version: 'Versão',
  clauses_count: 'Qtd. Cláusulas',
  clauses_titles: 'Títulos das Cláusulas',
  created_at: 'Data de Criação',
  updated_at: 'Última Atualização',
};

type EntityType = 'artists' | 'projects' | 'releases' | 'contracts' | 'agenda' | 'crm' | 'music_registry' | 'phonograms' | 'inventory' | 'contract_templates';

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
  contract_templates: contractTemplateColumns,
};

// Columns that should have status coloring applied
const statusColumns = ['Status', 'Status Contrato'];

const formatValue = (value: any, key: string, entityType?: EntityType): any => {
  if (value === null || value === undefined) return '';
  
  // Format dates
  if (key.includes('date') || key === 'created_at' || key === 'updated_at') {
    return formatDateBR(value);
  }
  
  // Format duration for music_registry as m:ss
  if (key === 'duration' && entityType === 'music_registry') {
    if (typeof value === 'number') {
      const minutes = Math.floor(value / 60);
      const seconds = value % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return value;
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
  
   return data.map(originalItem => {
     const transformed: Record<string, any> = {};
     const item: Record<string, any> = { ...(originalItem || {}) };
    // Add artist name if available (skip for music_registry as it uses artist_name -> Artista Responsável)
    if (artistsMap && item.artist_id && artistsMap[item.artist_id] && entityType !== 'music_registry') {
      transformed['Artista'] = artistsMap[item.artist_id];
    }
    
    // Handle special case for artist fields (sem mutar o objeto original)
    if (entityType === 'artists') {
      // Mesclar stage_name em name (Nome Artístico) se name estiver vazio
      item.name = item.name || item.'';
      // Mesclar legal_name em full_name (Nome Completo) se full_name estiver vazio
      item.full_name = item.full_name || item.legal_name || '';

      // Preencher campo "Instagram" com instagram_url quando vier só o link
      item.instagram = item.instagram || item.instagram_url || '';

      // Formatar distributor_emails como string legível (aceita múltiplos formatos)
      if (item.distributor_emails) {
        let distributorEmails: any = item.distributor_emails;
        if (typeof distributorEmails === 'string') {
          try {
            distributorEmails = JSON.parse(distributorEmails);
          } catch {
            // Não é JSON, tenta manter como texto já formatado
          }
        }

        if (typeof distributorEmails === 'object' && distributorEmails !== null && !Array.isArray(distributorEmails)) {
          const emailParts: string[] = [];
          // Iterar sobre todas as chaves para capturar qualquer distribuidora
          Object.entries(distributorEmails).forEach(([key, value]) => {
            if (value && typeof value === 'string' && value.trim()) {
              emailParts.push(`${key}: ${value}`);
            }
          });
          item.distributor_emails = emailParts.join('; ') || '';
        }
        // Se já for string (formato antigo), mantém como está
      }
    }
    
    // Calculate total value for inventory items
    if (entityType === 'inventory') {
      const quantity = item.quantity || 0;
      const unitValue = item.unit_value || 0;
      item.total_value = quantity * unitValue;
    }
    
    // Format participants for music_registry
    if (entityType === 'music_registry') {
      // Add artist name from artistsMap
      if (artistsMap && item.artist_id && artistsMap[item.artist_id]) {
        item.artist_name = artistsMap[item.artist_id];
      }
      
      // Format participants with all details
      if (item.participants) {
        const participants = Array.isArray(item.participants) ? item.participants : [];
        item.participants_formatted = participants.map((p: any) => {
          const parts = [];
          if (p.name) parts.push(p.name);
          if (p.role) parts.push(`(${p.role})`);
          if (p.percentage) parts.push(`${p.percentage}%`);
          if (p.link) parts.push(`Link: ${p.link}`);
          if (p.contract_start_date) parts.push(`Início: ${formatDateBR(p.contract_start_date)}`);
          return parts.join(' ');
        }).join('; ') || '';
      } else {
        item.participants_formatted = '';
      }
      
      // Format duration as m:ss
      if (item.duration && typeof item.duration === 'number') {
        const minutes = Math.floor(item.duration / 60);
        const seconds = item.duration % 60;
        item.duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
      
      // Format boolean fields
      item.is_instrumental = item.is_instrumental ? 'Sim' : 'Não';
      item.is_ai_created = item.is_ai_created ? 'Sim' : 'Não';
      
      // Format AI elements
      if (item.ai_elements && Array.isArray(item.ai_elements)) {
        item.ai_elements_formatted = item.ai_elements.map((el: any) => {
          const parts = [];
          if (el.element_type) parts.push(el.element_type);
          if (el.tool_name) parts.push(`Ferramenta: ${el.tool_name}`);
          if (el.prompt) parts.push(`Prompt: ${el.prompt}`);
          return parts.join(' - ');
        }).join('; ');
      } else {
        item.ai_elements_formatted = '';
      }
      
      // Format other_titles
      if (item.other_titles && Array.isArray(item.other_titles)) {
        item.other_titles_formatted = item.other_titles.map((t: any) => t.title || t).join('; ');
      } else {
        item.other_titles_formatted = '';
      }
      
      // Format connected_references
      if (item.connected_references && Array.isArray(item.connected_references)) {
        item.connected_references_formatted = item.connected_references.map((r: any) => {
          if (r.reference && r.type) return `${r.reference} (${r.type})`;
          return r.reference || r;
        }).join('; ');
      } else {
        item.connected_references_formatted = '';
      }
      
      // Map language
      const languageMap: Record<string, string> = {
        'portugues': 'Português',
        'ingles': 'Inglês',
        'espanhol': 'Espanhol',
        'instrumental': 'Instrumental',
      };
      item.language = languageMap[item.language] || item.language || '';
      
      // Map AI generation type
      const aiTypeMap: Record<string, string> = {
        'total': 'Total',
        'partial': 'Parcial',
      };
      item.ai_generation_type = aiTypeMap[item.ai_generation_type] || item.ai_generation_type || '';
    }
    
    // Format participants for phonograms
    if (entityType === 'phonograms') {
      // Get linked work info
      item.work_abramus_code = item.work_abramus_code || '';
      item.work_title = item.work_title || '';
      
      // Add artist name from artistsMap
      if (artistsMap && item.artist_id && artistsMap[item.artist_id]) {
        item.artist_name = artistsMap[item.artist_id];
      }
      
      // Format duration as m:ss
      if (item.duration && typeof item.duration === 'number') {
        const minutes = Math.floor(item.duration / 60);
        const seconds = item.duration % 60;
        item.duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
      
      // Format boolean fields
      item.is_instrumental = item.language === 'instrumental' || item.is_instrumental ? 'Sim' : 'Não';
      item.is_ai_created = item.is_ai_created ? 'Sim' : 'Não';
      item.is_national = item.is_national ? 'Sim' : 'Não';
      item.simultaneous_publication = item.simultaneous_publication ? 'Sim' : 'Não';
      
      // Map classification/version_type
      item.classification = item.version_type || item.classification || '';
      
      // Map aggregator/label
      item.aggregator = item.label || item.aggregator || '';
      
      // Map country codes
      const countryMap: Record<string, string> = {
        'brazil': 'Brasil',
        'usa': 'EUA',
        'uk': 'Reino Unido',
        'other': 'Outro',
      };
      item.origin_country = countryMap[item.origin_country] || item.origin_country || '';
      item.publication_country = countryMap[item.publication_country] || item.publication_country || '';
      
      // Format participants by role
      const participants = Array.isArray(item.participants) ? item.participants : [];
      
      // Produtores Fonográficos
      const producers = participants.filter((p: any) => p.role === 'produtor_fonografico');
      item.producers_formatted = producers.map((p: any) => {
        const parts = [];
        if (p.name) parts.push(p.name);
        if (p.percentage) parts.push(`${p.percentage}%`);
        return parts.join(' ');
      }).join('; ') || '';
      
      // Intérpretes
      const interpreters = participants.filter((p: any) => p.role === 'interprete');
      item.interpreters_formatted = interpreters.map((p: any) => {
        const parts = [];
        if (p.name) parts.push(p.name);
        if (p.percentage) parts.push(`${p.percentage}%`);
        return parts.join(' ');
      }).join('; ') || '';
      
      // Músicos Acompanhantes
      const musicians = participants.filter((p: any) => p.role === 'musico' || p.role === 'musico_acompanhante');
      item.musicians_formatted = musicians.map((p: any) => {
        const parts = [];
        if (p.name) parts.push(p.name);
        if (p.percentage) parts.push(`${p.percentage}%`);
        return parts.join(' ');
      }).join('; ') || '';
    }

    // Format releases data
    if (entityType === 'releases') {
      // Format distributors as platforms
      if (item.distributors && Array.isArray(item.distributors)) {
        const platformMap: Record<string, string> = {
          'onerpm': 'ONErpm',
          'distrokid': 'DistroKid',
          '30por1': '30por1',
          'outras_distribuidoras': 'Outras',
        };
        item.distributors = item.distributors.map((d: string) => platformMap[d] || d).join(', ');
      }
      
      // Add artist name from artistsMap
      if (artistsMap && item.artist_id && artistsMap[item.artist_id]) {
        item.artist_name = artistsMap[item.artist_id];
      }
      
      // Format additional images
      if (item.additional_images && Array.isArray(item.additional_images)) {
        item.additional_images = item.additional_images.join(', ');
      } else {
        item.additional_images = '';
      }
      
      // Format tracks with all fields from form
      if (item.tracks && Array.isArray(item.tracks)) {
        item.tracks_formatted = item.tracks.map((track: any, index: number) => {
          const parts = [];
          parts.push(`${index + 1}. ${track.title || 'Sem título'}`);
          if (track.artist) parts.push(`Artista: ${track.artist}`);
          if (track.isrc) parts.push(`ISRC: ${track.isrc}`);
          if (track.composers?.length) parts.push(`Compositores: ${track.composers.join(', ')}`);
          if (track.performers?.length) parts.push(`Intérpretes: ${track.performers.join(', ')}`);
          if (track.producers?.length) parts.push(`Produtores: ${track.producers.join(', ')}`);
          if (track.audio_file) parts.push(`Arquivo de Áudio: ${track.audio_file}`);
          if (track.lyrics) parts.push(`Letra: ${track.lyrics.substring(0, 100)}${track.lyrics.length > 100 ? '...' : ''}`);
          return parts.join(' | ');
        }).join('\n') || '';
      } else {
        item.tracks_formatted = '';
      }
      
      // Map status to Portuguese
      const statusMap: Record<string, string> = {
        'planning': 'Em Análise',
        'em_analise': 'Em Análise',
        'released': 'Aprovado',
        'aprovado': 'Aprovado',
        'cancelled': 'Rejeitado',
        'rejeitado': 'Rejeitado',
        'paused': 'Pausado',
        'pausado': 'Pausado',
      };
      item.status = statusMap[item.status] || item.status;
      
      // Map release type to Portuguese
      const typeMap: Record<string, string> = {
        'single': 'Single',
        'ep': 'EP',
        'album': 'Álbum',
      };
      item.release_type = typeMap[item.release_type || item.type] || item.release_type || item.type || '';
      
      // Map language to Portuguese
      const langMap: Record<string, string> = {
        'portugues': 'Português',
        'ingles': 'Inglês',
        'espanhol': 'Espanhol',
        'instrumental': 'Instrumental',
      };
      item.language = langMap[item.language] || item.language || '';
    }
    
    // Format contracts data
    if (entityType === 'contracts') {
      // Add artist name from related data or artistsMap
      if (item.artists?.name || item.artists?.name) {
        item.artist_name = item.artists.name || item.artists.name;
      } else if (artistsMap && item.artist_id && artistsMap[item.artist_id]) {
        item.artist_name = artistsMap[item.artist_id];
      }
      
      // Format contractor contact name (from crm_contacts if available)
      item.contractor_contact_name = item.contractor_contact_name || '';
      
      // Format boolean fields
      item.registry_office = item.registry_office ? 'Sim' : 'Não';
      
      // Map client_type to Portuguese
      const clientTypeMap: Record<string, string> = {
        'artista': 'Artista',
        'empresa': 'Empresa',
        'pessoa': 'Pessoa',
      };
      item.client_type = clientTypeMap[item.client_type] || item.client_type || '';
      
      // Map service_type to Portuguese
      const serviceTypeMap: Record<string, string> = {
        'empresariamento': 'Empresariamento',
        'empresariamento_suporte': 'Empresariamento com suporte',
        'gestao': 'Gestão',
        'agenciamento': 'Agenciamento',
        'edicao': 'Edição',
        'distribuicao': 'Distribuição',
        'marketing': 'Marketing',
        'producao_musical': 'Produção Musical',
        'producao_audiovisual': 'Produção Audiovisual',
        'licenciamento': 'Licenciamento',
        'publicidade': 'Publicidade',
        'parceria': 'Parceria',
        'shows': 'Shows',
        'outros': 'Outros',
      };
      item.service_type = serviceTypeMap[item.service_type] || item.service_type || '';
      
      // Map status to Portuguese
      const contractStatusMap: Record<string, string> = {
        'pendente': 'Pendente',
        'assinado': 'Assinado',
        'expirado': 'Expirado',
        'rescindido': 'Rescindido',
        'rascunho': 'Rascunho',
      };
      item.status = contractStatusMap[item.status] || item.status || '';
      
      // Map payment_type to Portuguese
      const paymentTypeMap: Record<string, string> = {
        'valor_fixo': 'Valor Fixo',
        'royalties': 'Royalties',
      };
      item.payment_type = paymentTypeMap[item.payment_type] || item.payment_type || '';
    }

    Object.entries(columns).forEach(([key, label]) => {
      if (item[key] !== undefined) {
        transformed[label] = formatValue(item[key], key, entityType);
      } else {
        transformed[label] = '';
      }
    });
    
    return transformed;
  });
};

// Apply cell styling for ALL columns based on status
const applyStatusColoring = (worksheet: XLSX.WorkSheet, data: any[]): void => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  
  // Find status column index to get the status value
  let statusColumnIndex = -1;
  headers.forEach((header, index) => {
    if (statusColumns.includes(header)) {
      statusColumnIndex = index;
    }
  });
  
  if (statusColumnIndex === -1) return;
  
  // Apply styling to ALL cells in each row based on status
  data.forEach((row, rowIndex) => {
    const statusHeader = headers[statusColumnIndex];
    const statusValue = row[statusHeader];
    const color = getStatusColor(String(statusValue));
    
    if (color) {
      // Apply color to ALL columns in this row
      headers.forEach((_, colIndex) => {
        const cellAddress = XLSX.utils.encode_cell({ r: rowIndex + 1, c: colIndex }); // +1 for header row
        
        if (!worksheet[cellAddress]) {
          worksheet[cellAddress] = { v: row[headers[colIndex]] || '' };
        }
        
        worksheet[cellAddress].s = {
          fill: {
            patternType: 'solid',
            fgColor: { rgb: color.bgColor },
            bgColor: { rgb: color.bgColor },
          },
          font: {
            color: { rgb: color.fgColor },
            bold: colIndex === statusColumnIndex, // Bold only the status column
          },
          alignment: {
            horizontal: 'center',
            vertical: 'center',
          },
        };
      });
    }
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
    
    // Export no navegador (evita fs.writeFileSync)
    const fileName = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
    const workbookArray = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      cellStyles: true,
    });

    const blob = new Blob([workbookArray], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

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
