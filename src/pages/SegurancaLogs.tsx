import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { ShieldAlert, Search, RefreshCw, Lock, AlertTriangle, CheckCircle, Monitor, Smartphone, Tablet, Settings, ClipboardList } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { getAuditActionLabel, getSettingTypeLabel } from "@/hooks/useSecurityAuditLog";

interface LoginAttempt {
  id: string;
  email: string;
  attempt_count: number;
  locked_until: string | null;
  last_attempt_at: string;
  created_at: string;
}

interface LoginHistory {
  id: string;
  user_id: string;
  login_at: string;
  ip_address: string | null;
  browser: string | null;
  device_type: string | null;
  location: string | null;
}

interface SecurityAuditLog {
  id: string;
  user_id: string;
  action: string;
  setting_type: string;
  old_value: string | null;
  new_value: string | null;
  user_agent: string | null;
  created_at: string;
}

export default function SegurancaLogs() {
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"attempts" | "history" | "audit">("attempts");
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch login attempts
      const { data: attemptsData, error: attemptsError } = await supabase
        .from("login_attempts")
        .select("*")
        .order("last_attempt_at", { ascending: false });

      if (attemptsError) throw attemptsError;
      setLoginAttempts(attemptsData || []);

      // Fetch login history (successful logins)
      const { data: historyData, error: historyError } = await supabase
        .from("login_history")
        .select("*")
        .order("login_at", { ascending: false })
        .limit(100);

      if (historyError) throw historyError;
      setLoginHistory(historyData || []);

      // Fetch security audit logs
      const { data: auditData, error: auditError } = await supabase
        .from("security_audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (auditError) throw auditError;
      setAuditLogs(auditData || []);

    } catch (error) {
      console.error("Error fetching security logs:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os logs de segurança",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const unlockAccount = async (email: string) => {
    try {
      const { error } = await supabase
        .from("login_attempts")
        .delete()
        .eq("email", email);

      if (error) throw error;

      toast({
        title: "Conta desbloqueada",
        description: `A conta ${email} foi desbloqueada com sucesso`
      });

      fetchData();
    } catch (error) {
      console.error("Error unlocking account:", error);
      toast({
        title: "Erro",
        description: "Não foi possível desbloquear a conta",
        variant: "destructive"
      });
    }
  };

  const getAttemptStatus = (attempt: LoginAttempt) => {
    if (attempt.locked_until) {
      const lockedUntil = new Date(attempt.locked_until);
      if (lockedUntil > new Date()) {
        return "locked";
      }
    }
    if (attempt.attempt_count >= 3) {
      return "warning";
    }
    return "normal";
  };

  const filteredAttempts = loginAttempts.filter(attempt => {
    const matchesSearch = attempt.email.toLowerCase().includes(searchTerm.toLowerCase());
    const status = getAttemptStatus(attempt);
    const matchesStatus = statusFilter === "all" || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getDeviceIcon = (deviceType: string | null) => {
    switch (deviceType?.toLowerCase()) {
      case "mobile":
        return <Smartphone className="h-4 w-4" />;
      case "tablet":
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const stats = {
    totalAttempts: loginAttempts.length,
    lockedAccounts: loginAttempts.filter(a => getAttemptStatus(a) === "locked").length,
    warningAccounts: loginAttempts.filter(a => getAttemptStatus(a) === "warning").length,
    successfulLogins: loginHistory.length,
    auditEvents: auditLogs.length
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto bg-background">
          <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center gap-4 px-6">
              <SidebarTrigger />
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-primary" />
                <h1 className="text-lg font-semibold">Logs de Segurança</h1>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <AlertTriangle className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tentativas Registradas</p>
                      <p className="text-2xl font-bold">{stats.totalAttempts}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/10">
                      <Lock className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Contas Bloqueadas</p>
                      <p className="text-2xl font-bold">{stats.lockedAccounts}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-500/10">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Em Alerta</p>
                      <p className="text-2xl font-bold">{stats.warningAccounts}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Logins Bem-sucedidos</p>
                      <p className="text-2xl font-bold">{stats.successfulLogins}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={activeTab === "attempts" ? "default" : "outline"}
                onClick={() => setActiveTab("attempts")}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Tentativas Falhas
              </Button>
              <Button
                variant={activeTab === "history" ? "default" : "outline"}
                onClick={() => setActiveTab("history")}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Histórico de Logins
              </Button>
              <Button
                variant={activeTab === "audit" ? "default" : "outline"}
                onClick={() => setActiveTab("audit")}
              >
                <ClipboardList className="h-4 w-4 mr-2" />
                Alterações de Segurança
              </Button>
            </div>

            {activeTab === "attempts" && (
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Tentativas de Login Suspeitas
                    </CardTitle>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar por email..."
                          className="pl-9 w-64"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="locked">Bloqueados</SelectItem>
                          <SelectItem value="warning">Em Alerta</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon" onClick={fetchData} disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredAttempts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <ShieldAlert className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma tentativa de login suspeita encontrada</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Tentativas</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Última Tentativa</TableHead>
                          <TableHead>Desbloqueio</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAttempts.map((attempt) => {
                          const status = getAttemptStatus(attempt);
                          return (
                            <TableRow key={attempt.id}>
                              <TableCell className="font-medium">{attempt.email}</TableCell>
                              <TableCell>
                                <Badge variant={attempt.attempt_count >= 5 ? "destructive" : attempt.attempt_count >= 3 ? "outline" : "secondary"}>
                                  {attempt.attempt_count} tentativa(s)
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {status === "locked" && (
                                  <Badge variant="destructive" className="gap-1">
                                    <Lock className="h-3 w-3" />
                                    Bloqueado
                                  </Badge>
                                )}
                                {status === "warning" && (
                                  <Badge variant="outline" className="gap-1 text-yellow-600 border-yellow-600">
                                    <AlertTriangle className="h-3 w-3" />
                                    Alerta
                                  </Badge>
                                )}
                                {status === "normal" && (
                                  <Badge variant="secondary">Normal</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {format(new Date(attempt.last_attempt_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                              </TableCell>
                              <TableCell>
                                {attempt.locked_until ? (
                                  new Date(attempt.locked_until) > new Date() 
                                    ? format(new Date(attempt.locked_until), "dd/MM/yyyy HH:mm", { locale: ptBR })
                                    : "Expirado"
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => unlockAccount(attempt.email)}
                                >
                                  Desbloquear
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "history" && (
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Histórico de Logins Bem-sucedidos
                    </CardTitle>
                    <Button variant="outline" size="icon" onClick={fetchData} disabled={isLoading}>
                      <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : loginHistory.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum histórico de login encontrado</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data/Hora</TableHead>
                          <TableHead>Dispositivo</TableHead>
                          <TableHead>Navegador</TableHead>
                          <TableHead>Localização</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loginHistory.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>
                              {format(new Date(log.login_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getDeviceIcon(log.device_type)}
                                <span>{log.device_type || "Desconhecido"}</span>
                              </div>
                            </TableCell>
                            <TableCell>{log.browser || "Desconhecido"}</TableCell>
                            <TableCell>{log.location || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "audit" && (
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-primary" />
                      Log de Alterações de Segurança
                    </CardTitle>
                    <Button variant="outline" size="icon" onClick={fetchData} disabled={isLoading}>
                      <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : auditLogs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma alteração de segurança registrada</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data/Hora</TableHead>
                          <TableHead>Ação</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Valor Anterior</TableHead>
                          <TableHead>Novo Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {auditLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>
                              {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {getAuditActionLabel(log.action)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {getSettingTypeLabel(log.setting_type)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {log.old_value || "-"}
                            </TableCell>
                            <TableCell>
                              {log.new_value || "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
