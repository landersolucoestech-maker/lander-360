import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface MarketingContentFormProps {
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
  contentType?: string; // 'post', 'stories', 'video', etc.
}

export const MarketingContentForm = ({ onSubmit, onCancel, initialData, contentType }: MarketingContentFormProps) => {
  const { toast } = useToast();
  const [publishDate, setPublishDate] = useState<Date | undefined>(initialData?.publishDate ? new Date(initialData.publishDate) : undefined);

  const getDefaultType = () => {
    switch (contentType) {
      case 'post': return 'Post';
      case 'stories': return 'Stories';
      case 'video': return 'Vídeo';
      default: return initialData?.type || '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      caption: formData.get("caption"),
      platform: formData.get("platform"),
      type: formData.get("type"),
      contentType: formData.get("contentType"),
      status: formData.get("status"),
      campaign: formData.get("campaign"),
      publishDate: publishDate?.toISOString(),
      publishTime: formData.get("publishTime"),
    };

    onSubmit?.(data);
    toast({
      title: "Conteúdo salvo",
      description: "O conteúdo foi salvo com sucesso.",
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {initialData ? "Editar Conteúdo" : 
           contentType === 'post' ? "Criar Post" :
           contentType === 'stories' ? "Criar Stories" :
           "Novo Conteúdo"}
        </CardTitle>
        <CardDescription>
          Planeje e crie conteúdo para suas redes sociais
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Conteúdo *</Label>
            <Input
              id="title"
              name="title"
              defaultValue={initialData?.title}
              placeholder="Ex: Post Instagram - Lançamento Single"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Plataforma *</Label>
              <Select name="platform" defaultValue={initialData?.platform}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a plataforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="TikTok">TikTok</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="YouTube">YouTube</SelectItem>
                  <SelectItem value="Twitter">Twitter</SelectItem>
                  <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Conteúdo *</Label>
              <Select name="type" defaultValue={getDefaultType()}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Post">Post</SelectItem>
                  <SelectItem value="Stories">Stories</SelectItem>
                  <SelectItem value="Vídeo">Vídeo</SelectItem>
                  <SelectItem value="Anúncio">Anúncio</SelectItem>
                  <SelectItem value="Carrossel">Carrossel</SelectItem>
                  <SelectItem value="Reels">Reels</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contentType">Formato *</Label>
              <Select name="contentType" defaultValue={initialData?.contentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Imagem">Imagem</SelectItem>
                  <SelectItem value="Vídeo">Vídeo</SelectItem>
                  <SelectItem value="Carrossel">Carrossel</SelectItem>
                  <SelectItem value="Texto">Texto</SelectItem>
                  <SelectItem value="GIF">GIF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select name="status" defaultValue={initialData?.status || "rascunho"}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="agendado">Agendado</SelectItem>
                  <SelectItem value="publicado">Publicado</SelectItem>
                  <SelectItem value="pausado">Pausado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaign">Campanha Relacionada</Label>
            <Input
              id="campaign"
              name="campaign"
              defaultValue={initialData?.campaign}
              placeholder="Ex: Lançamento EP"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={initialData?.description}
              placeholder="Descreva o conteúdo e seus objetivos"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="caption">Legenda/Copy</Label>
            <Textarea
              id="caption"
              name="caption"
              defaultValue={initialData?.caption}
              placeholder="Escreva a legenda que será publicada"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Publicação</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !publishDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {publishDate ? format(publishDate, "dd/MM/yyyy") : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={publishDate}
                    onSelect={setPublishDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="publishTime">Horário de Publicação</Label>
              <Input
                id="publishTime"
                name="publishTime"
                type="time"
                defaultValue={initialData?.publishTime}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {initialData ? "Atualizar Conteúdo" : "Salvar Conteúdo"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};