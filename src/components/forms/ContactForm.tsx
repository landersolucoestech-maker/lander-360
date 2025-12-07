import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const contactSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  type: z.string().min(1, "Selecione o tipo de contato"),
  status: z.string().min(1, "Selecione o status"),
  priority: z.string().min(1, "Selecione a prioridade"),
  company: z.string().optional(),
  position: z.string().optional(),
  document: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  notes: z.string().optional(),
  nextAction: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => void;
  onCancel: () => void;
  initialData?: Partial<ContactFormData>;
}

export function ContactForm({ onSubmit, onCancel, initialData }: ContactFormProps) {
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: initialData,
  });

  const handleFormSubmit = async (data: ContactFormData) => {
    try {
      await onSubmit(data);
      toast({
        title: "Sucesso",
        description: "Contato salvo com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar contato. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Nome do contato"
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="email@exemplo.com"
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone *</Label>
          <Input
            id="phone"
            {...register("phone")}
            placeholder="+55 11 99999-0000"
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Tipo *</Label>
          <Select onValueChange={(value) => setValue("type", value)} defaultValue={initialData?.type}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem value="agencia_booking">Agência de booking</SelectItem>
              <SelectItem value="agencia_branding">Agência de branding</SelectItem>
              <SelectItem value="agencia_casting">Agência de casting</SelectItem>
              <SelectItem value="agencia_marketing">Agência de marketing</SelectItem>
              <SelectItem value="agencia_publicidade">Agência de publicidade</SelectItem>
              <SelectItem value="agencia_sync">Agência de sync/licenciamento</SelectItem>
              <SelectItem value="agencia_viagem">Agência de viagem</SelectItem>
              <SelectItem value="artista">Artista</SelectItem>
              <SelectItem value="assessoria_imprensa">Assessoria de imprensa</SelectItem>
              <SelectItem value="associacoes_musicos">Associações de músicos</SelectItem>
              <SelectItem value="bancos">Bancos</SelectItem>
              <SelectItem value="barbeiro">Barbeiro</SelectItem>
              <SelectItem value="cartorio">Cartório</SelectItem>
              <SelectItem value="casa_show">Casa de show</SelectItem>
              <SelectItem value="clientes_corporativos">Clientes corporativos</SelectItem>
              <SelectItem value="colaborador">Colaborador</SelectItem>
              <SelectItem value="compositor">Compositor</SelectItem>
              <SelectItem value="consultor_estrategia">Consultor de estratégia</SelectItem>
              <SelectItem value="consultor_financeiro">Consultor financeiro</SelectItem>
              <SelectItem value="consultor_marketing">Consultor de marketing</SelectItem>
              <SelectItem value="contratantes">Contratantes</SelectItem>
              <SelectItem value="correios">Correios</SelectItem>
              <SelectItem value="criadores_conteudo">Criadores de conteúdo</SelectItem>
              <SelectItem value="curadores_playlist">Curadores de playlist</SelectItem>
              <SelectItem value="dancarina">Dançarino(a)</SelectItem>
              <SelectItem value="designer_grafico">Designer gráfico</SelectItem>
              <SelectItem value="diretor_socio">Diretor / Sócio</SelectItem>
              <SelectItem value="distribuidora_digital">Distribuidora digital</SelectItem>
              <SelectItem value="editora_musical">Editora musical</SelectItem>
              <SelectItem value="empresario_artistico">Empresário artístico</SelectItem>
              <SelectItem value="empresas_ecommerce">Empresas de e-commerce</SelectItem>
              <SelectItem value="empresas_tecnologia">Empresas de tecnologia</SelectItem>
              <SelectItem value="engenheiro_audio">Engenheiro de áudio</SelectItem>
              <SelectItem value="engenheiro_masterizacao">Engenheiro de masterização</SelectItem>
              <SelectItem value="engenheiro_mixagem">Engenheiro de mixagem</SelectItem>
              <SelectItem value="equipe_limpeza">Equipe de limpeza</SelectItem>
              <SelectItem value="escritorio_juridico">Escritório jurídico</SelectItem>
              <SelectItem value="fornecedor">Fornecedor</SelectItem>
              <SelectItem value="fotografo">Fotógrafo</SelectItem>
              <SelectItem value="funcionarios">Funcionários</SelectItem>
              <SelectItem value="graficas">Gráficas</SelectItem>
              <SelectItem value="gravadora_musical">Gravadora musical</SelectItem>
              <SelectItem value="hoteis">Hotéis</SelectItem>
              <SelectItem value="influenciador">Influenciador(a)</SelectItem>
              <SelectItem value="instrutor_vocal">Instrutor vocal</SelectItem>
              <SelectItem value="interprete">Intérprete</SelectItem>
              <SelectItem value="jornalistas">Jornalistas</SelectItem>
              <SelectItem value="leads">Leads</SelectItem>
              <SelectItem value="locadores_equipamento">Locadores de equipamento</SelectItem>
              <SelectItem value="maquiadores">Maquiadores</SelectItem>
              <SelectItem value="marcas">Marcas</SelectItem>
              <SelectItem value="marketplaces">Marketplaces</SelectItem>
              <SelectItem value="motorista">Motorista</SelectItem>
              <SelectItem value="oficina_mecanica">Oficina mecânica</SelectItem>
              <SelectItem value="parceiros">Parceiros</SelectItem>
              <SelectItem value="patrocinadores">Patrocinadores</SelectItem>
              <SelectItem value="plataformas_streaming">Plataformas de streaming</SelectItem>
              <SelectItem value="prefeitura">Prefeitura</SelectItem>
              <SelectItem value="produtor_artistico">Produtor artístico</SelectItem>
              <SelectItem value="produtor_cultural">Produtor cultural</SelectItem>
              <SelectItem value="produtor_fonografico">Produtor fonográfico</SelectItem>
              <SelectItem value="produtor_musical">Produtor musical</SelectItem>
              <SelectItem value="produtora_eventos">Produtora de eventos</SelectItem>
              <SelectItem value="produtora_video">Produtora de vídeo</SelectItem>
              <SelectItem value="sala_ensaio">Sala de ensaio</SelectItem>
              <SelectItem value="salao_beleza">Salão de beleza</SelectItem>
              <SelectItem value="secretaria_cultura">Secretaria de cultura</SelectItem>
              <SelectItem value="seguranca">Segurança</SelectItem>
              <SelectItem value="social_media">Social media</SelectItem>
              <SelectItem value="tecnico_iluminacao">Técnico de iluminação</SelectItem>
              <SelectItem value="tecnico_palco">Técnico de palco</SelectItem>
              <SelectItem value="tecnico_som">Técnico de som</SelectItem>
              <SelectItem value="tour_manager">Tour manager</SelectItem>
              <SelectItem value="transportadoras">Transportadoras</SelectItem>
              <SelectItem value="tv_radio">TV / Rádio</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-sm text-destructive">{errors.type.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select onValueChange={(value) => setValue("status", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="frio">Frio</SelectItem>
              <SelectItem value="morno">Morno</SelectItem>
              <SelectItem value="quente">Quente</SelectItem>
              <SelectItem value="negociacao">Negociação</SelectItem>
              <SelectItem value="fechado">Fechado</SelectItem>
              <SelectItem value="perdido">Perdido</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-destructive">{errors.status.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Prioridade *</Label>
          <Select onValueChange={(value) => setValue("priority", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="baixa">Baixa</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
            </SelectContent>
          </Select>
          {errors.priority && (
            <p className="text-sm text-destructive">{errors.priority.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Empresa/Cliente</Label>
          <Input
            id="company"
            {...register("company")}
            placeholder="Nome da empresa ou cliente"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Cargo</Label>
          <Input
            id="position"
            {...register("position")}
            placeholder="Cargo na empresa"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="document">CPF/CNPJ</Label>
          <Input
            id="document"
            {...register("document")}
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Endereço</Label>
          <Input
            id="address"
            {...register("address")}
            placeholder="Rua, número, complemento"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            {...register("city")}
            placeholder="Cidade"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">Estado</Label>
          <Select onValueChange={(value) => setValue("state", value)}>
            <SelectTrigger>
              <SelectValue placeholder="UF" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AC">AC</SelectItem>
              <SelectItem value="AL">AL</SelectItem>
              <SelectItem value="AP">AP</SelectItem>
              <SelectItem value="AM">AM</SelectItem>
              <SelectItem value="BA">BA</SelectItem>
              <SelectItem value="CE">CE</SelectItem>
              <SelectItem value="DF">DF</SelectItem>
              <SelectItem value="ES">ES</SelectItem>
              <SelectItem value="GO">GO</SelectItem>
              <SelectItem value="MA">MA</SelectItem>
              <SelectItem value="MT">MT</SelectItem>
              <SelectItem value="MS">MS</SelectItem>
              <SelectItem value="MG">MG</SelectItem>
              <SelectItem value="PA">PA</SelectItem>
              <SelectItem value="PB">PB</SelectItem>
              <SelectItem value="PR">PR</SelectItem>
              <SelectItem value="PE">PE</SelectItem>
              <SelectItem value="PI">PI</SelectItem>
              <SelectItem value="RJ">RJ</SelectItem>
              <SelectItem value="RN">RN</SelectItem>
              <SelectItem value="RS">RS</SelectItem>
              <SelectItem value="RO">RO</SelectItem>
              <SelectItem value="RR">RR</SelectItem>
              <SelectItem value="SC">SC</SelectItem>
              <SelectItem value="SP">SP</SelectItem>
              <SelectItem value="SE">SE</SelectItem>
              <SelectItem value="TO">TO</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="zip_code">CEP</Label>
          <Input
            id="zip_code"
            {...register("zip_code")}
            placeholder="00000-000"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="nextAction">Próxima Ação</Label>
        <Input
          id="nextAction"
          {...register("nextAction")}
          placeholder="Ex: Reunião agendada, Follow-up, Enviar proposta"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          {...register("notes")}
          placeholder="Observações sobre o contato..."
          rows={4}
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar Contato"}
        </Button>
      </div>
    </form>
  );
}