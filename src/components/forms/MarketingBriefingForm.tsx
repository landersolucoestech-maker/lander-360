import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Plus, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface MarketingBriefingFormProps {
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
}

export const MarketingBriefingForm = ({ onSubmit, onCancel, initialData }: MarketingBriefingFormProps) => {
  const { toast } = useToast();
  const [deadline, setDeadline] = useState<Date | undefined>(initialData?.deadline ? new Date(initialData.deadline) : undefined);
  const [deliverables, setDeliverables] = useState<string[]>(initialData?.deliverables || []);
  const [newDeliverable, setNewDeliverable] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const data = {
      title: formData.get("title"),
      campaign: formData.get("campaign"),
      objective: formData.get("objective"),
      targetAudience: formData.get("targetAudience"),
      description: formData.get("description"),
      budget: formData.get("budget"),
      priority: formData.get("priority"),
      status: formData.get("status"),
      deadline: deadline?.toISOString(),
      deliverables,
    };

    onSubmit?.(data);
    toast({
      title: "Briefing salvo",
      description: "O briefing foi salvo com sucesso.",
    });
  };

  const addDeliverable = () => {
    if (newDeliverable.trim() && !deliverables.includes(newDeliverable.trim())) {
      setDeliverables([...deliverables, newDeliverable.trim()]);
      setNewDeliverable("");
    }
  };

  const removeDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData ? "Editar Briefing" : "Novo Briefing de Marketing"}</CardTitle>
        <CardDescription>
          Defina os detalhes e diretrizes do projeto de marketing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Briefing *</Label>
              <Input
                id="title"
                name="title"
                defaultValue={initialData?.title}
                placeholder="Ex: Briefing - Lançamento Single"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaign">Campanha Relacionada *</Label>
              <Input
                id="campaign"
                name="campaign"
                defaultValue={initialData?.campaign}
                placeholder="Ex: Lançamento EP"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade *</Label>
              <Select name="priority" defaultValue={initialData?.priority}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select name="status" defaultValue={initialData?.status}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em-revisao">Em Revisão</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="rejeitado">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget (R$)</Label>
              <Input
                id="budget"
                name="budget"
                type="number"
                step="0.01"
                defaultValue={initialData?.budget?.replace("R$ ", "")}
                placeholder="5000.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Prazo de Entrega *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !deadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "dd/MM/yyyy") : "Selecione o prazo"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={setDeadline}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="objective">Objetivo do Projeto *</Label>
            <Textarea
              id="objective"
              name="objective"
              defaultValue={initialData?.objective}
              placeholder="Descreva o objetivo principal do projeto"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAudience">Público-Alvo *</Label>
            <Textarea
              id="targetAudience"
              name="targetAudience"
              defaultValue={initialData?.targetAudience}
              placeholder="Ex: 18-35 anos, interessados em música pop"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição Detalhada</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={initialData?.description}
              placeholder="Descreva os detalhes, estratégias e requisitos do projeto"
              rows={4}
            />
          </div>

          <div className="space-y-3">
            <Label>Entregáveis</Label>
            <div className="flex gap-2">
              <Input
                value={newDeliverable}
                onChange={(e) => setNewDeliverable(e.target.value)}
                placeholder="Ex: Posts Instagram, Stories, Vídeo TikTok"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addDeliverable())}
              />
              <Button type="button" onClick={addDeliverable} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {deliverables.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {deliverables.map((deliverable, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {deliverable}
                    <button
                      type="button"
                      onClick={() => removeDeliverable(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {initialData ? "Atualizar Briefing" : "Criar Briefing"}
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