import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { Settings, Mail, Bell, Shield, Database, Globe, Palette } from 'lucide-react';

export const SystemSettings = () => {
  const { toast } = useToast();
  const { settings, toggleAutoBackup, updateTimezone } = useSystemSettings();
  
  const [emailSettings, setEmailSettings] = useState({
    smtp_host: 'smtp.gmail.com',
    smtp_port: '587',
    smtp_user: '',
    smtp_password: '',
    from_email: 'sistema@empresa.com',
    from_name: 'Sistema Musical'
  });

  const [securitySettings, setSecuritySettings] = useState({
    password_min_length: 8,
    require_2fa: false,
    session_timeout: 24,
    max_login_attempts: 5,
    lockout_duration: 15
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    system_alerts: true,
    maintenance_mode: false,
    new_user_notifications: true,
    billing_notifications: true
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    primary_color: '#3b82f6',
    logo_url: '',
    company_name: 'Sistema Musical',
    tagline: 'Gestão Musical Completa'
  });

  const handleSaveEmailSettings = () => {
    // Save email settings logic here
    toast({
      title: "Configurações salvas",
      description: "As configurações de email foram atualizadas com sucesso."
    });
  };

  const handleSaveSecuritySettings = () => {
    // Save security settings logic here
    toast({
      title: "Configurações salvas",
      description: "As configurações de segurança foram atualizadas com sucesso."
    });
  };

  const handleSaveNotificationSettings = () => {
    // Save notification settings logic here
    toast({
      title: "Configurações salvas",
      description: "As configurações de notificação foram atualizadas com sucesso."
    });
  };

  const handleSaveAppearanceSettings = () => {
    // Save appearance settings logic here
    toast({
      title: "Configurações salvas",
      description: "As configurações de aparência foram atualizadas com sucesso."
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configurações do Sistema</h2>
        <p className="text-muted-foreground">Gerencie as configurações globais da plataforma</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações Gerais
              </CardTitle>
              <CardDescription>
                Configurações básicas do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nome da Empresa</Label>
                  <Input defaultValue="Sistema Musical" />
                </div>
                <div className="space-y-2">
                  <Label>Fuso Horário</Label>
                  <Select value={settings.timezone} onValueChange={updateTimezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                      <SelectItem value="America/New_York">Nova York (GMT-5)</SelectItem>
                      <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tóquio (GMT+9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>URL Base do Sistema</Label>
                <Input defaultValue="https://sistema.empresa.com" />
              </div>

              <div className="space-y-2">
                <Label>Descrição da Empresa</Label>
                <Textarea defaultValue="Plataforma completa para gestão musical e entretenimento." />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Configurações de Backup</h4>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Backup Automático</Label>
                    <p className="text-sm text-muted-foreground">
                      Realizar backup automaticamente todos os dias
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoBackup}
                    onCheckedChange={toggleAutoBackup}
                  />
                </div>
              </div>

              <Button onClick={() => toast({ title: "Configurações salvas", description: "As configurações gerais foram atualizadas." })}>
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Configurações de Email
              </CardTitle>
              <CardDescription>
                Configure o servidor SMTP para envio de emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Servidor SMTP</Label>
                  <Input
                    value={emailSettings.smtp_host}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtp_host: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Porta</Label>
                  <Input
                    value={emailSettings.smtp_port}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtp_port: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Usuário SMTP</Label>
                  <Input
                    value={emailSettings.smtp_user}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtp_user: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Senha SMTP</Label>
                  <Input
                    type="password"
                    value={emailSettings.smtp_password}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtp_password: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email de Origem</Label>
                  <Input
                    value={emailSettings.from_email}
                    onChange={(e) => setEmailSettings({ ...emailSettings, from_email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nome de Origem</Label>
                  <Input
                    value={emailSettings.from_name}
                    onChange={(e) => setEmailSettings({ ...emailSettings, from_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveEmailSettings}>
                  Salvar Configurações
                </Button>
                <Button variant="outline">
                  Testar Conexão
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configurações de Segurança
              </CardTitle>
              <CardDescription>
                Configure as políticas de segurança do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tamanho Mínimo da Senha</Label>
                  <Input
                    type="number"
                    value={securitySettings.password_min_length}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, password_min_length: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Timeout de Sessão (horas)</Label>
                  <Input
                    type="number"
                    value={securitySettings.session_timeout}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, session_timeout: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Máximo de Tentativas de Login</Label>
                  <Input
                    type="number"
                    value={securitySettings.max_login_attempts}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, max_login_attempts: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duração do Bloqueio (minutos)</Label>
                  <Input
                    type="number"
                    value={securitySettings.lockout_duration}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, lockout_duration: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Exigir Autenticação de Dois Fatores</Label>
                    <p className="text-sm text-muted-foreground">
                      Todos os usuários devem configurar 2FA
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.require_2fa}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, require_2fa: checked })}
                  />
                </div>
              </div>

              <Button onClick={handleSaveSecuritySettings}>
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configurações de Notificações
              </CardTitle>
              <CardDescription>
                Configure quando e como as notificações são enviadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificações importantes por email
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.email_notifications}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, email_notifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertas do Sistema</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar sobre problemas críticos do sistema
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.system_alerts}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, system_alerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo de Manutenção</Label>
                    <p className="text-sm text-muted-foreground">
                      Ativar página de manutenção para usuários
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.maintenance_mode}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, maintenance_mode: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações de Novos Usuários</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar quando novos usuários se registram
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.new_user_notifications}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, new_user_notifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações de Faturamento</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar sobre problemas de pagamento
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.billing_notifications}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, billing_notifications: checked })}
                  />
                </div>
              </div>

              <Button onClick={handleSaveNotificationSettings}>
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Configurações de Aparência
              </CardTitle>
              <CardDescription>
                Personalize a aparência da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nome da Empresa</Label>
                  <Input
                    value={appearanceSettings.company_name}
                    onChange={(e) => setAppearanceSettings({ ...appearanceSettings, company_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slogan</Label>
                  <Input
                    value={appearanceSettings.tagline}
                    onChange={(e) => setAppearanceSettings({ ...appearanceSettings, tagline: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>URL do Logo</Label>
                <Input
                  value={appearanceSettings.logo_url}
                  onChange={(e) => setAppearanceSettings({ ...appearanceSettings, logo_url: e.target.value })}
                  placeholder="https://exemplo.com/logo.png"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tema Padrão</Label>
                  <Select value={appearanceSettings.theme} onValueChange={(value) => setAppearanceSettings({ ...appearanceSettings, theme: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cor Primária</Label>
                  <Input
                    type="color"
                    value={appearanceSettings.primary_color}
                    onChange={(e) => setAppearanceSettings({ ...appearanceSettings, primary_color: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={handleSaveAppearanceSettings}>
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};