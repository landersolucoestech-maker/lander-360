import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit, rateLimitResponse } from '../_shared/rate-limit.ts'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type AIProvider = 'openai' | 'anthropic' | 'gemini';

interface AIRequest {
  provider?: AIProvider | 'auto';
  model?: string;
  messages: { role: string; content: string }[];
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  task?: string;
}

// Provider configurations
const PROVIDERS: Record<AIProvider, {
  url: string;
  models: Record<string, string>;
  getHeaders: (key: string) => Record<string, string>;
  formatRequest: (messages: any[], model: string, stream: boolean, maxTokens?: number) => any;
}> = {
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    models: {
      default: 'gpt-4o',
      fast: 'gpt-4o-mini',
      reasoning: 'o3-mini-2025-01-31',
      legacy: 'gpt-4-turbo',
    },
    getHeaders: (key: string) => ({
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    }),
    formatRequest: (messages: any[], model: string, stream: boolean, maxTokens?: number) => ({
      model,
      messages,
      stream,
      ...(maxTokens && { max_tokens: maxTokens }),
    }),
  },
  anthropic: {
    url: 'https://api.anthropic.com/v1/messages',
    models: {
      default: 'claude-sonnet-4-20250514',
      fast: 'claude-3-5-haiku-20241022',
      reasoning: 'claude-sonnet-4-20250514',
    },
    getHeaders: (key: string) => ({
      'x-api-key': key,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    }),
    formatRequest: (messages: any[], model: string, stream: boolean, maxTokens?: number) => {
      const systemMsg = messages.find((m: any) => m.role === 'system');
      const otherMsgs = messages.filter((m: any) => m.role !== 'system');
      return {
        model,
        max_tokens: maxTokens || 4096,
        stream,
        ...(systemMsg && { system: systemMsg.content }),
        messages: otherMsgs,
      };
    },
  },
  gemini: {
    url: 'https://ai.gateway.lovable.dev/v1/chat/completions',
    models: {
      default: 'google/gemini-2.5-flash',
      fast: 'google/gemini-2.5-flash-lite',
      pro: 'google/gemini-2.5-pro',
      image: 'google/gemini-2.5-flash-image',
    },
    getHeaders: (key: string) => ({
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    }),
    formatRequest: (messages: any[], model: string, stream: boolean, maxTokens?: number) => ({
      model,
      messages,
      stream,
      ...(maxTokens && { max_tokens: maxTokens }),
    }),
  },
};

// Auto-select best provider for task
function selectProvider(task?: string): AIProvider {
  if (!task) return 'gemini';
  
  const taskLower = task.toLowerCase();
  
  // Use Claude for analysis and complex reasoning
  if (taskLower.includes('analis') || taskLower.includes('document') || taskLower.includes('código')) {
    return 'anthropic';
  }
  
  // Use OpenAI for creative content and conversations
  if (taskLower.includes('criat') || taskLower.includes('marketing') || taskLower.includes('conteúdo')) {
    return 'openai';
  }
  
  // Default to Gemini (fast and cost-effective)
  return 'gemini';
}

async function callAI(
  provider: AIProvider,
  messages: any[],
  model?: string,
  stream = false,
  maxTokens?: number
): Promise<Response> {
  const config = PROVIDERS[provider];
  
  if (!config) {
    throw new Error(`Unknown provider: ${provider}. Valid providers: openai, anthropic, gemini`);
  }
  
  let apiKey: string | undefined;
  if (provider === 'openai') {
    apiKey = Deno.env.get('OPENAI_API_KEY');
  } else if (provider === 'anthropic') {
    apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  } else {
    apiKey = Deno.env.get('LOVABLE_API_KEY');
  }
  
  if (!apiKey) {
    throw new Error(`API key not configured for ${provider}`);
  }
  
  const selectedModel = model || config.models.default;
  
  const response = await fetch(config.url, {
    method: 'POST',
    headers: config.getHeaders(apiKey),
    body: JSON.stringify(config.formatRequest(messages, selectedModel, stream, maxTokens)),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${provider} API error: ${response.status} - ${errorText}`);
  }
  
  return response;
}

// Parse response based on provider
async function parseResponse(provider: AIProvider, response: Response): Promise<string> {
  const data = await response.json();
  
  if (provider === 'anthropic') {
    return data.content?.[0]?.text || '';
  }
  
  return data.choices?.[0]?.message?.content || '';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting - 200 AI requests per hour per user (based on auth header)
    const authHeader = req.headers.get('Authorization') || 'anonymous';
    const rateLimitKey = `ai-gateway:${authHeader.slice(-20)}`;
    const isAllowed = await checkRateLimit(rateLimitKey, { 
      maxRequests: 200, 
      windowSeconds: 3600 
    });
    if (!isAllowed) {
      return rateLimitResponse(corsHeaders);
    }

    const body: AIRequest = await req.json();
    
    const {
      provider = 'auto',
      model,
      messages,
      stream = false,
      maxTokens,
      systemPrompt,
      task,
    } = body;
    
    // Build messages array with system prompt
    const allMessages = systemPrompt 
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;
    
    // Select provider
    const selectedProvider: AIProvider = provider === 'auto' ? selectProvider(task) : provider;
    
    // Check if we have the required API key
    const hasOpenAI = !!Deno.env.get('OPENAI_API_KEY');
    const hasAnthropic = !!Deno.env.get('ANTHROPIC_API_KEY');
    const hasLovable = !!Deno.env.get('LOVABLE_API_KEY');
    
    let finalProvider: AIProvider = selectedProvider;
    
    // Fallback logic if preferred provider is unavailable
    if (selectedProvider === 'openai' && !hasOpenAI) {
      finalProvider = hasAnthropic ? 'anthropic' : 'gemini';
    } else if (selectedProvider === 'anthropic' && !hasAnthropic) {
      finalProvider = hasOpenAI ? 'openai' : 'gemini';
    } else if (selectedProvider === 'gemini' && !hasLovable) {
      finalProvider = hasOpenAI ? 'openai' : (hasAnthropic ? 'anthropic' : 'gemini');
    }
    
    // Call the AI
    const response = await callAI(finalProvider, allMessages, model, stream, maxTokens);
    
    if (stream) {
      // Return streaming response
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }
    
    // Parse and return non-streaming response
    const content = await parseResponse(finalProvider, response);
    
    return new Response(JSON.stringify({ 
      content,
      provider: finalProvider,
      model: model || PROVIDERS[finalProvider].models.default,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error: any) {
    // Handle rate limits and payment issues
    if (error.message?.includes('429')) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    if (error.message?.includes('402')) {
      return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    return new Response(JSON.stringify({ error: error?.message || "AI Gateway error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
