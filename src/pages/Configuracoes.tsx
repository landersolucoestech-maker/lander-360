import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTheme } from "next-themes";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Settings, User, Bell, Shield, Database, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChangePasswordModal } from "@/components/modals/ChangePasswordModal";
import { LoginHistoryModal } from "@/components/modals/LoginHistoryModal";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import { useBackupData } from "@/hooks/useBackupData";
import { RestoreBackupModal } from "@/components/modals/RestoreBackupModal";

const profileSchema = z.object({
  full_name: z.string().min(1, "Nome completo é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
});

const Configuracoes = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const { settings: systemSettings, toggleAutoBackup, updateTimezone } = useSystemSettings();
  const { settings: notificationSettings, toggleNewContracts, toggleContractsExpiring, toggleNewReleases } = useNotificationSettings();
  const { exportData, createBackup, isExporting, isBackingUp, getLastBackupInfo } = useBackupData();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showLoginHistory, setShowLoginHistory] = useState(false);
  const [showRestoreBackup, setShowRestoreBackup] = useState(false);
  const [timezoneInput, setTimezoneInput] = useState(systemSettings.timezone);

  // Buscar dados do perfil
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data;
    },
    enabled: !!user?.id
  });

  // Formulário
  const form = useForm({
    resolver: zodResolver(profileSchema),
    values: {
      full_name: profile?.full_name || user?.user_metadata?.full_name || "",
      email: (profile as any)?.email || user?.email || "",
      phone: (profile as any)?.phone || "",
    },
  });

  // Mutation para atualizar perfil
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!user?.id) throw new Error('Usuário não encontrado');

      const profileData = {
        full_name: data.full_name,
        phone: data.phone || null,
      };

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (existingProfile) {
        const { error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', user.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            ...profileData,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar perfil. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    updateProfileMutation.mutate(data);
  };

  // Dados do usuário para exibição
  const userEmail = user?.email || "usuário@sistema.com";
  const userName = profile?.full_name || user?.user_metadata?.full_name || "Usuário";
  const userInitials = userName.charAt(0).toUpperCase();

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
              {/* Profile Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Perfil do Usuário
                  </CardTitle>
                  <CardDescription>
                    Informações pessoais e configurações da conta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      <div className="h-4 bg-muted rounded animate-pulse"></div>
                      <div className="h-4 bg-muted rounded animate-pulse"></div>
                      <div className="h-4 bg-muted rounded animate-pulse"></div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* User Display Card */}
                      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={profile?.avatar_url || ""} alt={userName} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-lg font-medium">
                            {userInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-lg font-medium text-foreground">{userName}</span>
                          <span className="text-sm text-muted-foreground">{userEmail}</span>
                        </div>
                      </div>

                      {/* Edit Form */}
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="full_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome Completo</FormLabel>
                                <FormControl>
                                  <Input placeholder="Seu nome completo" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="email" 
                                    placeholder="email@exemplo.com" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Telefone</FormLabel>
                                <FormControl>
                                  <Input placeholder="+55 (11) 99999-9999" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button 
                            type="submit" 
                            disabled={updateProfileMutation.isPending}
                            className="w-full"
                          >
                            {updateProfileMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                          </Button>
                        </form>
                      </Form>
                    </div>
                  )}
                </CardContent>
              </Card>

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

              {/* Security */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Segurança
                  </CardTitle>
                  <CardDescription>
                    Configurações de segurança e acesso
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Autenticação de Dois Fatores</Label>
                      <p className="text-sm text-muted-foreground">
                        Adicionar camada extra de segurança
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowChangePassword(true)}
                    >
                      Alterar Senha
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowLoginHistory(true)}
                    >
                      Ver Histórico
                    </Button>
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
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    {(() => {
                      const lastBackup = getLastBackupInfo();
                      if (lastBackup) {
                        return (
                          <>
                            <p className="text-sm font-medium">
                              Último backup: {new Date(lastBackup.date).toLocaleString('pt-BR')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Próximo backup: {systemSettings.autoBackup ? 'Automático habilitado' : 'Automático desabilitado'}
                            </p>
                          </>
                        );
                      } else {
                        return (
                          <>
                            <p className="text-sm font-medium">Nenhum backup encontrado</p>
                            <p className="text-sm text-muted-foreground">
                              Crie seu primeiro backup usando o botão acima
                            </p>
                          </>
                        );
                      }
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>
      
      <ChangePasswordModal 
        open={showChangePassword} 
        onOpenChange={setShowChangePassword} 
      />
      
      <LoginHistoryModal 
        open={showLoginHistory} 
        onOpenChange={setShowLoginHistory} 
      />
      
      <RestoreBackupModal 
        open={showRestoreBackup} 
        onOpenChange={setShowRestoreBackup} 
      />
    </SidebarProvider>
  );
};

export default Configuracoes;