import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDateFullBR } from "@/lib/utils";

interface FinancialViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: any;
}

export function FinancialViewModal({ open, onOpenChange, transaction }: FinancialViewModalProps) {
  if (!transaction) return null;

  const categoryLabels: Record<string, string> = {
    venda_musicas: 'Venda de Músicas',
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
    outros: 'Outros'
  };

  const statusLabels: Record<string, string> = {
    pendente: 'Pendente',
    aprovado: 'Aprovado',
    pago: 'Pago',
    cancelado: 'Cancelado'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Detalhes da Transação</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações Principais */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Informações Principais</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Descrição</label>
                <p className="font-medium">{transaction.description}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Tipo</label>
                <p className="font-medium">
                  <Badge variant={transaction.transaction_type === "receitas" ? "default" : "destructive"}>
                    {transaction.transaction_type === "receitas" ? "Receita" : 
                     transaction.transaction_type === "despesas" ? "Despesa" :
                     transaction.transaction_type === "investimentos" ? "Investimento" :
                     transaction.transaction_type === "impostos" ? "Imposto" :
                     transaction.transaction_type === "transferencias" ? "Transferência" : transaction.transaction_type}
                  </Badge>
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Valor</label>
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
              <div>
                <label className="text-sm text-muted-foreground">Status</label>
                <p className="font-medium">
                  <Badge 
                    variant={
                      transaction.status === "pago" ? "default" : 
                      transaction.status === "cancelado" ? "destructive" : "secondary"
                    }
                  >
                    {statusLabels[transaction.status] || transaction.status}
                  </Badge>
                </p>
              </div>
            </div>
          </div>

          {/* Detalhes */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Detalhes</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Categoria</label>
                <p className="font-medium">
                  <Badge variant="secondary">
                    {categoryLabels[transaction.category] || transaction.category}
                  </Badge>
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Data da Transação</label>
                <p className="font-medium">
                  {formatDateFullBR(transaction.transaction_date)}
                </p>
              </div>
              {transaction.payment_method && (
                <div>
                  <label className="text-sm text-muted-foreground">Método de Pagamento</label>
                  <p className="font-medium">{transaction.payment_method}</p>
                </div>
              )}
              {transaction.artists && (
                <div>
                  <label className="text-sm text-muted-foreground">Artista</label>
                  <p className="font-medium">{transaction.artists.stage_name || transaction.artists.name}</p>
                </div>
              )}
              {transaction.crm_contacts && (
                <div>
                  <label className="text-sm text-muted-foreground">Contato CRM</label>
                  <p className="font-medium">
                    {transaction.crm_contacts.name}
                    {transaction.crm_contacts.company && <span className="text-muted-foreground"> ({transaction.crm_contacts.company})</span>}
                  </p>
                </div>
              )}
              {transaction.responsible_by && (
                <div>
                  <label className="text-sm text-muted-foreground">Responsável</label>
                  <p className="font-medium">{transaction.responsible_by}</p>
                </div>
              )}
              {transaction.authorized_by && (
                <div>
                  <label className="text-sm text-muted-foreground">Autorizado por</label>
                  <p className="font-medium">{transaction.authorized_by}</p>
                </div>
              )}
              {transaction.observations && (
                <div className="col-span-2">
                  <label className="text-sm text-muted-foreground">Observações</label>
                  <p className="font-medium">{transaction.observations}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
