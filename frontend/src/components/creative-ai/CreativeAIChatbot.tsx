import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, Loader2, Bot, User, Sparkles, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useArtists } from '@/hooks/useArtists';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const CreativeAIChatbot = () => {
  const { data: artists } = useArtists();
  const [selectedArtist, setSelectedArtist] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get artist data if selected
      let artistData = null;
      if (selectedArtist) {
        const artist = artists?.find(a => a.id === selectedArtist);
        if (artist) {
          artistData = artist;
        }
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-creative-ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: 'chat',
          artistData,
          chatMessages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage.content },
          ],
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to start stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let assistantContent = '';

      // Add empty assistant message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage?.role === 'assistant') {
                  lastMessage.content = assistantContent;
                }
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportChat = async () => {
    if (messages.length === 0) {
      toast.error('Nenhuma conversa para exportar');
      return;
    }

    const artistName = selectedArtist 
      ? artists?.find(a => a.id === selectedArtist)?.name || artists?.find(a => a.id === selectedArtist)?.name || 'Geral'
      : 'Geral';
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      
      // Load header image
      const headerImg = new Image();
      headerImg.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        headerImg.onload = () => resolve();
        headerImg.onerror = () => reject(new Error('Failed to load header image'));
        headerImg.src = '/assets/chat-pdf-header.png';
      });

      // Calculate header height maintaining aspect ratio
      const imgAspectRatio = headerImg.width / headerImg.height;
      const headerHeight = pageWidth / imgAspectRatio;
      
      // Add header image at position 0,0 filling full width
      pdf.addImage(headerImg, 'PNG', 0, 0, pageWidth, headerHeight);

      let y = headerHeight + 10;
      
      // Title
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Conversa - Assistente de Marketing', margin, y);
      y += 8;
      
      // Subtitle info
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Artista: ${artistName}  |  Data: ${new Date().toLocaleDateString('pt-BR')}`, margin, y);
      y += 10;
      
      // Separator line
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 8;
      
      // Messages
      pdf.setTextColor(0, 0, 0);
      
      for (const message of messages) {
        const time = message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const role = message.role === 'user' ? 'USUÁRIO' : 'ASSISTENTE';
        
        // Check if we need a new page
        if (y > pageHeight - 30) {
          pdf.addPage();
          pdf.addImage(headerImg, 'PNG', 0, 0, pageWidth, headerHeight);
          y = headerHeight + 10;
        }
        
        // Role and time
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(message.role === 'user' ? 180 : 0, message.role === 'user' ? 0 : 100, message.role === 'user' ? 0 : 0);
        pdf.text(`[${time}] ${role}:`, margin, y);
        y += 5;
        
        // Message content
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(50, 50, 50);
        
        const lines = pdf.splitTextToSize(message.content, contentWidth);
        for (const line of lines) {
          if (y > pageHeight - 15) {
            pdf.addPage();
            pdf.addImage(headerImg, 'PNG', 0, 0, pageWidth, headerHeight);
            y = headerHeight + 10;
          }
          pdf.text(line, margin, y);
          y += 5;
        }
        
        y += 5;
      }
      
      pdf.save(`chat-marketing-${artistName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF exportado');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Erro ao exportar PDF');
    }
  };

  const suggestedPrompts = [
    'Crie uma estratégia de lançamento para o próximo single',
    'Quais são as melhores hashtags para usar no TikTok?',
    'Sugira ideias de conteúdo para stories',
    'Como aumentar o engajamento no Instagram?',
    'Crie um roteiro para vídeo de 30 segundos',
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Contexto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Artista</label>
            <Select
              value={selectedArtist || 'all'}
              onValueChange={(value) => setSelectedArtist(value === 'all' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um artista" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Nenhum (geral)</SelectItem>
                {artists?.filter((artist) => artist.id).map((artist) => (
                  <SelectItem key={artist.id} value={artist.id}>
                    {artist.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-medium mb-3">Sugestões</h4>
            <div className="space-y-2">
              {suggestedPrompts.map((prompt, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left h-auto py-2 text-xs"
                  onClick={() => setInput(prompt)}
                >
                  <Sparkles className="h-3 w-3 mr-2 text-primary shrink-0" />
                  <span className="truncate">{prompt}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="lg:col-span-3 flex flex-col h-[600px]">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Assistente de Marketing
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportChat}
              disabled={messages.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Bot className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="font-medium text-foreground">Como posso ajudar?</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Sou seu assistente de marketing musical. Posso criar estratégias, 
                sugerir conteúdo, analisar dados e muito mais.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <span className="text-xs opacity-60 mt-1 block">
                      {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              placeholder="Digite sua mensagem..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              disabled={isLoading}
            />
            <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
