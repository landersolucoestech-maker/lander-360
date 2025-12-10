import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MarketingBriefingForm } from "@/components/forms/MarketingBriefingForm";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface MarketingBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export const MarketingBriefingModal = ({ isOpen, onClose, initialData }: MarketingBriefingModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement actual briefing service
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      
      toast({
        title: "Briefing Salvo",
        description: "O briefing foi salvo com sucesso!",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar briefing.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="sr-only">
          <DialogTitle>{initialData ? "Editar Briefing" : "Novo Briefing"}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes do briefing de marketing
          </DialogDescription>
        </DialogHeader>
        <MarketingBriefingForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          initialData={initialData}
        />
      </DialogContent>
    </Dialog>
  );
};