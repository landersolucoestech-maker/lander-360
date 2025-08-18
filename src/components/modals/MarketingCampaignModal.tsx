import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MarketingCampaignForm } from "@/components/forms/MarketingCampaignForm";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface MarketingCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export const MarketingCampaignModal = ({ isOpen, onClose, initialData }: MarketingCampaignModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement actual campaign service
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      
      toast({
        title: "Campanha Salva",
        description: "A campanha foi salva com sucesso!",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar campanha.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>{initialData ? "Editar Campanha" : "Nova Campanha"}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da campanha de marketing
          </DialogDescription>
        </DialogHeader>
        <MarketingCampaignForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          initialData={initialData}
        />
      </DialogContent>
    </Dialog>
  );
};