import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  PlayCircle, 
  Calendar, 
  DollarSign, 
  Users, 
  Music,
  Mic2,
  Headphones
} from "lucide-react";

interface ProjectViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: any;
}

export function ProjectViewModal({
  open,
  onOpenChange,
  project,
}: ProjectViewModalProps) {
  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Projeto</DialogTitle>
          <DialogDescription>
            Informações completas do projeto musical
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header com nome e status */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
              <PlayCircle className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{project.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <Badge 
                  variant={
                    project.status === "Concluído" ? "default" :
                    project.status === "Em Andamento" ? "secondary" : "outline"
                  }
                >
                  {project.status}
                </Badge>
                <Badge variant="secondary">{project.type}</Badge>
                <Badge variant="outline">{project.genre}</Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Progresso */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Progresso do Projeto</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Conclusão</span>
                <span className="font-medium">{project.progress || 0}%</span>
              </div>
              <Progress value={project.progress || 0} className="h-2" />
            </div>
          </div>

          <Separator />

          {/* Equipe */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Equipe do Projeto</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Music className="h-5 w-5 text-primary" />
                  <span className="font-medium">Compositores</span>
                </div>
                <p className="text-sm text-muted-foreground">{project.compositors || "Não informado"}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Mic2 className="h-5 w-5 text-primary" />
                  <span className="font-medium">Intérpretes</span>
                </div>
                <p className="text-sm text-muted-foreground">{project.interpreters || "Não informado"}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Headphones className="h-5 w-5 text-primary" />
                  <span className="font-medium">Produtores</span>
                </div>
                <p className="text-sm text-muted-foreground">{project.djProducer || "Não informado"}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Datas e Orçamento */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Informações do Projeto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Data de Início</div>
                  <div className="font-medium">
                    {project.startDate ? new Date(project.startDate).toLocaleDateString('pt-BR') : "Não definida"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Data de Término</div>
                  <div className="font-medium">
                    {project.endDate ? new Date(project.endDate).toLocaleDateString('pt-BR') : "Não definida"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Orçamento</div>
                  <div className="font-medium">{project.budget || "Não definido"}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Gênero Musical</div>
                  <div className="font-medium">{project.genre || "Não definido"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}