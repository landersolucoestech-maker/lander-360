import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MarketingContentForm } from "@/components/forms/MarketingContentForm";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface MarketingContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  contentType?: string;
}

export const MarketingContentModal = ({ isOpen, onClose, initialData, contentType }: MarketingContentModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement actual content service
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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