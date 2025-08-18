import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface WorkflowNavigationProps {
  currentStep: "projeto" | "registro" | "lancamento" | "marketing";
  projectId?: string;
}

const workflowSteps = {
  projeto: {
    title: "Projetos",
    next: { href: "/registro-musicas", title: "Registrar Obra" },
    prev: null
  },
  registro: {
    title: "Registro de Obras",
    next: { href: "/lancamentos", title: "Fazer Lançamento" },
    prev: { href: "/projetos", title: "Voltar aos Projetos" }
  },
  lancamento: {
    title: "Lançamentos",
    next: { href: "/marketing/visao-geral", title: "Iniciar Marketing" },
    prev: { href: "/registro-musicas", title: "Voltar ao Registro" }
  },
  marketing: {
    title: "Marketing",
    next: null,
    prev: { href: "/lancamentos", title: "Voltar aos Lançamentos" }
  }
};

export function WorkflowNavigation({ currentStep, projectId }: WorkflowNavigationProps) {
  const step = workflowSteps[currentStep];
  
  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          {step.prev && (
            <Button variant="outline" size="sm" asChild>
              <a href={step.prev.href} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                {step.prev.title}
              </a>
            </Button>
          )}
          <div className="text-sm text-muted-foreground">
            Fluxo de trabalho: <span className="font-medium text-foreground">{step.title}</span>
          </div>
        </div>
        
        {step.next && (
          <Button size="sm" asChild>
            <a href={step.next.href} className="flex items-center gap-2">
              {step.next.title}
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}