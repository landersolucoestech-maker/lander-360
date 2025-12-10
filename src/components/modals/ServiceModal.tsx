import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ServiceForm, ServiceFormData } from "@/components/forms/ServiceForm";
import { Service } from "@/hooks/useServices";

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ServiceFormData) => void;
  service?: Service | null;
  isLoading?: boolean;
}

export function ServiceModal({ isOpen, onClose, onSubmit, service, isLoading }: ServiceModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {service ? "Editar Serviço" : "Novo Serviço"}
          </DialogTitle>
        </DialogHeader>
        <ServiceForm
          onSubmit={onSubmit}
          initialData={service || undefined}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
