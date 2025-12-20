import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InvoiceForm } from "@/components/forms/InvoiceForm";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InvoiceModal({ isOpen, onClose }: InvoiceModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createInvoice = useMutation({
    mutationFn: async (data: any) => {
      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  const handleSubmit = async (data: any) => {
    try {
      await createInvoice.mutateAsync(data);
      
      toast({
        title: "Nota Fiscal Criada",
        description: "A nota fiscal foi criada com sucesso!",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar nota fiscal.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Nova Nota Fiscal</DialogTitle>
        </DialogHeader>
        <InvoiceForm 
          onSubmit={handleSubmit} 
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}