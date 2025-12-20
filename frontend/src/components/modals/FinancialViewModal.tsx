import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDateFullBR } from "@/lib/utils";
import { FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FinancialViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: any;
}

export function FinancialViewModal({ open, onOpenChange, transaction }: FinancialViewModalProps) {
  if (!transaction) return null;

  const categoryLabels: Record<string, string> = {
    venda_musicas: 'Venda de Músicas',
    streaming: 'Streaming',
    onerpm: 'ONErpm',
    distrokid: 'DistroKid',
    '30por1': '30por1',
    believe: 'Believe',
    tunecore: 'TuneCore',
    cd_baby: 'CD Baby',
    outras_distribuidoras: 'Outras Distribuidoras',
    shows: 'Shows',
    licenciamento: 'Licenciamento',
    merchandising: 'Merchandising',
    publicidade: 'Publicidade',
    producao: 'Produção',
    producao_musical: 'Produção Musical',
    producao_audiovisual: 'Produção Audiovisual',
    distribuicao: 'Distribuição',
    gestao: 'Gestão',
    produtores: 'Produtores',
    caches: 'Cachês',
    marketing: 'Marketing',
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
    servicos: 'Serviços',
    investimentos: 'Investimentos',
    design_grafico: 'Design Gráfico',
    outros: 'Outros'
  };

  const subcategoryLabels: Record<string, string> = {
    capa_single: 'Capa de Single',
    capa_album: 'Capa de Álbum',
    capa_ep: 'Capa de EP',
    material_promocional: 'Material Promocional',
    identidade_visual: 'Identidade Visual',
    banner_redes: 'Banner para Redes',
    clipe_musical: 'Clipe Musical',
    lyric_video: 'Lyric Video',
    video_promocional: 'Vídeo Promocional',
    making_of: 'Making Of',
    reels_tiktok: 'Reels/TikTok',
    gravacao_estudio: 'Gravação em Estúdio',
    mixagem: 'Mixagem',
    masterizacao: 'Masterização',
    producao_beat: 'Produção de Beat',
    arranjo: 'Arranjo',
    meta_ads: 'Meta Ads',
    google_ads: 'Google Ads',
    tiktok_ads: 'TikTok Ads',
    spotify_ads: 'Spotify Ads',
    impulsionamento: 'Impulsionamento',
    gestor_redes: 'Gestor de Redes',
    social_media: 'Social Media',
    criacao_conteudo: 'Criação de Conteúdo',
    assessoria_imprensa: 'Assessoria de Imprensa',
    cache_artista: 'Cachê do Artista',
    cache_banda: 'Cachê da Banda',
    cache_dj: 'Cachê DJ',
    cache_tecnico: 'Cachê Técnico',
    hospedagem: 'Hospedagem',
    transporte: 'Transporte',
    alimentacao: 'Alimentação',
    equipamento_som: 'Equipamento de Som',
    iluminacao: 'Iluminação',
    palco: 'Palco',
    aluguel_estudio: 'Aluguel de Estúdio',
    aluguel_equipamento: 'Aluguel de Equipamento',
    aluguel_espaco: 'Aluguel de Espaço',
  };

  const statusLabels: Record<string, string> = {
    pendente: 'Pendente',
    aprovado: 'Aprovado',
    pago: 'Pago',
    cancelado: 'Cancelado',
    atrasado: 'Atrasado'
  };

  const paymentMethodLabels: Record<string, string> = {
    pix: 'PIX',
    boleto: 'Boleto',
    cartao: 'Cartão',
    ted: 'TED',
    dinheiro: 'Dinheiro'
  };

  const paymentTypeLabels: Record<string, string> = {
    a_vista: 'À Vista',
    parcelado: 'Parcelado',
    recorrente: 'Recorrente'
  };

  const clientTypeLabels: Record<string, string> = {
    empresa: 'Empresa',
    artista: 'Artista',
    pessoa: 'Pessoa'
  };

  const transactionTypeLabels: Record<string, string> = {
    receitas: 'Receita',
    despesas: 'Despesa',
    investimentos: 'Investimento',
    impostos: 'Imposto',
    transferencias: 'Transferência'
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pago': return 'default';
      case 'aprovado': return 'secondary';
      case 'cancelado': return 'destructive';
      case 'atrasado': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Detalhes da Transação</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações do Cliente/Fornecedor */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Informações do Cliente/Fornecedor</h3>
            <div className="grid grid-cols-2 gap-4">
              {transaction.type && (
                <div>
                  <label className="text-sm text-muted-foreground">Tipo (pra quem pagar)</label>
                  <p className="font-medium">{clientTypeLabels[transaction.type] || transaction.type}</p>
                </div>
              )}
              {transaction.artists && (
                <div>
                  <label className="text-sm text-muted-foreground">Fornecedor/Cliente (Artista)</label>
                  <p className="font-medium">{transaction.artists.stage_name || transaction.artists.name}</p>
                </div>
              )}
              {transaction.crm_contacts && (
                <div>
                  <label className="text-sm text-muted-foreground">Fornecedor/Cliente (CRM)</label>
                  <p className="font-medium">
                    {transaction.crm_contacts.name}
                    {transaction.crm_contacts.company && <span className="text-muted-foreground"> ({transaction.crm_contacts.company})</span>}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Informações da Transação */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Informações da Transação</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Tipo de Transação</label>
                <p className="font-medium">
                  <Badge variant={transaction.transaction_type === "receitas" ? "default" : "destructive"}>
                    {transactionTypeLabels[transaction.transaction_type] || transaction.transaction_type}
                  </Badge>
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Categoria</label>
                <p className="font-medium">
                  <Badge variant="secondary">
                    {categoryLabels[transaction.category] || transaction.category}
                  </Badge>
                </p>
              </div>
              {transaction.subcategory && (
                <div>
                  <label className="text-sm text-muted-foreground">Subcategoria / Serviço</label>
                  <p className="font-medium">
                    <Badge variant="outline">
                      {subcategoryLabels[transaction.subcategory] || transaction.subcategory}
                    </Badge>
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm text-muted-foreground">Status</label>
                <p className="font-medium">
                  <Badge variant={getStatusVariant(transaction.status)}>
                    {statusLabels[transaction.status] || transaction.status}
                  </Badge>
                </p>
              </div>
            </div>
          </div>

          {/* Vinculações */}
          {(transaction.projects || transaction.contracts || transaction.agenda_events) && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Vinculações</h3>
              <div className="grid grid-cols-2 gap-4">
                {transaction.projects && (
                  <div>
                    <label className="text-sm text-muted-foreground">Projeto/Música Vinculado</label>
                    <p className="font-medium">{transaction.projects.name}</p>
                  </div>
                )}
                {transaction.contracts && (
                  <div>
                    <label className="text-sm text-muted-foreground">Contrato Vinculado</label>
                    <p className="font-medium">{transaction.contracts.title}</p>
                  </div>
                )}
                {transaction.agenda_events && (
                  <div>
                    <label className="text-sm text-muted-foreground">Show/Evento Vinculado</label>
                    <p className="font-medium">{transaction.agenda_events.title}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Valores e Pagamento */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Valores e Pagamento</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Valor (R$)</label>
                <p className={`font-semibold text-lg ${
                  transaction.transaction_type === "receitas" ? "text-green-600" : "text-red-600"
                }`}>
                  {transaction.transaction_type === "receitas" ? "+" : "-"}
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(transaction.amount)}
                </p>
              </div>
              {transaction.payment_method && (
                <div>
                  <label className="text-sm text-muted-foreground">Forma de Pagamento</label>
                  <p className="font-medium">{paymentMethodLabels[transaction.payment_method] || transaction.payment_method}</p>
                </div>
              )}
              {transaction.payment_type && (
                <div>
                  <label className="text-sm text-muted-foreground">Tipo de Pagamento</label>
                  <p className="font-medium">{paymentTypeLabels[transaction.payment_type] || transaction.payment_type}</p>
                </div>
              )}
              <div>
                <label className="text-sm text-muted-foreground">Data da Transação</label>
                <p className="font-medium">
                  {formatDateFullBR(transaction.transaction_date || transaction.date)}
                </p>
              </div>
            </div>
          </div>


          {/* Descrição e Observações */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Descrição e Observações</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Descrição</label>
                <p className="font-medium">{transaction.description}</p>
              </div>
              {transaction.observations && (
                <div>
                  <label className="text-sm text-muted-foreground">Observações</label>
                  <p className="font-medium whitespace-pre-wrap">{transaction.observations}</p>
                </div>
              )}
            </div>
          </div>

          {/* Anexo */}
          {transaction.attachment_url && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Comprovante Anexado</h3>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => window.open(transaction.attachment_url, '_blank')}
                >
                  Ver Comprovante
                  <ExternalLink className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
