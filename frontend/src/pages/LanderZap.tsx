import { useState, useEffect, useMemo } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Search, Plus, Star, Archive, Trash2, MoreHorizontal, Send, Mail, MessageCircle, Loader2, Phone, User, ChevronsUpDown, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  type: 'artist' | 'crm';
  image_url?: string;
}

interface Conversation {
  id: string;
  contact_id: string;
  contact_name: string;
  contact_initials: string;
  contact_image?: string;
  contact_type: 'artist' | 'crm';
  last_message: string;
  last_message_at: string;
  starred: boolean;
  unread: boolean;
  channel: 'whatsapp' | 'email';
}

interface Message {
  id: string;
  conversation_id: string;
  content: string;
  sent_at: string;
  from_me: boolean;
  channel: 'whatsapp' | 'email';
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

type FilterType = "todas" | "nao_lidas" | "favoritas";

const LanderZap = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [filter, setFilter] = useState<FilterType>("todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [replyText, setReplyText] = useState("");
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [newMessageChannel, setNewMessageChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const [newMessageText, setNewMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [contactSearchOpen, setContactSearchOpen] = useState(false);
  const [contactSearchTerm, setContactSearchTerm] = useState("");

  // Buscar conversas
  const { data: conversations = [], isLoading: loadingConversations } = useQuery({
    queryKey: ['landerzap-conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('landerzap_conversations')
        .select('*')
        .order('last_message_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as Conversation[];
    }
  });

  // Buscar mensagens da conversa selecionada
  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['landerzap-messages', selectedConversation?.id],
    queryFn: async () => {
      if (!selectedConversation) return [];
      
      const { data, error } = await supabase
        .from('landerzap_messages')
        .select('*')
        .eq('conversation_id', selectedConversation.id)
        .order('sent_at', { ascending: true });
      
      if (error) throw error;
      return (data || []) as Message[];
    },
    enabled: !!selectedConversation
  });

  // Buscar contatos (artistas + CRM)
  const { data: contacts = [] } = useQuery({
    queryKey: ['landerzap-contacts'],
    queryFn: async () => {
      const [artistsRes, crmRes] = await Promise.all([
        supabase.from('artists').select('id, name, stage_name, email, phone, image_url'),
        supabase.from('crm_contacts').select('id, name, email, phone, image_url')
      ]);

      const artists: Contact[] = (artistsRes.data || []).map(a => ({
        id: a.id,
        name: a.name,
        email: a.email || undefined,
        phone: a.phone || undefined,
        type: 'artist' as const,
        image_url: a.image_url || undefined
      }));

      const crm: Contact[] = (crmRes.data || []).map(c => ({
        id: c.id,
        name: c.name,
        email: c.email || undefined,
        phone: c.phone || undefined,
        type: 'crm' as const,
        image_url: c.image_url || undefined
      }));

      return [...artists, ...crm];
    }
  });

  // Enviar mensagem
  const sendMessage = useMutation({
    mutationFn: async ({ 
      contactId, 
      content, 
      channel 
    }: { 
      contactId: string; 
      content: string; 
      channel: 'whatsapp' | 'email' 
    }) => {
      const contact = contacts.find(c => c.id === contactId);
      if (!contact) throw new Error('Contato não encontrado');

      if (channel === 'whatsapp' && !contact.phone) {
        throw new Error('Contato não possui telefone cadastrado');
      }
      if (channel === 'email' && !contact.email) {
        throw new Error('Contato não possui email cadastrado');
      }

      // Enviar via Edge Function
      const { data, error } = await supabase.functions.invoke('landerzap-send', {
        body: {
          contactId,
          contactName: contact.name,
          contactPhone: contact.phone,
          contactEmail: contact.email,
          contactType: contact.type,
          content,
          channel
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landerzap-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['landerzap-messages'] });
      setReplyText("");
      setNewMessageText("");
      setIsNewMessageOpen(false);
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao enviar",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Alternar favorito
  const toggleStar = async (id: string) => {
    const conv = conversations.find(c => c.id === id);
    if (!conv) return;

    await supabase
      .from('landerzap_conversations')
      .update({ starred: !conv.starred })
      .eq('id', id);

    queryClient.invalidateQueries({ queryKey: ['landerzap-conversations'] });
  };

  // Arquivar conversa
  const archiveConversation = async (id: string) => {
    await supabase
      .from('landerzap_conversations')
      .update({ archived: true })
      .eq('id', id);

    queryClient.invalidateQueries({ queryKey: ['landerzap-conversations'] });
    if (selectedConversation?.id === id) {
      setSelectedConversation(null);
    }
    toast({ title: "Conversa arquivada" });
  };

  // Excluir conversa
  const deleteConversation = async (id: string) => {
    await supabase.from('landerzap_messages').delete().eq('conversation_id', id);
    await supabase.from('landerzap_conversations').delete().eq('id', id);

    queryClient.invalidateQueries({ queryKey: ['landerzap-conversations'] });
    if (selectedConversation?.id === id) {
      setSelectedConversation(null);
    }
    toast({ title: "Conversa excluída" });
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedConversation) return;

    sendMessage.mutate({
      contactId: selectedConversation.contact_id,
      content: replyText.trim(),
      channel: selectedConversation.channel
    });
  };

  const handleSendNewMessage = () => {
    if (!newMessageText.trim() || !selectedContactId) return;

    setIsSending(true);
    sendMessage.mutate({
      contactId: selectedContactId,
      content: newMessageText.trim(),
      channel: newMessageChannel
    }, {
      onSettled: () => setIsSending(false)
    });
  };

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = conv.contact_name.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "nao_lidas") return matchesSearch && conv.unread;
    if (filter === "favoritas") return matchesSearch && conv.starred;
    return matchesSearch;
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const selectedContact = contacts.find(c => c.id === selectedContactId);

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
              <Button size="sm" className="gap-2" onClick={() => setIsNewMessageOpen(true)}>
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
                      placeholder="Buscar conversas..."
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
                  {loadingConversations ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <MessageCircle className="h-12 w-12 text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground text-sm">
                        {searchTerm ? "Nenhuma conversa encontrada" : "Nenhuma conversa ainda"}
                      </p>
                      <Button 
                        variant="link" 
                        className="mt-2"
                        onClick={() => setIsNewMessageOpen(true)}
                      >
                        Iniciar nova conversa
                      </Button>
                    </div>
                  ) : (
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
                            if (conv.unread) {
                              supabase
                                .from('landerzap_conversations')
                                .update({ unread: false })
                                .eq('id', conv.id)
                                .then(() => {
                                  queryClient.invalidateQueries({ queryKey: ['landerzap-conversations'] });
                                });
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10 shrink-0">
                              {conv.contact_image && (
                                <AvatarImage src={conv.contact_image} />
                              )}
                              <AvatarFallback
                                className={cn(
                                  "text-xs font-medium",
                                  conv.unread
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                                )}
                              >
                                {conv.contact_initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={cn(
                                      "font-medium text-sm truncate",
                                      conv.unread && "text-foreground font-semibold"
                                    )}
                                  >
                                    {conv.contact_name}
                                  </span>
                                  {conv.channel === 'whatsapp' ? (
                                    <MessageCircle className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <Mail className="h-3 w-3 text-blue-500" />
                                  )}
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  {conv.starred && (
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  )}
                                  <span className="text-[10px] text-muted-foreground">
                                    {new Date(conv.last_message_at).toLocaleDateString('pt-BR', {
                                      day: '2-digit',
                                      month: '2-digit'
                                    })}
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {conv.last_message}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                          {selectedConversation.contact_image && (
                            <AvatarImage src={selectedConversation.contact_image} />
                          )}
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                            {selectedConversation.contact_initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="font-semibold text-foreground">
                              {selectedConversation.contact_name}
                            </h2>
                            {selectedConversation.channel === 'whatsapp' ? (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <MessageCircle className="h-3 w-3 mr-1" />
                                WhatsApp
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-blue-600 border-blue-600">
                                <Mail className="h-3 w-3 mr-1" />
                                Email
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {selectedConversation.contact_type === 'artist' ? 'Artista' : 'Contato CRM'}
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
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => archiveConversation(selectedConversation.id)}
                        >
                          <Archive className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deleteConversation(selectedConversation.id)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>

                    {/* Message Content */}
                    <ScrollArea className="flex-1 p-6">
                      {loadingMessages ? (
                        <div className="flex items-center justify-center p-8">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                          <MessageCircle className="h-12 w-12 text-muted-foreground/50 mb-3" />
                          <p className="text-muted-foreground text-sm">Nenhuma mensagem ainda</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((msg) => (
                            <div
                              key={msg.id}
                              className={cn(
                                "max-w-[80%] rounded-lg p-4",
                                msg.from_me
                                  ? "ml-auto bg-primary text-primary-foreground"
                                  : "bg-muted"
                              )}
                            >
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                              <div className={cn(
                                "flex items-center gap-2 mt-2",
                                msg.from_me ? "justify-end" : "justify-start"
                              )}>
                                <p
                                  className={cn(
                                    "text-[10px]",
                                    msg.from_me ? "text-primary-foreground/70" : "text-muted-foreground"
                                  )}
                                >
                                  {new Date(msg.sent_at).toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                                {msg.from_me && (
                                  <Badge 
                                    variant="outline" 
                                    className={cn(
                                      "text-[8px] h-4",
                                      msg.status === 'sent' && "border-yellow-500 text-yellow-500",
                                      msg.status === 'delivered' && "border-blue-500 text-blue-500",
                                      msg.status === 'read' && "border-green-500 text-green-500",
                                      msg.status === 'failed' && "border-red-500 text-red-500"
                                    )}
                                  >
                                    {msg.status === 'sent' && 'Enviado'}
                                    {msg.status === 'delivered' && 'Entregue'}
                                    {msg.status === 'read' && 'Lido'}
                                    {msg.status === 'failed' && 'Falhou'}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>

                    {/* Reply Input */}
                    <div className="border-t border-border p-4">
                      <div className="flex gap-3">
                        <Textarea
                          placeholder={`Responder via ${selectedConversation.channel === 'whatsapp' ? 'WhatsApp' : 'Email'}...`}
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
                          disabled={!replyText.trim() || sendMessage.isPending}
                        >
                          {sendMessage.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              Enviar
                              <Send className="h-4 w-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                    <MessageCircle className="h-16 w-16 mb-4 text-muted-foreground/50" />
                    <p className="text-lg font-medium mb-2">Selecione uma conversa</p>
                    <p className="text-sm text-center mb-4">
                      Escolha uma conversa existente ou inicie uma nova
                    </p>
                    <Button onClick={() => setIsNewMessageOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Mensagem
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>

      {/* Modal Nova Mensagem */}
      <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova Mensagem</DialogTitle>
            <DialogDescription>
              Envie uma mensagem via WhatsApp ou Email
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Canal */}
            <div className="space-y-2">
              <Label>Canal de envio</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={newMessageChannel === 'whatsapp' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setNewMessageChannel('whatsapp')}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  type="button"
                  variant={newMessageChannel === 'email' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setNewMessageChannel('email')}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              </div>
            </div>

            {/* Destinatário */}
            <div className="space-y-2">
              <Label>Destinatário</Label>
              <Popover open={contactSearchOpen} onOpenChange={setContactSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={contactSearchOpen}
                    className="w-full justify-between font-normal"
                  >
                    {selectedContactId ? (
                      <span className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        {contacts.find(c => c.id === selectedContactId)?.name || "Selecione..."}
                      </span>
                    ) : (
                      "Buscar contato..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-popover" align="start" style={{ width: 'var(--radix-popover-trigger-width)' }}>
                  <Command>
                    <CommandInput 
                      placeholder="Digite para buscar..." 
                      value={contactSearchTerm}
                      onValueChange={setContactSearchTerm}
                    />
                    <CommandList>
                      <CommandEmpty>Nenhum contato encontrado.</CommandEmpty>
                      <CommandGroup heading="Artistas">
                        {contacts
                          .filter(c => c.type === 'artist')
                          .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
                          .map(contact => (
                            <CommandItem
                              key={contact.id}
                              value={contact.name}
                              onSelect={() => {
                                setSelectedContactId(contact.id);
                                setContactSearchOpen(false);
                              }}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedContactId === contact.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex items-center gap-2 flex-1">
                                <User className="h-3 w-3 text-muted-foreground" />
                                <span>{contact.name}</span>
                                {newMessageChannel === 'whatsapp' && contact.phone && (
                                  <span className="text-xs text-muted-foreground ml-auto">{contact.phone}</span>
                                )}
                                {newMessageChannel === 'email' && contact.email && (
                                  <span className="text-xs text-muted-foreground ml-auto">{contact.email}</span>
                                )}
                                {newMessageChannel === 'whatsapp' && !contact.phone && (
                                  <Badge variant="outline" className="text-destructive border-destructive text-[10px] ml-auto">
                                    Sem telefone
                                  </Badge>
                                )}
                                {newMessageChannel === 'email' && !contact.email && (
                                  <Badge variant="outline" className="text-destructive border-destructive text-[10px] ml-auto">
                                    Sem email
                                  </Badge>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                      </CommandGroup>
                      <CommandGroup heading="Contatos CRM">
                        {contacts
                          .filter(c => c.type === 'crm')
                          .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
                          .map(contact => (
                            <CommandItem
                              key={contact.id}
                              value={contact.name}
                              onSelect={() => {
                                setSelectedContactId(contact.id);
                                setContactSearchOpen(false);
                              }}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedContactId === contact.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex items-center gap-2 flex-1">
                                <User className="h-3 w-3 text-muted-foreground" />
                                <span>{contact.name}</span>
                                {newMessageChannel === 'whatsapp' && contact.phone && (
                                  <span className="text-xs text-muted-foreground ml-auto">{contact.phone}</span>
                                )}
                                {newMessageChannel === 'email' && contact.email && (
                                  <span className="text-xs text-muted-foreground ml-auto">{contact.email}</span>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedContact && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {newMessageChannel === 'whatsapp' ? (
                    <>
                      <Phone className="h-3 w-3" />
                      {selectedContact.phone || 'Sem telefone cadastrado'}
                    </>
                  ) : (
                    <>
                      <Mail className="h-3 w-3" />
                      {selectedContact.email || 'Sem email cadastrado'}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mensagem */}
            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea
                placeholder="Digite sua mensagem..."
                className="min-h-[120px]"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
              />
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsNewMessageOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSendNewMessage}
                disabled={!selectedContactId || !newMessageText.trim() || isSending}
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Enviar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default LanderZap;
