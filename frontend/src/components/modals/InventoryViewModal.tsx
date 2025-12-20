import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

interface Equipment {
  id: string;
  name: string;
  category: string;
  status: string;
  quantity: number;
  location: string;
  unit_value: number | null;
  sector: string | null;
  responsible: string | null;
  purchase_location: string | null;
  invoice_number: string | null;
  entry_date: string | null;
  observations: string | null;
}

interface InventoryViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment | null;
}

const sectorLabels: Record<string, string> = {
  administrativo: "Administrativo / Corporativo",
  financeiro: "Financeiro",
  juridico: "Jurídico",
  artistico: "Artístico (A&R)",
  producao_musical: "Produção Musical",
  producao_audiovisual: "Produção Audiovisual",
  editora: "Editora Musical",
  distribuicao: "Distribuição Digital",
  marketing: "Marketing",
  comunicacao: "Comunicação e Imprensa",
  eventos: "Eventos e Shows",
  comercial: "Comercial / Vendas",
  rh: "Recursos Humanos",
  ti: "Tecnologia / TI",
  arquivo: "Arquivo e Documentação",
  logistica: "Logística e Operações",
};

const categoryLabels: Record<string, string> = {
  audio: "Áudio",
  video: "Vídeo",
  estrutura: "Estrutura",
  computador: "Computador",
  software: "Software",
  mobilia: "Mobília",
  iluminacao: "Iluminação",
  escritorio: "Escritório",
  outros: "Outros",
};

export function InventoryViewModal({ isOpen, onClose, equipment }: InventoryViewModalProps) {
  if (!equipment) return null;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Disponível": return "success";
      case "Em Uso": return "info";
      case "Manutenção": return "warning";
      case "Danificado": return "destructive";
      default: return "secondary";
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Não informado';
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy');
    } catch {
      return dateStr;
    }
  };

  const totalValue = (equipment.unit_value || 0) * equipment.quantity;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Detalhes do Equipamento</DialogTitle>
          <DialogDescription className="text-sm">Informações completas do item selecionado</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Básicas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Setor</p>
                <p className="font-medium">{sectorLabels[equipment.sector || ''] || equipment.sector || "Não informado"}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Categoria</p>
                <Badge variant="secondary">{categoryLabels[equipment.category] || equipment.category}</Badge>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Nome do Item</p>
              <p className="font-medium text-lg">{equipment.name}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Quantidade</p>
                <p className="font-medium">{equipment.quantity} unidade(s)</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Localização</p>
                <p className="font-medium">{equipment.location}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Responsável</p>
                <p className="font-medium">{equipment.responsible || "Não informado"}</p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={getStatusVariant(equipment.status) as any}>
                {equipment.status}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Informações de Compra */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações de Compra</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Local de Compra</p>
                <p className="font-medium">{equipment.purchase_location || "Não informado"}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Número da Nota Fiscal</p>
                <p className="font-medium">{equipment.invoice_number || "Não informado"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Data de Entrada</p>
                <p className="font-medium">{formatDate(equipment.entry_date)}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Valor Unitário</p>
                <p className="font-medium">{formatCurrency(equipment.unit_value)}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="font-medium text-primary">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Informações Adicionais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Adicionais</h3>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Observações</p>
              <p className="font-medium">{equipment.observations || "Nenhuma observação registrada"}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}