import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Contract } from "@/types/database";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Calendar, DollarSign, User, Building } from "lucide-react";

interface ContractViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract | null;
}

const serviceTypeLabels: Record<string, string> = {
  empresariamento: 'Empresariamento',
  gestao: 'Gestão',
  agenciamento: 'Agenciamento',
  edicao: 'Edição',
  distribuicao: 'Distribuição',
  marketing: 'Marketing',
  producao_musical: 'Produção Musical',
  producao_audiovisual: 'Produção Audiovisual'
};

const statusLabels: Record<string, string> = {
  pendente: 'Pendente',
  assinado: 'Assinado',
  expirado: 'Expirado',
  rescindido: 'Rescindido',
  rascunho: 'Rascunho'
};

export function ContractViewModal({ isOpen, onClose, contract }: ContractViewModalProps) {
  if (!contract) return null;

  const contractData = contract as any;
  const totalValue = contractData.fixed_value || contract.advance_amount || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {contractData.title || contract.contract_type}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            {contractData.service_type && (
              <Badge variant="secondary">
                {serviceTypeLabels[contractData.service_type] || contractData.service_type}
              </Badge>
            )}
            <Badge 
              variant={
                contractData.status === "assinado" ? "default" : 
                contractData.status === "expirado" || contractData.status === "rescindido" ? "destructive" : 
                contractData.status === "pendente" ? "secondary" : "outline"
              }
            >
              {statusLabels[contractData.status] || 'Ativo'}
            </Badge>
            {contractData.client_type && (
              <Badge variant="outline">
                {contractData.client_type === 'artista' ? 'Artista' : 'Empresa'}
              </Badge>
            )}
          </div>

          {/* Contract Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Período */}
            {(contractData.start_date || contractData.end_date || contract.effective_from || contract.effective_to) && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Período</span>
                </div>
                <div className="font-medium">
                  {(contractData.start_date || contract.effective_from) 
                    ? format(new Date(contractData.start_date || contract.effective_from), "dd/MM/yyyy", { locale: ptBR }) 
                    : "N/A"} 
                  {" - "} 
                  {(contractData.end_date || contract.effective_to) 
                    ? format(new Date(contractData.end_date || contract.effective_to), "dd/MM/yyyy", { locale: ptBR }) 
                    : "N/A"}
                </div>
              </div>
            )}

            {/* Valor */}
            {totalValue > 0 && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm font-medium">Valor</span>
                </div>
                <div className="font-medium text-lg">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(totalValue)}
                </div>
                {(contract.royalty_rate || contractData.royalties_percentage) && (
                  <div className="text-sm text-muted-foreground">
                    + {contract.royalty_rate || contractData.royalties_percentage}% royalties
                  </div>
                )}
              </div>
            )}

            {/* Responsável */}
            {contractData.responsible_person && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">Responsável</span>
                </div>
                <div className="font-medium">{contractData.responsible_person}</div>
              </div>
            )}

            {/* Tipo de Cliente */}
            {contractData.client_type && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Building className="h-4 w-4" />
                  <span className="text-sm font-medium">Tipo de Cliente</span>
                </div>
                <div className="font-medium">
                  {contractData.client_type === 'artista' ? 'Artista' : 'Empresa'}
                </div>
              </div>
            )}
          </div>

          {/* Descrição */}
          {contract.description && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-muted-foreground text-sm font-medium mb-2">Descrição</div>
              <p className="text-foreground">{contract.description}</p>
            </div>
          )}

          {/* Notas */}
          {contract.notes && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-muted-foreground text-sm font-medium mb-2">Notas</div>
              <p className="text-foreground">{contract.notes}</p>
            </div>
          )}

          {/* Metadados */}
          <div className="text-xs text-muted-foreground pt-4 border-t border-border">
            <p>ID: {contract.id}</p>
            {contract.created_at && (
              <p>Criado em: {format(new Date(contract.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
            )}
            {contract.updated_at && (
              <p>Atualizado em: {format(new Date(contract.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
