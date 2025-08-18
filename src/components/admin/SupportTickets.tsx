import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Search, MessageSquare, Clock, CheckCircle, AlertCircle, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  user_email: string;
  organization: string;
  category: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
}

export const SupportTickets = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [response, setResponse] = useState('');

  // Mock data - replace with real Supabase data
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 'TICK-001',
      title: 'Problema de login',
      description: 'Não consigo fazer login no sistema. A senha parece estar incorreta.',
      status: 'open',
      priority: 'high',
      user_email: 'joao@techcorp.com',
      organization: 'TechCorp Brasil',
      category: 'Autenticação',
      created_at: '2024-02-15T10:30:00Z',
      updated_at: '2024-02-15T10:30:00Z'
    },
    {
      id: 'TICK-002',
      title: 'Relatório não carrega',
      description: 'O relatório de vendas não está carregando quando clico no botão.',
      status: 'in_progress',
      priority: 'medium',
      user_email: 'maria@startup.com',
      organization: 'StartupXYZ',
      category: 'Relatórios',
      created_at: '2024-02-14T15:20:00Z',
      updated_at: '2024-02-15T09:15:00Z',
      assigned_to: 'admin@sistema.com'
    },
    {
      id: 'TICK-003',
      title: 'Solicitar nova funcionalidade',
      description: 'Gostaria de sugerir a implementação de um dashboard customizável.',
      status: 'open',
      priority: 'low',
      user_email: 'carlos@enterprise.com',
      organization: 'Enterprise Inc',
      category: 'Funcionalidade',
      created_at: '2024-02-13T11:45:00Z',
      updated_at: '2024-02-13T11:45:00Z'
    },
    {
      id: 'TICK-004',
      title: 'Erro ao salvar dados',
      description: 'Recebo erro 500 sempre que tento salvar novos dados no sistema.',
      status: 'resolved',
      priority: 'urgent',
      user_email: 'ana@digital.com',
      organization: 'Digital Agency',
      category: 'Bug',
      created_at: '2024-02-12T08:30:00Z',
      updated_at: '2024-02-14T16:00:00Z',
      assigned_to: 'admin@sistema.com'
    }
  ]);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.user_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      open: 'destructive',
      in_progress: 'default',
      resolved: 'secondary',
      closed: 'outline'
    } as const;
    
    const labels = {
      open: 'Aberto',
      in_progress: 'Em andamento',
      resolved: 'Resolvido',
      closed: 'Fechado'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: 'outline',
      medium: 'secondary',
      high: 'default',
      urgent: 'destructive'
    } as const;
    
    const labels = {
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta',
      urgent: 'Urgente'
    };

    return (
      <Badge variant={variants[priority as keyof typeof variants]}>
        {labels[priority as keyof typeof labels]}
      </Badge>
    );
  };

  const handleStatusUpdate = (ticketId: string, newStatus: string) => {
    setTickets(tickets.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, status: newStatus as any, updated_at: new Date().toISOString() }
        : ticket
    ));
    
    toast({
      title: "Status atualizado",
      description: "O status do ticket foi atualizado com sucesso"
    });
  };

  const handleAssignTicket = (ticketId: string) => {
    setTickets(tickets.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, assigned_to: 'admin@sistema.com', status: 'in_progress', updated_at: new Date().toISOString() }
        : ticket
    ));
    
    toast({
      title: "Ticket atribuído",
      description: "O ticket foi atribuído para você"
    });
  };

  const openTicketCount = tickets.filter(t => t.status === 'open').length;
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Tickets de Suporte</h2>
        <p className="text-muted-foreground">Gerencie todas as solicitações de suporte dos usuários</p>
      </div>

      {/* Métricas de Tickets */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Abertos</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openTicketCount}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando atendimento
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressCount}</div>
            <p className="text-xs text-muted-foreground">
              Sendo atendidos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedCount}</div>
            <p className="text-xs text-muted-foreground">
              Finalizados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.length}</div>
            <p className="text-xs text-muted-foreground">
              Todos os tickets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Tickets</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os tickets de suporte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="open">Aberto</SelectItem>
                <SelectItem value="in_progress">Em andamento</SelectItem>
                <SelectItem value="resolved">Resolvido</SelectItem>
                <SelectItem value="closed">Fechado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Organização</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.id}</TableCell>
                  <TableCell>{ticket.title}</TableCell>
                  <TableCell>{ticket.user_email}</TableCell>
                  <TableCell>{ticket.organization}</TableCell>
                  <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                  <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                  <TableCell>{ticket.category}</TableCell>
                  <TableCell>{new Date(ticket.created_at).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalhes do Ticket #{selectedTicket?.id}</DialogTitle>
                            <DialogDescription>
                              {selectedTicket?.title}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedTicket && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Status</Label>
                                  <div className="mt-1">{getStatusBadge(selectedTicket.status)}</div>
                                </div>
                                <div>
                                  <Label>Prioridade</Label>
                                  <div className="mt-1">{getPriorityBadge(selectedTicket.priority)}</div>
                                </div>
                                <div>
                                  <Label>Usuário</Label>
                                  <p className="text-sm">{selectedTicket.user_email}</p>
                                </div>
                                <div>
                                  <Label>Organização</Label>
                                  <p className="text-sm">{selectedTicket.organization}</p>
                                </div>
                              </div>
                              <div>
                                <Label>Descrição</Label>
                                <p className="text-sm mt-1 p-3 bg-muted rounded-md">{selectedTicket.description}</p>
                              </div>
                              <div className="space-y-2">
                                <Label>Resposta</Label>
                                <Textarea
                                  value={response}
                                  onChange={(e) => setResponse(e.target.value)}
                                  placeholder="Digite sua resposta..."
                                />
                              </div>
                              <div className="flex gap-2">
                                <Select onValueChange={(value) => handleStatusUpdate(selectedTicket.id, value)}>
                                  <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Alterar status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="open">Aberto</SelectItem>
                                    <SelectItem value="in_progress">Em andamento</SelectItem>
                                    <SelectItem value="resolved">Resolvido</SelectItem>
                                    <SelectItem value="closed">Fechado</SelectItem>
                                  </SelectContent>
                                </Select>
                                {!selectedTicket.assigned_to && (
                                  <Button onClick={() => handleAssignTicket(selectedTicket.id)}>
                                    <User className="h-4 w-4 mr-2" />
                                    Atribuir para mim
                                  </Button>
                                )}
                                <Button variant="outline">
                                  Enviar Resposta
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};