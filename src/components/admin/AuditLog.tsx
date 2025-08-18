import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, Eye, User, Settings, Database, Shield, AlertTriangle } from 'lucide-react';

interface AuditEntry {
  id: string;
  user_email: string;
  action: string;
  resource: string;
  details: string;
  ip_address: string;
  user_agent: string;
  status: 'success' | 'failure' | 'warning';
  created_at: string;
}

export const AuditLog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7');

  // Mock data - replace with real Supabase data
  const auditEntries: AuditEntry[] = [
    {
      id: '1',
      user_email: 'admin@sistema.com',
      action: 'LOGIN',
      resource: 'Authentication',
      details: 'Usuário fez login no sistema',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success',
      created_at: '2024-02-15T10:30:00Z'
    },
    {
      id: '2',
      user_email: 'joao@techcorp.com',
      action: 'CREATE_USER',
      resource: 'User Management',
      details: 'Novo usuário criado: maria@example.com',
      ip_address: '192.168.1.101',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      status: 'success',
      created_at: '2024-02-15T09:15:00Z'
    },
    {
      id: '3',
      user_email: 'maria@startup.com',
      action: 'UPDATE_PLAN',
      resource: 'Subscription',
      details: 'Plano alterado de Básico para Profissional',
      ip_address: '192.168.1.102',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success',
      created_at: '2024-02-15T08:45:00Z'
    },
    {
      id: '4',
      user_email: 'carlos@enterprise.com',
      action: 'DELETE_DATA',
      resource: 'Project Management',
      details: 'Tentativa de exclusão de projeto sem permissão',
      ip_address: '192.168.1.103',
      user_agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      status: 'failure',
      created_at: '2024-02-15T08:20:00Z'
    },
    {
      id: '5',
      user_email: 'admin@sistema.com',
      action: 'BACKUP_CREATE',
      resource: 'System',
      details: 'Backup automático criado com sucesso',
      ip_address: '10.0.0.1',
      user_agent: 'System/Automated',
      status: 'success',
      created_at: '2024-02-15T06:00:00Z'
    },
    {
      id: '6',
      user_email: 'ana@digital.com',
      action: 'PASSWORD_CHANGE',
      resource: 'Authentication',
      details: 'Senha alterada pelo usuário',
      ip_address: '192.168.1.104',
      user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      status: 'success',
      created_at: '2024-02-14T16:30:00Z'
    },
    {
      id: '7',
      user_email: 'hacker@malicious.com',
      action: 'LOGIN_ATTEMPT',
      resource: 'Authentication',
      details: 'Múltiplas tentativas de login falharam - possível ataque',
      ip_address: '203.0.113.1',
      user_agent: 'curl/7.68.0',
      status: 'warning',
      created_at: '2024-02-14T14:25:00Z'
    }
  ];

  const filteredEntries = auditEntries.filter(entry => {
    const matchesSearch = entry.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'all' || entry.action.toLowerCase().includes(actionFilter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    return matchesSearch && matchesAction && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'default',
      failure: 'destructive',
      warning: 'secondary'
    } as const;
    
    const labels = {
      success: 'Sucesso',
      failure: 'Falha',
      warning: 'Aviso'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getActionIcon = (action: string) => {
    if (action.includes('LOGIN')) return <User className="h-4 w-4" />;
    if (action.includes('CREATE') || action.includes('UPDATE') || action.includes('DELETE')) return <Database className="h-4 w-4" />;
    if (action.includes('BACKUP')) return <Settings className="h-4 w-4" />;
    if (action.includes('SECURITY') || action.includes('ATTEMPT')) return <Shield className="h-4 w-4" />;
    return <Eye className="h-4 w-4" />;
  };

  const successCount = auditEntries.filter(e => e.status === 'success').length;
  const failureCount = auditEntries.filter(e => e.status === 'failure').length;
  const warningCount = auditEntries.filter(e => e.status === 'warning').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Log de Auditoria</h2>
        <p className="text-muted-foreground">Monitore todas as atividades e ações realizadas no sistema</p>
      </div>

      {/* Métricas de Auditoria */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ações Bem-sucedidas</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successCount}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 7 dias
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Falhas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failureCount}</div>
            <p className="text-xs text-muted-foreground">
              Requer atenção
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avisos</CardTitle>
            <Eye className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warningCount}</div>
            <p className="text-xs text-muted-foreground">
              Atividades suspeitas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditEntries.length}</div>
            <p className="text-xs text-muted-foreground">
              Registros totais
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Log de Auditoria */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Atividades</CardTitle>
          <CardDescription>
            Histórico completo de todas as ações realizadas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por usuário, ação, recurso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="create">Criar</SelectItem>
                <SelectItem value="update">Atualizar</SelectItem>
                <SelectItem value="delete">Excluir</SelectItem>
                <SelectItem value="backup">Backup</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
                <SelectItem value="failure">Falha</SelectItem>
                <SelectItem value="warning">Aviso</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Hoje</SelectItem>
                <SelectItem value="7">7 dias</SelectItem>
                <SelectItem value="30">30 dias</SelectItem>
                <SelectItem value="90">90 dias</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Recurso</TableHead>
                <TableHead>Detalhes</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-mono text-sm">
                    {new Date(entry.created_at).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell>{entry.user_email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getActionIcon(entry.action)}
                      <span>{entry.action.replace('_', ' ')}</span>
                    </div>
                  </TableCell>
                  <TableCell>{entry.resource}</TableCell>
                  <TableCell className="max-w-xs truncate" title={entry.details}>
                    {entry.details}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{entry.ip_address}</TableCell>
                  <TableCell>{getStatusBadge(entry.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};