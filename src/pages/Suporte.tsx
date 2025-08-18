import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  Mail, 
  FileText, 
  Search,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const Suporte = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [supportForm, setSupportForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    priority: "medium"
  });

  const faqItems = [
    {
      question: "Como fazer login no sistema?",
      answer: "Para fazer login, acesse a tela de login, digite seu email e senha cadastrados. Se for sua primeira vez, entre em contato com o administrador para criar sua conta."
    },
    {
      question: "Como criar um novo artista?",
      answer: "Vá para a seção 'Artistas', clique em 'Novo Artista' e preencha todas as informações necessárias como nome, gênero musical, contatos e dados bancários."
    },
    {
      question: "Como gerar relatórios?",
      answer: "Acesse a seção 'Relatórios', escolha o tipo de relatório desejado, configure os filtros de data e outros parâmetros, e clique em 'Gerar Relatório'."
    },
    {
      question: "Como registrar uma nova música?",
      answer: "Na seção 'Registro de Músicas', clique em 'Nova Música', preencha os metadados como título, compositores, gênero e faça o upload do arquivo de áudio."
    },
    {
      question: "Como gerenciar contratos?",
      answer: "Na seção 'Contratos', você pode visualizar, criar e editar contratos. Preencha todos os dados das partes envolvidas, valores e condições do acordo."
    },
    {
      question: "Como funciona o sistema financeiro?",
      answer: "O módulo financeiro permite registrar receitas, despesas, gerar relatórios financeiros e acompanhar o fluxo de caixa da empresa."
    },
    {
      question: "Como alterar minha senha?",
      answer: "Acesse seu perfil no canto superior direito, clique em 'Configurações' e depois em 'Alterar Senha'. Digite sua senha atual e a nova senha."
    },
    {
      question: "Como exportar dados?",
      answer: "Na maioria das seções, há um botão 'Exportar' que permite baixar os dados em formato Excel ou PDF para uso externo."
    }
  ];

  const filteredFaq = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmitSupport = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate sending support request
    toast({
      title: "Solicitação enviada",
      description: "Sua solicitação de suporte foi enviada com sucesso. Retornaremos em breve."
    });

    // Reset form
    setSupportForm({
      name: "",
      email: "",
      subject: "",
      message: "",
      priority: "medium"
    });
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
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
                Encontre respostas ou entre em contato conosco
              </p>
            </div>
          </div>

          <Tabs defaultValue="faq" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="contact">Contato</TabsTrigger>
              <TabsTrigger value="tickets">Meus Chamados</TabsTrigger>
            </TabsList>

            <TabsContent value="faq" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    Perguntas Frequentes
                  </CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar nas perguntas frequentes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {filteredFaq.map((item, index) => (
                    <div key={index} className="border rounded-lg">
                      <button
                        onClick={() => toggleFaq(index)}
                        className="w-full p-4 text-left flex items-center justify-between hover:bg-muted/50 rounded-lg transition-colors"
                      >
                        <span className="font-medium">{item.question}</span>
                        {expandedFaq === index ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      {expandedFaq === index && (
                        <div className="p-4 pt-0 border-t bg-muted/20">
                          <p className="text-muted-foreground">{item.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  {filteredFaq.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma pergunta encontrada para "{searchTerm}"
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Nova Solicitação
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitSupport} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Nome</label>
                          <Input
                            value={supportForm.name}
                            onChange={(e) => setSupportForm({...supportForm, name: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Email</label>
                          <Input
                            type="email"
                            value={supportForm.email}
                            onChange={(e) => setSupportForm({...supportForm, email: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Assunto</label>
                        <Input
                          value={supportForm.subject}
                          onChange={(e) => setSupportForm({...supportForm, subject: e.target.value})}
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Prioridade</label>
                        <select
                          value={supportForm.priority}
                          onChange={(e) => setSupportForm({...supportForm, priority: e.target.value})}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="low">Baixa</option>
                          <option value="medium">Média</option>
                          <option value="high">Alta</option>
                          <option value="urgent">Urgente</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Mensagem</label>
                        <Textarea
                          value={supportForm.message}
                          onChange={(e) => setSupportForm({...supportForm, message: e.target.value})}
                          rows={5}
                          placeholder="Descreva detalhadamente sua dúvida ou problema..."
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full">
                        Enviar Solicitação
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Phone className="h-5 w-5" />
                        Contato Direto
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Telefone</p>
                          <p className="text-sm text-muted-foreground">(33) 99917-9552</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-sm text-muted-foreground">suporte@gestao360.com</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Horário de Atendimento</p>
                          <p className="text-sm text-muted-foreground">
                            Segunda a Sexta: 8h às 18h<br />
                            Sábado: 9h às 13h
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Documentação
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        Manual do Usuário
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        Guia de Primeiros Passos
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        Tutoriais em Vídeo
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tickets" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Meus Chamados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Mock ticket data */}
                    <div className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">#SUP-001 - Problema com relatórios</h4>
                          <p className="text-sm text-muted-foreground">Criado em 15/12/2024</p>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Em Andamento
                        </Badge>
                      </div>
                      <p className="text-sm">Relatórios não estão sendo gerados corretamente...</p>
                    </div>

                    <div className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">#SUP-002 - Dúvida sobre contratos</h4>
                          <p className="text-sm text-muted-foreground">Criado em 12/12/2024</p>
                        </div>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Resolvido
                        </Badge>
                      </div>
                      <p className="text-sm">Como vincular artistas aos contratos...</p>
                    </div>

                    <div className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">#SUP-003 - Erro no sistema financeiro</h4>
                          <p className="text-sm text-muted-foreground">Criado em 10/12/2024</p>
                        </div>
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Urgente
                        </Badge>
                      </div>
                      <p className="text-sm">Sistema apresenta erro ao calcular comissões...</p>
                    </div>

                    <div className="text-center py-4">
                      <p className="text-muted-foreground text-sm">
                        Não encontrou o que procura? 
                        <Button variant="link" className="px-1">
                          Abrir novo chamado
                        </Button>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Suporte;