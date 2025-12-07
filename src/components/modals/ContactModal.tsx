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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Contato" : "Novo Contato"}
          </DialogTitle>
          <DialogDescription>
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