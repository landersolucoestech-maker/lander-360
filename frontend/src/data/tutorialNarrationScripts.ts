// Tutorial Narration Scripts for each module
// These scripts will be converted to audio using TTS

// Import slide images
import slideDashboard from '@/assets/tutorial-slides/slide-dashboard.png';
import slideArtist from '@/assets/tutorial-slides/slide-artist.png';
import slideCopyright from '@/assets/tutorial-slides/slide-copyright.png';
import slideRelease from '@/assets/tutorial-slides/slide-release.png';
import slideFinancial from '@/assets/tutorial-slides/slide-financial.png';
import slideMarketing from '@/assets/tutorial-slides/slide-marketing.png';
import slideProject from '@/assets/tutorial-slides/slide-project.png';
import slideContract from '@/assets/tutorial-slides/slide-contract.png';

export interface TutorialNarrationScript {
  tutorialId: string;
  title: string;
  narrationText: string;
  slides: TutorialSlide[];
}

export interface TutorialSlide {
  id: string;
  title: string;
  description: string;
  imageUrl?: string; // Can be populated by admin
  narrationText: string;
}

export const TUTORIAL_NARRATION_SCRIPTS: TutorialNarrationScript[] = [
  {
    tutorialId: 'start-hub',
    title: 'StartHub - Primeiros Passos',
    narrationText: 'Bem-vindo ao Lander 360! Neste tutorial, você vai aprender a configurar sua conta e dar os primeiros passos na plataforma.',
    slides: [
      {
        id: 'sh-slide-1',
        title: 'Bem-vindo ao Lander 360',
        description: 'Sua plataforma completa de gestão musical.',
        imageUrl: slideDashboard,
        narrationText: 'O Lander 360 é uma plataforma completa de gestão musical, desenvolvida para gravadoras, editoras, produtoras e artistas independentes. Aqui você vai encontrar todas as ferramentas necessárias para gerenciar sua carreira ou seu catálogo musical.'
      },
      {
        id: 'sh-slide-2',
        title: 'Configurando seu Perfil',
        description: 'Personalize suas informações e preferências.',
        imageUrl: slideArtist,
        narrationText: 'O primeiro passo é configurar seu perfil. Acesse o menu de configurações e preencha suas informações pessoais, foto de perfil e preferências do sistema. Isso vai personalizar sua experiência na plataforma.'
      },
      {
        id: 'sh-slide-3',
        title: 'Navegação Principal',
        description: 'Conheça o menu lateral e os módulos disponíveis.',
        imageUrl: slideDashboard,
        narrationText: 'O menu lateral é sua central de navegação. Aqui você encontra todos os módulos organizados por categoria: Catálogo, Operações, Financeiro, Marketing e Configurações. Clique em qualquer item para acessar suas funcionalidades.'
      },
      {
        id: 'sh-slide-4',
        title: 'Dashboard',
        description: 'Visão geral das suas operações.',
        imageUrl: slideDashboard,
        narrationText: 'O Dashboard é sua página inicial. Ele mostra métricas importantes, atividades recentes e atalhos para ações rápidas. Use-o para ter uma visão geral de tudo que está acontecendo.'
      }
    ]
  },
  {
    tutorialId: 'control-tower',
    title: 'Control Tower - Dashboard',
    narrationText: 'Aprenda a usar o Dashboard para monitorar todas as suas operações em tempo real.',
    slides: [
      {
        id: 'ct-slide-1',
        title: 'Visão Geral do Dashboard',
        description: 'Métricas e indicadores em tempo real.',
        imageUrl: slideDashboard,
        narrationText: 'O Dashboard do Lander 360 é seu centro de comando. Aqui você visualiza métricas financeiras, status de projetos, lançamentos recentes e alertas importantes, tudo em um só lugar.'
      },
      {
        id: 'ct-slide-2',
        title: 'Cards de Métricas',
        description: 'Entenda os principais indicadores.',
        imageUrl: slideDashboard,
        narrationText: 'Os cards na parte superior mostram seus principais indicadores: receita total, despesas, número de artistas ativos e projetos em andamento. Esses números são atualizados automaticamente.'
      },
      {
        id: 'ct-slide-3',
        title: 'Gráficos de Performance',
        description: 'Análise visual dos seus resultados.',
        imageUrl: slideFinancial,
        narrationText: 'Os gráficos mostram a evolução das suas métricas ao longo do tempo. Você pode visualizar receitas, streams, engajamento e outras métricas importantes para tomada de decisão.'
      },
      {
        id: 'ct-slide-4',
        title: 'Ações Rápidas',
        description: 'Acesse funcionalidades frequentes.',
        imageUrl: slideDashboard,
        narrationText: 'Os botões de ação rápida permitem criar novos artistas, projetos ou transações com apenas um clique. Use-os para agilizar suas tarefas do dia a dia.'
      }
    ]
  },
  {
    tutorialId: 'artist-core',
    title: 'Artist Core - Gestão de Artistas',
    narrationText: 'Descubra como cadastrar e gerenciar artistas com perfis completos.',
    slides: [
      {
        id: 'ac-slide-1',
        title: 'Cadastro de Artistas',
        description: 'Crie perfis completos para seus artistas.',
        imageUrl: slideArtist,
        narrationText: 'O módulo de Artistas permite criar perfis completos com informações pessoais, artísticas e comerciais. Clique em Novo Artista para começar o cadastro.'
      },
      {
        id: 'ac-slide-2',
        title: 'Informações do Perfil',
        description: 'Nome artístico, gênero, biografia e mais.',
        imageUrl: slideArtist,
        narrationText: 'Preencha o nome artístico, gênero musical, biografia e outras informações importantes. Você também pode adicionar foto do artista e links para redes sociais.'
      },
      {
        id: 'ac-slide-3',
        title: 'Redes Sociais e Streaming',
        description: 'Vincule perfis de plataformas digitais.',
        imageUrl: slideMarketing,
        narrationText: 'Conecte os perfis do Spotify, Instagram, YouTube e outras plataformas. Isso permite monitorar métricas e manter tudo sincronizado.'
      },
      {
        id: 'ac-slide-4',
        title: 'Dados Sensíveis',
        description: 'Informações bancárias e documentos.',
        imageUrl: slideCopyright,
        narrationText: 'Na aba de dados sensíveis, você cadastra informações bancárias, CPF/CNPJ e documentos importantes. Esses dados são protegidos e visíveis apenas para usuários autorizados.'
      },
      {
        id: 'ac-slide-5',
        title: 'Metas do Artista',
        description: 'Defina e acompanhe objetivos.',
        imageUrl: slideFinancial,
        narrationText: 'Configure metas de streams, seguidores ou receita. O sistema acompanha automaticamente o progresso e exibe alertas quando objetivos são alcançados.'
      }
    ]
  },
  {
    tutorialId: 'copyright-hub',
    title: 'Copyright Hub - Registro de Obras',
    narrationText: 'Aprenda a registrar obras musicais e gerenciar direitos autorais.',
    slides: [
      {
        id: 'ch-slide-1',
        title: 'Registro de Obras Musicais',
        description: 'Cadastre composições e letras.',
        imageUrl: slideCopyright,
        narrationText: 'O Copyright Hub é onde você registra suas obras musicais. Cada obra representa uma composição, com seus compositores, letristas e editoras envolvidas.'
      },
      {
        id: 'ch-slide-2',
        title: 'Compositores e Autores',
        description: 'Vincule os criadores da obra.',
        imageUrl: slideArtist,
        narrationText: 'Adicione todos os compositores e autores da obra. Informe o papel de cada um, seja compositor da melodia, letrista ou ambos.'
      },
      {
        id: 'ch-slide-3',
        title: 'Código ISWC',
        description: 'Identificação internacional da obra.',
        imageUrl: slideCopyright,
        narrationText: 'O ISWC é o código internacional que identifica sua obra. Se você já possui, cadastre aqui. Se não, o sistema pode ajudar a gerenciar o processo de obtenção.'
      },
      {
        id: 'ch-slide-4',
        title: 'Splits de Direitos Autorais',
        description: 'Defina a divisão entre criadores.',
        imageUrl: slideFinancial,
        narrationText: 'Configure os percentuais de cada participante. O sistema valida automaticamente para garantir que a soma seja 100 por cento e facilita o cálculo de royalties.'
      }
    ]
  },
  {
    tutorialId: 'master-rights',
    title: 'Master Rights - Fonogramas',
    narrationText: 'Gerencie fonogramas, masters e direitos conexos.',
    slides: [
      {
        id: 'mr-slide-1',
        title: 'O que são Fonogramas',
        description: 'Entenda a diferença entre obra e fonograma.',
        imageUrl: slideRelease,
        narrationText: 'Um fonograma é a gravação de uma obra musical. Enquanto a obra é a composição, o fonograma é a interpretação gravada, o master que vai para as plataformas.'
      },
      {
        id: 'mr-slide-2',
        title: 'Registro de Fonograma',
        description: 'Cadastre suas gravações.',
        imageUrl: slideArtist,
        narrationText: 'Para cada fonograma, informe o artista intérprete, produtores, músicos e técnicos envolvidos. Você também pode fazer upload do arquivo de áudio.'
      },
      {
        id: 'mr-slide-3',
        title: 'Código ISRC',
        description: 'Identificação da gravação.',
        imageUrl: slideCopyright,
        narrationText: 'O ISRC identifica unicamente cada gravação no mundo. Ele é essencial para rastreamento de execuções e pagamento de royalties. Cadastre ou gere novos códigos aqui.'
      },
      {
        id: 'mr-slide-4',
        title: 'Vinculação com Obra',
        description: 'Conecte fonograma à composição.',
        imageUrl: slideCopyright,
        narrationText: 'Todo fonograma deve estar vinculado à sua obra correspondente. Isso garante que tanto os direitos autorais quanto os conexos sejam gerenciados corretamente.'
      }
    ]
  },
  {
    tutorialId: 'release-factory',
    title: 'Release Factory - Lançamentos',
    narrationText: 'Crie e gerencie álbuns, EPs e singles.',
    slides: [
      {
        id: 'rf-slide-1',
        title: 'Tipos de Lançamento',
        description: 'Single, EP ou Álbum.',
        imageUrl: slideRelease,
        narrationText: 'O Release Factory permite criar qualquer tipo de lançamento: singles com uma faixa, EPs com 2 a 6 faixas, ou álbuns completos. Escolha o tipo e comece a montagem.'
      },
      {
        id: 'rf-slide-2',
        title: 'Montagem do Lançamento',
        description: 'Adicione faixas e organize a tracklist.',
        imageUrl: slideRelease,
        narrationText: 'Selecione os fonogramas que farão parte do lançamento e organize a ordem das faixas. Você pode arrastar e soltar para reorganizar facilmente.'
      },
      {
        id: 'rf-slide-3',
        title: 'Arte e Metadados',
        description: 'Capa, gênero e informações.',
        imageUrl: slideRelease,
        narrationText: 'Faça upload da arte de capa e preencha os metadados: gênero principal, subgênero, idioma e outras informações exigidas pelas distribuidoras.'
      },
      {
        id: 'rf-slide-4',
        title: 'Revisão e Publicação',
        description: 'Verifique e envie para distribuição.',
        imageUrl: slideRelease,
        narrationText: 'Antes de enviar, revise todos os dados. O sistema valida automaticamente se tudo está correto. Quando estiver pronto, envie para a distribuidora com um clique.'
      }
    ]
  },
  {
    tutorialId: 'project-flow',
    title: 'Project Flow - Gestão de Projetos',
    narrationText: 'Organize projetos, etapas e acompanhe o progresso.',
    slides: [
      {
        id: 'pf-slide-1',
        title: 'Criando Projetos',
        description: 'Organize suas iniciativas.',
        imageUrl: slideProject,
        narrationText: 'Projetos podem ser álbuns, turnês, campanhas de marketing ou qualquer iniciativa que precise de organização. Crie um projeto e defina seus objetivos.'
      },
      {
        id: 'pf-slide-2',
        title: 'Etapas e Milestones',
        description: 'Divida em fases mensuráveis.',
        imageUrl: slideProject,
        narrationText: 'Divida o projeto em etapas com datas de início e fim. Defina milestones importantes como entregas, aprovações ou lançamentos.'
      },
      {
        id: 'pf-slide-3',
        title: 'Atribuição de Responsáveis',
        description: 'Defina quem faz o quê.',
        imageUrl: slideProject,
        narrationText: 'Atribua responsáveis para cada etapa ou tarefa. Todos os envolvidos recebem notificações sobre prazos e atualizações.'
      },
      {
        id: 'pf-slide-4',
        title: 'Acompanhamento',
        description: 'Monitore o progresso.',
        imageUrl: slideDashboard,
        narrationText: 'O painel de projetos mostra o progresso geral e de cada etapa. Use filtros para ver projetos atrasados, em andamento ou concluídos.'
      }
    ]
  },
  {
    tutorialId: 'launch-manager',
    title: 'Launch Manager - Planejamento',
    narrationText: 'Planeje e execute lançamentos musicais completos.',
    slides: [
      {
        id: 'lm-slide-1',
        title: 'Cronograma de Lançamento',
        description: 'Planeje cada etapa.',
        imageUrl: slideProject,
        narrationText: 'Um lançamento bem-sucedido precisa de planejamento. Defina a data de lançamento e o sistema sugere datas para entregas, aprovações e início de divulgação.'
      },
      {
        id: 'lm-slide-2',
        title: 'Pré-Save',
        description: 'Capture fãs antecipadamente.',
        imageUrl: slideMarketing,
        narrationText: 'Configure campanhas de pré-save para que fãs salvem a música antes do lançamento. Isso melhora o algoritmo das plataformas no dia da estreia.'
      },
      {
        id: 'lm-slide-3',
        title: 'Checklist de Lançamento',
        description: 'Não esqueça nenhum detalhe.',
        imageUrl: slideProject,
        narrationText: 'O checklist de lançamento garante que você não esqueça nada: entrega à distribuidora, cadastro no Instagram Music, pitch para playlists e mais.'
      },
      {
        id: 'lm-slide-4',
        title: 'Monitoramento Pós-Lançamento',
        description: 'Acompanhe os resultados.',
        imageUrl: slideDashboard,
        narrationText: 'Após o lançamento, monitore streams, salvamentos e adições em playlists. Compare com lançamentos anteriores para entender a performance.'
      }
    ]
  },
  {
    tutorialId: 'digital-distribution',
    title: 'Digital Distribution',
    narrationText: 'Distribua música para plataformas digitais.',
    slides: [
      {
        id: 'dd-slide-1',
        title: 'Distribuidoras Parceiras',
        description: 'Escolha sua distribuidora.',
        imageUrl: slideRelease,
        narrationText: 'O Lander 360 se integra com as principais distribuidoras do mercado. Configure sua conta de distribuição para enviar lançamentos diretamente.'
      },
      {
        id: 'dd-slide-2',
        title: 'Plataformas de Destino',
        description: 'Spotify, Apple Music e mais.',
        imageUrl: slideRelease,
        narrationText: 'Selecione em quais plataformas seu lançamento deve aparecer. Você pode incluir ou excluir plataformas específicas conforme sua estratégia.'
      },
      {
        id: 'dd-slide-3',
        title: 'Envio e Acompanhamento',
        description: 'Status de entrega.',
        imageUrl: slideProject,
        narrationText: 'Após enviar, acompanhe o status de entrega em cada plataforma. O sistema mostra quando o conteúdo foi recebido, processado e está disponível.'
      },
      {
        id: 'dd-slide-4',
        title: 'Links Inteligentes',
        description: 'Compartilhe de forma otimizada.',
        imageUrl: slideMarketing,
        narrationText: 'Gere links inteligentes que direcionam o ouvinte para sua plataforma preferida. Ideal para compartilhar nas redes sociais.'
      }
    ]
  },
  {
    tutorialId: 'royalty-watch',
    title: 'Royalty Watch - Monitoramento',
    narrationText: 'Monitore execuções e royalties.',
    slides: [
      {
        id: 'rw-slide-1',
        title: 'Monitoramento de Execuções',
        description: 'Rádio, TV e espaços públicos.',
        imageUrl: slideFinancial,
        narrationText: 'O Royalty Watch monitora onde suas músicas estão sendo executadas: rádios, canais de TV, estabelecimentos comerciais e eventos.'
      },
      {
        id: 'rw-slide-2',
        title: 'Relatórios ECAD',
        description: 'Importe e analise.',
        imageUrl: slideDashboard,
        narrationText: 'Importe relatórios do ECAD e compare com suas detecções internas. O sistema identifica automaticamente divergências que podem representar perdas.'
      },
      {
        id: 'rw-slide-3',
        title: 'Identificação de Divergências',
        description: 'Encontre execuções não pagas.',
        imageUrl: slideFinancial,
        narrationText: 'Quando uma execução detectada não aparece no relatório de pagamento, você pode contestar. O sistema facilita a documentação para cobranças.'
      },
      {
        id: 'rw-slide-4',
        title: 'Solicitação de Correções',
        description: 'Reclame o que é seu.',
        imageUrl: slideContract,
        narrationText: 'Gere automaticamente documentos para solicitar correções às associações de direitos. Acompanhe o status de cada solicitação até a resolução.'
      }
    ]
  },
  {
    tutorialId: 'sync-licensing',
    title: 'Sync & Licensing',
    narrationText: 'Gerencie licenças de sincronização.',
    slides: [
      {
        id: 'sl-slide-1',
        title: 'O que é Sync',
        description: 'Música em filmes, séries e comerciais.',
        imageUrl: slideRelease,
        narrationText: 'Sincronização é quando sua música é usada em produções audiovisuais: filmes, séries, novelas, comerciais e games. É uma fonte importante de receita.'
      },
      {
        id: 'sl-slide-2',
        title: 'Oportunidades de Sync',
        description: 'Cadastre e acompanhe.',
        imageUrl: slideProject,
        narrationText: 'Registre oportunidades de licenciamento que surgirem. Acompanhe o status de cada negociação, desde o primeiro contato até o fechamento.'
      },
      {
        id: 'sl-slide-3',
        title: 'Termos e Valores',
        description: 'Negocie corretamente.',
        imageUrl: slideFinancial,
        narrationText: 'Defina os termos de cada licença: território, período, mídia e valores. O sistema ajuda a calcular taxas justas baseadas em referências de mercado.'
      },
      {
        id: 'sl-slide-4',
        title: 'Contrato de Licença',
        description: 'Documente tudo.',
        imageUrl: slideContract,
        narrationText: 'Gere contratos de licenciamento a partir de templates. Acompanhe assinaturas e arquive documentos de forma organizada.'
      }
    ]
  },
  {
    tutorialId: 'rights-protection',
    title: 'Rights Protection - Takedowns',
    narrationText: 'Proteja seus direitos autorais.',
    slides: [
      {
        id: 'rp-slide-1',
        title: 'Uso Indevido',
        description: 'Identifique infrações.',
        imageUrl: slideCopyright,
        narrationText: 'Quando sua música é usada sem autorização em vídeos, lives ou outros conteúdos, você pode solicitar a remoção. Isso se chama takedown.'
      },
      {
        id: 'rp-slide-2',
        title: 'Criando Solicitação',
        description: 'Documente a infração.',
        imageUrl: slideCopyright,
        narrationText: 'Registre o link do conteúdo infrator, a plataforma e as evidências. O sistema gera automaticamente a documentação necessária para a remoção.'
      },
      {
        id: 'rp-slide-3',
        title: 'Acompanhamento',
        description: 'Status do takedown.',
        imageUrl: slideProject,
        narrationText: 'Acompanhe cada solicitação: enviada, em análise, aceita ou rejeitada. Receba notificações quando houver atualizações.'
      },
      {
        id: 'rp-slide-4',
        title: 'Resolução',
        description: 'Conclua o processo.',
        imageUrl: slideCopyright,
        narrationText: 'Quando o conteúdo for removido, registre a resolução. Mantenha histórico de todas as infrações para referência futura.'
      }
    ]
  },
  {
    tutorialId: 'split-engine',
    title: 'Split Engine - Gestão de Shares',
    narrationText: 'Configure divisão de royalties.',
    slides: [
      {
        id: 'se-slide-1',
        title: 'Entendendo Splits',
        description: 'Divisão de receitas.',
        imageUrl: slideFinancial,
        narrationText: 'Splits definem como as receitas de uma obra ou fonograma são divididas entre os participantes. Cada um recebe seu percentual automaticamente.'
      },
      {
        id: 'se-slide-2',
        title: 'Configuração por Obra',
        description: 'Defina percentuais.',
        imageUrl: slideFinancial,
        narrationText: 'Para cada obra, defina o percentual de cada compositor, letrista e editora. O sistema valida para garantir que a soma seja exatamente 100 por cento.'
      },
      {
        id: 'se-slide-3',
        title: 'Validação Automática',
        description: 'Evite erros.',
        imageUrl: slideDashboard,
        narrationText: 'O sistema alerta quando há inconsistências nos splits. Isso evita problemas de pagamento e disputas entre participantes.'
      },
      {
        id: 'se-slide-4',
        title: 'Relatórios de Divisão',
        description: 'Transparência total.',
        imageUrl: slideFinancial,
        narrationText: 'Gere relatórios detalhados mostrando quanto cada participante deve receber. Compartilhe com transparência para manter boas relações comerciais.'
      }
    ]
  },
  {
    tutorialId: 'contract-vault',
    title: 'Contract Vault - Contratos',
    narrationText: 'Gerencie contratos e documentos.',
    slides: [
      {
        id: 'cv-slide-1',
        title: 'Templates de Contrato',
        description: 'Modelos prontos.',
        imageUrl: slideContract,
        narrationText: 'O Contract Vault oferece templates para os principais tipos de contrato: artístico, edição, licenciamento, management e mais. Personalize conforme necessário.'
      },
      {
        id: 'cv-slide-2',
        title: 'Geração de Contratos',
        description: 'Crie rapidamente.',
        imageUrl: slideContract,
        narrationText: 'Selecione o template, preencha as variáveis como nome das partes, valores e prazos. O contrato é gerado automaticamente, pronto para revisão.'
      },
      {
        id: 'cv-slide-3',
        title: 'Assinatura Digital',
        description: 'Validade jurídica.',
        imageUrl: slideContract,
        narrationText: 'Envie contratos para assinatura digital integrada. Todas as partes assinam online, com validade jurídica e rastreabilidade.'
      },
      {
        id: 'cv-slide-4',
        title: 'Arquivo Seguro',
        description: 'Organize documentos.',
        imageUrl: slideCopyright,
        narrationText: 'Todos os contratos assinados ficam arquivados de forma segura. Busque por artista, tipo de contrato ou período para encontrar rapidamente.'
      }
    ]
  },
  {
    tutorialId: 'revenue-center',
    title: 'Revenue Center - Financeiro',
    narrationText: 'Controle receitas e despesas.',
    slides: [
      {
        id: 'rc-slide-1',
        title: 'Registro de Transações',
        description: 'Receitas e despesas.',
        imageUrl: slideFinancial,
        narrationText: 'O Revenue Center é seu controle financeiro completo. Registre todas as entradas e saídas, categorizadas e vinculadas a artistas ou projetos.'
      },
      {
        id: 'rc-slide-2',
        title: 'Categorização',
        description: 'Organize por tipo.',
        imageUrl: slideFinancial,
        narrationText: 'Use categorias como Royalties, Shows, Licenciamento, Produção e outras para organizar suas transações. Isso facilita análises e relatórios.'
      },
      {
        id: 'rc-slide-3',
        title: 'Anexos e Comprovantes',
        description: 'Documente tudo.',
        imageUrl: slideCopyright,
        narrationText: 'Anexe comprovantes, notas fiscais e outros documentos em cada transação. Mantenha tudo organizado para contabilidade e auditorias.'
      },
      {
        id: 'rc-slide-4',
        title: 'Fluxo de Caixa',
        description: 'Visualize sua saúde financeira.',
        imageUrl: slideFinancial,
        narrationText: 'O gráfico de fluxo de caixa mostra entradas e saídas ao longo do tempo. Identifique tendências e planeje-se para períodos de baixa.'
      }
    ]
  },
  {
    tutorialId: 'accounting-pro',
    title: 'Accounting Pro - Contabilidade',
    narrationText: 'Ferramentas contábeis avançadas.',
    slides: [
      {
        id: 'ap-slide-1',
        title: 'Plano de Contas',
        description: 'Estrutura contábil.',
        imageUrl: slideFinancial,
        narrationText: 'O Accounting Pro traz um plano de contas adaptado para a indústria musical. Configure suas contas de acordo com sua estrutura empresarial.'
      },
      {
        id: 'ap-slide-2',
        title: 'DRE - Demonstração de Resultados',
        description: 'Análise de lucros.',
        imageUrl: slideDashboard,
        narrationText: 'Gere o DRE automaticamente com base nas suas transações. Visualize receitas, custos, despesas e resultado líquido por período.'
      },
      {
        id: 'ap-slide-3',
        title: 'Exportação Contábil',
        description: 'Para seu contador.',
        imageUrl: slideFinancial,
        narrationText: 'Exporte relatórios no formato que seu contador precisa. Facilite a integração com sistemas de contabilidade externos.'
      },
      {
        id: 'ap-slide-4',
        title: 'Integração com Contador',
        description: 'Colaboração simplificada.',
        imageUrl: slideProject,
        narrationText: 'Dê acesso ao seu contador para visualizar relatórios diretamente. Ele pode extrair as informações necessárias sem depender de você.'
      }
    ]
  },
  {
    tutorialId: 'fiscal-hub',
    title: 'Fiscal Hub - Nota Fiscal',
    narrationText: 'Emita e gerencie notas fiscais.',
    slides: [
      {
        id: 'fh-slide-1',
        title: 'Dados Fiscais',
        description: 'Configure sua empresa.',
        imageUrl: slideCopyright,
        narrationText: 'Antes de emitir notas, configure os dados fiscais da sua empresa: CNPJ, inscrição municipal, certificado digital e configurações de impostos.'
      },
      {
        id: 'fh-slide-2',
        title: 'Emissão de NFS-e',
        description: 'Nota de serviço.',
        imageUrl: slideFinancial,
        narrationText: 'Emita notas fiscais de serviço para shows, produção, licenciamento e outros serviços. Preencha os dados do cliente e o sistema faz o resto.'
      },
      {
        id: 'fh-slide-3',
        title: 'Consulta de Notas',
        description: 'Histórico completo.',
        imageUrl: slideDashboard,
        narrationText: 'Consulte todas as notas emitidas por período, cliente ou status. Identifique rapidamente notas pendentes ou canceladas.'
      },
      {
        id: 'fh-slide-4',
        title: 'Download XML e PDF',
        description: 'Arquive e compartilhe.',
        imageUrl: slideCopyright,
        narrationText: 'Baixe o XML para arquivo fiscal e o PDF para enviar ao cliente. Tudo organizado e fácil de acessar quando precisar.'
      }
    ]
  },
  {
    tutorialId: 'operations-hub',
    title: 'Operations Hub',
    narrationText: 'Serviços, agenda e inventário.',
    slides: [
      {
        id: 'oh-slide-1',
        title: 'Cadastro de Serviços',
        description: 'O que você oferece.',
        imageUrl: slideProject,
        narrationText: 'O Operations Hub centraliza seus serviços: produção musical, mixagem, masterização, shows, consultoria. Defina preços e condições para cada um.'
      },
      {
        id: 'oh-slide-2',
        title: 'Agenda de Eventos',
        description: 'Organize compromissos.',
        imageUrl: slideMarketing,
        narrationText: 'A agenda mostra shows, gravações, reuniões e outros compromissos. Visualize por dia, semana ou mês e filtre por artista ou tipo de evento.'
      },
      {
        id: 'oh-slide-3',
        title: 'Inventário',
        description: 'Controle equipamentos.',
        imageUrl: slideProject,
        narrationText: 'Mantenha controle de instrumentos, equipamentos e materiais. Registre aquisições, empréstimos e manutenções.'
      },
      {
        id: 'oh-slide-4',
        title: 'Integração Google Calendar',
        description: 'Sincronize sua agenda.',
        imageUrl: slideMarketing,
        narrationText: 'Conecte com o Google Calendar para sincronizar eventos automaticamente. Receba lembretes e mantenha tudo em um só lugar.'
      }
    ]
  },
  {
    tutorialId: 'relationship-manager',
    title: 'Relationship Manager - CRM',
    narrationText: 'Gerencie contatos e relacionamentos.',
    slides: [
      {
        id: 'rm-slide-1',
        title: 'Cadastro de Contatos',
        description: 'Sua rede organizada.',
        imageUrl: slideArtist,
        narrationText: 'O CRM armazena todos os seus contatos: gravadoras, editoras, produtores, jornalistas, curadores de playlist e outros profissionais da indústria.'
      },
      {
        id: 'rm-slide-2',
        title: 'Registro de Interações',
        description: 'Histórico de conversas.',
        imageUrl: slideMarketing,
        narrationText: 'Registre cada interação: emails, ligações, reuniões e negociações. Mantenha histórico para dar continuidade em conversas futuras.'
      },
      {
        id: 'rm-slide-3',
        title: 'Classificação de Leads',
        description: 'Priorize oportunidades.',
        imageUrl: slideProject,
        narrationText: 'Classifique contatos por potencial: lead frio, morno ou quente. Foque energia nos relacionamentos mais promissores.'
      },
      {
        id: 'rm-slide-4',
        title: 'Pipeline Comercial',
        description: 'Acompanhe negociações.',
        imageUrl: slideDashboard,
        narrationText: 'Visualize suas oportunidades em um pipeline. Veja em qual etapa cada negociação está e o que precisa ser feito para avançar.'
      }
    ]
  },
  {
    tutorialId: 'lander-connect',
    title: 'Lander Connect - Comunicação',
    narrationText: 'Central de mensagens e WhatsApp.',
    slides: [
      {
        id: 'lc-slide-1',
        title: 'WhatsApp Integrado',
        description: 'Comunicação centralizada.',
        imageUrl: slideMarketing,
        narrationText: 'O Lander Connect integra o WhatsApp à sua gestão. Conecte seu número e gerencie conversas com artistas, clientes e parceiros sem sair da plataforma.'
      },
      {
        id: 'lc-slide-2',
        title: 'Gestão de Conversas',
        description: 'Organize seus chats.',
        imageUrl: slideMarketing,
        narrationText: 'Visualize todas as conversas em uma interface unificada. Marque favoritos, arquive concluídas e priorize as mais importantes.'
      },
      {
        id: 'lc-slide-3',
        title: 'Envio de Mensagens',
        description: 'Comunique-se rapidamente.',
        imageUrl: slideMarketing,
        narrationText: 'Envie mensagens individuais ou em massa. Use templates para mensagens frequentes como confirmação de eventos ou lembretes.'
      },
      {
        id: 'lc-slide-4',
        title: 'Templates de Mensagem',
        description: 'Padronize comunicações.',
        imageUrl: slideContract,
        narrationText: 'Crie templates para mensagens recorrentes. Personalize variáveis como nome do artista, data do evento e outros detalhes automaticamente.'
      }
    ]
  },
  {
    tutorialId: 'growth-studio',
    title: 'Growth Studio - Marketing',
    narrationText: 'Crie campanhas e acompanhe resultados.',
    slides: [
      {
        id: 'gs-slide-1',
        title: 'Campanhas de Marketing',
        description: 'Planeje e execute.',
        imageUrl: slideMarketing,
        narrationText: 'O Growth Studio é seu centro de marketing. Crie campanhas para lançamentos, clipes, turnês ou qualquer ação promocional.'
      },
      {
        id: 'gs-slide-2',
        title: 'Público-Alvo',
        description: 'Defina para quem.',
        imageUrl: slideMarketing,
        narrationText: 'Defina o público de cada campanha: faixa etária, localização, interesses. Isso ajuda a direcionar conteúdo e investimentos.'
      },
      {
        id: 'gs-slide-3',
        title: 'Calendário de Conteúdo',
        description: 'Organize postagens.',
        imageUrl: slideMarketing,
        narrationText: 'Planeje suas postagens em um calendário visual. Veja o que está programado para cada dia e garanta consistência nas redes sociais.'
      },
      {
        id: 'gs-slide-4',
        title: 'Métricas e Análise',
        description: 'Meça resultados.',
        imageUrl: slideDashboard,
        narrationText: 'Acompanhe métricas de engajamento, alcance e conversões. Compare campanhas para entender o que funciona melhor com seu público.'
      }
    ]
  },
  {
    tutorialId: 'creative-ai-lab',
    title: 'Creative AI Lab - IA Criativa',
    narrationText: 'Use inteligência artificial para criar conteúdo.',
    slides: [
      {
        id: 'ca-slide-1',
        title: 'Geração de Ideias',
        description: 'IA para criatividade.',
        imageUrl: slideMarketing,
        narrationText: 'O Creative AI Lab usa inteligência artificial para gerar ideias de conteúdo. Informe o artista e o contexto, e receba sugestões criativas.'
      },
      {
        id: 'ca-slide-2',
        title: 'Briefings Automáticos',
        description: 'Documentos prontos.',
        imageUrl: slideContract,
        narrationText: 'Gere briefings completos para designers, videomakers e outros criativos. A IA estrutura todas as informações necessárias.'
      },
      {
        id: 'ca-slide-3',
        title: 'Análise de Tendências',
        description: 'O que está em alta.',
        imageUrl: slideDashboard,
        narrationText: 'A IA analisa tendências de mercado e sugere como aproveitá-las. Descubra formatos, hashtags e temas que estão performando bem.'
      },
      {
        id: 'ca-slide-4',
        title: 'Otimização de Conteúdo',
        description: 'Melhore suas postagens.',
        imageUrl: slideMarketing,
        narrationText: 'Submeta rascunhos de legendas e posts para a IA otimizar. Receba versões melhoradas com calls-to-action mais efetivos.'
      }
    ]
  },
  {
    tutorialId: 'insights-audit',
    title: 'Insights & Audit - Relatórios',
    narrationText: 'Gere relatórios e audite operações.',
    slides: [
      {
        id: 'ia-slide-1',
        title: 'Tipos de Relatórios',
        description: 'Informações estruturadas.',
        imageUrl: slideDashboard,
        narrationText: 'O módulo de Relatórios oferece diversos tipos: catálogo de obras, royalties por período, performance de artistas, financeiro e muito mais.'
      },
      {
        id: 'ia-slide-2',
        title: 'Exportação de Dados',
        description: 'Excel, PDF e mais.',
        imageUrl: slideDashboard,
        narrationText: 'Exporte relatórios em Excel para análises detalhadas ou em PDF para apresentações. Os dados são formatados automaticamente.'
      },
      {
        id: 'ia-slide-3',
        title: 'Auditoria de Operações',
        description: 'Rastro de atividades.',
        imageUrl: slideCopyright,
        narrationText: 'O log de auditoria registra todas as ações importantes: quem fez, quando fez e o que foi alterado. Essencial para segurança e compliance.'
      },
      {
        id: 'ia-slide-4',
        title: 'Análise de Tendências',
        description: 'Identifique padrões.',
        imageUrl: slideFinancial,
        narrationText: 'Visualize tendências ao longo do tempo. Identifique quais artistas ou obras estão crescendo e quais precisam de mais atenção.'
      }
    ]
  },
  {
    tutorialId: 'system-settings',
    title: 'System Settings - Configurações',
    narrationText: 'Configure usuários, permissões e preferências.',
    slides: [
      {
        id: 'ss-slide-1',
        title: 'Gerenciamento de Usuários',
        description: 'Quem pode acessar.',
        imageUrl: slideArtist,
        narrationText: 'No painel de usuários, adicione membros da sua equipe. Defina email, senha inicial e perfil de acesso para cada um.'
      },
      {
        id: 'ss-slide-2',
        title: 'Perfis e Permissões',
        description: 'Controle o acesso.',
        imageUrl: slideCopyright,
        narrationText: 'Configure o que cada perfil pode ver e fazer. Administradores têm acesso total, enquanto outros perfis podem ter restrições específicas.'
      },
      {
        id: 'ss-slide-3',
        title: 'Integrações',
        description: 'Conecte serviços.',
        imageUrl: slideProject,
        narrationText: 'Ative integrações com serviços externos: Google Calendar, distribuidoras, plataformas de pagamento e outros sistemas.'
      },
      {
        id: 'ss-slide-4',
        title: 'Preferências do Sistema',
        description: 'Personalize a plataforma.',
        imageUrl: slideDashboard,
        narrationText: 'Configure preferências gerais: moeda padrão, fuso horário, formato de data e aparência visual. Adapte o sistema ao seu modo de trabalhar.'
      }
    ]
  }
];

export const getNarrationScriptByTutorialId = (tutorialId: string): TutorialNarrationScript | undefined => {
  return TUTORIAL_NARRATION_SCRIPTS.find(s => s.tutorialId === tutorialId);
};
