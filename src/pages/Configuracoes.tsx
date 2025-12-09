import { useState, useEffect } from "react";
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
import { Settings, Bell, Database, Link2, Music, DollarSign, Calendar, FileText, CheckCircle2, XCircle, Landmark, Sun, Moon, Monitor } from "lucide-react";
import { BankIntegrationModal } from "@/components/modals/BankIntegrationModal";
import { IntegrationModal } from "@/components/modals/IntegrationModal";
import { useToast } from "@/hooks/use-toast";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import { useBackupData } from "@/hooks/useBackupData";
import { RestoreBackupModal } from "@/components/modals/RestoreBackupModal";

// Integration configurations
const integrationConfigs = {
  onerpm: {
    id: 'onerpm',
    name: 'ONErpm',
    type: 'distributor' as const,
    description: 'Distribuidora global com presença na América Latina. Conecte para sincronizar lançamentos e métricas.',
    website: 'https://onerpm.com',
  },
  distrokid: {
    id: 'distrokid',
    name: 'DistroKid',
    type: 'distributor' as const,
    description: 'Distribuidora digital com distribuição ilimitada. Conecte para gerenciar seus lançamentos.',
    website: 'https://distrokid.com',
  },
  '30por1': {
    id: '30por1',
    name: '30por1',
    type: 'distributor' as const,
    description: 'Distribuidora brasileira independente. Conecte para sincronizar catálogo e relatórios.',
    website: 'https://30por1.com.br',
  },
  abramus: {
    id: 'abramus',
    name: 'ABRAMUS',
    type: 'rights' as const,
    description: 'Associação Brasileira de Música e Artes. Conecte para consultar registros de obras e direitos autorais.',
    website: 'https://abramus.org.br',
    requiredFields: [
      { key: 'codigo_socio', label: 'Código de Sócio ABRAMUS', placeholder: 'Ex: 123456', type: 'text' },
      { key: 'cpf', label: 'CPF do Titular', placeholder: '000.000.000-00', type: 'text' },
    ],
  },
  google_calendar: {
    id: 'google_calendar',
    name: 'Google Calendar',
    type: 'calendar' as const,
    description: 'Sincronize eventos e compromissos da agenda com o Google Calendar.',
    website: 'https://calendar.google.com',
    requiredFields: [
      { key: 'email', label: 'E-mail da conta Google', placeholder: 'seu@gmail.com', type: 'email' },
      { key: 'password', label: 'Senha', placeholder: 'Digite sua senha', type: 'password' },
    ],
  },
};

const Configuracoes = () => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { settings: systemSettings, toggleAutoBackup, updateTimezone } = useSystemSettings();
  const { settings: notificationSettings, toggleNewContracts, toggleContractsExpiring, toggleNewReleases } = useNotificationSettings();
  const { exportData, createBackup, isExporting, isBackingUp } = useBackupData();
  const [showRestoreBackup, setShowRestoreBackup] = useState(false);
  const [showBankIntegration, setShowBankIntegration] = useState(false);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<typeof integrationConfigs[keyof typeof integrationConfigs] | null>(null);
  const [timezoneInput, setTimezoneInput] = useState(systemSettings.timezone);
  const [connectedIntegrations, setConnectedIntegrations] = useState<Record<string, boolean>>({});

  // Load connected integrations from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('integrations');
    if (stored) {
      const parsed = JSON.parse(stored);
      const connected: Record<string, boolean> = {};
      Object.keys(parsed).forEach(key => {
        connected[key] = parsed[key].connected;
      });
      setConnectedIntegrations(connected);
    }
  }, [showIntegrationModal]);

  const handleOpenIntegration = (integrationKey: keyof typeof integrationConfigs) => {
    setSelectedIntegration(integrationConfigs[integrationKey]);
    setShowIntegrationModal(true);
  };

  const handleIntegrationConnect = (integrationId: string) => {
    setConnectedIntegrations(prev => ({ ...prev, [integrationId]: true }));
  };

  const handleIntegrationDisconnect = (integrationId: string) => {
    // Remove from localStorage
    const stored = localStorage.getItem('integrations');
    if (stored) {
      const parsed = JSON.parse(stored);
      delete parsed[integrationId];
      localStorage.setItem('integrations', JSON.stringify(parsed));
    }
    setConnectedIntegrations(prev => ({ ...prev, [integrationId]: false }));
    toast({
      title: "Integração desconectada",
      description: "A integração foi removida com sucesso.",
    });
  };

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
                        connected={connectedIntegrations['onerpm'] || false}
                        onConnect={() => handleOpenIntegration('onerpm')}
                        onDisconnect={() => handleIntegrationDisconnect('onerpm')}
                      />
                      <IntegrationItem 
                        name="DistroKid" 
                        connected={connectedIntegrations['distrokid'] || false}
                        onConnect={() => handleOpenIntegration('distrokid')}
                        onDisconnect={() => handleIntegrationDisconnect('distrokid')}
                      />
                      <IntegrationItem 
                        name="30por1" 
                        connected={connectedIntegrations['30por1'] || false}
                        onConnect={() => handleOpenIntegration('30por1')}
                        onDisconnect={() => handleIntegrationDisconnect('30por1')}
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
                        connected={connectedIntegrations['abramus'] || false}
                        onConnect={() => handleOpenIntegration('abramus')}
                        onDisconnect={() => handleIntegrationDisconnect('abramus')}
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
                        connected={connectedIntegrations['bank'] || false}
                        onConnect={() => setShowBankIntegration(true)}
                        onDisconnect={() => handleIntegrationDisconnect('bank')}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Calendário */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Calendário
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <IntegrationItem 
                        name="Google Calendar" 
                        connected={connectedIntegrations['google_calendar'] || false}
                        onConnect={() => handleOpenIntegration('google_calendar')}
                        onDisconnect={() => handleIntegrationDisconnect('google_calendar')}
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

      <IntegrationModal
        open={showIntegrationModal}
        onOpenChange={setShowIntegrationModal}
        integration={selectedIntegration}
        onConnect={handleIntegrationConnect}
      />
    </SidebarProvider>
  );
};

// Integration Item Component
const IntegrationItem = ({ 
  name, 
  connected, 
  onConnect,
  onDisconnect 
}: { 
  name: string; 
  connected: boolean; 
  onConnect: () => void;
  onDisconnect: () => void;
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
        <Button 
          variant="destructive" 
          size="sm"
          onClick={onDisconnect}
        >
          Desconectar
        </Button>
      ) : (
        <Button 
          variant="outline" 
          size="sm"
          onClick={onConnect}
        >
          Conectar
        </Button>
      )}
    </div>
  );
};

export default Configuracoes;
