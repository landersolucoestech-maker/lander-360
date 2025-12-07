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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { History, Monitor, Smartphone, Tablet, MapPin, Calendar, Clock, RefreshCw, Globe } from "lucide-react";
import { formatDateTimeBR } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LoginRecord {
  id: string;
  login_at: string;
  ip_address: string | null;
  user_agent: string | null;
  device_type: string | null;
  browser: string | null;
  location: string | null;
}

interface LoginHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginHistoryModal({ open, onOpenChange }: LoginHistoryModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loginHistory, setLoginHistory] = useState<LoginRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLoginHistory = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('login_history')
        .select('*')
        .eq('user_id', user.id)
        .order('login_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setLoginHistory(data || []);
    } catch (error: any) {
      console.error('Error fetching login history:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico de login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && user) {
      fetchLoginHistory();
    }
  }, [open, user]);

  const getDeviceIcon = (deviceType: string | null) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: format(date, "dd 'de' MMM 'de' yyyy", { locale: ptBR }),
      time: format(date, "HH:mm", { locale: ptBR })
    };
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Agora mesmo";
    if (diffMins < 60) return `Há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
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
              {loginHistory.length} {loginHistory.length === 1 ? 'acesso registrado' : 'acessos registrados'}
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
                <p className="text-xs text-muted-foreground mt-2">
                  Os próximos logins serão registrados aqui
                </p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="max-h-[400px] pr-4">
              <div className="space-y-3">
                {loginHistory.map((record, index) => {
                  const { date, time } = formatTimestamp(record.login_at);
                  const relativeTime = getRelativeTime(record.login_at);
                  
                  return (
                    <Card key={record.id} className={`transition-colors hover:bg-muted/30 ${index === 0 ? 'border-primary/50' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="mt-1 p-2 bg-muted rounded-lg">
                              {getDeviceIcon(record.device_type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-sm">
                                  {record.browser || "Navegador"}
                                </p>
                                {index === 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    Sessão atual
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-xs text-muted-foreground mb-2">
                                {record.device_type || "Desktop"}
                              </p>
                              
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {date}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {time}
                                </div>
                                {record.ip_address && (
                                  <div className="flex items-center gap-1">
                                    <Globe className="h-3 w-3" />
                                    {record.ip_address}
                                  </div>
                                )}
                                {record.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {record.location}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {relativeTime && (
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {relativeTime}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
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
