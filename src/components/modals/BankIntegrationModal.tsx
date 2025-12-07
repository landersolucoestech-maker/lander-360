import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { formatDateBR } from "@/lib/utils";
import { 
  Building2, 
  CreditCard, 
  Link, 
  Check, 
  AlertCircle, 
  Settings, 
  Shield,
  Plus,
  Eye,
  Edit,
  Trash2
} from "lucide-react";

interface BankIntegrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BankIntegrationModal({ open, onOpenChange }: BankIntegrationModalProps) {
  const [activeTab, setActiveTab] = useState("accounts");
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  // Connected accounts state - will be populated from API
  const [connectedAccounts, setConnectedAccounts] = useState([]);

  // Automation rules state - will be populated from API
  const [automationRules, setAutomationRules] = useState([]);

  const supportedBanks = [
    { id: "bb", name: "Banco do Brasil", logo: "🏦" },
    { id: "itau", name: "Itaú", logo: "🔶" },
    { id: "bradesco", name: "Bradesco", logo: "🔴" },
    { id: "santander", name: "Santander", logo: "🔴" },
    { id: "caixa", name: "Caixa Econômica", logo: "🟦" },
    { id: "nubank", name: "Nubank", logo: "🟣" },
    { id: "inter", name: "Banco Inter", logo: "🟠" },
    { id: "c6", name: "C6 Bank", logo: "⚫" }
  ];

  const handleConnectBank = async (bankId: string) => {
    setIsConnecting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Conta conectada",
        description: "Sua conta bancária foi conectada com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar sua conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSyncAccount = async (accountId: string) => {
    try {
      toast({
        title: "Sincronização iniciada",
        description: "Suas transações estão sendo atualizadas...",
      });
    } catch (error) {
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível sincronizar a conta.",
        variant: "destructive",
      });
    }
  };

  const handleToggleAutoSync = (accountId: string, enabled: boolean) => {
    setConnectedAccounts(prev => 
      prev.map(account => 
        account.id === accountId 
          ? { ...account, autoSync: enabled }
          : account
      )
    );
    toast({
      title: enabled ? "Sincronização automática ativada" : "Sincronização automática desativada",
      description: enabled 
        ? "Suas transações serão sincronizadas automaticamente."
        : "Você precisará sincronizar manualmente.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Integração Bancária
          </DialogTitle>
          <DialogDescription>
            Configure e gerencie suas conexões bancárias para sincronização automática de transações
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="accounts">Contas Conectadas</TabsTrigger>
            <TabsTrigger value="connect">Conectar Nova Conta</TabsTrigger>
            <TabsTrigger value="rules">Regras de Automação</TabsTrigger>
          </TabsList>
          
          <div className="mt-4 overflow-y-auto max-h-[70vh]">
            {/* Connected Accounts Tab */}
            <TabsContent value="accounts" className="space-y-4">
              {connectedAccounts.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma conta conectada</h3>
                  <p className="text-muted-foreground mb-4">
                    Conecte suas contas bancárias para sincronizar transações automaticamente
                  </p>
                  <Button onClick={() => setActiveTab("connect")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Conectar Primeira Conta
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {connectedAccounts.map((account: any) => (
                    <Card key={account.id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{account.bankName}</CardTitle>
                              <CardDescription>
                                {account.accountType} • {account.agency}-{account.accountNumber}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge 
                            variant={account.status === "connected" ? "default" : "destructive"}
                            className="flex items-center gap-1"
                          >
                            {account.status === "connected" ? (
                              <>
                                <Check className="h-3 w-3" />
                                Conectado
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-3 w-3" />
                                Erro
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
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              }).format(account.balance)}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">Última Sincronização</Label>
                            <p className="text-sm">
                              {formatDateBR(account.lastSync)}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm text-muted-foreground">Sinc. Automática</Label>
                              <div className="mt-1">
                                <Switch
                                  checked={account.autoSync}
                                  onCheckedChange={(checked) => handleToggleAutoSync(account.id, checked)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSyncAccount(account.id)}
                            disabled={account.status !== "connected"}
                          >
                            <Link className="h-4 w-4 mr-2" />
                            Sincronizar Agora
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Transações
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Configurar
                          </Button>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Desconectar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Connect New Account Tab */}
            <TabsContent value="connect" className="space-y-6">
              <div className="text-center space-y-2">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-semibold">Conexão Segura com Open Banking</h3>
                <p className="text-muted-foreground">
                  Conecte suas contas bancárias de forma segura usando o padrão Open Banking.
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
                              Suporte completo via Open Banking
                            </p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleConnectBank(bank.id)}
                          disabled={isConnecting}
                          className="gap-2"
                        >
                          <Link className="h-4 w-4" />
                          {isConnecting ? "Conectando..." : "Conectar"}
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
                        • Utilizamos criptografia de ponta a ponta<br/>
                        • Acesso somente leitura às suas transações<br/>
                        • Conformidade com LGPD e regulamentações bancárias<br/>
                        • Você pode revogar o acesso a qualquer momento
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Automation Rules Tab */}
            <TabsContent value="rules" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Regras de Automação</h3>
                  <p className="text-muted-foreground">
                    Configure regras para categorizar automaticamente suas transações
                  </p>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Regra
                </Button>
              </div>

              {automationRules.length === 0 ? (
                <div className="text-center py-12">
                  <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma regra configurada</h3>
                  <p className="text-muted-foreground mb-4">
                    Crie regras para categorizar suas transações automaticamente
                  </p>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Criar Primeira Regra
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {automationRules.map((rule: any) => (
                    <Card key={rule.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h4 className="font-medium">{rule.name}</h4>
                              <Badge variant="outline">
                                {rule.type === "entrada" ? "Receita" : "Despesa"}
                              </Badge>
                              <Badge variant="secondary">
                                Prioridade {rule.priority}
                              </Badge>
                              <Switch checked={rule.enabled} />
                            </div>
                            <p className="text-sm text-muted-foreground">
                              <strong>Condição:</strong> {rule.condition}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              <strong>Categoria:</strong> {rule.category} → {rule.subcategory}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Como funcionam as regras?</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• As regras são aplicadas automaticamente às novas transações sincronizadas</p>
                    <p>• Use condições como "CONTAINS", "STARTS_WITH", "EQUALS" para criar filtros</p>
                    <p>• Regras com prioridade menor são aplicadas primeiro</p>
                    <p>• Uma transação pode corresponder a múltiplas regras</p>
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