import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type AIProvider = 'openai' | 'anthropic' | 'gemini' | 'auto';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface UseAIOptions {
  provider?: AIProvider;
  model?: string;
  systemPrompt?: string;
  task?: string;
  maxTokens?: number;
  onError?: (error: Error) => void;
}

export interface AIResponse {
  content: string;
  provider: AIProvider;
  model: string;
}

export function useAI(options: UseAIOptions = {}) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(async (
    messages: AIMessage[],
    overrideOptions?: Partial<UseAIOptions>
  ): Promise<AIResponse | null> => {
    setIsLoading(true);
    setError(null);

    const finalOptions = { ...options, ...overrideOptions };

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-gateway', {
        body: {
          messages,
          provider: finalOptions.provider || 'auto',
          model: finalOptions.model,
          systemPrompt: finalOptions.systemPrompt,
          task: finalOptions.task,
          maxTokens: finalOptions.maxTokens,
          stream: false,
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      return {
        content: data.content,
        provider: data.provider,
        model: data.model,
      };
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error(err?.message || 'AI request failed');
      setError(error);
      
      if (err?.message?.includes('429')) {
        toast({
          title: 'Limite de requisições',
          description: 'Aguarde um momento e tente novamente.',
          variant: 'destructive',
        });
      } else if (err?.message?.includes('402')) {
        toast({
          title: 'Créditos insuficientes',
          description: 'Adicione créditos para continuar usando a IA.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erro na IA',
          description: error.message,
          variant: 'destructive',
        });
      }
      
      options.onError?.(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [options, toast]);

  const streamMessage = useCallback(async (
    messages: AIMessage[],
    onChunk: (chunk: string) => void,
    overrideOptions?: Partial<UseAIOptions>
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    const finalOptions = { ...options, ...overrideOptions };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-gateway`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages,
            provider: finalOptions.provider || 'auto',
            model: finalOptions.model,
            systemPrompt: finalOptions.systemPrompt,
            task: finalOptions.task,
            maxTokens: finalOptions.maxTokens,
            stream: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Process SSE data
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) onChunk(content);
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error(err?.message || 'Stream failed');
      setError(error);
      toast({
        title: 'Erro no streaming',
        description: error.message,
        variant: 'destructive',
      });
      options.onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [options, toast]);

  return {
    sendMessage,
    streamMessage,
    isLoading,
    error,
  };
}

// Utility hook for image generation
export function useImageGeneration() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const generateImage = useCallback(async (
    prompt: string,
    options: { provider?: 'openai' | 'gemini'; size?: string; quality?: string } = {}
  ): Promise<string | null> => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          prompt,
          provider: options.provider || 'gemini',
          size: options.size || '1024x1024',
          quality: options.quality || 'high',
        },
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      return data.url;
    } catch (err: any) {
      toast({
        title: 'Erro ao gerar imagem',
        description: err?.message || 'Falha na geração de imagem',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    generateImage,
    isLoading,
  };
}
