import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MarketingContentForm } from "@/components/forms/MarketingContentForm";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MarketingContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  contentType?: string;
}

export const MarketingContentModal = ({ isOpen, onClose, initialData, contentType }: MarketingContentModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createContent = useMutation({
    mutationFn: async (data: any) => {
      const { data: content, error } = await supabase
        .from('marketing_content')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return content;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-content'] });
    },
  });

  const handleSubmit = async (data: any) => {
    try {
      await createContent.mutateAsync(data);
      
      toast({
        title: "Conteúdo Salvo",
        description: "O conteúdo foi salvo com sucesso!",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar conteúdo.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {initialData ? "Editar Conteúdo" : 
             contentType === 'post' ? "Criar Post" :
             contentType === 'stories' ? "Criar Stories" :
             "Novo Conteúdo"}
          </DialogTitle>
          <DialogDescription>
            Preencha os detalhes do conteúdo
          </DialogDescription>
        </DialogHeader>
        <MarketingContentForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          initialData={initialData}
          contentType={contentType}
        />
      </DialogContent>
    </Dialog>
  );
};