import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MarketingTaskForm } from "@/components/forms/MarketingTaskForm";
import { useToast } from "@/hooks/use-toast";
import { useCreateMarketingTask } from "@/hooks/useMarketing";

interface MarketingTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export const MarketingTaskModal = ({ isOpen, onClose, initialData }: MarketingTaskModalProps) => {
  const { toast } = useToast();
  const createTask = useCreateMarketingTask();

  const handleSubmit = async (data: any) => {
    try {
      await createTask.mutateAsync(data);
      
      toast({
        title: "Tarefa Salva",
        description: "A tarefa foi salva com sucesso!",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar tarefa.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="sr-only">
          <DialogTitle>{initialData ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da tarefa de marketing
          </DialogDescription>
        </DialogHeader>
        <MarketingTaskForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          initialData={initialData}
        />
      </DialogContent>
    </Dialog>
  );
};