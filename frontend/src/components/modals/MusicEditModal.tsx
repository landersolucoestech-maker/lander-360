import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MusicRegistrationForm } from "@/components/forms/MusicRegistrationForm";

interface MusicEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  song: any;
  onSuccess?: () => void;
}

export function MusicEditModal({ open, onOpenChange, song, onSuccess }: MusicEditModalProps) {
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
          <DialogTitle className="text-lg sm:text-xl">Editar Música</DialogTitle>
        </DialogHeader>
        <MusicRegistrationForm
          registration={song}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}