import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { MatchingConfigModal } from "@/components/modals/MatchingConfigModal";
import { 
  Zap, Workflow, Globe, Code, Play, Pause, 
  Plus, Settings, RefreshCw, CheckCircle, AlertCircle,
  Clock, Activity, Terminal, ExternalLink, Trash2, Music
} from "lucide-react";

interface Automation {
  id: string;
  name: string;
  trigger: string;
  action: string;
  status: 'active' | 'paused' | 'error';
  lastRun?: string;
  runCount: number;
}

interface N8nWorkflow {
  id: string;
  name: string;
  webhookUrl: string;
  description: string;
  active: boolean;
  lastExecution?: string;
  executions: number;
}

interface APIEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  description: string;
  rateLimit: string;
  status: 'active' | 'deprecated';
}

const AutomationModule = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("automations");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isMatchingConfigOpen, setIsMatchingConfigOpen] = useState(false);

  // Default automations including Matching Automático
  const [automations, setAutomations] = useState<Automation[]>([
    {
      id: 'matching-automatico',
      name: 'Matching Automático',
      trigger: 'Detecção de execução',
      action: 'Correspondência automática de obras',
      status: 'paused',
      lastRun: undefined,
      runCount: 0,
    }
  ]);
  const [n8nWorkflows] = useState<N8nWorkflow[]>([]);
  const [apiEndpoints] = useState<APIEndpoint[]>([]);

  const handleToggleAutomation = (id: string) => {
    setAutomations(prev => prev.map(a => 
      a.id === id 
        ? { ...a, status: a.status === 'active' ? 'paused' : 'active' }
        : a
    ));
    toast({
      title: "Automação atualizada",
      description: "O status da automação foi alterado.",
    });
  };

  const handleRunAutomation = (id: string) => {
    toast({
      title: "Automação executada",
      description: "A automação foi executada manualmente.",
    });
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl) {
      toast({
        title: "URL necessária",
        description: "Insira a URL do webhook para testar.",
        variant: "destructive",
      });
      return;
    }

    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify({
          event: "test",
          timestamp: new Date().toISOString(),
          source: "lander360"
        }),
      });

      toast({
        title: "Webhook enviado",
        description: "Verifique o histórico do seu n8n para confirmar.",
      });
    } catch (error) {
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar para o webhook.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-500';
      case 'POST': return 'bg-blue-500';
      case 'PUT': return 'bg-yellow-500';
      case 'DELETE': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Automação & Integrações
          </h2>
          <p className="text-muted-foreground">
            Automações internas, n8n e APIs operacionais
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Automação
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{automations.filter(a => a.status === 'active').length}</p>
                <p className="text-xs text-muted-foreground">Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{automations.reduce((sum, a) => sum + a.runCount, 0)}</p>
                <p className="text-xs text-muted-foreground">Execuções</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Workflow className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{n8nWorkflows.filter(w => w.active).length}</p>
                <p className="text-xs text-muted-foreground">Workflows n8n</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{apiEndpoints.length}</p>
                <p className="text-xs text-muted-foreground">Endpoints API</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="automations" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Automações Internas
          </TabsTrigger>
          <TabsTrigger value="n8n" className="flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            Integrações n8n
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            APIs Operacionais
          </TabsTrigger>
        </TabsList>

        <TabsContent value="automations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automações Internas</CardTitle>
              <CardDescription>
                Automações que rodam dentro do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Gatilho</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Última Execução</TableHead>
                    <TableHead>Execuções</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {automations.map(automation => (
                    <TableRow key={automation.id}>
                      <TableCell>{getStatusIcon(automation.status)}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {automation.id === 'matching-automatico' && (
                            <Music className="h-4 w-4 text-primary" />
                          )}
                          {automation.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{automation.trigger}</TableCell>
                      <TableCell className="text-sm">{automation.action}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {automation.lastRun || 'Nunca'}
                      </TableCell>
                      <TableCell>{automation.runCount}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleRunAutomation(automation.id)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleToggleAutomation(automation.id)}
                          >
                            {automation.status === 'active' ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              if (automation.id === 'matching-automatico') {
                                setIsMatchingConfigOpen(true);
                              }
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <MatchingConfigModal
            isOpen={isMatchingConfigOpen}
            onClose={() => setIsMatchingConfigOpen(false)}
          />
        </TabsContent>

        <TabsContent value="n8n" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integrações via n8n</CardTitle>
              <CardDescription>
                Workflows externos conectados via webhooks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Webhook tester */}
              <div className="p-4 bg-muted rounded-lg space-y-4">
                <Label>Testar Webhook n8n</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="https://n8n.exemplo.com/webhook/..."
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleTestWebhook}>
                    <Play className="h-4 w-4 mr-2" />
                    Testar
                  </Button>
                </div>
              </div>

              {/* Workflows list */}
              <div className="space-y-4">
                {n8nWorkflows.map(workflow => (
                  <div key={workflow.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{workflow.name}</p>
                          <Badge variant={workflow.active ? 'default' : 'secondary'}>
                            {workflow.active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{workflow.description}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Abrir n8n
                      </Button>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Terminal className="h-3 w-3" />
                        {workflow.webhookUrl}
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        {workflow.executions} execuções
                      </span>
                      {workflow.lastExecution && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Última: {workflow.lastExecution}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Conectar Novo Workflow n8n
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                APIs Operacionais
              </CardTitle>
              <CardDescription>
                Endpoints disponíveis para integrações externas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Método</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Rate Limit</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiEndpoints.map(endpoint => (
                    <TableRow key={endpoint.id}>
                      <TableCell>
                        <Badge className={getMethodColor(endpoint.method)}>
                          {endpoint.method}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{endpoint.endpoint}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{endpoint.description}</TableCell>
                      <TableCell className="text-sm">{endpoint.rateLimit}</TableCell>
                      <TableCell>
                        <Badge variant={endpoint.status === 'active' ? 'default' : 'secondary'}>
                          {endpoint.status === 'active' ? 'Ativo' : 'Deprecated'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Documentação da API</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Acesse a documentação completa da API para integrar sistemas externos.
                </p>
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver Documentação
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomationModule;
