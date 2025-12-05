import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Upload, Calendar, FileText } from "lucide-react";

const quickActions = [
  {
    title: "Cadastrar Artista",
    description: "Adicionar novo artista",
    icon: Plus,
    href: "/artistas",
    variant: "default" as const,
    flow: "Primeiro passo: cadastrar artista"
  },
  {
    title: "Iniciar Projeto",
    description: "Começar novo projeto musical",
    icon: Plus,
    href: "/projetos",
    variant: "secondary" as const,
    flow: "Segundo passo do fluxo"
  },
  {
    title: "Registrar Obra",
    description: "Após criar projeto",
    icon: Upload,
    href: "/registro-musicas",
    variant: "secondary" as const,
    flow: "Segundo passo do fluxo"
  },
  {
    title: "Fazer Lançamento",
    description: "Após registro concluído",
    icon: Calendar,
    href: "/lancamentos",
    variant: "secondary" as const,
    flow: "Terceiro passo do fluxo"
  },
  {
    title: "Iniciar Marketing",
    description: "Após lançamento ativo",
    icon: FileText,
    href: "/marketing/visao-geral",
    variant: "secondary" as const,
    flow: "Quarto passo do fluxo"
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Fluxo Principal</CardTitle>
        <p className="text-sm text-muted-foreground">Siga o fluxo de trabalho completo: Projeto → Registro → Lançamento → Marketing</p>
      </CardHeader>
      <CardContent className="grid grid-cols-5 gap-3">
        {quickActions.map((action) => (
          <Button
            key={action.title}
            variant={action.variant}
            className="h-auto p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform text-center"
            asChild
          >
            <a href={action.href}>
              <div className="flex flex-col items-center gap-2">
                <action.icon className="h-5 w-5" />
                <span className="font-medium text-sm">{action.title}</span>
                <span className="text-xs text-muted-foreground text-center">{action.description}</span>
              </div>
            </a>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}