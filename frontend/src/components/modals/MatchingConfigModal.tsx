import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

interface MatchingConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MatchingConfigModal({ isOpen, onClose }: MatchingConfigModalProps) {
  const { toast } = useToast();
  const [matchThreshold, setMatchThreshold] = useState([85]);
  const [autoMatch, setAutoMatch] = useState(true);
  const [notifyUnreported, setNotifyUnreported] = useState(true);
  const [matchingFrequency, setMatchingFrequency] = useState("daily");

  const handleSave = () => {
    toast({
      title: "Configurações salvas",
      description: "As configurações de matching foram atualizadas com sucesso.",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configurar Matching Automático</DialogTitle>
          <DialogDescription>
            Configure os parâmetros do sistema de correspondência automática de obras.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Threshold */}
          <div className="space-y-3">
            <Label>Limiar de Correspondência: {matchThreshold[0]}%</Label>
            <Slider
              value={matchThreshold}
              onValueChange={setMatchThreshold}
              max={100}
              min={50}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Porcentagem mínima de similaridade para considerar uma correspondência válida.
            </p>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label>Frequência de Verificação</Label>
            <Select value={matchingFrequency} onValueChange={setMatchingFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realtime">Tempo Real</SelectItem>
                <SelectItem value="hourly">A cada hora</SelectItem>
                <SelectItem value="daily">Diário</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Auto Match Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Matching Automático</Label>
              <p className="text-xs text-muted-foreground">
                Ativa correspondência automática sem intervenção manual.
              </p>
            </div>
            <Switch checked={autoMatch} onCheckedChange={setAutoMatch} />
          </div>

          {/* Notify Unreported */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificar Não Reportados</Label>
              <p className="text-xs text-muted-foreground">
                Enviar alerta quando detectar execuções não reportadas.
              </p>
            </div>
            <Switch checked={notifyUnreported} onCheckedChange={setNotifyUnreported} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Configurações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
