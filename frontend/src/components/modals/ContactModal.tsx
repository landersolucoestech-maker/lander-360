import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ContactForm } from "@/components/forms/ContactForm";

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

export function ContactModal({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: ContactModalProps) {
  const handleSubmit = async (data: any) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {initialData ? "Editar Contato" : "Novo Contato"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {initialData
              ? "Atualize as informações do contato"
              : "Preencha as informações do novo contato"}
          </DialogDescription>
        </DialogHeader>
        <ContactForm
          key={initialData?.id || 'new'}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialData={initialData}
        />
      </DialogContent>
    </Dialog>
  );
}