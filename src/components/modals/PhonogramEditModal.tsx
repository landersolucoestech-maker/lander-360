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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{phonogram ? 'Editar Fonograma' : 'Novo Fonograma'}</DialogTitle>
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
