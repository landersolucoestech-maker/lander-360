// Manual categorization rules based on keywords

export interface CategorizationRule {
  keywords: string[];
  category: string;
  type: 'receitas' | 'despesas' | 'investimentos';
}

export const categorizationRules: CategorizationRule[] = [
  // Receitas - Streaming/Distribuidoras
  { keywords: ['spotify', 'apple music', 'deezer', 'amazon music', 'youtube music', 'tidal'], category: 'streaming', type: 'receitas' },
  { keywords: ['onerpm', 'one rpm', '1rpm'], category: 'onerpm', type: 'receitas' },
  { keywords: ['distrokid'], category: 'distrokid', type: 'receitas' },
  { keywords: ['30por1', '30 por 1'], category: '30por1', type: 'receitas' },
  { keywords: ['believe'], category: 'believe', type: 'receitas' },
  { keywords: ['tunecore'], category: 'tunecore', type: 'receitas' },
  { keywords: ['cd baby', 'cdbaby'], category: 'cd_baby', type: 'receitas' },
  
  // Receitas - Outros
  { keywords: ['show', 'apresentacao', 'apresentação', 'palco', 'festival', 'evento musical'], category: 'shows', type: 'receitas' },
  { keywords: ['licenciamento', 'licenca', 'licença', 'sync', 'sincronização'], category: 'licenciamento', type: 'receitas' },
  { keywords: ['merchandising', 'merch', 'camiseta', 'produto'], category: 'merchandising', type: 'receitas' },
  { keywords: ['publicidade', 'propaganda', 'campanha', 'anuncio', 'anúncio'], category: 'publicidade', type: 'receitas' },
  { keywords: ['producao', 'produção', 'produtor'], category: 'producao', type: 'receitas' },
  
  // Despesas
  { keywords: ['cache', 'cachê', 'pagamento artista'], category: 'caches', type: 'despesas' },
  { keywords: ['marketing', 'ads', 'facebook ads', 'google ads', 'instagram ads', 'tiktok ads'], category: 'marketing', type: 'despesas' },
  { keywords: ['salario', 'salário', 'folha', 'funcionario', 'funcionário', 'holerite'], category: 'salarios', type: 'despesas' },
  { keywords: ['aluguel', 'locacao', 'locação', 'rent'], category: 'aluguel', type: 'despesas' },
  { keywords: ['manutencao', 'manutenção', 'reparo', 'conserto'], category: 'manutencao', type: 'despesas' },
  { keywords: ['viagem', 'passagem', 'hotel', 'hospedagem', 'uber', '99', 'combustivel', 'combustível'], category: 'viagens', type: 'despesas' },
  { keywords: ['juridico', 'jurídico', 'advogado', 'advocacia', 'contrato legal'], category: 'juridicos', type: 'despesas' },
  { keywords: ['contador', 'contabilidade', 'contabil', 'contábil'], category: 'contabilidade', type: 'despesas' },
  { keywords: ['estudio', 'estúdio', 'gravacao', 'gravação', 'mixagem', 'masterizacao', 'masterização'], category: 'estudio', type: 'despesas' },
  { keywords: ['equipamento', 'instrumento', 'microfone', 'interface', 'cabo', 'fone'], category: 'equipamentos', type: 'despesas' },
  { keywords: ['registro', 'ecad', 'abramus', 'ubc', 'sicam'], category: 'registros', type: 'despesas' },
  { keywords: ['licenca software', 'licença software', 'plugin', 'vst', 'assinatura'], category: 'licencas', type: 'despesas' },
  { keywords: ['luz', 'energia', 'agua', 'água', 'internet', 'telefone', 'celular'], category: 'infraestrutura', type: 'despesas' },
  
  // Investimentos
  { keywords: ['clipe', 'videoclipe', 'video', 'vídeo', 'filmagem'], category: 'clipes', type: 'investimentos' },
  { keywords: ['turne', 'turnê', 'tour'], category: 'turnê', type: 'investimentos' },
  { keywords: ['curso', 'capacitacao', 'capacitação', 'treinamento', 'workshop'], category: 'capacitacao', type: 'investimentos' },
];

// Load custom rules from localStorage
function getCustomRules(): CategorizationRule[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('customCategorizationRules');
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function categorizeByRules(description: string): { category: string; type: 'receitas' | 'despesas' | 'investimentos' } | null {
  const lowerDesc = description.toLowerCase();
  
  // Check custom rules first (higher priority)
  const customRules = getCustomRules();
  for (const rule of customRules) {
    for (const keyword of rule.keywords) {
      if (lowerDesc.includes(keyword.toLowerCase())) {
        return { category: rule.category, type: rule.type };
      }
    }
  }
  
  // Then check built-in rules
  for (const rule of categorizationRules) {
    for (const keyword of rule.keywords) {
      if (lowerDesc.includes(keyword.toLowerCase())) {
        return { category: rule.category, type: rule.type };
      }
    }
  }
  
  return null;
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    // Receitas
    streaming: 'Streaming',
    onerpm: 'ONErpm',
    distrokid: 'DistroKid',
    '30por1': '30por1',
    believe: 'Believe',
    tunecore: 'TuneCore',
    cd_baby: 'CD Baby',
    shows: 'Shows',
    licenciamento: 'Licenciamento',
    merchandising: 'Merchandising',
    publicidade: 'Publicidade',
    producao: 'Produção',
    distribuicao: 'Distribuição',
    gestao: 'Gestão',
    // Despesas
    caches: 'Cachês',
    comissao: 'Comissão',
    marketing: 'Marketing',
    salarios: 'Salários',
    aluguel: 'Aluguel',
    manutencao: 'Manutenção',
    viagens: 'Viagens',
    juridicos: 'Jurídicos',
    contabilidade: 'Contabilidade',
    estudio: 'Estúdio',
    equipamentos: 'Equipamentos',
    registros: 'Registros',
    licencas: 'Licenças',
    infraestrutura: 'Infraestrutura',
    servicos: 'Serviços',
    equipe: 'Equipe',
    produtores: 'Produtores',
    // Investimentos
    clipes: 'Clipes',
    'turnê': 'Turnê',
    capacitacao: 'Capacitação',
    producao_musical: 'Produção Musical',
    marketing_digital: 'Marketing Digital',
    // Outros
    outros: 'Outros',
  };
  
  return labels[category] || category;
}
