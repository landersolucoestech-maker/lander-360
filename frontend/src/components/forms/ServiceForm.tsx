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
  grupo: z.string().min(1, "Grupo é obrigatório"),
  category: z.string().min(1, "Categoria é obrigatória"),
  service_type: z.string().min(1, "Tipo é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  cost_price: z.number().min(0, "Valor deve ser maior ou igual a zero"),
  margin: z.number().min(0, "Margem deve ser maior ou igual a zero"),
  sale_price: z.number().min(0, "Preço deve ser maior ou igual a zero"),
  discount_value: z.number().min(0).optional(),
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

const grupos = [
  { value: "agenciamento", label: "Agenciamento" },
  { value: "producao_musical", label: "Produção Musical" },
  { value: "producao_audiovisual", label: "Produção Audiovisual" },
  { value: "editora", label: "Editora" },
  { value: "design_grafico", label: "Design Gráfico" },
  { value: "gerenciamento_redes_sociais", label: "Gerenciamento de Redes Sociais" },
  { value: "trafego_pago", label: "Tráfego Pago" },
  { value: "criacao_sites", label: "Criação de Sites" },
];

const categories = [
  { value: "consultoria", label: "Consultoria" },
  { value: "criacao_sites", label: "Criação de Sites" },
  { value: "design_grafico", label: "Design Gráfico" },
  { value: "distribuicao_musical", label: "Distribuição Musical" },
  { value: "editora_musical", label: "Editora Musical" },
  { value: "financeiro_admin", label: "Financeiro/Admin" },
  { value: "gerenciamento_redes_sociais", label: "Gerenciamento de Redes Sociais" },
  { value: "gestao_carreira", label: "Gestão de Carreira" },
  { value: "marketing", label: "Marketing" },
  { value: "parcerias", label: "Parcerias" },
  { value: "producao_audiovisual", label: "Produção Audiovisual" },
  { value: "producao_conteudo", label: "Produção de Conteúdo" },
  { value: "producao_musical", label: "Produção Musical" },
  { value: "trafego_pago", label: "Tráfego Pago" },
];

const serviceTypes = [
  { value: "avulso", label: "Avulso" },
  { value: "mensal", label: "Mensal" },
  { value: "pacote", label: "Pacote" },
  { value: "pacote_1", label: "Pacote 1" },
  { value: "pacote_2", label: "Pacote 2" },
  { value: "pacote_3", label: "Pacote 3" },
  { value: "pacote_4", label: "Pacote 4" },
  { value: "pacote_5", label: "Pacote 5" },
  { value: "pacote_6", label: "Pacote 6" },
  { value: "pacote_7", label: "Pacote 7" },
  { value: "pacote_essencial", label: "Pacote Essencial" },
  { value: "pacote_iniciante", label: "Pacote Iniciante" },
  { value: "pacote_intermediario", label: "Pacote Intermediário" },
  { value: "pacote_intermediario_completo", label: "Pacote Intermediário (Completo)" },
  { value: "pacote_profissional", label: "Pacote Profissional" },
];

export function ServiceForm({ onSubmit, onCancel, initialData, isLoading }: ServiceFormProps) {
  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      grupo: initialData?.grupo || "",
      category: initialData?.category || "",
      service_type: initialData?.service_type || "",
      description: initialData?.description || "",
      cost_price: initialData?.cost_price || 0,
      margin: initialData?.margin || 0,
      sale_price: initialData?.sale_price || 0,
      discount_value: initialData?.discount_value || 0,
      final_price: initialData?.final_price || 0,
      observations: initialData?.observations || "",
    },
  });

  const costPrice = form.watch("cost_price");
  const margin = form.watch("margin");
  const salePrice = form.watch("sale_price");
  const discountValue = form.watch("discount_value");

  // Calculate sale_price based on cost_price and margin
  useEffect(() => {
    const cost = costPrice || 0;
    const marginValue = margin || 0;
    const calculatedSalePrice = cost + (cost * marginValue / 100);
    form.setValue("sale_price", Math.round(calculatedSalePrice * 100) / 100);
  }, [costPrice, margin, form]);

  // Calculate final_price based on sale_price and discount
  useEffect(() => {
    const sale = salePrice || 0;
    const discount = discountValue || 0;
    const calculatedFinalPrice = sale - (sale * discount / 100);
    form.setValue("final_price", Math.max(0, Math.round(calculatedFinalPrice * 100) / 100));
  }, [salePrice, discountValue, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="grupo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grupo</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o grupo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {grupos.map((grupo) => (
                      <SelectItem key={grupo.value} value={grupo.value}>
                        {grupo.label}
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
                <FormLabel>Tipo</FormLabel>
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
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="cost_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Custo (R$)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="margin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Margem (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sale_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Venda (R$)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    readOnly
                    className="bg-muted"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="discount_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Desc%</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="final_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Total (R$)</FormLabel>
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
        </div>

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
