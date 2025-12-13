import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Search, Plus, Star, Archive, Trash2, MoreHorizontal, Send } from "lucide-react";

interface Conversation {
  id: string;
  name: string;
  initials: string;
  subject: string;
  preview: string;
  timestamp: string;
  starred: boolean;
  unread: boolean;
  messages: Message[];
}

interface Message {
  id: string;
  content: string;
  timestamp: string;
  fromMe: boolean;
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    name: "Mc Looiz",
    initials: "ML",
    subject: "Sobre o novo lançamento",
    preview: "Oi! Queria discutir a data de lançamento do novo single...",
    timestamp: "10:30",
    starred: true,
    unread: true,
    messages: [
      {
        id: "1-1",
        content: "Oi! Queria discutir a data de lançamento do novo single.\n\nEstou pensando em lançar no dia 20, mas queria saber se vocês acham que é uma boa data considerando o calendário de lançamentos do mês.\n\nTambém preciso saber sobre a arte da capa, já está pronta?",
        timestamp: "10:30",
        fromMe: false,
      },
    ],
  },
  {
    id: "2",
    name: "ONErpm",
    initials: "ON",
    subject: "Relatório de royalties - Dezembro",
    preview: "Segue em anexo o relatório de royalties referente ao mês de dezembro...",
    timestamp: "Ontem",
    starred: false,
    unread: false,
    messages: [
      {
        id: "2-1",
        content: "Segue em anexo o relatório de royalties referente ao mês de dezembro.\n\nTotal de streams: 2.4M\nReceita estimada: R$ 8.420,00\n\nQualquer dúvida estamos à disposição.",
        timestamp: "Ontem",
        fromMe: false,
      },
    ],
  },
  {
    id: "3",
    name: "Dj Lael",
    initials: "DL",
    subject: "Re: Contrato de renovação",
    preview: "Perfeito, concordamos com os termos propostos. Quando podemos assinar?",
    timestamp: "Ontem",
    starred: false,
    unread: false,
    messages: [
      {
        id: "3-1",
        content: "Perfeito, concordamos com os termos propostos. Quando podemos assinar?\n\nJá repassei para o advogado e ele deu o ok.",
        timestamp: "Ontem",
        fromMe: false,
      },
    ],
  },
  {
    id: "4",
    name: "Spotify for Artists",
    initials: "SP",
    subject: "Seu resumo semanal",
    preview: "Suas músicas alcançaram 2.4M de streams esta semana...",
    timestamp: "2 dias",
    starred: true,
    unread: false,
    messages: [
      {
        id: "4-1",
        content: "Suas músicas alcançaram 2.4M de streams esta semana!\n\n📈 Top músicas:\n1. Tropa do Lael - 890K\n2. Putaria No Escuro - 650K\n3. Xia As Amiguinhas - 420K\n\nContinue assim! 🔥",
        timestamp: "2 dias",
        fromMe: false,
      },
    ],
  },
  {
    id: "5",
    name: "Designer GV",
    initials: "DG",
    subject: "Artwork para o EP",
    preview: "Estou enviando as opções de arte para a capa do EP Bandida...",
    timestamp: "3 dias",
    starred: false,
    unread: false,
    messages: [
      {
        id: "5-1",
        content: "Estou enviando as opções de arte para a capa do EP Bandida.\n\nSão 3 versões diferentes, me digam qual preferem para eu finalizar.",
        timestamp: "3 dias",
        fromMe: false,
      },
    ],
  },
  {
    id: "6",
    name: "Studio A",
    initials: "SA",
    subject: "Agendamento de sessão",
    preview: "Confirmando a sessão de gravação para o dia 15/12...",
    timestamp: "4 dias",
    starred: false,
    unread: false,
    messages: [
      {
        id: "6-1",
        content: "Confirmando a sessão de gravação para o dia 15/12 às 14h.\n\nO estúdio estará preparado com todo o equipamento necessário.",
        timestamp: "4 dias",
        fromMe: false,
      },
    ],
  },
];

type FilterType = "todas" | "nao_lidas" | "favoritas";

const LanderZap = () => {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(mockConversations[0]);
  const [filter, setFilter] = useState<FilterType>("todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [replyText, setReplyText] = useState("");

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.subject.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "nao_lidas") return matchesSearch && conv.unread;
    if (filter === "favoritas") return matchesSearch && conv.starred;
    return matchesSearch;
  });

  const toggleStar = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, starred: !c.starred } : c))
    );
    if (selectedConversation?.id === id) {
      setSelectedConversation((prev) => prev ? { ...prev, starred: !prev.starred } : null);
    }
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: `${selectedConversation.id}-${Date.now()}`,
      content: replyText.trim(),
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      fromMe: true,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConversation.id
          ? { ...c, messages: [...c.messages, newMessage] }
          : c
      )
    );

    setSelectedConversation((prev) =>
      prev ? { ...prev, messages: [...prev.messages, newMessage] } : null
    );

    setReplyText("");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full h-screen flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="h-9 w-9" />
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground">LanderZap</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Comunicação com artistas e parceiros
                  </p>
                </div>
              </div>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nova Mensagem</span>
              </Button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Panel - Conversations List */}
              <div className="w-full max-w-md border-r border-border flex flex-col bg-card">
                {/* Search */}
                <div className="p-3 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar mensagens..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="px-3 py-2 border-b border-border flex gap-2">
                  <Badge
                    variant={filter === "todas" ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => setFilter("todas")}
                  >
                    Todas
                  </Badge>
                  <Badge
                    variant={filter === "nao_lidas" ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => setFilter("nao_lidas")}
                  >
                    Não lidas
                  </Badge>
                  <Badge
                    variant={filter === "favoritas" ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => setFilter("favoritas")}
                  >
                    Favoritas
                  </Badge>
                </div>

                {/* Conversations */}
                <ScrollArea className="flex-1">
                  <div className="divide-y divide-border">
                    {filteredConversations.map((conv) => (
                      <div
                        key={conv.id}
                        className={cn(
                          "p-3 cursor-pointer transition-colors hover:bg-accent/50",
                          selectedConversation?.id === conv.id && "bg-accent"
                        )}
                        onClick={() => {
                          setSelectedConversation(conv);
                          // Mark as read
                          setConversations((prev) =>
                            prev.map((c) => (c.id === conv.id ? { ...c, unread: false } : c))
                          );
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 shrink-0">
                            <AvatarFallback
                              className={cn(
                                "text-xs font-medium",
                                conv.unread
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              {conv.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={cn(
                                  "font-medium text-sm truncate",
                                  conv.unread && "text-foreground font-semibold"
                                )}
                              >
                                {conv.name}
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                {conv.starred && (
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                )}
                                <span className="text-[10px] text-muted-foreground">
                                  {conv.timestamp}
                                </span>
                              </div>
                            </div>
                            <p
                              className={cn(
                                "text-sm truncate",
                                conv.unread
                                  ? "text-foreground font-medium"
                                  : "text-muted-foreground"
                              )}
                            >
                              {conv.subject}
                            </p>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {conv.preview}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Right Panel - Message View */}
              <div className="flex-1 flex flex-col bg-background">
                {selectedConversation ? (
                  <>
                    {/* Message Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                            {selectedConversation.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h2 className="font-semibold text-foreground">
                            {selectedConversation.name}
                          </h2>
                          <p className="text-xs text-muted-foreground">
                            {selectedConversation.timestamp}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleStar(selectedConversation.id)}
                        >
                          <Star
                            className={cn(
                              "h-4 w-4",
                              selectedConversation.starred
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            )}
                          />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Archive className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>

                    {/* Message Content */}
                    <ScrollArea className="flex-1 p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4">
                        {selectedConversation.subject}
                      </h3>
                      <div className="space-y-4">
                        {selectedConversation.messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={cn(
                              "max-w-[80%] rounded-lg p-4",
                              msg.fromMe
                                ? "ml-auto bg-primary text-primary-foreground"
                                : "bg-muted"
                            )}
                          >
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            <p
                              className={cn(
                                "text-[10px] mt-2",
                                msg.fromMe ? "text-primary-foreground/70" : "text-muted-foreground"
                              )}
                            >
                              {msg.timestamp}
                            </p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    {/* Reply Input */}
                    <div className="border-t border-border p-4">
                      <div className="flex gap-3">
                        <Textarea
                          placeholder="Escreva sua resposta..."
                          className="min-h-[80px] resize-none"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendReply();
                            }
                          }}
                        />
                        <Button
                          className="self-end"
                          onClick={handleSendReply}
                          disabled={!replyText.trim()}
                        >
                          Enviar
                          <Send className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    Selecione uma conversa para visualizar
                  </div>
                )}
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default LanderZap;
