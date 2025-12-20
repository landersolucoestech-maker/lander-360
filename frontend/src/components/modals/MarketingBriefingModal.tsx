import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MarketingBriefingForm } from "@/components/forms/MarketingBriefingForm";
import { useToast } from "@/hooks/use-toast";
import { useCreateMarketingBriefing } from "@/hooks/useMarketing";

interface MarketingBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export const MarketingBriefingModal = ({ isOpen, onClose, initialData }: MarketingBriefingModalProps) => {
  const { toast } = useToast();
  const createBriefing = useCreateMarketingBriefing();

  const handleSubmit = async (data: any) => {
    try {
      await createBriefing.mutateAsync(data);
      
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