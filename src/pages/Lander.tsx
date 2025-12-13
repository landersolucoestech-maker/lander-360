import { useState, useRef } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, MessageCircle, Users, ShieldCheck } from "lucide-react";

interface Message {
  id: string;
  author: "Lander" | "Artista" | "Parceiro";
  name: string;
  content: string;
  timestamp: string;
}

const Lander = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      author: "Lander",
      name: "Lander 360º",
      content: "Bem-vindo ao canal oficial de comunicação Lander. Use este espaço para falar com artistas, empresários e parceiros sobre lançamentos, campanhas e operações do dia a dia.",
      timestamp: "09:00",
    },
    {
      id: "2",
      author: "Artista",
      name: "Mc Looiz",
      content: "Fala Lander, já saiu o planejamento de divulgação do EP Bandida?",
      timestamp: "09:12",
    },
    {
      id: "3",
      author: "Lander",
      name: "Equipe Lander",
      content: "Sim! Hoje à tarde vamos te enviar o cronograma completo com posts, vídeos curtos e datas de impulsionamento.",
      timestamp: "09:18",
    },
  ]);

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: String(Date.now()),
      author: "Lander",
      name: "Lander 360º",
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full h-full px-4 py-4 space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="h-9 w-9" />
                <div className="flex flex-col gap-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Lander</h1>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Comunicação central entre Lander, artistas e parceiros
                  </p>
                </div>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Canal Oficial</CardTitle>
                  <CardDescription>Mensagens institucionais e operacionais</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>Use para decisões, alinhamentos e avisos importantes.</span>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Artistas</CardTitle>
                  <CardDescription>Comunicação direta com o casting</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  <span>Organize conversas por lançamento, projeto ou campanha.</span>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Mensagens</CardTitle>
                  <CardDescription>Histórico e registro estratégico</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  <span>Centralize decisões em um único canal interno.</span>
                </CardContent>
              </Card>
            </div>

            {/* Chat Area */}
            <Card className="flex flex-col h-[calc(100vh-260px)]">
              <CardHeader className="border-b border-border pb-3 flex flex-row items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    Canal Geral
                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                      Comunicação Interna
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Use este espaço para registrar conversas importantes com artistas e parceiros.
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-4" ref={scrollRef as any}>
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className="flex gap-3 items-start"
                      >
                        <Avatar className="h-9 w-9 mt-0.5">
                          <AvatarFallback className={
                            message.author === "Lander"
                              ? "bg-primary text-primary-foreground text-xs"
                              : "bg-secondary text-secondary-foreground text-xs"
                          }>
                            {message.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-xs mb-1">
                            <span className="font-semibold text-foreground">
                              {message.name}
                            </span>
                            <Badge
                              variant={
                                message.author === "Lander"
                                  ? "default"
                                  : "outline"
                              }
                              className="text-[9px] uppercase tracking-wide px-1.5 py-0 h-4"
                            >
                              {message.author}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground ml-auto">
                              {message.timestamp}
                            </span>
                          </div>
                          <div className="inline-block max-w-[90%] rounded-lg bg-muted px-3 py-2 text-sm text-foreground">
                            {message.content}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="border-t border-border px-4 py-3 flex items-center gap-2">
                  <Input
                    placeholder="Escreva uma mensagem como Lander para artistas e parceiros..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <Button
                    size="icon"
                    className="shrink-0"
                    onClick={handleSend}
                    disabled={!input.trim()}
                    aria-label="Enviar mensagem"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Lander;
