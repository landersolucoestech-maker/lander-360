import { useMemo } from 'react';
import { useArtists } from '@/hooks/useArtists';
import { useProjects } from '@/hooks/useProjects';
import { useMusicRegistry } from '@/hooks/useMusicRegistry';
import { usePhonograms } from '@/hooks/usePhonograms';
import { useReleases } from '@/hooks/useReleases';
import { useContracts } from '@/hooks/useContracts';
import { useFinancialTransactions } from '@/hooks/useFinancial';
import { useAgenda } from '@/hooks/useAgenda';
import { useInventory } from '@/hooks/useInventory';
import { useCrmContacts } from '@/hooks/useCrm';
import { useServices } from '@/hooks/useServices';

export interface AuditItem {
  id: string;
  name: string;
  missingFields: string[];
  data: any;
}

export const useAuditData = () => {
  const { data: artists = [] } = useArtists();
  const { data: projects = [] } = useProjects();
  const { data: musicRegistry = [] } = useMusicRegistry();
  const { data: phonograms = [] } = usePhonograms();
  const { data: releases = [] } = useReleases();
  const { data: contracts = [] } = useContracts();
  const { data: transactions = [] } = useFinancialTransactions();
  const { data: agenda = [] } = useAgenda();
  const { data: inventory = [] } = useInventory();
  const { data: contacts = [] } = useCrmContacts();
  const { data: services = [] } = useServices();

  // Artists audit - Note: sensitive data (cpf_cnpj, rg, full_address, bank details) moved to artist_sensitive_data table
  const artistsAudit = useMemo<AuditItem[]>(() => {
    return artists.map(artist => {
      const missingFields: string[] = [];
      if (!artist.full_name) missingFields.push("Nome Completo");
      if (!artist.name) missingFields.push("Nome Artístico");
      if (!artist.birth_date) missingFields.push("Data de Nascimento");
      if (!artist.email) missingFields.push("E-mail");
      if (!artist.phone) missingFields.push("Telefone");
      if (!artist.spotify_url) missingFields.push("Spotify");
      if (!artist.instagram_url) missingFields.push("Instagram");
      if (!artist.youtube_url) missingFields.push("YouTube");
      if (!artist.tiktok) missingFields.push("TikTok");
      if (!artist.soundcloud) missingFields.push("SoundCloud");
      if (!artist.genre) missingFields.push("Gênero Musical");
      if (!artist.profile_type) missingFields.push("Tipo de Perfil");
      if (!artist.bio) missingFields.push("Biografia");
      if (!artist.distributors || artist.distributors.length === 0) missingFields.push("Distribuidores");
      if (artist.profile_type === 'com_empresario' || artist.profile_type === 'gravadora' || artist.profile_type === 'editora') {
        if (!artist.manager_name) missingFields.push("Nome do Empresário/Responsável");
        if (!artist.manager_phone) missingFields.push("Telefone do Empresário/Responsável");
        if (!artist.manager_email) missingFields.push("E-mail do Empresário/Responsável");
      }
      return { id: artist.id, name: artist.name, missingFields, data: artist };
    });
  }, [artists]);

  // Projects audit
  const projectsAudit = useMemo<AuditItem[]>(() => {
    return projects.map(project => {
      const missingFields: string[] = [];
      if (!project.name) missingFields.push("Nome do Projeto");
      if (!project.artist_id) missingFields.push("Artista");
      if (!project.description) missingFields.push("Descrição");
      if (!project.start_date) missingFields.push("Data de Início");
      if (!project.end_date) missingFields.push("Data de Término");
      if (!project.status) missingFields.push("Status");
      if (!project.budget) missingFields.push("Orçamento");
      const audioFiles = project.audio_files as any[];
      if (!audioFiles || audioFiles.length === 0) missingFields.push("Arquivos de Áudio/Músicas");
      return { id: project.id, name: project.name, missingFields, data: project };
    });
  }, [projects]);

  // Music registry audit
  const musicAudit = useMemo<AuditItem[]>(() => {
    return musicRegistry.map(music => {
      const missingFields: string[] = [];
      if (!music.title) missingFields.push("Título");
      if (!music.artist_id) missingFields.push("Artista");
      if (!music.isrc) missingFields.push("ISRC");
      if (!music.iswc) missingFields.push("ISWC");
      if (!music.abramus_code) missingFields.push("Código ABRAMUS");
      if (!music.ecad_code) missingFields.push("Código ECAD");
      if (!music.genre) missingFields.push("Gênero");
      if (!music.duration) missingFields.push("Duração");
      if (!music.release_date) missingFields.push("Data de Lançamento");
      const participants = music.participants as any[];
      if (!participants || participants.length === 0) missingFields.push("Participantes");
      if (!music.writers || music.writers.length === 0) missingFields.push("Compositores");
      if (!music.publishers || music.publishers.length === 0) missingFields.push("Editoras");
      return { id: music.id, name: music.title, missingFields, data: music };
    });
  }, [musicRegistry]);

  // Phonograms audit
  const phonogramsAudit = useMemo<AuditItem[]>(() => {
    return phonograms.map(phono => {
      const missingFields: string[] = [];
      if (!phono.title) missingFields.push("Título");
      if (!phono.artist_id) missingFields.push("Artista");
      if (!phono.work_id) missingFields.push("Obra Vinculada");
      if (!phono.isrc) missingFields.push("ISRC");
      if (!phono.genre) missingFields.push("Gênero");
      if (!phono.duration) missingFields.push("Duração");
      if (!phono.recording_date) missingFields.push("Data de Gravação");
      if (!phono.recording_studio) missingFields.push("Estúdio");
      if (!phono.recording_location) missingFields.push("Local de Gravação");
      if (!phono.master_owner) missingFields.push("Proprietário do Master");
      if (!phono.label) missingFields.push("Gravadora");
      const participants = phono.participants as any[];
      if (!participants || participants.length === 0) missingFields.push("Participantes");
      return { id: phono.id, name: phono.title, missingFields, data: phono };
    });
  }, [phonograms]);

  // Releases audit
  const releasesAudit = useMemo<AuditItem[]>(() => {
    return releases.map(release => {
      const missingFields: string[] = [];
      if (!release.title) missingFields.push("Título");
      if (!release.artist_id) missingFields.push("Artista");
      if (!release.release_type && !release.type) missingFields.push("Tipo de Lançamento");
      if (!release.release_date) missingFields.push("Data de Lançamento");
      if (!release.cover_url) missingFields.push("Capa");
      if (!release.genre) missingFields.push("Gênero");
      if (!release.language) missingFields.push("Idioma");
      if (!release.label) missingFields.push("Gravadora");
      if (!release.copyright) missingFields.push("Copyright");
      if (!release.distributors || release.distributors.length === 0) missingFields.push("Distribuidores");
      const tracks = release.tracks as any[];
      if (!tracks || tracks.length === 0) missingFields.push("Faixas");
      return { id: release.id, name: release.title, missingFields, data: release };
    });
  }, [releases]);

  // Contracts audit
  const contractsAudit = useMemo<AuditItem[]>(() => {
    return contracts.map(contract => {
      const missingFields: string[] = [];
      if (!contract.title) missingFields.push("Título");
      if (!contract.artist_id) missingFields.push("Artista");
      if (!contract.contract_type) missingFields.push("Tipo de Contrato");
      if (!contract.start_date) missingFields.push("Data de Início");
      if (!contract.end_date) missingFields.push("Data de Término");
      if (!contract.status) missingFields.push("Status");
      if (!contract.value && !contract.royalty_rate && !contract.royalties_percentage) missingFields.push("Valor/Royalties");
      if (!contract.document_url) missingFields.push("Documento");
      if (!contract.terms) missingFields.push("Termos");
      return { id: contract.id, name: contract.title, missingFields, data: contract };
    });
  }, [contracts]);

  // Financial audit
  const financialAudit = useMemo<AuditItem[]>(() => {
    return transactions.map(transaction => {
      const missingFields: string[] = [];
      if (!transaction.description) missingFields.push("Descrição");
      if (!transaction.amount) missingFields.push("Valor");
      if (!transaction.type) missingFields.push("Tipo");
      if (!transaction.date) missingFields.push("Data");
      if (!transaction.category) missingFields.push("Categoria");
      if (!transaction.status) missingFields.push("Status");
      if (!transaction.payment_method) missingFields.push("Método de Pagamento");
      return { id: transaction.id, name: transaction.description, missingFields, data: transaction };
    });
  }, [transactions]);

  // Agenda audit
  const agendaAudit = useMemo<AuditItem[]>(() => {
    return agenda.map(event => {
      const missingFields: string[] = [];
      if (!event.title) missingFields.push("Título");
      if (!event.start_date) missingFields.push("Data de Início");
      if (!event.start_time) missingFields.push("Horário de Início");
      if (!event.event_type) missingFields.push("Tipo de Evento");
      if (!event.location) missingFields.push("Local");
      if (!event.description) missingFields.push("Descrição");
      if (!event.artist_id) missingFields.push("Artista Vinculado");
      if (!event.venue_name) missingFields.push("Nome do Local");
      if (!event.venue_address) missingFields.push("Endereço do Local");
      return { id: event.id, name: event.title, missingFields, data: event };
    });
  }, [agenda]);

  // Inventory audit
  const inventoryAudit = useMemo<AuditItem[]>(() => {
    return inventory.map(item => {
      const missingFields: string[] = [];
      if (!item.name) missingFields.push("Nome");
      if (!item.description) missingFields.push("Descrição");
      if (!item.category) missingFields.push("Categoria");
      if (!item.quantity && item.quantity !== 0) missingFields.push("Quantidade");
      if (!item.location) missingFields.push("Localização");
      if (!item.status) missingFields.push("Status");
      if (!item.sector) missingFields.push("Setor");
      if (!item.responsible) missingFields.push("Responsável");
      if (!item.unit_value) missingFields.push("Valor Unitário");
      if (!item.entry_date) missingFields.push("Data de Entrada");
      return { id: item.id, name: item.name, missingFields, data: item };
    });
  }, [inventory]);

  // CRM audit
  const crmAudit = useMemo<AuditItem[]>(() => {
    return contacts.map(contact => {
      const missingFields: string[] = [];
      if (!contact.name) missingFields.push("Nome");
      if (!contact.email) missingFields.push("E-mail");
      if (!contact.phone) missingFields.push("Telefone");
      if (!contact.contact_type) missingFields.push("Tipo de Contato");
      if (!contact.company) missingFields.push("Empresa");
      if (!contact.position) missingFields.push("Cargo");
      if (!contact.address) missingFields.push("Endereço");
      if (!contact.city) missingFields.push("Cidade");
      if (!contact.state) missingFields.push("Estado");
      if (!contact.document) missingFields.push("Documento");
      if (!contact.status) missingFields.push("Status");
      return { id: contact.id, name: contact.name, missingFields, data: contact };
    });
  }, [contacts]);

  // Services audit
  const servicesAudit = useMemo<AuditItem[]>(() => {
    return services.map(service => {
      const missingFields: string[] = [];
      if (!service.name) missingFields.push("Nome");
      if (!service.description) missingFields.push("Descrição");
      if (!service.category) missingFields.push("Categoria");
      if (!service.service_type) missingFields.push("Tipo");
      if (!service.cost_price) missingFields.push("Valor de Custo");
      if (!service.sale_price) missingFields.push("Valor de Venda");
      if (!service.grupo) missingFields.push("Grupo");
      return { id: service.id, name: service.name, missingFields, data: service };
    });
  }, [services]);

  return {
    artists,
    projects,
    musicRegistry,
    phonograms,
    releases,
    contracts,
    transactions,
    agenda,
    inventory,
    contacts,
    services,
    artistsAudit,
    projectsAudit,
    musicAudit,
    phonogramsAudit,
    releasesAudit,
    contractsAudit,
    financialAudit,
    agendaAudit,
    inventoryAudit,
    crmAudit,
    servicesAudit,
  };
};
