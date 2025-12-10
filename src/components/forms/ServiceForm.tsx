import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEffect } from "react";

const serviceSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  category: z.string().min(1, "Categoria é obrigatória"),
  service_type: z.string().min(1, "Tipo é obrigatório"),
  sale_price: z.number().min(0, "Preço deve ser maior ou igual a zero"),
  sale_price_type: z.string().optional(),
  discount_value: z.number().min(0).optional(),
  discount_type: z.string().optional(),
  final_price: z.number().min(0).optional(),
  observations: z.string().optional(),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  onSubmit: (data: ServiceFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<ServiceFormData>;
  isLoading?: boolean;
}

const categories = [
  { value: "agenciamento", label: "Agenciamento" },
  { value: "gestao_carreira", label: "Gestão de Carreira" },
  { value: "producao_musical", label: "Produção Musical" },
  { value: "producao_audiovisual", label: "Produção Audiovisual" },
  { value: "design_grafico", label: "Design Gráfico" },
  { value: "gestao_redes_sociais", label: "Gestão de Redes Sociais" },
  { value: "trafego_pago", label: "Tráfego Pago" },
  { value: "criacao_sites", label: "Criação de Sites" },
  { value: "edicao_musical", label: "Edição Musical" },
];

const serviceTypes = [
  { value: "recorrente", label: "Recorrente" },
  { value: "avulso", label: "Avulso" },
  { value: "pacote", label: "Pacote" },
];

const discountTypes = [
  { value: "percentage", label: "Percentual (%)" },
  { value: "fixed", label: "Valor Fixo (R$)" },
];

const salePriceTypes = [
  { value: "fixed", label: "R$" },
  { value: "percentage", label: "%" },
];

export function ServiceForm({ onSubmit, onCancel, initialData, isLoading }: ServiceFormProps) {
  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      category: initialData?.category || "",
      service_type: initialData?.service_type || "",
      sale_price: initialData?.sale_price || 0,
      sale_price_type: initialData?.sale_price_type || "fixed",
      discount_value: initialData?.discount_value || 0,
      discount_type: initialData?.discount_type || "percentage",
      final_price: initialData?.final_price || 0,
      observations: initialData?.observations || "",
    },
  });

  const salePrice = form.watch("sale_price");
  const salePriceType = form.watch("sale_price_type");
  const discountValue = form.watch("discount_value");
  const discountType = form.watch("discount_type");

  // Calculate final price automatically
  useEffect(() => {
    let finalPrice = salePrice || 0;
    const discount = discountValue || 0;

    if (discountType === "percentage") {
      finalPrice = salePrice - (salePrice * discount / 100);
    } else {
      finalPrice = salePrice - discount;
    }

    form.setValue("final_price", Math.max(0, finalPrice));
  }, [salePrice, discountValue, discountType, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Serviço</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome do serviço" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="service_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Serviço</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {serviceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="sale_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço de Venda</FormLabel>
                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="sale_price_type"
                    render={({ field: typeField }) => (
                      <Select onValueChange={typeField.onChange} value={typeField.value}>
                        <SelectTrigger className="w-20">
                          <SelectValue placeholder="R$" />
                        </SelectTrigger>
                        <SelectContent>
                          {salePriceTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max={salePriceType === "percentage" ? 100 : undefined}
                      placeholder="0,00"
                      className="flex-1"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discount_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Desconto</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {discountTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discount_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Desconto {discountType === "percentage" ? "(%)" : "(R$)"}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max={discountType === "percentage" ? 100 : undefined}
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="final_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preço Final (R$)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  readOnly
                  className="bg-muted"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição do Serviço</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva os detalhes do serviço..."
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar Serviço"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
