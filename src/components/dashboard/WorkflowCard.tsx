import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: "completed" | "current" | "pending";
  href: string;
}

const workflowSteps: WorkflowStep[] = [
  {
    id: "projeto",
    title: "Projeto",
    description: "Criar e definir o projeto musical",
    status: "completed",
    href: "/projetos"
  },
  {
    id: "registro",
    title: "Registro",
    description: "Registrar obra/fonograma",
    status: "current",
    href: "/registro-musicas"
  },
  {
    id: "lancamento",
    title: "Lançamento",
    description: "Distribuição em plataformas",
    status: "pending",
    href: "/lancamentos"
  },
  {
    id: "marketing",
    title: "Marketing",
    description: "Divulgação e promoção",
    status: "pending",
    href: "/marketing/visao-geral"
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-success" />;
    case "current":
      return <Clock className="h-4 w-4 text-warning" />;
    case "pending":
      return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    default:
      return null;
  }
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case "completed":
      return "success" as const;
    case "current":
      return "warning" as const;
    case "pending":
      return "secondary" as const;
    default:
      return "secondary" as const;
  }
};

export function WorkflowCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Fluxo de Trabalho</CardTitle>
        <p className="text-sm text-muted-foreground">
          Acompanhe o progresso do seu projeto através das etapas
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {workflowSteps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              {getStatusIcon(step.status)}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm">{step.title}</h4>
                  <Badge variant={getStatusVariant(step.status)} className="text-xs">
                    {step.status === "completed" ? "Concluído" : 
                     step.status === "current" ? "Atual" : "Pendente"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
            <Button 
              variant={step.status === "current" ? "default" : "outline"} 
              size="sm"
              asChild
            >
              <Link to={step.href}>
                {step.status === "current" ? "Continuar" : "Acessar"}
              </Link>
            </Button>
            {index < workflowSteps.length - 1 && (
              <ArrowRight className="h-4 w-4 text-muted-foreground ml-2" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}