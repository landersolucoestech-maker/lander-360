import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSessionSettings } from "@/hooks/useSessionSettings";
import { useToast } from "@/hooks/use-toast";
import { Monitor, Smartphone, Tablet, RefreshCw, LogOut, Shield, AlertTriangle, Clock } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserSession {
  id: string;
  session_token: string;
  device_type: string | null;
  browser: string | null;
  is_active: boolean;
  last_activity_at: string;
  created_at: string;
}

export function SessionManager() {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSessionToken, setCurrentSessionToken] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { settings: sessionSettings, TIMEOUT_OPTIONS } = useSessionSettings();

  const getTimeoutLabel = () => {
    const option = TIMEOUT_OPTIONS.find(o => o.value === sessionSettings.timeoutMinutes);
    return option?.label || `${sessionSettings.timeoutMinutes} minutos`;
  };

  const fetchSessions = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      setCurrentSessionToken(sessionData.session?.access_token?.substring(0, 32) || null);

      const { data, error } = await supabase
        .from("user_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("last_activity_at", { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as sessões",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user]);

  const terminateSession = async (sessionId: string, sessionToken: string) => {
    try {
      const { error } = await supabase
        .from("user_sessions")
        .update({
          is_active: false,
          terminated_at: new Date().toISOString(),
          terminated_reason: "user_terminated"
        })
        .eq("id", sessionId);

      if (error) throw error;

      toast({
        title: "Sessão encerrada",
        description: "A sessão foi encerrada com sucesso"
      });

      // If terminating current session, sign out
      if (sessionToken === currentSessionToken) {
        await supabase.auth.signOut();
      } else {
        fetchSessions();
      }
    } catch (error) {
      console.error("Error terminating session:", error);
      toast({
        title: "Erro",
        description: "Não foi possível encerrar a sessão",
        variant: "destructive"
      });
    }
  };

  const terminateAllOtherSessions = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_sessions")
        .update({
          is_active: false,
          terminated_at: new Date().toISOString(),
          terminated_reason: "user_terminated_all"
        })
        .eq("user_id", user.id)
        .eq("is_active", true)
        .neq("session_token", currentSessionToken || "");

      if (error) throw error;

      toast({
        title: "Sessões encerradas",
        description: "Todas as outras sessões foram encerradas"
      });

      fetchSessions();
    } catch (error) {
      console.error("Error terminating all sessions:", error);
      toast({
        title: "Erro",
        description: "Não foi possível encerrar as sessões",
        variant: "destructive"
      });
    }
  };

  const getDeviceIcon = (deviceType: string | null) => {
    switch (deviceType?.toLowerCase()) {
      case "mobile":
        return <Smartphone className="h-5 w-5" />;
      case "tablet":
        return <Tablet className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  const isCurrentSession = (sessionToken: string) => {
    return sessionToken === currentSessionToken;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Sessões Ativas
            </CardTitle>
            <CardDescription className="mt-1">
              Gerencie os dispositivos conectados à sua conta
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchSessions} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            {sessions.length > 1 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <LogOut className="h-4 w-4 mr-2" />
                    Encerrar Outras
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Encerrar todas as outras sessões?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Isso irá desconectar todos os outros dispositivos da sua conta. Você permanecerá conectado neste dispositivo.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={terminateAllOtherSessions}>
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma sessão ativa encontrada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  isCurrentSession(session.session_token) 
                    ? "border-primary/50 bg-primary/5" 
                    : "border-border"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${
                    isCurrentSession(session.session_token)
                      ? "bg-primary/10 text-primary"
                      : "bg-muted"
                  }`}>
                    {getDeviceIcon(session.device_type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{session.browser || "Navegador desconhecido"}</p>
                      {isCurrentSession(session.session_token) && (
                        <Badge variant="default" className="text-xs">
                          Sessão atual
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                      <span>{session.device_type || "Dispositivo desconhecido"}</span>
                      <span>•</span>
                      <span>
                        Última atividade: {format(new Date(session.last_activity_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                      {isCurrentSession(session.session_token) && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-500">
                            <Clock className="h-3 w-3" />
                            Expira após {getTimeoutLabel()} de inatividade
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  {!isCurrentSession(session.session_token) ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                          <LogOut className="h-4 w-4 mr-2" />
                          Encerrar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Encerrar esta sessão?</AlertDialogTitle>
                          <AlertDialogDescription>
                            O dispositivo será desconectado e precisará fazer login novamente para acessar a conta.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => terminateSession(session.id, session.session_token)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Encerrar Sessão
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <Badge variant="secondary">Ativa</Badge>
                  )}
                </div>
              </div>
            ))}

            {sessions.length > 0 && (
              <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Dica de segurança</p>
                    <p className="text-sm text-muted-foreground">
                      Se você não reconhece algum dispositivo listado acima, encerre a sessão imediatamente e considere alterar sua senha.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
