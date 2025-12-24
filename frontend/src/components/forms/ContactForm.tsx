import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Upload, User } from "lucide-react";
import { getTodayDateString } from "@/lib/utils";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DateInput } from "@/components/ui/date-input";
import { parse, format } from "date-fns";
import { useArtists } from "@/hooks/useArtists";

const interactionSchema = z.object({
  date: z.string().min(1, "Data é obrigatória"),
  description: z.string().min(1, "Descrição é obrigatória"),
  type: z.string().optional(),
});

const contactSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().optional(),
  phone: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  artist_name: z.string().optional(),
  document: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  image_url: z.string().optional(),
  interactions: z.array(interactionSchema).optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

// Artist Dropdown Component
function ArtistDropdown({ value, onChange }: { value?: string; onChange: (value: string) => void }) {
  const { data: artists = [], isLoading } = useArtists();

  return (
    <div className="space-y-2">
      <Label htmlFor="artist_name">Responsável pelo Artista</Label>
      <Select onValueChange={onChange} value={value || ""}>
        <SelectTrigger>
          <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione o artista"} />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {artists.map((artist) => (
            <SelectItem key={artist.id} value={artist.name}>
              {artist.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => void;
  onCancel: () => void;
  initialData?: Partial<ContactFormData>;
}

export function ContactForm({ onSubmit, onCancel, initialData }: ContactFormProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url || null);
  const [isUploading, setIsUploading] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      ...initialData,
      interactions: initialData?.interactions || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "interactions",
  });

  const addInteraction = () => {
    append({
      date: getTodayDateString(),
      description: "",
      type: "nota",
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem válida.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `contacts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("crm-contacts")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("crm-contacts")
        .getPublicUrl(filePath);

      setImagePreview(publicUrl);
      setValue("image_url", publicUrl);
      
      toast({
        title: "Sucesso",
        description: "Imagem enviada com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      toast({
        title: "Erro",
        description: "Erro ao enviar imagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

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

  const handleManualSubmit = async () => {
    const formData = watch();
    if (!formData.name || formData.name.trim() === "") {
      toast({
        title: "Erro",
        description: "O campo Nome é obrigatório.",
        variant: "destructive",
      });
      return;
    }
    try {
      await onSubmit(formData);
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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 sm:space-y-6">
      {/* Upload de Imagem */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        <div 
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted cursor-pointer hover:border-primary transition-colors flex-shrink-0"
          onClick={() => fileInputRef.current?.click()}
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <User className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Foto do Contato</Label>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-1 sm:mr-2" />
              {isUploading ? "Enviando..." : "Selecionar"}
            </Button>
            {imagePreview && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setImagePreview(null);
                  setValue("image_url", "");
                }}
              >
                Remover
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">JPG, PNG ou WebP. Máximo 5MB.</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
          <Select onValueChange={(value) => setValue("type", value)} value={watch("type")} defaultValue={initialData?.type}>
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
              <SelectItem value="assessoria_imprensa">Assessoria de imprensa</SelectItem>
              <SelectItem value="associacoes_musicos">Associações de músicos</SelectItem>
              <SelectItem value="bancos">Bancos</SelectItem>
              <SelectItem value="barbeiro">Barbeiro</SelectItem>
              <SelectItem value="cartorio">Cartório</SelectItem>
              <SelectItem value="casa_show">Casa de show</SelectItem>
              <SelectItem value="clientes_corporativos">Clientes corporativos</SelectItem>
              <SelectItem value="colaborador">Colaborador</SelectItem>
              <SelectItem value="concessionaria">Concessionária</SelectItem>
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
              <SelectItem value="gravadora">Gravadora</SelectItem>
              <SelectItem value="hoteis">Hotéis</SelectItem>
              <SelectItem value="influenciador">Influenciador(a)</SelectItem>
              <SelectItem value="instrutor_vocal">Instrutor vocal</SelectItem>
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
              <SelectItem value="orgao_arrecadador">Órgão Arrecadador (Receita Federal, Estadual, Municipal)</SelectItem>
              <SelectItem value="produtor_artistico">Produtor artístico</SelectItem>
              <SelectItem value="produtor_cultural">Produtor cultural</SelectItem>
              <SelectItem value="produtor_fonografico">Produtor fonográfico</SelectItem>
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
          <Select onValueChange={(value) => setValue("status", value)} value={watch("status")} defaultValue={initialData?.status}>
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
          <Select onValueChange={(value) => setValue("priority", value)} value={watch("priority")} defaultValue={initialData?.priority}>
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
          <Select onValueChange={(value) => setValue("position", value)} value={watch("position")} defaultValue={initialData?.position}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o cargo" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem value="produtor_artistico">Produtor Artístico</SelectItem>
              <SelectItem value="produtor_musical">Produtor Musical</SelectItem>
              <SelectItem value="produtor_fonografico">Produtor Fonográfico</SelectItem>
              <SelectItem value="engenheiro_audio">Engenheiro de Áudio</SelectItem>
              <SelectItem value="engenheiro_mixagem">Engenheiro de Mixagem</SelectItem>
              <SelectItem value="engenheiro_masterizacao">Engenheiro de Masterização</SelectItem>
              <SelectItem value="compositor">Compositor</SelectItem>
              <SelectItem value="letrista">Letrista</SelectItem>
              <SelectItem value="arranjador">Arranjador</SelectItem>
              <SelectItem value="diretor_artistico">Diretor Artístico</SelectItem>
              <SelectItem value="diretor_criativo">Diretor Criativo</SelectItem>
              <SelectItem value="manager">Manager / Empresário</SelectItem>
              <SelectItem value="tour_manager">Tour Manager</SelectItem>
              <SelectItem value="agente">Agente de Booking</SelectItem>
              <SelectItem value="social_media">Social Media</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="assessor_imprensa">Assessor de Imprensa</SelectItem>
              <SelectItem value="fotografo">Fotógrafo</SelectItem>
              <SelectItem value="videomaker">Videomaker</SelectItem>
              <SelectItem value="designer">Designer Gráfico</SelectItem>
              <SelectItem value="advogado">Advogado</SelectItem>
              <SelectItem value="contador">Contador</SelectItem>
              <SelectItem value="administrativo">Administrativo</SelectItem>
              <SelectItem value="financeiro">Financeiro</SelectItem>
              <SelectItem value="ceo">CEO / Diretor</SelectItem>
              <SelectItem value="socio">Sócio</SelectItem>
              <SelectItem value="assistente">Assistente</SelectItem>
              <SelectItem value="estagiario">Estagiário</SelectItem>
              <SelectItem value="freelancer">Freelancer</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="document">CPF/CNPJ</Label>
          <Input
            id="document"
            {...register("document")}
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
          />
        </div>

        {watch("position") === "produtor_artistico" && (
          <ArtistDropdown 
            value={watch("artist_name")} 
            onChange={(value) => setValue("artist_name", value)} 
          />
        )}

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
          <Select onValueChange={(value) => setValue("state", value)} value={watch("state")} defaultValue={initialData?.state}>
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

      {/* Histórico de Interações */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Histórico de Interações</Label>
          <Button type="button" variant="outline" size="sm" onClick={addInteraction}>
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Interação
          </Button>
        </div>

        {fields.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma interação registrada.</p>
        )}

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-lg space-y-3 bg-muted/30">
              <div className="flex items-start justify-between gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                  <div className="space-y-2">
                    <Label htmlFor={`interactions.${index}.date`}>Data</Label>
                    <DateInput
                      value={field.date ? parse(field.date, "yyyy-MM-dd", new Date()) : undefined}
                      onChange={(date) => {
                        if (date) {
                          setValue(`interactions.${index}.date`, format(date, "yyyy-MM-dd"));
                        } else {
                          setValue(`interactions.${index}.date`, "");
                        }
                      }}
                      placeholder="DD/MM/AAAA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`interactions.${index}.type`}>Tipo</Label>
                    <Select 
                      onValueChange={(value) => setValue(`interactions.${index}.type`, value)}
                      defaultValue={field.type || "nota"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nota">Nota</SelectItem>
                        <SelectItem value="ligacao">Ligação</SelectItem>
                        <SelectItem value="email">E-mail</SelectItem>
                        <SelectItem value="reuniao">Reunião</SelectItem>
                        <SelectItem value="visita">Visita</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`interactions.${index}.description`}>Descrição</Label>
                <Textarea
                  {...register(`interactions.${index}.description`)}
                  placeholder="Descreva a interação..."
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="button" onClick={handleManualSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar Contato"}
        </Button>
      </div>
    </form>
  );
}