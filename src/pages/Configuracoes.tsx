import { useState } from "react";
import { useTheme } from "next-themes";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings, Bell, Database, Link2, Music, DollarSign, BarChart3, Mail, MessageSquare, Calendar, FileText, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import { useBackupData } from "@/hooks/useBackupData";
import { RestoreBackupModal } from "@/components/modals/RestoreBackupModal";

const Configuracoes = () => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { settings: systemSettings, toggleAutoBackup, updateTimezone } = useSystemSettings();
  const { settings: notificationSettings, toggleNewContracts, toggleContractsExpiring, toggleNewReleases } = useNotificationSettings();
  const { exportData, createBackup, isExporting, isBackingUp } = useBackupData();
  const [showRestoreBackup, setShowRestoreBackup] = useState(false);
  const [timezoneInput, setTimezoneInput] = useState(systemSettings.timezone);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
              <p className="text-muted-foreground">
                Gerencie as configurações do sistema e preferências
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notificações
                  </CardTitle>
                  <CardDescription>
                    Configure as notificações que deseja receber
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Novos Contratos</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber notificação sobre novos contratos
                      </p>
                    </div>
                    <Switch 
                      checked={notificationSettings.newContracts}
                      onCheckedChange={toggleNewContracts}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Contratos Vencendo</Label>
                      <p className="text-sm text-muted-foreground">
                        Alertas de vencimento de contratos
                      </p>
                    </div>
                    <Switch 
                      checked={notificationSettings.contractsExpiring}
                      onCheckedChange={toggleContractsExpiring}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Novos Lançamentos</Label>
                      <p className="text-sm text-muted-foreground">
                        Notificações sobre lançamentos
                      </p>
                    </div>
                    <Switch 
                      checked={notificationSettings.newReleases}
                      onCheckedChange={toggleNewReleases}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* System Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Sistema
                  </CardTitle>
                  <CardDescription>
                    Configurações gerais do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Modo Escuro</Label>
                      <p className="text-sm text-muted-foreground">
                        Alternar entre tema claro e escuro
                      </p>
                    </div>
                    <Switch 
                      checked={theme === 'dark'}
                      onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Backup Automático</Label>
                      <p className="text-sm text-muted-foreground">
                        Backup diário dos dados
                      </p>
                    </div>
                    <Switch 
                      checked={systemSettings.autoBackup}
                      onCheckedChange={toggleAutoBackup}
                    />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Fuso Horário</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={timezoneInput}
                        onChange={(e) => setTimezoneInput(e.target.value)}
                        placeholder="America/Sao_Paulo" 
                        className="flex-1"
                      />
                      <Button 
                        size="sm"
                        onClick={() => {
                          updateTimezone(timezoneInput);
                        }}
                        disabled={timezoneInput === systemSettings.timezone}
                      >
                        Salvar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Database */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Dados e Backup
                  </CardTitle>
                  <CardDescription>
                    Gerencie backups e exportação de dados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2"
                      onClick={exportData}
                      disabled={isExporting}
                    >
                      <Database className="h-4 w-4" />
                      {isExporting ? 'Exportando...' : 'Exportar Dados'}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2"
                      onClick={createBackup}
                      disabled={isBackingUp}
                    >
                      <Database className="h-4 w-4" />
                      {isBackingUp ? 'Criando...' : 'Backup Manual'}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2"
                      onClick={() => setShowRestoreBackup(true)}
                    >
                      <Database className="h-4 w-4" />
                      Restaurar Backup
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Integrations */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link2 className="h-5 w-5" />
                    Integrações
                  </CardTitle>
                  <CardDescription>
                    Conecte suas plataformas e serviços externos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Distribuidoras */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Music className="h-4 w-4" />
                      Distribuidoras
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <IntegrationItem 
                        name="ONErpm" 
                        connected={false}
                        onConnect={() => toast({ title: "Conectar ONErpm", description: "Funcionalidade em desenvolvimento" })}
                      />
                      <IntegrationItem 
                        name="DistroKid" 
                        connected={false}
                        onConnect={() => toast({ title: "Conectar DistroKid", description: "Funcionalidade em desenvolvimento" })}
                      />
                      <IntegrationItem 
                        name="Believe" 
                        connected={false}
                        onConnect={() => toast({ title: "Conectar Believe", description: "Funcionalidade em desenvolvimento" })}
                      />
                      <IntegrationItem 
                        name="TuneCore" 
                        connected={false}
                        onConnect={() => toast({ title: "Conectar TuneCore", description: "Funcionalidade em desenvolvimento" })}
                      />
                      <IntegrationItem 
                        name="CD Baby" 
                        connected={false}
                        onConnect={() => toast({ title: "Conectar CD Baby", description: "Funcionalidade em desenvolvimento" })}
                      />
                      <IntegrationItem 
                        name="30por1" 
                        connected={false}
                        onConnect={() => toast({ title: "Conectar 30por1", description: "Funcionalidade em desenvolvimento" })}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Plataformas de Streaming */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Plataformas de Streaming
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <IntegrationItem 
                        name="Spotify for Artists" 
                        connected={false}
                        onConnect={() => toast({ title: "Conectar Spotify", description: "Funcionalidade em desenvolvimento" })}
                      />
                      <IntegrationItem 
                        name="YouTube Music" 
                        connected={false}
                        onConnect={() => toast({ title: "Conectar YouTube", description: "Funcionalidade em desenvolvimento" })}
                      />
                      <IntegrationItem 
                        name="Apple Music" 
                        connected={false}
                        onConnect={() => toast({ title: "Conectar Apple Music", description: "Funcionalidade em desenvolvimento" })}
                      />
                      <IntegrationItem 
                        name="Deezer" 
                        connected={false}
                        onConnect={() => toast({ title: "Conectar Deezer", description: "Funcionalidade em desenvolvimento" })}
                      />
                      <IntegrationItem 
                        name="Amazon Music" 
                        connected={false}
                        onConnect={() => toast({ title: "Conectar Amazon Music", description: "Funcionalidade em desenvolvimento" })}
                      />
                      <IntegrationItem 
                        name="Tidal" 
                        connected={false}
                        onConnect={() => toast({ title: "Conectar Tidal", description: "Funcionalidade em desenvolvimento" })}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Redes Sociais */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Redes Sociais
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <IntegrationItem 
                        name="Instagram" 
                        connected={false}
                        onConnect={() => toast({ title: "Conectar Instagram", description: "Funcionalidade em desenvolvimento" })}
                      />
                      <IntegrationItem 
                        name="TikTok" 
                        connected={false}
                        onConnect={() => toast({ title: "Conectar TikTok", description: "Funcionalidade em desenvolvimento" })}
                      />
                      <IntegrationItem 
                        name="Facebook" 
                        connected={false}
                        onConnect={() => toast({ title: "Conectar Facebook", description: "Funcionalidade em desenvolvimento" })}
                      />
                      <IntegrationItem 
                        name="X (Twitter)" 
                        connected={false}
                        onConnect={() => toast({ title: "Conectar X", description: "Funcionalidade em desenvolvimento" })}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Financeiro */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Financeiro
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <IntegrationItem 
                        name="Banco do Brasil" 
                        connected={false}
                        onConnect={() => toast({ title: "Conectar Banco do Brasil", description: "Funcionalidade em desenvolvimento" })}
                      />
                      <IntegrationItem 
                        name="Itaú" 
                        connected={false}
                        onConnect={() => toast({ title: "Conectar Itaú", description: "Funcionalidade em desenvolvimento" })}
                      />
                      <IntegrationItem 
                        name="Bradesco" 
                        connected={false}
                        onConnect={() => toast({ title: "Conectar Bradesco", description: "Funcionalidade em desenvolvimento" })}
                      />
                      <IntegrationItem 
                        name="Nubank" 
                        connected={false}
                        onConnect={() => toast({ title: "Conectar Nubank", description: "Funcionalidade em desenvolvimento" })}
                      />
                      <IntegrationItem 
                        name="PayPal" 
                        connected={false}
                        onConnect={() => toast({ title: "Conectar PayPal", description: "Funcionalidade em desenvolvimento" })}
                      />
                      <IntegrationItem 
                        name="Stripe" 
                        connected={false}
                        onConnect={() => toast({ title: "Conectar Stripe", description: "Funcionalidade em desenvolvimento" })}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Outros */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Outros Serviços
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <IntegrationItem 
                        name="Google Calendar" 
                        connected={false}
                        onConnect={() => toast({ title: "Conectar Google Calendar", description: "Funcionalidade em desenvolvimento" })}
                      />
                      <IntegrationItem 
                        name="Google Drive" 
                        connected={false}
                        onConnect={() => toast({ title: "Conectar Google Drive", description: "Funcionalidade em desenvolvimento" })}
                      />
                      <IntegrationItem 
                        name="Dropbox" 
                        connected={false}
                        onConnect={() => toast({ title: "Conectar Dropbox", description: "Funcionalidade em desenvolvimento" })}
                      />
                      <IntegrationItem 
                        name="Mailchimp" 
                        connected={false}
                        onConnect={() => toast({ title: "Conectar Mailchimp", description: "Funcionalidade em desenvolvimento" })}
                      />
                      <IntegrationItem 
                        name="WhatsApp Business" 
                        connected={false}
                        onConnect={() => toast({ title: "Conectar WhatsApp", description: "Funcionalidade em desenvolvimento" })}
                      />
                      <IntegrationItem 
                        name="ECAD/UBC" 
                        connected={false}
                        onConnect={() => toast({ title: "Conectar ECAD/UBC", description: "Funcionalidade em desenvolvimento" })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>

      <RestoreBackupModal
        open={showRestoreBackup}
        onOpenChange={setShowRestoreBackup}
      />
    </SidebarProvider>
  );
};

// Integration Item Component
const IntegrationItem = ({ 
  name, 
  connected, 
  onConnect 
}: { 
  name: string; 
  connected: boolean; 
  onConnect: () => void;
}) => {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-2">
        {connected ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="text-sm font-medium">{name}</span>
      </div>
      {connected ? (
        <Badge variant="outline" className="text-green-500 border-green-500">
          Conectado
        </Badge>
      ) : (
        <Button variant="outline" size="sm" onClick={onConnect}>
          Conectar
        </Button>
      )}
    </div>
  );
};

export default Configuracoes;
