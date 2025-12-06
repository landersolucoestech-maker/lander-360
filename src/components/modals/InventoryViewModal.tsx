import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Equipment {
  id: string;
  name: string;
  category: string;
  status: string;
  quantity: number;
  location: string;
  value: string;
  lastMaintenance: string;
  sector?: string;
  responsible?: string;
  purchaseLocation?: string;
  invoiceNumber?: string;
  entryDate?: string;
  unitValue?: string;
  observations?: string;
}

interface InventoryViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment | null;
}

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Equipamento</DialogTitle>
          <DialogDescription>Informações completas do item selecionado</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Básicas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Setor</p>
                <p className="font-medium">{equipment.sector || "Não informado"}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Categoria</p>
                <Badge variant="secondary">{equipment.category}</Badge>
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
                <p className="font-medium">{equipment.purchaseLocation || "Não informado"}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Número da Nota Fiscal</p>
                <p className="font-medium">{equipment.invoiceNumber || "Não informado"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Data de Entrada</p>
                <p className="font-medium">{equipment.entryDate || "Não informado"}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Valor Unitário</p>
                <p className="font-medium">{equipment.unitValue || equipment.value}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="font-medium text-primary">{equipment.value}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Informações Adicionais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Adicionais</h3>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Última Manutenção</p>
              <p className="font-medium">{equipment.lastMaintenance}</p>
            </div>
            
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
