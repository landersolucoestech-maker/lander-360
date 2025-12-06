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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Bell, Database, Link2, Music, DollarSign, Calendar, FileText, CheckCircle2, XCircle, Landmark, Sun, Moon, Monitor, Clock, Shield } from "lucide-react";
import { BankIntegrationModal } from "@/components/modals/BankIntegrationModal";
import { useToast } from "@/hooks/use-toast";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import { useBackupData } from "@/hooks/useBackupData";
import { useSessionSettings } from "@/hooks/useSessionSettings";
import { RestoreBackupModal } from "@/components/modals/RestoreBackupModal";

const Configuracoes = () => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { settings: systemSettings, toggleAutoBackup, updateTimezone } = useSystemSettings();
  const { settings: notificationSettings, toggleNewContracts, toggleContractsExpiring, toggleNewReleases } = useNotificationSettings();
  const { exportData, createBackup, isExporting, isBackingUp } = useBackupData();
  const { settings: sessionSettings, updateTimeoutMinutes, TIMEOUT_OPTIONS } = useSessionSettings();
  const [showRestoreBackup, setShowRestoreBackup] = useState(false);
  const [showBankIntegration, setShowBankIntegration] = useState(false);
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
                      <Label>Aparência</Label>
                      <p className="text-sm text-muted-foreground">
                        Escolha o tema da interface
                      </p>
                    </div>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Selecionar tema" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center gap-2">
                            <Sun className="h-4 w-4" />
                            Claro
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Moon className="h-4 w-4" />
                            Escuro
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center gap-2">
                            <Monitor className="h-4 w-4" />
                            Sistema
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
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

              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Segurança
                  </CardTitle>
                  <CardDescription>
                    Configure as opções de segurança da conta
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Tempo de Expiração da Sessão
                    </Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Sua sessão será encerrada automaticamente após este período de inatividade
                    </p>
                    <Select 
                      value={sessionSettings.timeoutMinutes.toString()} 
                      onValueChange={(value) => {
                        updateTimeoutMinutes(parseInt(value));
                        toast({
                          title: "Configuração atualizada",
                          description: `Sessão expirará após ${TIMEOUT_OPTIONS.find(o => o.value === parseInt(value))?.label || value + ' minutos'} de inatividade`
                        });
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecionar tempo" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEOUT_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                        name="30por1" 
                        connected={false}
                        onConnect={() => toast({ title: "Conectar 30por1", description: "Funcionalidade em desenvolvimento" })}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Gestão de Direitos */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Gestão de Direitos Autorais
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <IntegrationItem 
                        name="ABRAMUS" 
                        connected={false}
                        onConnect={() => toast({ title: "Conectar ABRAMUS", description: "Funcionalidade em desenvolvimento" })}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Financeiro */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Landmark className="h-4 w-4" />
                      Integração Bancária
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <IntegrationItem 
                        name="Conta Bancária" 
                        connected={false}
                        onConnect={() => setShowBankIntegration(true)}
                      />
                    </div>
                  </div>

                  {/* Calendário */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Calendário
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <IntegrationItem 
                        name="Google Calendar" 
                        connected={false}
                        onConnect={() => toast({ title: "Conectar Google Calendar", description: "Funcionalidade em desenvolvimento" })}
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
      
      <BankIntegrationModal
        open={showBankIntegration}
        onOpenChange={setShowBankIntegration}
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
