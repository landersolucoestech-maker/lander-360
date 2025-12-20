import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MarketingCampaignForm } from "@/components/forms/MarketingCampaignForm";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MarketingCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export const MarketingCampaignModal = ({ isOpen, onClose, initialData }: MarketingCampaignModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createCampaign = useMutation({
    mutationFn: async (data: any) => {
      const { data: campaign, error } = await supabase
        .from('marketing_campaigns')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return campaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
    },
  });

  const handleSubmit = async (data: any) => {
    try {
      await createCampaign.mutateAsync(data);
      
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
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
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