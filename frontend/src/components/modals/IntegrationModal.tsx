import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  Link2, 
  Check, 
  AlertCircle, 
  Shield,
  ExternalLink,
  Loader2,
  Music,
  FileText,
  Calendar
} from "lucide-react";

interface IntegrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integration: {
    id: string;
    name: string;
    type: 'distributor' | 'rights' | 'calendar' | 'dsp' | 'automation' | 'communication';
    description: string;
    website?: string;
    requiredFields?: { key: string; label: string; placeholder: string; type?: string }[];
  } | null;
  onConnect?: (integrationId: string, credentials: Record<string, string>) => void;
}

export function IntegrationModal({ open, onOpenChange, integration, onConnect }: IntegrationModalProps) {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [credentials, setCredentials] = useState<Record<string, string>>({});

  if (!integration) return null;

  const getIcon = () => {
    switch (integration.type) {
      case 'distributor':
      case 'dsp':
        return <Music className="h-6 w-6 text-primary" />;
      case 'rights':
        return <FileText className="h-6 w-6 text-primary" />;
      case 'calendar':
        return <Calendar className="h-6 w-6 text-primary" />;
      default:
        return <Link2 className="h-6 w-6 text-primary" />;
    }
  };

  const getDefaultFields = () => {
    if (integration.requiredFields) return integration.requiredFields;
    
    switch (integration.type) {
      case 'distributor':
      case 'dsp':
        return [
          { key: 'email', label: 'E-mail da conta', placeholder: 'seu@email.com', type: 'email' },
          { key: 'api_key', label: 'API Key / Token', placeholder: 'Cole sua API Key aqui', type: 'password' },
        ];
      case 'rights':
        return [
          { key: 'codigo_socio', label: 'Código de Sócio', placeholder: 'Ex: 123456', type: 'text' },
          { key: 'cpf_cnpj', label: 'CPF/CNPJ', placeholder: 'Digite o CPF ou CNPJ', type: 'text' },
        ];
      case 'calendar':
        return []; // OAuth flow, no manual fields
      case 'automation':
        return [
          { key: 'webhook_url', label: 'URL do Webhook', placeholder: 'https://...', type: 'text' },
          { key: 'api_key', label: 'API Key', placeholder: 'Cole sua API Key', type: 'password' },
        ];
      case 'communication':
        return [
          { key: 'api_key', label: 'API Key', placeholder: 'Cole sua API Key', type: 'password' },
          { key: 'api_secret', label: 'API Secret', placeholder: 'Cole seu API Secret', type: 'password' },
        ];
      default:
        return [];
    }
  };

  const fields = getDefaultFields();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      // Validate required fields
      for (const field of fields) {
        if (!credentials[field.key]) {
          toast({
            title: "Campo obrigatório",
            description: `Preencha o campo ${field.label}`,
            variant: "destructive",
          });
          setIsConnecting(false);
          return;
        }

        // Validate email format
        if (field.type === 'email' && !validateEmail(credentials[field.key])) {
          toast({
            title: "E-mail inválido",
            description: "Digite um endereço de e-mail válido",
            variant: "destructive",
          });
          setIsConnecting(false);
          return;
        }

        // Validate password minimum length
        if (field.type === 'password' && field.key === 'password' && !validatePassword(credentials[field.key])) {
          toast({
            title: "Senha muito curta",
            description: "A senha deve ter no mínimo 6 caracteres",
            variant: "destructive",
          });
          setIsConnecting(false);
          return;
        }
      }

      // Simulate API connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (onConnect) {
        onConnect(integration.id, credentials);
      }
      
      toast({
        title: "Conexão estabelecida!",
        description: `${integration.name} foi conectado com sucesso.`,
      });
      
      // Store connection in localStorage for demo
      const connections = JSON.parse(localStorage.getItem('integrations') || '{}');
      connections[integration.id] = {
        connected: true,
        connectedAt: new Date().toISOString(),
        email: credentials.email || credentials.codigo_socio,
      };
      localStorage.setItem('integrations', JSON.stringify(connections));
      
      onOpenChange(false);
      setCredentials({});
    } catch (error) {
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar. Verifique suas credenciais.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleOAuthConnect = async () => {
    setIsConnecting(true);
    
    try {
      // For OAuth integrations like Google Calendar
      toast({
        title: "Redirecionando...",
        description: `Você será redirecionado para autorizar o ${integration.name}.`,
      });
      
      // Simulate OAuth redirect
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In production, this would redirect to OAuth provider
      if (integration.website) {
        window.open(integration.website, '_blank');
      }
      
      // Store pending connection
      const connections = JSON.parse(localStorage.getItem('integrations') || '{}');
      connections[integration.id] = {
        connected: true,
        connectedAt: new Date().toISOString(),
        type: 'oauth',
      };
      localStorage.setItem('integrations', JSON.stringify(connections));
      
      toast({
        title: "Aguardando autorização",
        description: "Complete a autorização na janela aberta e retorne aqui.",
      });
      
    } catch (error) {
      toast({
        title: "Erro na conexão",
        description: "Não foi possível iniciar o processo de autorização.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            {getIcon()}
            Conectar {integration.name}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {integration.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Integration Info Card */}
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    {getIcon()}
                  </div>
                  <div>
                    <h4 className="font-semibold">{integration.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {integration.type === 'distributor' && 'Distribuidora Digital'}
                      {integration.type === 'dsp' && 'Plataforma de Streaming'}
                      {integration.type === 'rights' && 'Gestão de Direitos'}
                      {integration.type === 'calendar' && 'Calendário'}
                      {integration.type === 'automation' && 'Automação'}
                      {integration.type === 'communication' && 'Comunicação'}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-muted-foreground">
                  Não conectado
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Credentials Form or OAuth Button */}
          {fields.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Suas credenciais são armazenadas de forma segura</span>
              </div>
              
              {fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <Input
                    id={field.key}
                    type={field.type || 'text'}
                    placeholder={field.placeholder}
                    value={credentials[field.key] || ''}
                    onChange={(e) => setCredentials(prev => ({
                      ...prev,
                      [field.key]: e.target.value
                    }))}
                  />
                </div>
              ))}
              
              <div className="flex gap-2 pt-4">
                <Button 
                  className="flex-1" 
                  onClick={handleConnect}
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Conectar
                    </>
                  )}
                </Button>
                {integration.website && (
                  <Button 
                    variant="outline"
                    onClick={() => window.open(integration.website, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Site
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Clique no botão abaixo para autorizar a conexão com {integration.name}.
                  Você será redirecionado para fazer login na sua conta.
                </p>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleOAuthConnect}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Redirecionando...
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Conectar com {integration.name}
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Security Notice */}
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="p-3">
              <div className="flex gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Ao conectar, você autoriza o Lander 360º a acessar informações da sua conta 
                  {integration.type === 'distributor' && ' para sincronizar lançamentos e métricas'}
                  {integration.type === 'dsp' && ' para sincronizar métricas de streaming'}
                  {integration.type === 'rights' && ' para consultar registros de obras'}
                  {integration.type === 'calendar' && ' para sincronizar eventos e agenda'}
                  {integration.type === 'automation' && ' para executar automações'}
                  {integration.type === 'communication' && ' para enviar notificações'}.
                  Você pode revogar o acesso a qualquer momento.
                  Você pode revogar o acesso a qualquer momento.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
