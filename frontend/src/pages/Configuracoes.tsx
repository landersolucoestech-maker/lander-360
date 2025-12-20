import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Settings, Bell, Database, Link2, Music, Calendar, FileText, CheckCircle2, XCircle, Landmark, 
  Sun, Moon, Monitor, Zap, User, Building2, Shield, Palette, Globe, Upload, Key, Smartphone,
  Mail, MessageSquare, Clock, Webhook, Languages
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BankIntegrationModal } from "@/components/modals/BankIntegrationModal";
import { IntegrationModal } from "@/components/modals/IntegrationModal";

import { useToast } from "@/hooks/use-toast";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import { useBackupData } from "@/hooks/useBackupData";
import { RestoreBackupModal } from "@/components/modals/RestoreBackupModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Integration configurations
const integrationConfigs = {
  onerpm: {
    id: 'onerpm',
    name: 'ONErpm',
    type: 'distributor' as const,
    description: 'Distribuidora global com presença na América Latina.',
    website: 'https://onerpm.com',
  },
  distrokid: {
    id: 'distrokid',
    name: 'DistroKid',
    type: 'distributor' as const,
    description: 'Distribuidora digital com distribuição ilimitada.',
    website: 'https://distrokid.com',
  },
  '30por1': {
    id: '30por1',
    name: '30por1',
    type: 'distributor' as const,
    description: 'Distribuidora brasileira independente.',
    website: 'https://30por1.com.br',
  },
  spotify: {
    id: 'spotify',
    name: 'Spotify',
    type: 'dsp' as const,
    description: 'Plataforma de streaming de música.',
    website: 'https://spotify.com',
  },
  apple_music: {
    id: 'apple_music',
    name: 'Apple Music',
    type: 'dsp' as const,
    description: 'Serviço de streaming da Apple.',
    website: 'https://music.apple.com',
  },
  deezer: {
    id: 'deezer',
    name: 'Deezer',
    type: 'dsp' as const,
    description: 'Plataforma de streaming francesa.',
    website: 'https://deezer.com',
  },
  abramus: {
    id: 'abramus',
    name: 'ABRAMUS',
    type: 'rights' as const,
    description: 'Associação Brasileira de Música e Artes.',
    website: 'https://abramus.org.br',
    requiredFields: [
      { key: 'codigo_socio', label: 'Código de Sócio ABRAMUS', placeholder: 'Ex: 123456', type: 'text' },
      { key: 'cpf', label: 'CPF do Titular', placeholder: '000.000.000-00', type: 'text' },
    ],
  },
  ecad: {
    id: 'ecad',
    name: 'ECAD',
    type: 'rights' as const,
    description: 'Escritório Central de Arrecadação e Distribuição.',
    website: 'https://ecad.org.br',
  },
  google_calendar: {
    id: 'google_calendar',
    name: 'Google Calendar',
    type: 'calendar' as const,
    description: 'Sincronize eventos da agenda.',
    website: 'https://calendar.google.com',
  },
  n8n: {
    id: 'n8n',
    name: 'n8n',
    type: 'automation' as const,
    description: 'Automação de workflows.',
    website: 'https://n8n.io',
  },
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    type: 'communication' as const,
    description: 'API de mensagens do WhatsApp.',
    website: 'https://business.whatsapp.com',
  },
  twilio: {
    id: 'twilio',
    name: 'Twilio',
    type: 'communication' as const,
    description: 'SMS e comunicação por voz.',
    website: 'https://twilio.com',
  },
  resend: {
    id: 'resend',
    name: 'Resend',
    type: 'communication' as const,
    description: 'Envio de e-mails transacionais.',
    website: 'https://resend.com',
  },
};

const Configuracoes = () => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings: systemSettings, toggleAutoBackup, updateTimezone } = useSystemSettings();
  const { 
    settings: notificationSettings, 
    toggleNewContracts, 
    toggleContractsExpiring, 
    toggleNewReleases,
    toggleWeeklyReminders,
    toggleEmailNotifications,
    toggleSmsNotifications,
    toggleBellNotifications
  } = useNotificationSettings();
  const { exportData, createBackup, isExporting, isBackingUp } = useBackupData();
  
  const [activeTab, setActiveTab] = useState("perfil");
  const [showRestoreBackup, setShowRestoreBackup] = useState(false);
  const [showBankIntegration, setShowBankIntegration] = useState(false);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<typeof integrationConfigs[keyof typeof integrationConfigs] | null>(null);
  const [connectedIntegrations, setConnectedIntegrations] = useState<Record<string, boolean>>({});
  
  // Profile state
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    avatarUrl: ''
  });

  // Company state
  const [companyData, setCompanyData] = useState({
    legalName: 'Lander Records Produções Artísticas LTDA',
    name: 'Lander Records',
    cnpj: '50.056.858/0001-46',
    address: 'Rua A, nº 58, Bairro Vila Império, Governador Valadares/MG, CEP 35050-560',
    phone: '',
    responsible: 'Deyvisson Lander Andrade'
  });

  // Language/Locale state
  const [localeSettings, setLocaleSettings] = useState({
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    dateFormat: 'DD/MM/YYYY',
    currency: 'BRL'
  });

  // Load profile data
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        email: user.email || '',
        fullName: user.user_metadata?.full_name || ''
      }));
    }
  }, [user]);

  // Load company data from localStorage
  useEffect(() => {
    const storedCompany = localStorage.getItem('companyData');
    if (storedCompany) {
      try {
        setCompanyData(prev => ({ ...prev, ...JSON.parse(storedCompany) }));
      } catch (error) {
        console.error('Error loading company data:', error);
      }
    }
  }, []);

  // Load locale settings from localStorage
  useEffect(() => {
    const storedLocale = localStorage.getItem('localeSettings');
    if (storedLocale) {
      try {
        setLocaleSettings(prev => ({ ...prev, ...JSON.parse(storedLocale) }));
      } catch (error) {
        console.error('Error loading locale settings:', error);
      }
    }
  }, []);

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

  const handleSaveProfile = () => {
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram salvas com sucesso.",
    });
  };

  const handleSaveCompany = () => {
    localStorage.setItem('companyData', JSON.stringify(companyData));
    toast({
      title: "Dados da empresa atualizados",
      description: "As informações da empresa foram salvas.",
    });
  };

  const handleSaveLocale = () => {
    localStorage.setItem('localeSettings', JSON.stringify(localeSettings));
    toast({
      title: "Preferências salvas",
      description: "Suas preferências de idioma foram atualizadas.",
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setProfileData(prev => ({ ...prev, avatarUrl: publicUrl }));
      toast({
        title: "Foto atualizada",
        description: "Sua foto de perfil foi alterada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao enviar foto",
        description: "Não foi possível atualizar sua foto.",
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full h-full px-4 py-3 space-y-3">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <SidebarTrigger className="h-9 w-9" />
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
                <p className="text-muted-foreground">
                  Gerencie as configurações do sistema e preferências
                </p>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="flex flex-wrap h-auto gap-1">
                <TabsTrigger value="perfil" className="gap-2">
                  <User className="h-4 w-4" />
                  Perfil
                </TabsTrigger>
                <TabsTrigger value="empresa" className="gap-2">
                  <Building2 className="h-4 w-4" />
                  Empresa
                </TabsTrigger>
                <TabsTrigger value="automacoes" className="gap-2">
                  <Zap className="h-4 w-4" />
                  Automações
                </TabsTrigger>
                <TabsTrigger value="seguranca" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Segurança
                </TabsTrigger>
                <TabsTrigger value="aparencia" className="gap-2">
                  <Palette className="h-4 w-4" />
                  Aparência
                </TabsTrigger>
                <TabsTrigger value="idioma" className="gap-2">
                  <Languages className="h-4 w-4" />
                  Idioma
                </TabsTrigger>
                <TabsTrigger value="integracoes" className="gap-2">
                  <Link2 className="h-4 w-4" />
                  Integrações
                </TabsTrigger>
              </TabsList>

              {/* Perfil Tab */}
              <TabsContent value="perfil" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Informações Pessoais
                    </CardTitle>
                    <CardDescription>
                      Atualize suas informações de perfil
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profileData.avatarUrl} />
                        <AvatarFallback className="text-2xl">
                          {profileData.fullName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Label htmlFor="avatar-upload" className="cursor-pointer">
                          <Button variant="outline" asChild>
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              Alterar Foto
                            </span>
                          </Button>
                        </Label>
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                        />
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome Completo</Label>
                        <Input
                          value={profileData.fullName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                          placeholder="Seu nome completo"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>E-mail</Label>
                        <Input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="seu@email.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Telefone</Label>
                        <Input
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                    </div>
                    <Button onClick={handleSaveProfile}>Salvar Alterações</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Empresa Tab */}
              <TabsContent value="empresa" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Dados da Empresa
                    </CardTitle>
                    <CardDescription>
                      Informações da empresa para contratos e documentos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Razão Social</Label>
                        <Input
                          value={companyData.legalName}
                          onChange={(e) => setCompanyData(prev => ({ ...prev, legalName: e.target.value }))}
                          placeholder="Razão social da empresa"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nome Fantasia</Label>
                        <Input
                          value={companyData.name}
                          onChange={(e) => setCompanyData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CNPJ</Label>
                        <Input
                          value={companyData.cnpj}
                          onChange={(e) => setCompanyData(prev => ({ ...prev, cnpj: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Endereço Completo</Label>
                        <Input
                          value={companyData.address}
                          onChange={(e) => setCompanyData(prev => ({ ...prev, address: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Telefone/WhatsApp</Label>
                        <Input
                          value={companyData.phone}
                          onChange={(e) => setCompanyData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Responsável</Label>
                        <Input
                          value={companyData.responsible}
                          onChange={(e) => setCompanyData(prev => ({ ...prev, responsible: e.target.value }))}
                        />
                      </div>
                    </div>
                    <Button onClick={handleSaveCompany}>Salvar Dados</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Automações Tab */}
              <TabsContent value="automacoes" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Dados e Backup */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Dados e Backup
                      </CardTitle>
                      <CardDescription>
                        Gerenciamento de dados e backups automáticos
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                      <div className="grid grid-cols-1 gap-2">
                        <Button 
                          variant="outline" 
                          onClick={exportData}
                          disabled={isExporting}
                        >
                          <Database className="h-4 w-4 mr-2" />
                          {isExporting ? 'Exportando...' : 'Exportar Dados'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={createBackup}
                          disabled={isBackingUp}
                        >
                          <Database className="h-4 w-4 mr-2" />
                          {isBackingUp ? 'Criando...' : 'Backup Manual'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowRestoreBackup(true)}
                        >
                          <Database className="h-4 w-4 mr-2" />
                          Restaurar Backup
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notificações */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notificações
                      </CardTitle>
                      <CardDescription>
                        Configure canais e tipos de notificação
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold">Canais</Label>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">E-mail</span>
                          </div>
                          <Switch 
                            checked={notificationSettings.emailNotifications ?? true}
                            onCheckedChange={() => toggleEmailNotifications?.()}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">SMS</span>
                          </div>
                          <Switch 
                            checked={notificationSettings.smsNotifications ?? false}
                            onCheckedChange={() => toggleSmsNotifications?.()}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Notificações no Sistema</span>
                          </div>
                          <Switch 
                            checked={notificationSettings.bellNotifications ?? true}
                            onCheckedChange={() => toggleBellNotifications?.()}
                          />
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold">Tipos</Label>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Novos Contratos</span>
                          <Switch 
                            checked={notificationSettings.newContracts}
                            onCheckedChange={toggleNewContracts}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Contratos Vencendo</span>
                          <Switch 
                            checked={notificationSettings.contractsExpiring}
                            onCheckedChange={toggleContractsExpiring}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Novos Lançamentos</span>
                          <Switch 
                            checked={notificationSettings.newReleases}
                            onCheckedChange={toggleNewReleases}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Lembretes Semanais</span>
                          <Switch 
                            checked={notificationSettings.weeklyReminders ?? false}
                            onCheckedChange={() => toggleWeeklyReminders?.()}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Segurança Tab */}
              <TabsContent value="seguranca" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        Alterar Senha
                      </CardTitle>
                      <CardDescription>
                        Atualize sua senha de acesso
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Senha Atual</Label>
                        <Input type="password" placeholder="••••••••" />
                      </div>
                      <div className="space-y-2">
                        <Label>Nova Senha</Label>
                        <Input type="password" placeholder="••••••••" />
                      </div>
                      <div className="space-y-2">
                        <Label>Confirmar Nova Senha</Label>
                        <Input type="password" placeholder="••••••••" />
                      </div>
                      <Button>Alterar Senha</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5" />
                        Autenticação em Duas Etapas
                      </CardTitle>
                      <CardDescription>
                        Adicione uma camada extra de segurança
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>2FA via Aplicativo</Label>
                          <p className="text-sm text-muted-foreground">
                            Use um app autenticador
                          </p>
                        </div>
                        <Switch />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>2FA via E-mail</Label>
                          <p className="text-sm text-muted-foreground">
                            Receba código por e-mail
                          </p>
                        </div>
                        <Switch />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Sessões Ativas
                      </CardTitle>
                      <CardDescription>
                        Gerencie suas sessões de login
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Este dispositivo</p>
                            <p className="text-sm text-muted-foreground">Última atividade: agora</p>
                          </div>
                          <Button variant="outline" size="sm" disabled>
                            Sessão Atual
                          </Button>
                        </div>
                      </div>
                      <Button variant="destructive" className="mt-4">
                        Encerrar Todas as Outras Sessões
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Aparência Tab */}
              <TabsContent value="aparencia" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Tema da Interface
                    </CardTitle>
                    <CardDescription>
                      Escolha o tema visual do sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <button
                        onClick={() => setTheme('light')}
                        className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                          theme === 'light' ? 'border-primary bg-primary/10' : 'hover:bg-muted'
                        }`}
                      >
                        <Sun className="h-8 w-8" />
                        <span className="text-sm font-medium">Claro</span>
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                          theme === 'dark' ? 'border-primary bg-primary/10' : 'hover:bg-muted'
                        }`}
                      >
                        <Moon className="h-8 w-8" />
                        <span className="text-sm font-medium">Escuro</span>
                      </button>
                      <button
                        onClick={() => setTheme('system')}
                        className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                          theme === 'system' ? 'border-primary bg-primary/10' : 'hover:bg-muted'
                        }`}
                      >
                        <Monitor className="h-8 w-8" />
                        <span className="text-sm font-medium">Sistema</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Idioma Tab */}
              <TabsContent value="idioma" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Preferências Regionais
                    </CardTitle>
                    <CardDescription>
                      Configure idioma, fuso horário e formatos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Idioma</Label>
                        <Select 
                          value={localeSettings.language} 
                          onValueChange={(v) => setLocaleSettings(prev => ({ ...prev, language: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                            <SelectItem value="en-US">English (US)</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Fuso Horário</Label>
                        <Select 
                          value={localeSettings.timezone} 
                          onValueChange={(v) => setLocaleSettings(prev => ({ ...prev, timezone: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                            <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                            <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                            <SelectItem value="Europe/Lisbon">Lisboa (GMT+0)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Formato de Data</Label>
                        <Select 
                          value={localeSettings.dateFormat} 
                          onValueChange={(v) => setLocaleSettings(prev => ({ ...prev, dateFormat: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DD/MM/YYYY">DD/MM/AAAA</SelectItem>
                            <SelectItem value="MM/DD/YYYY">MM/DD/AAAA</SelectItem>
                            <SelectItem value="YYYY-MM-DD">AAAA-MM-DD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Moeda</Label>
                        <Select 
                          value={localeSettings.currency} 
                          onValueChange={(v) => setLocaleSettings(prev => ({ ...prev, currency: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BRL">Real (R$)</SelectItem>
                            <SelectItem value="USD">Dólar ($)</SelectItem>
                            <SelectItem value="EUR">Euro (€)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={handleSaveLocale}>Salvar Preferências</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Integrações Tab */}
              <TabsContent value="integracoes" className="space-y-6">
                <div className="space-y-6">
                  {/* DSPs */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Music className="h-5 w-5" />
                        DSPs (Plataformas de Streaming)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <IntegrationItem 
                          name="Spotify" 
                          connected={connectedIntegrations['spotify'] || false}
                          onConnect={() => handleOpenIntegration('spotify')}
                          onDisconnect={() => handleIntegrationDisconnect('spotify')}
                        />
                        <IntegrationItem 
                          name="Apple Music" 
                          connected={connectedIntegrations['apple_music'] || false}
                          onConnect={() => handleOpenIntegration('apple_music')}
                          onDisconnect={() => handleIntegrationDisconnect('apple_music')}
                        />
                        <IntegrationItem 
                          name="Deezer" 
                          connected={connectedIntegrations['deezer'] || false}
                          onConnect={() => handleOpenIntegration('deezer')}
                          onDisconnect={() => handleIntegrationDisconnect('deezer')}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Distribuidoras */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Music className="h-5 w-5" />
                        Distribuidoras
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                    </CardContent>
                  </Card>

                  {/* Gestão de Direitos Autorais */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Gestão de Direitos Autorais
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <IntegrationItem 
                          name="ABRAMUS" 
                          connected={connectedIntegrations['abramus'] || false}
                          onConnect={() => handleOpenIntegration('abramus')}
                          onDisconnect={() => handleIntegrationDisconnect('abramus')}
                        />
                        <IntegrationItem 
                          name="ECAD" 
                          connected={connectedIntegrations['ecad'] || false}
                          onConnect={() => handleOpenIntegration('ecad')}
                          onDisconnect={() => handleIntegrationDisconnect('ecad')}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Integração Bancária */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Landmark className="h-5 w-5" />
                        Integração Bancária
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <IntegrationItem 
                          name="Conta Bancária" 
                          connected={connectedIntegrations['bank'] || false}
                          onConnect={() => setShowBankIntegration(true)}
                          onDisconnect={() => handleIntegrationDisconnect('bank')}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* APIs Operacionais */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        APIs Operacionais
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <IntegrationItem 
                          name="n8n Workflows" 
                          connected={connectedIntegrations['n8n'] || false}
                          onConnect={() => handleOpenIntegration('n8n')}
                          onDisconnect={() => handleIntegrationDisconnect('n8n')}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Calendário */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Calendário
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <IntegrationItem 
                          name="Google Calendar" 
                          connected={connectedIntegrations['google_calendar'] || false}
                          onConnect={() => handleOpenIntegration('google_calendar')}
                          onDisconnect={() => handleIntegrationDisconnect('google_calendar')}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Meios de Comunicação */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Meios de Comunicação
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <IntegrationItem 
                          name="WhatsApp Business" 
                          connected={connectedIntegrations['whatsapp'] || false}
                          onConnect={() => handleOpenIntegration('whatsapp')}
                          onDisconnect={() => handleIntegrationDisconnect('whatsapp')}
                        />
                        <IntegrationItem 
                          name="Twilio" 
                          connected={connectedIntegrations['twilio'] || false}
                          onConnect={() => handleOpenIntegration('twilio')}
                          onDisconnect={() => handleIntegrationDisconnect('twilio')}
                        />
                        <IntegrationItem 
                          name="Resend" 
                          connected={connectedIntegrations['resend'] || false}
                          onConnect={() => handleOpenIntegration('resend')}
                          onDisconnect={() => handleIntegrationDisconnect('resend')}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
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