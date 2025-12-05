import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Shield } from "lucide-react";

const PerfilUsuario = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 space-y-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
              <p className="text-muted-foreground">Informações do sistema</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <Avatar className="h-24 w-24">
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl">G3</AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle>Gestão 360</CardTitle>
                  <CardDescription className="flex items-center justify-center gap-2">
                    <Mail className="h-4 w-4" />Sistema de Gestão
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Função:</span>
                      <Badge variant="outline"><Shield className="h-3 w-3 mr-1" />Administrador</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Informações do Sistema</CardTitle>
                  <CardDescription>Sistema de gestão para gravadoras e artistas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nome do Sistema</label>
                      <p>Gestão 360</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Versão</label>
                      <p>1.0.0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default PerfilUsuario;
