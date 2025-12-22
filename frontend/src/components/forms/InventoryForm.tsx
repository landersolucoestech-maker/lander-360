import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DateInput } from "@/components/ui/date-input";
import { useEffect } from "react";

const inventorySchema = z.object({
  // Basic Information
  sector: z.string().optional(),
  category: z.string().optional(),
  name: z.string().min(1, "Nome do item é obrigatório"),
  quantity: z.string().optional(),
  location: z.string().optional(),
  responsible: z.string().optional(),
  status: z.string().optional(),
  
  // Purchase Information
  purchaseLocation: z.string().optional(),
  invoiceNumber: z.string().optional(),
  entryDate: z.date().optional().nullable(),
  unitValue: z.string().optional(),
  
  // Additional Information
  observations: z.string().optional(),
});

type InventoryFormData = z.infer<typeof inventorySchema>;

export interface InventoryInitialData {
  id: string;
  name: string;
  category: string;
  status: string;
  quantity: number;
  location: string;
  unit_value: number | null;
  sector: string | null;
  responsible: string | null;
  purchase_location: string | null;
  invoice_number: string | null;
  entry_date: string | null;
  observations: string | null;
}

interface InventoryFormProps {
  onSubmit: (data: InventoryFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  initialData?: InventoryInitialData | null;
  isEditMode?: boolean;
}

export function InventoryForm({ onSubmit, onCancel, isSubmitting = false, initialData, isEditMode = false }: InventoryFormProps) {
  const form = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      entryDate: new Date(),
      status: "Disponível",
    },
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (initialData && isEditMode) {
      form.reset({
        name: initialData.name || '',
        sector: initialData.sector || '',
        category: initialData.category || '',
        quantity: String(initialData.quantity || 1),
        location: initialData.location || '',
        responsible: initialData.responsible || '',
        status: initialData.status || 'Disponível',
        purchaseLocation: initialData.purchase_location || '',
        invoiceNumber: initialData.invoice_number || '',
        entryDate: initialData.entry_date ? new Date(initialData.entry_date) : new Date(),
        unitValue: initialData.unit_value ? String(initialData.unit_value) : '',
        observations: initialData.observations || '',
      });
    }
  }, [initialData, isEditMode, form]);

  const watchedQuantity = form.watch("quantity");
  const watchedUnitValue = form.watch("unitValue");

  // Calculate total value automatically
  const calculateTotalValue = () => {
    const quantity = parseFloat(watchedQuantity || "0");
    const unitValue = parseFloat(watchedUnitValue?.replace(/[^\d.,]/g, "")?.replace(",", ".") || "0");
    return (quantity * unitValue).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        {/* Basic Information */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-base sm:text-lg font-semibold">Informações Básicas</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <FormField
              control={form.control}
              name="sector"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Setor</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o setor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="administrativo">Administrativo / Corporativo</SelectItem>
                        <SelectItem value="arquivo">Arquivo e Documentação</SelectItem>
                        <SelectItem value="artistico">Artístico (A&R – Artistas & Repertório)</SelectItem>
                        <SelectItem value="comercial">Comercial / Vendas</SelectItem>
                        <SelectItem value="comunicacao">Comunicação e Imprensa (PR)</SelectItem>
                        <SelectItem value="distribuicao">Distribuição Digital</SelectItem>
                        <SelectItem value="editora">Editora Musical (Publishing)</SelectItem>
                        <SelectItem value="eventos">Eventos e Shows</SelectItem>
                        <SelectItem value="financeiro">Financeiro</SelectItem>
                        <SelectItem value="juridico">Jurídico</SelectItem>
                        <SelectItem value="logistica">Logística e Operações</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="producao_audiovisual">Produção Audiovisual</SelectItem>
                        <SelectItem value="producao_musical">Produção Musical</SelectItem>
                        <SelectItem value="rh">Recursos Humanos (RH)</SelectItem>
                        <SelectItem value="ti">Tecnologia / TI</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="audio">Áudio</SelectItem>
                        <SelectItem value="video">Vídeo</SelectItem>
                        <SelectItem value="estrutura">Estrutura</SelectItem>
                        <SelectItem value="computador">Computador</SelectItem>
                        <SelectItem value="software">Software</SelectItem>
                        <SelectItem value="mobilia">Mobilia</SelectItem>
                        <SelectItem value="iluminacao">Iluminação</SelectItem>
                        <SelectItem value="escritorio">Escritório</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Item</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Microfone Condensador AKG C414" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" placeholder="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Localização</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Estúdio A, Sala 201, Depósito" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="responsible"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsável</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do responsável" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Disponível">Disponível</SelectItem>
                      <SelectItem value="Em Uso">Em Uso</SelectItem>
                      <SelectItem value="Manutenção">Em Manutenção</SelectItem>
                      <SelectItem value="Danificado">Danificado</SelectItem>
                      <SelectItem value="Emprestado">Emprestado</SelectItem>
                      <SelectItem value="Descartado">Descartado</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Purchase Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Informações de Compra</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="purchaseLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Local de Compra</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Loja de Música ABC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="invoiceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número da Nota Fiscal</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: NF-123456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="entryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Entrada</FormLabel>
                  <FormControl>
                    <DateInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="DD/MM/AAAA"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="unitValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Unitário (R$)</FormLabel>
                  <FormControl>
                    <Input placeholder="0,00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Valor Total (Calculado)</label>
              <div className="h-10 px-3 py-2 border border-input bg-muted/50 rounded-md text-sm font-medium text-foreground flex items-center">
                {calculateTotalValue()}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Informações Adicionais</h3>
          
          <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Observações adicionais sobre o item (garantia, especificações técnicas, etc.)" 
                    className="min-h-[80px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : isEditMode ? "Salvar Alterações" : "Cadastrar Item"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={isSubmitting}>
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}