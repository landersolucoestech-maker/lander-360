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
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {service ? "Editar Serviço" : "Novo Serviço"}
          </DialogTitle>
        </DialogHeader>
        <ServiceForm
          onSubmit={onSubmit}
          onCancel={onClose}
          initialData={service || undefined}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
