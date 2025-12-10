import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useBelvoIntegration } from "@/hooks/useBelvoIntegration";
import { formatDateBR } from "@/lib/utils";
import { 
  Building2, 
  Link, 
  Check, 
  AlertCircle, 
  Settings, 
  Shield,
  Plus,
  Eye,
  Trash2,
  RefreshCw,
  Loader2
} from "lucide-react";

interface BankIntegrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BankIntegrationModal({ open, onOpenChange }: BankIntegrationModalProps) {
  const [activeTab, setActiveTab] = useState("accounts");
  const { toast } = useToast();
  const { 
    isLoading, 
    links, 
    accounts,
    listLinks, 
    getAccounts,
    deleteLink, 
    syncAccount 
  } = useBelvoIntegration();

  // Load connected accounts on mount
  useEffect(() => {
    if (open) {
      loadConnectedAccounts();
    }
  }, [open]);

  const loadConnectedAccounts = async () => {
    const loadedLinks = await listLinks();
    // Get account details for each link
    for (const link of loadedLinks) {
      await getAccounts(link.id);
    }
  };

  const handleConnectBank = async () => {
    toast({
      title: "Conexão via Belvo",
      description: "Acesse o painel do Belvo Dashboard para conectar uma nova conta bancária. A sincronização será automática após a conexão.",
    });
    // In production, you would use Belvo Connect Widget here
    // For now, we show instructions
  };

  const handleSyncAccount = async (linkId: string) => {
    await syncAccount(linkId);
  };

  const handleDisconnectAccount = async (linkId: string) => {
    await deleteLink(linkId);
    await loadConnectedAccounts();
  };

  // Get account info for a link
  const getAccountForLink = (linkId: string) => {
    return accounts.find(acc => acc.link === linkId);
  };

  const supportedBanks = [
    { id: "bancodobrasil_br_retail", name: "Banco do Brasil", logo: "🏦" },
    { id: "itau_br_retail", name: "Itaú", logo: "🔶" },
    { id: "bradesco_br_retail", name: "Bradesco", logo: "🔴" },
    { id: "santander_br_retail", name: "Santander", logo: "🔴" },
    { id: "caixa_br_retail", name: "Caixa Econômica", logo: "🟦" },
    { id: "nubank_br_retail", name: "Nubank", logo: "🟣" },
    { id: "inter_br_retail", name: "Banco Inter", logo: "🟠" },
    { id: "c6bank_br_retail", name: "C6 Bank", logo: "⚫" }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] max-w-6xl max-h-[90vh] overflow-hidden p-3 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Building2 className="h-5 w-5" />
            Integração Bancária (Belvo)
          </DialogTitle>
          <DialogDescription className="text-sm">
            Configure e gerencie suas conexões bancárias via Belvo Open Banking para sincronização automática de transações
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="accounts">Contas Conectadas</TabsTrigger>
            <TabsTrigger value="connect">Conectar Nova Conta</TabsTrigger>
            <TabsTrigger value="config">Configuração</TabsTrigger>
          </TabsList>
          
          <div className="mt-4 overflow-y-auto max-h-[70vh]">
            {/* Connected Accounts Tab */}
            <TabsContent value="accounts" className="space-y-4">
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadConnectedAccounts}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Atualizar
                </Button>
              </div>

              {isLoading && links.length === 0 ? (
                <div className="text-center py-12">
                  <Loader2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-spin" />
                  <p className="text-muted-foreground">Carregando contas conectadas...</p>
                </div>
              ) : links.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma conta conectada</h3>
                  <p className="text-muted-foreground mb-4">
                    Conecte suas contas bancárias via Belvo para sincronizar transações automaticamente
                  </p>
                  <Button onClick={() => setActiveTab("connect")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Conectar Primeira Conta
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {links.map((link) => {
                    const account = getAccountForLink(link.id);
                    return (
                      <Card key={link.id} className="relative">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{link.institution}</CardTitle>
                                <CardDescription>
                                  {account ? `${account.type} • ${account.number}` : 'Carregando...'}
                                </CardDescription>
                              </div>
                            </div>
                            <Badge 
                              variant={link.status === "valid" ? "default" : "destructive"}
                              className="flex items-center gap-1"
                            >
                              {link.status === "valid" ? (
                                <>
                                  <Check className="h-3 w-3" />
                                  Conectado
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="h-3 w-3" />
                                  {link.status}
                                </>
                              )}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label className="text-sm text-muted-foreground">Saldo Atual</Label>
                              <p className="text-lg font-semibold">
                                {account ? new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL'
                                }).format(account.balance?.current || 0) : '-'}
                              </p>
                            </div>
                            <div>
                              <Label className="text-sm text-muted-foreground">Último Acesso</Label>
                              <p className="text-sm">
                                {formatDateBR(link.last_accessed_at)}
                              </p>
                            </div>
                            <div>
                              <Label className="text-sm text-muted-foreground">Modo de Acesso</Label>
                              <p className="text-sm capitalize">{link.access_mode}</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 pt-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleSyncAccount(link.id)}
                              disabled={isLoading || link.status !== "valid"}
                            >
                              {isLoading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <RefreshCw className="h-4 w-4 mr-2" />
                              )}
                              Sincronizar Agora
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Transações
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDisconnectAccount(link.id)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Desconectar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Connect New Account Tab */}
            <TabsContent value="connect" className="space-y-6">
              <div className="text-center space-y-2">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-semibold">Conexão Segura via Belvo</h3>
                <p className="text-muted-foreground">
                  Conecte suas contas bancárias de forma segura usando o padrão Open Banking do Belvo.
                  Seus dados são criptografados e você pode revogar o acesso a qualquer momento.
                </p>
              </div>

              <div className="grid gap-3">
                {supportedBanks.map((bank) => (
                  <Card key={bank.id} className="hover:bg-accent/50 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{bank.logo}</div>
                          <div>
                            <h4 className="font-medium">{bank.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Suporte completo via Belvo Open Banking
                            </p>
                          </div>
                        </div>
                        <Button 
                          onClick={handleConnectBank}
                          disabled={isLoading}
                          className="gap-2"
                        >
                          <Link className="h-4 w-4" />
                          Conectar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-medium">Sobre a Segurança</h4>
                      <p className="text-sm text-muted-foreground">
                        • Utilizamos Belvo, líder em Open Banking na América Latina<br/>
                        • Criptografia de ponta a ponta em todas as transações<br/>
                        • Acesso somente leitura às suas transações<br/>
                        • Conformidade com LGPD e regulamentações do Banco Central<br/>
                        • Você pode revogar o acesso a qualquer momento
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Configuration Tab */}
            <TabsContent value="config" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configuração do Belvo
                  </CardTitle>
                  <CardDescription>
                    Gerencie suas credenciais e configurações de integração
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Status da Integração</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Configurado
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Credenciais Belvo configuradas
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Ambiente</Label>
                    <p className="text-sm text-muted-foreground">
                      Sandbox (Testes) - Para produção, altere a URL da API na edge function
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Sincronização Automática</Label>
                    <div className="flex items-center gap-3">
                      <Switch defaultChecked />
                      <span className="text-sm text-muted-foreground">
                        Sincronizar transações automaticamente a cada 6 horas
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Próximos Passos</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>1. Acesse o dashboard do Belvo para criar links de conexão</p>
                    <p>2. Use o Belvo Connect Widget em produção para conexões diretas</p>
                    <p>3. Configure webhooks para sincronização em tempo real</p>
                    <p>4. Altere a URL da API para produção quando estiver pronto</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
