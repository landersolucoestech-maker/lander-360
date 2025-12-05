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
import { Settings, Bell, Database } from "lucide-react";
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

export default Configuracoes;
