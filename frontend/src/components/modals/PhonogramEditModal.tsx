import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PhonogramForm } from "@/components/forms/PhonogramForm";

interface PhonogramEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phonogram: any;
  onSuccess?: () => void;
}

export function PhonogramEditModal({ open, onOpenChange, phonogram, onSuccess }: PhonogramEditModalProps) {
  const handleSuccess = () => {
    onSuccess?.();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {phonogram ? 'Editar Fonograma' : 'Novo Fonograma'}
          </DialogTitle>
        </DialogHeader>
        <PhonogramForm
          phonogram={phonogram}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
