/**
 * Utilitários para formatação de filtros de busca
 * Remove caracteres técnicos e formata nomes amigáveis
 */

/**
 * Converte string técnica para nome amigável
 * Ex: "producao_musical" -> "Produção Musical"
 */
export function formatFilterLabel(value: string): string {
  if (!value) return '';
  
  // Mapeamento de termos específicos para melhor exibição
  const specialMappings: Record<string, string> = {
    // Tipos de contrato
    'empresariamento': 'Empresariamento',
    'empresariamento_suporte': 'Empresariamento Suporte',
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
    
    // Tipos de cliente
    'artista': 'Artista',
    'empresa': 'Empresa',
    'pessoa': 'Pessoa',
    
    // Status de contrato
    'pendente': 'Pendente',
    'assinado': 'Assinado',
    'expirado': 'Expirado',
    'rescindido': 'Rescindido',
    'rascunho': 'Rascunho',
    'ativo': 'Ativo',
    'active': 'Ativo',
    
    // Status de obras/fonogramas
    'registrado': 'Registrado',
    'em_analise': 'Em Análise',
    'aprovado': 'Aprovado',
    'rejeitado': 'Rejeitado',
    
    // Categorias financeiras
    'receita': 'Receita',
    'despesa': 'Despesa',
    'royalties': 'Royalties',
    'adiantamento': 'Adiantamento',
    'cachê': 'Cachê',
    'cache': 'Cachê',
    'producao': 'Produção',
    'equipamentos': 'Equipamentos',
    'viagem': 'Viagem',
    'hospedagem': 'Hospedagem',
    'alimentacao': 'Alimentação',
    'transporte': 'Transporte',
    'marketing_digital': 'Marketing Digital',
    'assessoria': 'Assessoria',
    'estudio': 'Estúdio',
    'mixagem': 'Mixagem',
    'masterizacao': 'Masterização',
    'distribuicao_digital': 'Distribuição Digital',
    
    // Tipos de compromisso/agenda
    'sessoes_estudio': 'Sessões de Estúdio',
    'shows': 'Shows',
    'sessoes_fotos': 'Sessões de Fotos',
    'podcasts': 'Podcasts',
    'reunioes': 'Reuniões',
    'viagens': 'Viagens',
    'entrevistas': 'Entrevistas',
    'gravacao': 'Gravação',
    'ensaio': 'Ensaio',
    'evento': 'Evento',
    'promocional': 'Promocional',
    
    // Tipos de nota fiscal
    'nfe': 'NF-e (Nota Fiscal Eletrônica)',
    'nfse': 'NFS-e (Nota Fiscal de Serviço)',
    'nfce': 'NFC-e (Nota Fiscal Consumidor)',
    'entrada': 'Entrada',
    'saida': 'Saída',
    
    // Setores
    'producao': 'Produção',
    'administrativo': 'Administrativo',
    'financeiro': 'Financeiro',
    'comercial': 'Comercial',
    'tecnico': 'Técnico',
    'artistico': 'Artístico',
    'eventos': 'Eventos',
    'juridico': 'Jurídico',
    'rh': 'Recursos Humanos',
    'ti': 'TI',
    
    // Locais de inventário
    'escritorio': 'Escritório',
    'estudio_a': 'Estúdio A',
    'estudio_b': 'Estúdio B',
    'deposito': 'Depósito',
    'externo': 'Externo',
  };
  
  // Verificar mapeamento especial primeiro
  const lowerValue = value.toLowerCase();
  if (specialMappings[lowerValue]) {
    return specialMappings[lowerValue];
  }
  
  // Formatação genérica: remove _ e capitaliza cada palavra
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
    .trim();
}

/**
 * Ordena array de opções alfabeticamente pelo label
 */
export function sortOptionsAlphabetically<T extends { label: string }>(options: T[]): T[] {
  return [...options].sort((a, b) => 
    a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' })
  );
}

/**
 * Ordena array de strings alfabeticamente
 */
export function sortStringsAlphabetically(items: string[]): string[] {
  return [...items].sort((a, b) => 
    a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })
  );
}

/**
 * Cria opções de filtro a partir de valores únicos
 */
export function createFilterOptions(values: (string | null | undefined)[]): { value: string; label: string }[] {
  const uniqueValues = [...new Set(values.filter(Boolean))] as string[];
  const options = uniqueValues.map(value => ({
    value,
    label: formatFilterLabel(value)
  }));
  return sortOptionsAlphabetically(options);
}

/**
 * Remove itens específicos de um array de opções
 */
export function excludeOptions<T extends { value: string }>(options: T[], excludeValues: string[]): T[] {
  return options.filter(opt => !excludeValues.includes(opt.value.toLowerCase()));
}
