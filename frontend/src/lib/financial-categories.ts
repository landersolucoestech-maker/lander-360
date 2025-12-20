// =====================================================
// CONSTANTES DE CATEGORIAS FINANCEIRAS
// =====================================================

// Subcategorias por categoria base
export const subcategoriesByCategory: Record<string, Record<string, string>> = {
  design_grafico: {
    capa_musical: 'Capa Musical',
    banner: 'Banner',
    logo: 'Logo',
    flyer: 'Flyer/Cartaz',
    thumb_youtube: 'Thumbnail YouTube',
    post_social: 'Post Redes Sociais',
    identidade_visual: 'Identidade Visual',
    outro: 'Outro'
  },
  marketing: {
    trafego_pago: 'Tráfego Pago',
    gestao_redes: 'Gestão de Redes',
    assessoria: 'Assessoria de Imprensa',
    influencer: 'Influenciador',
    campanha: 'Campanha',
    outro: 'Outro'
  },
  producao: {
    mix: 'Mixagem',
    master: 'Masterização',
    gravacao: 'Gravação',
    arranjo: 'Arranjo',
    beat: 'Beat/Instrumental',
    outro: 'Outro'
  },
  equipamentos: {
    pirotecnia: 'Pirotecnia',
    iluminacao: 'Iluminação',
    som: 'Equipamento de Som',
    instrumento: 'Instrumento Musical',
    acessorio: 'Acessório',
    outro: 'Outro'
  },
  shows: {
    cache: 'Cachê',
    transporte: 'Transporte',
    hospedagem: 'Hospedagem',
    alimentacao: 'Alimentação',
    estrutura: 'Estrutura',
    staff: 'Staff/Equipe',
    outro: 'Outro'
  },
  estudio: {
    aluguel_hora: 'Aluguel por Hora',
    diaria: 'Diária',
    pacote: 'Pacote',
    outro: 'Outro'
  },
  viagens: {
    passagem: 'Passagem Aérea',
    hospedagem: 'Hospedagem',
    transporte: 'Transporte Local',
    alimentacao: 'Alimentação',
    outro: 'Outro'
  },
  servicos: {
    consultoria: 'Consultoria',
    assessoria: 'Assessoria',
    fotografia: 'Fotografia',
    video: 'Vídeo/Clipe',
    edicao: 'Edição',
    outro: 'Outro'
  }
};

// =====================================================
// CATEGORIAS POR TIPO DE TRANSAÇÃO
// =====================================================

export const receitasCategories = {
  venda_musicas: 'Venda de Músicas',
  streaming: 'Streaming',
  shows: 'Shows',
  licenciamento: 'Licenciamento',
  merchandising: 'Merchandising',
  publicidade: 'Publicidade',
  producao: 'Produção',
  distribuicao: 'Distribuição',
  gestao: 'Gestão'
};

export const despesasCategories = {
  produtores: 'Produtores',
  caches: 'Cachês',
  comissao: 'Comissão',
  marketing: 'Marketing',
  design_grafico: 'Design Gráfico',
  equipe: 'Equipe',
  infraestrutura: 'Infraestrutura',
  registros: 'Registros',
  juridicos: 'Jurídicos',
  salarios: 'Salários',
  aluguel: 'Aluguel',
  manutencao: 'Manutenção',
  viagens: 'Viagens',
  licencas: 'Licenças',
  contabilidade: 'Contabilidade',
  estudio: 'Estúdio',
  equipamentos: 'Equipamentos',
  servicos: 'Serviços'
};

export const investimentosCategories = {
  producao_musical: 'Produção Musical',
  marketing_digital: 'Marketing Digital',
  equipamentos: 'Equipamentos',
  estudio: 'Estúdio',
  clipes: 'Clipes/Vídeos',
  turnê: 'Turnê',
  capacitacao: 'Capacitação'
};

export const impostosCategories = {
  irpj: 'IRPJ',
  csll: 'CSLL',
  pis: 'PIS',
  cofins: 'COFINS',
  iss: 'ISS',
  icms: 'ICMS',
  inss: 'INSS',
  fgts: 'FGTS',
  irrf: 'IRRF',
  simples: 'Simples Nacional',
  outros: 'Outros Impostos'
};

export const transferenciasCategories = {
  entre_contas: 'Entre Contas',
  para_artista: 'Para Artista',
  para_fornecedor: 'Para Fornecedor',
  recebimento: 'Recebimento',
  aplicacao: 'Aplicação',
  resgate: 'Resgate'
};

// =====================================================
// CATEGORIAS POR TIPO DE CLIENTE
// =====================================================

// Artista
export const artistaCategories = {
  caches: 'Cachês',
  suporte_financeiro: 'Suporte Financeiro'
};

// Empresa - Despesas
export const empresaDespesasCategories = {
  servicos: 'Serviços',
  produtos: 'Produtos',
  administrativo: 'Administrativo',
  marketing: 'Marketing',
  viagens: 'Viagens'
};

// Empresa - Receitas
export const empresaReceitasCategories = {
  receitas_musicais: 'Receitas Musicais',
  servicos: 'Serviços',
  produtos: 'Produtos',
  receitas_contratuais: 'Receitas Contratuais',
  receitas_internas: 'Receitas Internas'
};

// Pessoa - Despesas
export const pessoaDespesasCategories = {
  remuneracao: 'Remuneração',
  servicos_pf: 'Serviços Pessoa Física',
  reembolsos: 'Reembolsos',
  outros_pf: 'Outros'
};

// Pessoa - Receitas
export const pessoaReceitasCategories = {
  receitas_musicais: 'Receitas Musicais',
  servicos: 'Serviços',
  produtos: 'Produtos',
  receitas_contratuais: 'Receitas Contratuais',
  receitas_internas: 'Receitas Internas'
};

// Impostos - Empresa
export const impostosEmpresaCategories = {
  impostos_diretos: 'Impostos diretos',
  impostos_folha: 'Impostos sobre folha / pessoas',
  retencoes_fonte: 'Retenções na fonte (serviços)',
  taxas_contribuicoes: 'Taxas e contribuições'
};

// =====================================================
// SUBCATEGORIAS DE RECEITAS (EMPRESA)
// =====================================================

export const empresaReceitasMusicaisOptions = {
  participacao_show_evento: 'Participação em show / evento',
  venda_show_fechado: 'Venda de show fechado',
  direitos_autorais_ecad: 'Direitos autorais (ECAD)',
  direitos_conexos: 'Direitos conexos',
  royalties_streaming_dsps: 'Royalties de streaming (DSPs)',
  royalties_fonograficos: 'Royalties fonográficos',
  adiantamento_royalties: 'Adiantamento de royalties',
  licenciamento_obra: 'Licenciamento de obra',
  licenciamento_fonograma: 'Licenciamento de fonograma',
  sincronizacao: 'Sincronização (filme, série, publicidade, game)',
  venda_beats: 'Venda de beats'
};

export const empresaReceitasServicosOptions = {
  producao_musical: 'Produção musical',
  producao_audiovisual: 'Produção audiovisual',
  marketing_divulgacao: 'Marketing / divulgação',
  design_grafico: 'Design gráfico',
  criacao_site: 'Criação de site',
  gestao_redes_sociais: 'Gestão de redes sociais',
  trafego_pago: 'Tráfego pago',
  consultoria: 'Consultoria'
};

export const empresaReceitasProdutosOptions = {
  venda_merchandising: 'Venda de merchandising',
  venda_produtos_fisicos: 'Venda de produtos físicos',
  venda_produtos_digitais: 'Venda de produtos digitais',
  venda_nfts: 'Venda de NFTs / ativos digitais'
};

export const empresaReceitasContratuaisOptions = {
  repasse_contrato: 'Repasse de contrato',
  comissao: 'Comissão (%)',
  fee_administrativo: 'Fee administrativo',
  reembolso_recebido: 'Reembolso recebido',
  multa_contratual: 'Multa contratual',
  bonus_incentivo: 'Bônus / incentivo',
  patrocinio: 'Patrocínio',
  apoio_cultural: 'Apoio cultural / incentivo fiscal'
};

export const empresaReceitasInternasOptions = {
  aporte_investimento: 'Aporte / investimento',
  receita_recorrente: 'Receita recorrente (mensalidade, contrato fixo)',
  parceria_comercial: 'Parceria comercial',
  revenue_share: 'Revenue share'
};

// =====================================================
// SUBCATEGORIAS DE DESPESAS (EMPRESA)
// =====================================================

export const empresaServicosOptions = {
  design_grafico: 'Design gráfico',
  producao_audiovisual: 'Produção audiovisual (clipe, teaser, edição)',
  assessoria_juridica: 'Assessoria jurídica',
  contabil_fiscal: 'Contábil / fiscal',
  ti_desenvolvimento: 'TI / desenvolvimento / SaaS',
  fotografia_audiovisual: 'Fotografia / audiovisual avulso',
  licenciamento_obras: 'Licenciamento de obras',
  licenciamento_beat: 'Licenciamento de beat',
  sampling_clearance: 'Sampling / clearance',
  direitos_autorais: 'Direitos autorais (adiantamentos)'
};

export const empresaMarketingOptions = {
  marketing_pr_trafego: 'Marketing / PR / tráfego pago',
  anuncios: 'Anúncios (Meta, Google, TikTok)',
  brindes_promocionais: 'Brindes promocionais'
};

export const empresaProdutosOptions = {
  equipamentos: 'Equipamentos (áudio, vídeo, informática)',
  cenografia_palco: 'Cenografia / palco',
  pirotecnia_efeitos: 'Pirotecnia / efeitos',
  merchandising: 'Merchandising (camisas, bonés)'
};

export const empresaAdministrativoOptions = {
  aluguel: 'Aluguel',
  energia_agua_internet: 'Energia / água / internet',
  telefonia: 'Telefonia',
  correios_logistica: 'Correios / logística',
  taxas_bancarias: 'Taxas bancárias',
  impostos: 'Impostos',
  juros: 'Juros',
  multas: 'Multas',
  iof: 'IOF',
  tarifas_plataforma: 'Tarifas de plataforma'
};

export const empresaViagensOptions = {
  passagens: 'Passagens',
  hospedagem: 'Hospedagem',
  alimentacao: 'Alimentação',
  transporte: 'Transporte',
  locacao_equipamentos: 'Locação de equipamentos'
};

// =====================================================
// SUBCATEGORIAS DE IMPOSTOS (EMPRESA)
// =====================================================

export const impostosEmpresaDiretosOptions = {
  das_simples: 'DAS (Simples Nacional)',
  irpj: 'IRPJ',
  csll: 'CSLL',
  pis: 'PIS',
  cofins: 'COFINS',
  iss: 'ISS',
  icms: 'ICMS'
};

export const impostosEmpresaFolhaOptions = {
  inss_patronal: 'INSS Patronal',
  fgts: 'FGTS',
  irrf: 'IRRF (salários, pró-labore, serviços)'
};

export const impostosEmpresaRetencoesOptions = {
  iss_retido: 'ISS Retido',
  inss_retido: 'INSS Retido',
  pis_cofins_csll_retidos: 'PIS/COFINS/CSLL Retidos'
};

export const impostosEmpresaTaxasOptions = {
  taxas_municipais: 'Taxas municipais (alvará, licença)',
  taxas_estaduais: 'Taxas estaduais',
  taxas_federais: 'Taxas federais',
  multas_juros_fiscais: 'Multas e juros fiscais'
};

// =====================================================
// SUBCATEGORIAS DE RECEITAS (PESSOA)
// =====================================================

export const pessoaReceitasMusicaisOptions = {
  participacao_show_evento: 'Participação em show / evento',
  venda_show_fechado: 'Venda de show fechado',
  licenciamento_obra: 'Licenciamento de obra',
  licenciamento_fonograma: 'Licenciamento de fonograma',
  sincronizacao: 'Sincronização (filme, série, publicidade, game)',
  venda_beats: 'Venda de beats'
};

export const pessoaReceitasServicosOptions = {
  producao_musical: 'Produção musical',
  producao_audiovisual: 'Produção audiovisual',
  marketing_divulgacao: 'Marketing / divulgação',
  design_grafico: 'Design gráfico',
  criacao_site: 'Criação de site',
  gestao_redes_sociais: 'Gestão de redes sociais',
  trafego_pago: 'Tráfego pago',
  consultoria: 'Consultoria'
};

export const pessoaReceitasProdutosOptions = {
  venda_merchandising: 'Venda de merchandising',
  venda_produtos_fisicos: 'Venda de produtos físicos',
  venda_produtos_digitais: 'Venda de produtos digitais',
  venda_nfts: 'Venda de NFTs / ativos digitais'
};

export const pessoaReceitasContratuaisOptions = {
  repasse_contrato: 'Repasse de contrato',
  comissao: 'Comissão (%)',
  fee_administrativo: 'Fee administrativo',
  reembolso_recebido: 'Reembolso recebido',
  multa_contratual: 'Multa contratual',
  bonus_incentivo: 'Bônus / incentivo',
  patrocinio: 'Patrocínio',
  apoio_cultural: 'Apoio cultural / incentivo fiscal'
};

export const pessoaReceitasInternasOptions = {
  aporte_investimento: 'Aporte / investimento',
  receita_recorrente: 'Receita recorrente (mensalidade, contrato fixo)',
  parceria_comercial: 'Parceria comercial',
  revenue_share: 'Revenue share'
};

// =====================================================
// SUBCATEGORIAS DE DESPESAS (PESSOA)
// =====================================================

export const pessoaRemuneracaoOptions = {
  salario: 'Salário',
  pro_labore: 'Pró-labore',
  cache_artistico: 'Cachê artístico',
  pagamento_diaria: 'Pagamento por diária',
  hora_extra: 'Hora extra',
  comissao: 'Comissão',
  bonus_premiacao: 'Bônus / Premiação'
};

export const pessoaServicosPfOptions = {
  freelancer: 'Freelancer',
  prestador_autonomo: 'Prestador autônomo',
  consultoria: 'Consultoria',
  producao_pontual: 'Produção pontual',
  tecnica_operacional: 'Técnica / Operacional (som, luz, roadie, etc.)'
};

export const pessoaReembolsosOptions = {
  reembolso_transporte: 'Reembolso de transporte',
  reembolso_alimentacao: 'Reembolso de alimentação',
  reembolso_hospedagem: 'Reembolso de hospedagem',
  reembolso_materiais: 'Reembolso de materiais'
};

export const pessoaOutrosOptions = {
  ajuda_custo: 'Ajuda de custo',
  indenizacao: 'Indenização',
  multa_contratual: 'Multa contratual'
};

// =====================================================
// MÉTODOS DE PAGAMENTO
// =====================================================

export const paymentMethods = [
  { value: 'pix', label: 'Pix' },
  { value: 'ted', label: 'TED' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'cartao', label: 'Cartão' },
  { value: 'dinheiro', label: 'Dinheiro' },
];

export const paymentTypes = [
  { value: 'a_vista', label: 'À Vista' },
  { value: 'parcelado', label: 'Parcelado' },
];

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export type TransactionType = 'receitas' | 'despesas' | 'investimentos' | 'impostos' | 'transferencias';
export type ClientType = 'empresa' | 'artista' | 'pessoa';

/**
 * Retorna as categorias disponíveis baseado no tipo de transação e tipo de cliente
 */
export function getAvailableCategories(
  transactionType: TransactionType,
  clientType: ClientType
): Record<string, string> {
  if (clientType === 'artista') {
    return artistaCategories;
  }
  
  if (clientType === 'empresa') {
    if (transactionType === 'impostos') return impostosEmpresaCategories;
    if (transactionType === 'receitas') return empresaReceitasCategories;
    return empresaDespesasCategories;
  }
  
  if (clientType === 'pessoa') {
    if (transactionType === 'receitas') return pessoaReceitasCategories;
    return pessoaDespesasCategories;
  }
  
  // Fallback para categorias gerais
  switch (transactionType) {
    case 'receitas': return receitasCategories;
    case 'investimentos': return investimentosCategories;
    case 'impostos': return impostosCategories;
    case 'transferencias': return transferenciasCategories;
    default: return despesasCategories;
  }
}

/**
 * Retorna as opções de vinculação/tipo de serviço para empresa
 */
export function getEmpresaVinculacaoOptions(
  transactionType: TransactionType,
  category: string
): Record<string, string> | null {
  // Impostos
  if (transactionType === 'impostos') {
    switch (category) {
      case 'impostos_diretos': return impostosEmpresaDiretosOptions;
      case 'impostos_folha': return impostosEmpresaFolhaOptions;
      case 'retencoes_fonte': return impostosEmpresaRetencoesOptions;
      case 'taxas_contribuicoes': return impostosEmpresaTaxasOptions;
      default: return null;
    }
  }
  
  // Receitas
  if (transactionType === 'receitas') {
    switch (category) {
      case 'receitas_musicais': return empresaReceitasMusicaisOptions;
      case 'servicos': return empresaReceitasServicosOptions;
      case 'produtos': return empresaReceitasProdutosOptions;
      case 'receitas_contratuais': return empresaReceitasContratuaisOptions;
      case 'receitas_internas': return empresaReceitasInternasOptions;
      default: return null;
    }
  }
  
  // Despesas
  switch (category) {
    case 'servicos': return empresaServicosOptions;
    case 'marketing': return empresaMarketingOptions;
    case 'produtos': return empresaProdutosOptions;
    case 'administrativo': return empresaAdministrativoOptions;
    case 'viagens': return empresaViagensOptions;
    default: return null;
  }
}

/**
 * Retorna as opções de vinculação/tipo de serviço para pessoa
 */
export function getPessoaVinculacaoOptions(
  transactionType: TransactionType,
  category: string
): Record<string, string> | null {
  // Receitas
  if (transactionType === 'receitas') {
    switch (category) {
      case 'receitas_musicais': return pessoaReceitasMusicaisOptions;
      case 'servicos': return pessoaReceitasServicosOptions;
      case 'produtos': return pessoaReceitasProdutosOptions;
      case 'receitas_contratuais': return pessoaReceitasContratuaisOptions;
      case 'receitas_internas': return pessoaReceitasInternasOptions;
      default: return null;
    }
  }
  
  // Despesas
  switch (category) {
    case 'remuneracao': return pessoaRemuneracaoOptions;
    case 'servicos_pf': return pessoaServicosPfOptions;
    case 'reembolsos': return pessoaReembolsosOptions;
    case 'outros_pf': return pessoaOutrosOptions;
    default: return null;
  }
}
