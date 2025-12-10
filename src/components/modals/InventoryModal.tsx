import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InventoryForm, InventoryInitialData } from "@/components/forms/InventoryForm";
import { useCreateInventory, useUpdateInventory } from "@/hooks/useInventory";

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment?: InventoryInitialData | null;
  isEditMode?: boolean;
}

export function InventoryModal({ isOpen, onClose, equipment, isEditMode = false }: InventoryModalProps) {
  const createInventory = useCreateInventory();
  const updateInventory = useUpdateInventory();

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

    if (isEditMode && equipment?.id) {
      await updateInventory.mutateAsync({ id: equipment.id, data: inventoryData });
    } else {
      await createInventory.mutateAsync(inventoryData);
    }
    onClose();
  };

  const isPending = createInventory.isPending || updateInventory.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {isEditMode ? "Editar Item" : "Novo Item no Inventário"}
          </DialogTitle>
        </DialogHeader>
        <InventoryForm 
          onSubmit={handleSubmit} 
          onCancel={onClose}
          isSubmitting={isPending}
          initialData={equipment}
          isEditMode={isEditMode}
        />
      </DialogContent>
    </Dialog>
  );
}