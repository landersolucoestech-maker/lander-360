import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Upload, Calendar, FileText } from "lucide-react";
import { Link } from "react-router-dom";
const quickActions = [{
  title: "Cadastrar Artista",
  description: "Adicionar novo artista",
  icon: Plus,
  href: "/artistas",
  variant: "default" as const,
  flow: "Primeiro passo: cadastrar artista"
}, {
  title: "Iniciar Projeto",
  description: "Começar novo projeto musical",
  icon: Plus,
  href: "/projetos",
  variant: "secondary" as const,
  flow: "Segundo passo do fluxo"
}, {
  title: "Registrar Obra",
  description: "Após criar projeto",
  icon: Upload,
  href: "/registro-musicas",
  variant: "secondary" as const,
  flow: "Segundo passo do fluxo"
}, {
  title: "Fazer Lançamento",
  description: "Após registro concluído",
  icon: Calendar,
  href: "/lancamentos",
  variant: "secondary" as const,
  flow: "Terceiro passo do fluxo"
}, {
  title: "Iniciar Marketing",
  description: "Após lançamento ativo",
  icon: FileText,
  href: "/marketing/visao-geral",
  variant: "secondary" as const,
  flow: "Quarto passo do fluxo"
}];
export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {quickActions.map((action, index) => (
          <Link key={index} to={action.href} className="block">
            <Button
              variant={action.variant}
              className="w-full justify-start gap-3"
            >
              <action.icon className="h-4 w-4" />
              <div className="flex flex-col items-start text-left">
                <span className="font-medium">{action.title}</span>
                <span className="text-xs text-muted-foreground">{action.description}</span>
              </div>
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}