import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Service } from "@/hooks/useServices";
import { formatDateBR } from "@/lib/utils";

interface ServiceViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
}

const grupoLabels: Record<string, string> = {
  agenciamento: "Agenciamento",
  producao_musical: "Produção Musical",
  producao_audiovisual: "Produção Audiovisual",
  editora: "Editora",
  design_grafico: "Design Gráfico",
  gerenciamento_redes_sociais: "Gerenciamento de Redes Sociais",
  trafego_pago: "Tráfego Pago",
  criacao_sites: "Criação de Sites",
};

const categoryLabels: Record<string, string> = {
  consultoria: "Consultoria",
  criacao_sites: "Criação de Sites",
  design_grafico: "Design Gráfico",
  distribuicao_musical: "Distribuição Musical",
  editora_musical: "Editora Musical",
  financeiro_admin: "Financeiro/Admin",
  gerenciamento_redes_sociais: "Gerenciamento de Redes Sociais",
  gestao_carreira: "Gestão de Carreira",
  marketing: "Marketing",
  parcerias: "Parcerias",
  producao_audiovisual: "Produção Audiovisual",
  producao_conteudo: "Produção de Conteúdo",
  producao_musical: "Produção Musical",
  trafego_pago: "Tráfego Pago",
};

const serviceTypeLabels: Record<string, string> = {
  avulso: "Avulso",
  mensal: "Mensal",
  pacote: "Pacote",
  pacote_1: "Pacote 1",
  pacote_2: "Pacote 2",
  pacote_3: "Pacote 3",
  pacote_4: "Pacote 4",
  pacote_5: "Pacote 5",
  pacote_6: "Pacote 6",
  pacote_7: "Pacote 7",
  pacote_essencial: "Pacote Essencial",
  pacote_iniciante: "Pacote Iniciante",
  pacote_intermediario: "Pacote Intermediário",
  pacote_intermediario_completo: "Pacote Intermediário (Completo)",
  pacote_profissional: "Pacote Profissional",
};

export function ServiceViewModal({ isOpen, onClose, service }: ServiceViewModalProps) {
  if (!service) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  const formatPercent = (value: number) => {
    return `${value || 0}%`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Detalhes do Serviço</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Grupo</p>
              <p className="font-medium">{grupoLabels[service.grupo || ""] || service.grupo || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Categoria</p>
              <p className="font-medium">{categoryLabels[service.category] || service.category}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tipo</p>
              <p className="font-medium">{serviceTypeLabels[service.service_type] || service.service_type}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Descrição do Serviço</p>
            <p className="font-medium">{service.description || "-"}</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Valor Custo</p>
              <p className="font-medium">{formatCurrency(service.cost_price)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Margem</p>
              <p className="font-medium">{formatPercent(service.margin)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor Venda</p>
              <p className="font-medium">{formatCurrency(service.sale_price)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Desc%</p>
              <p className="font-medium">{formatPercent(service.discount_value)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="font-medium text-primary">{formatCurrency(service.final_price)}</p>
            </div>
          </div>

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
