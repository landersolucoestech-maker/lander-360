import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus,
  BookOpen,
  Ticket,
  Mail,
  Clock,
  Phone,
  Search,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Timer,
  Filter
} from "lucide-react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const Suporte = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [ticketFilter, setTicketFilter] = useState("todos");
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "geral"
  });

  const faqItems = [
    {
      question: "Como fazer login no sistema?",
      answer: "Para fazer login, acesse a tela de login, digite seu email e senha cadastrados. Se for sua primeira vez, entre em contato com o administrador para criar sua conta.",
      category: "Acesso"
    },
    {
      question: "Como criar um novo artista?",
      answer: "Vá para a seção 'Artistas', clique em 'Novo Artista' e preencha todas as informações necessárias como nome, gênero musical, contatos e dados bancários.",
      category: "Artistas"
    },
    {
      question: "Como gerar relatórios?",
      answer: "Acesse a seção 'Relatórios', escolha o tipo de relatório desejado, configure os filtros de data e outros parâmetros, e clique em 'Gerar Relatório'.",
      category: "Relatórios"
    },
    {
      question: "Como registrar uma nova música?",
      answer: "Na seção 'Registro de Músicas', clique em 'Nova Música', preencha os metadados como título, compositores, gênero e faça o upload do arquivo de áudio.",
      category: "Músicas"
    },
    {
      question: "Como gerenciar contratos?",
      answer: "Na seção 'Contratos', você pode visualizar, criar e editar contratos. Preencha todos os dados das partes envolvidas, valores e condições do acordo.",
      category: "Contratos"
    },
    {
      question: "Como funciona o sistema financeiro?",
      answer: "O módulo financeiro permite registrar receitas, despesas, gerar relatórios financeiros e acompanhar o fluxo de caixa da empresa.",
      category: "Financeiro"
    },
    {
      question: "Como alterar minha senha?",
      answer: "Acesse seu perfil no canto superior direito, clique em 'Configurações' e depois em 'Alterar Senha'. Digite sua senha atual e a nova senha.",
      category: "Conta"
    },
    {
      question: "Como exportar dados?",
      answer: "Na maioria das seções, há um botão 'Exportar' que permite baixar os dados em formato Excel ou PDF para uso externo.",
      category: "Exportação"
    }
  ];

  const tickets = [
    {
      id: "TIC-001",
      title: "Problema com relatórios financeiros",
      status: "aberto",
      priority: "alta",
      created: "2024-12-15",
      updated: "2024-12-16",
      description: "Relatórios financeiros não estão sendo gerados corretamente..."
    },
    {
      id: "TIC-002", 
      title: "Dúvida sobre contratos de artistas",
      status: "aguardando",
      priority: "media",
      created: "2024-12-12",
      updated: "2024-12-14",
      description: "Como vincular múltiplos artistas a um contrato..."
    },
    {
      id: "TIC-003",
      title: "Erro no sistema de upload",
      status: "fechado",
      priority: "baixa", 
      created: "2024-12-10",
      updated: "2024-12-11",
      description: "Sistema apresenta erro ao fazer upload de músicas..."
    },
    {
      id: "TIC-004",
      title: "Problema de acesso ao sistema",
      status: "fechado",
      priority: "urgente",
      created: "2024-12-08",
      updated: "2024-12-09", 
      description: "Não consigo acessar o sistema após mudança de senha..."
    }
  ];

  const filteredFaq = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTickets = tickets.filter(ticket => {
    if (ticketFilter === "todos") return true;
    return ticket.status === ticketFilter;
  });

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Ticket criado",
      description: "Seu ticket foi criado com sucesso. Você receberá atualizações por email."
    });

    setNewTicketForm({
      title: "",
      description: "",
      priority: "medium",
      category: "geral"
    });
    setShowNewTicketForm(false);
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "aberto":
        return <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Aberto
        </Badge>;
      case "aguardando":
        return <Badge variant="outline" className="flex items-center gap-1">
          <Timer className="h-3 w-3" />
          Aguardando
        </Badge>;
      case "fechado":
        return <Badge variant="secondary" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Fechado
        </Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgente": return "text-red-600";
      case "alta": return "text-orange-600";
      case "media": return "text-yellow-600";
      case "baixa": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center gap-4 mb-6">
            <SidebarTrigger />
            <div>
              <h1 className="text-3xl font-bold">Central de Suporte</h1>
              <p className="text-muted-foreground">
                Crie tickets, consulte a base de conhecimento e acompanhe suas solicitações
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Novo Ticket */}
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowNewTicketForm(true)}>
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Novo Ticket</h3>
                <p className="text-sm text-muted-foreground">
                  Precisa de ajuda? Abra um novo ticket de suporte
                </p>
              </CardContent>
            </Card>

            {/* Base de Conhecimento */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Base de Conhecimento</h3>
                <p className="text-sm text-muted-foreground">
                  Encontre respostas rápidas nas perguntas frequentes
                </p>
              </CardContent>
            </Card>

            {/* Meus Tickets */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Ticket className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Meus Tickets</h3>
                <p className="text-sm text-muted-foreground">
                  {tickets.length} ticket(s) • {tickets.filter(t => t.status === 'aberto').length} aberto(s)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Modal Novo Ticket */}
          {showNewTicketForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Novo Ticket de Suporte
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowNewTicketForm(false)}
                    >
                      ×
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitTicket} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Título</label>
                      <Input
                        value={newTicketForm.title}
                        onChange={(e) => setNewTicketForm({...newTicketForm, title: e.target.value})}
                        placeholder="Descreva brevemente o problema"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Categoria</label>
                        <select
                          value={newTicketForm.category}
                          onChange={(e) => setNewTicketForm({...newTicketForm, category: e.target.value})}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="geral">Geral</option>
                          <option value="tecnico">Técnico</option>
                          <option value="financeiro">Financeiro</option>
                          <option value="artistas">Artistas</option>
                          <option value="contratos">Contratos</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Prioridade</label>
                        <select
                          value={newTicketForm.priority}
                          onChange={(e) => setNewTicketForm({...newTicketForm, priority: e.target.value})}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="baixa">Baixa</option>
                          <option value="media">Média</option>
                          <option value="alta">Alta</option>
                          <option value="urgente">Urgente</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Descrição</label>
                      <Textarea
                        value={newTicketForm.description}
                        onChange={(e) => setNewTicketForm({...newTicketForm, description: e.target.value})}
                        rows={4}
                        placeholder="Descreva detalhadamente o problema ou dúvida..."
                        required
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        Criar Ticket
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowNewTicketForm(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Base de Conhecimento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Base de Conhecimento
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar na base de conhecimento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {filteredFaq.map((item, index) => (
                  <div key={index} className="border rounded-lg">
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full p-3 text-left flex items-center justify-between hover:bg-muted/50 rounded-lg transition-colors"
                    >
                      <div>
                        <span className="font-medium text-sm">{item.question}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{item.category}</Badge>
                        </div>
                      </div>
                      {expandedFaq === index ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                    {expandedFaq === index && (
                      <div className="p-3 pt-0 border-t bg-muted/20">
                        <p className="text-sm text-muted-foreground">{item.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
                {filteredFaq.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum resultado encontrado para "{searchTerm}"
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Meus Tickets */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  Meus Tickets
                </CardTitle>
                <div className="flex gap-2 flex-wrap">
                  {["todos", "aberto", "aguardando", "fechado"].map((filter) => (
                    <Button
                      key={filter}
                      variant={ticketFilter === filter ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTicketFilter(filter)}
                      className="text-xs"
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      {filter === "todos" && ` (${tickets.length})`}
                      {filter !== "todos" && ` (${tickets.filter(t => t.status === filter).length})`}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {filteredTickets.map((ticket) => (
                  <div key={ticket.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{ticket.id}</span>
                          {getStatusBadge(ticket.status)}
                        </div>
                        <h4 className="font-medium text-sm mb-1">{ticket.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {ticket.description}
                        </p>
                      </div>
                      <div className={`text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority.toUpperCase()}
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Criado: {ticket.created}</span>
                      <span>Atualizado: {ticket.updated}</span>
                    </div>
                  </div>
                ))}
                {filteredTickets.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum ticket encontrado
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Outros Canais de Suporte */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Outros Canais de Suporte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <Mail className="h-8 w-8 text-blue-600" />
                  <div>
                    <h4 className="font-medium">Email</h4>
                    <p className="text-sm text-muted-foreground">suporte@gestao360.com</p>
                    <p className="text-xs text-muted-foreground">Resposta em até 24h</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <Phone className="h-8 w-8 text-green-600" />
                  <div>
                    <h4 className="font-medium">Telefone</h4>
                    <p className="text-sm text-muted-foreground">(33) 99917-9552</p>
                    <p className="text-xs text-muted-foreground">Suporte direto</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <Clock className="h-8 w-8 text-orange-600" />
                  <div>
                    <h4 className="font-medium">Horário de Atendimento</h4>
                    <p className="text-sm text-muted-foreground">Seg-Sex: 8h às 18h</p>
                    <p className="text-xs text-muted-foreground">Sáb: 9h às 13h</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Suporte;