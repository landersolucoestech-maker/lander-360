import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InventoryForm } from "@/components/forms/InventoryForm";
import { useCreateInventory } from "@/hooks/useInventory";

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InventoryModal({ isOpen, onClose }: InventoryModalProps) {
  const createInventory = useCreateInventory();

  const handleSubmit = async (data: any) => {
    const inventoryData = {
      name: data.name,
      quantity: data.quantity ? parseInt(data.quantity, 10) : 1,
      category: data.category || null,
      location: data.location || null,
      status: data.status || 'Disponível',
      sector: data.sector || null,
      responsible: data.responsible || null,
      purchase_location: data.purchaseLocation || null,
      invoice_number: data.invoiceNumber || null,
      entry_date: data.entryDate ? data.entryDate.toISOString().split('T')[0] : null,
      unit_value: data.unitValue ? parseFloat(data.unitValue.replace(/[^\d.,]/g, '').replace(',', '.')) : null,
      observations: data.observations || null,
    };

    await createInventory.mutateAsync(inventoryData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Novo Item no Inventário</DialogTitle>
        </DialogHeader>
        <InventoryForm 
          onSubmit={handleSubmit} 
          onCancel={onClose}
          isSubmitting={createInventory.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}