import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { History, Monitor, Smartphone, MapPin, Calendar, Clock, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LoginEvent {
  id: string;
  timestamp: number;
  event_message: string;
  level: string;
  msg: string;
  path?: string;
  status?: string;
  error?: string;
}

interface LoginHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginHistoryModal({ open, onOpenChange }: LoginHistoryModalProps) {
  const { toast } = useToast();
  const [loginHistory, setLoginHistory] = useState<LoginEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLoginHistory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-auth-logs', {
        body: { limit: 20 }
      });

      if (error) {
        throw error;
      }

      // Parse the auth logs to extract login events
      const logs = data?.logs || [];
      const loginEvents = logs
        .filter((log: any) => 
          log.msg === 'Login' || 
          log.msg === 'request completed' || 
          log.error?.includes('Invalid login credentials')
        )
        .map((log: any) => ({
          id: log.id,
          timestamp: log.timestamp,
          event_message: log.event_message,
          level: log.level,
          msg: log.msg,
          path: log.path,
          status: log.status,
          error: log.error
        }))
        .sort((a: any, b: any) => b.timestamp - a.timestamp);

      setLoginHistory(loginEvents);
    } catch (error: any) {
      console.error('Error fetching login history:', error);
      
      // Fallback with mock data if the function doesn't exist yet
      const mockData = [
        {
          id: '1',
          timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
          event_message: 'Login realizado com sucesso',
          level: 'info',
          msg: 'Login',
          status: '200'
        },
        {
          id: '2',
          timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
          event_message: 'Login realizado com sucesso',
          level: 'info',
          msg: 'Login',
          status: '200'
        },
        {
          id: '3',
          timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
          event_message: 'Tentativa de login com credenciais inválidas',
          level: 'error',
          msg: 'Invalid login credentials',
          status: '400',
          error: 'Invalid login credentials'
        },
        {
          id: '4',
          timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
          event_message: 'Login realizado com sucesso',
          level: 'info',
          msg: 'Login',
          status: '200'
        }
      ];
      
      setLoginHistory(mockData);
      
      toast({
        title: "Aviso",
        description: "Exibindo dados de exemplo. A integração com logs reais será implementada.",
        variant: "default",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchLoginHistory();
    }
  }, [open]);

  const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return <Monitor className="h-4 w-4" />;
    
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      return <Smartphone className="h-4 w-4" />;
    }
    
    return <Monitor className="h-4 w-4" />;
  };

  const getStatusBadge = (status?: string, error?: string) => {
    if (error || status === '400') {
      return <Badge variant="destructive">Falha</Badge>;
    }
    
    if (status === '200') {
      return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Sucesso</Badge>;
    }
    
    return <Badge variant="secondary">Desconhecido</Badge>;
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return {
      date: format(date, "dd 'de' MMM", { locale: ptBR }),
      time: format(date, "HH:mm", { locale: ptBR })
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Login
          </DialogTitle>
          <DialogDescription>
            Visualize os últimos acessos à sua conta
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {loginHistory.length} eventos encontrados
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLoginHistory}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded animate-pulse"></div>
                      <div className="h-3 bg-muted rounded w-3/4 animate-pulse"></div>
                      <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : loginHistory.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Nenhum histórico de login encontrado
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {loginHistory.map((event, index) => {
                const { date, time } = formatTimestamp(event.timestamp);
                
                return (
                  <Card key={event.id} className="transition-colors hover:bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-1">
                            {getDeviceIcon()}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm">
                                {event.error ? 'Tentativa de Login Falhada' : 'Login Realizado'}
                              </p>
                              {getStatusBadge(event.status, event.error)}
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {date}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {time}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                Brasil
                              </div>
                            </div>
                            
                            {event.error && (
                              <p className="text-xs text-destructive">
                                {event.error}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    
                    {index < loginHistory.length - 1 && <Separator />}
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}