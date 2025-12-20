import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function callOpenAI(messages: Message[], model = 'gpt-4o-mini') {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 4096,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callClaude(messages: Message[], model = 'claude-3-5-sonnet-20241022') {
  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  const userMessages = messages.filter(m => m.role !== 'system');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': CLAUDE_API_KEY!,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: systemMessage,
      messages: userMessages.map(m => ({ role: m.role, content: m.content })),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude error: ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

async function callGemini(messages: Message[], model = 'gemini-1.5-flash') {
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini error: ${error}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { provider, model, messages, prompt } = await req.json();

    // Convert simple prompt to messages format
    const messagesList: Message[] = messages || [
      { role: 'user', content: prompt },
    ];

    let result: string;

    switch (provider?.toLowerCase()) {
      case 'claude':
      case 'anthropic':
        if (!CLAUDE_API_KEY) throw new Error('Claude API key not configured');
        result = await callClaude(messagesList, model);
        break;

      case 'gemini':
      case 'google':
        if (!GEMINI_API_KEY) throw new Error('Gemini API key not configured');
        result = await callGemini(messagesList, model);
        break;

      case 'openai':
      default:
        if (!OPENAI_API_KEY) throw new Error('OpenAI API key not configured');
        result = await callOpenAI(messagesList, model);
        break;
    }

    return new Response(
      JSON.stringify({ success: true, content: result, provider: provider || 'openai' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
