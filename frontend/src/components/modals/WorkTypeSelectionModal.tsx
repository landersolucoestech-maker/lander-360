import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface WorkTypeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAutoral: () => void;
  onSelectReferencia: () => void;
}

export function WorkTypeSelectionModal({
  isOpen,
  onClose,
  onSelectAutoral,
  onSelectReferencia,
}: WorkTypeSelectionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Qual tipo de obra você está cadastrando?
          </DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </button>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Obra Autoral</span>: Selecione esta opção se você for o autor ou editor da obra. Este é o cadastro oficial da criação, feito por quem integra diretamente o corpo autoral.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Obra por Referência</span>: Use esta opção apenas quando a obra for utilizada como apoio no cadastro de um fonograma, e quando você não faz parte do corpo autoral. Trata-se de um registro auxiliar, não oficial, que facilita a identificação futura da obra.
            </p>
          </div>
        </div>

        <div className="flex gap-4 pt-2">
          <Button
            onClick={onSelectAutoral}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            Obra Autoral
          </Button>
          <Button
            onClick={onSelectReferencia}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            Obra por Referência
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
