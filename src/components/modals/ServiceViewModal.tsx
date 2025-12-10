import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Service } from "@/hooks/useServices";
import { formatDateBR } from "@/lib/utils";

interface ServiceViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
}

const categoryLabels: Record<string, string> = {
  agenciamento: "Agenciamento",
  gestao_carreira: "Gestão de Carreira",
  producao_musical: "Produção Musical",
  producao_audiovisual: "Produção Audiovisual",
  design_grafico: "Design Gráfico",
  gestao_redes_sociais: "Gestão de Redes Sociais",
  trafego_pago: "Tráfego Pago",
  criacao_sites: "Criação de Sites",
  edicao_musical: "Edição Musical",
};

const serviceTypeLabels: Record<string, string> = {
  recorrente: "Recorrente",
  avulso: "Avulso",
  pacote: "Pacote",
};

export function ServiceViewModal({ isOpen, onClose, service }: ServiceViewModalProps) {
  if (!service) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDiscount = (value: number, type: string) => {
    if (type === "percentage") {
      return `${value}%`;
    }
    return formatCurrency(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes do Serviço</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Nome do Serviço</p>
            <p className="font-medium">{service.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Categoria</p>
              <p className="font-medium">{categoryLabels[service.category] || service.category}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tipo</p>
              <p className="font-medium">{serviceTypeLabels[service.service_type] || service.service_type}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Preço de Venda</p>
              <p className="font-medium">{formatCurrency(service.sale_price)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Desconto</p>
              <p className="font-medium">{formatDiscount(service.discount_value, service.discount_type)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Preço Final</p>
              <p className="font-medium text-primary">{formatCurrency(service.final_price)}</p>
            </div>
          </div>

          {service.description && (
            <div>
              <p className="text-sm text-muted-foreground">Descrição</p>
              <p className="font-medium">{service.description}</p>
            </div>
          )}

          {service.observations && (
            <div>
              <p className="text-sm text-muted-foreground">Observações</p>
              <p className="font-medium">{service.observations}</p>
            </div>
          )}

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Criado em: {formatDateBR(service.created_at)}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
