import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ImageRequest {
  prompt: string;
  provider?: 'openai' | 'gemini';
  size?: string;
  quality?: string;
  style?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, provider = 'gemini', size = '1024x1024', quality = 'high', style } = await req.json() as ImageRequest;
    
    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    console.log(`[Image Gen] Provider: ${provider}, Size: ${size}, Prompt: ${prompt.substring(0, 100)}...`);
    
    if (provider === 'openai') {
      const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
      if (!OPENAI_API_KEY) {
        throw new Error("OpenAI API key not configured");
      }
      
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt,
          n: 1,
          size,
          quality,
          ...(style && { style }),
        }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error('[Image Gen] OpenAI error:', error);
        throw new Error(`OpenAI error: ${response.status}`);
      }
      
      const data = await response.json();
      const imageUrl = data.data?.[0]?.url || data.data?.[0]?.b64_json;
      
      return new Response(JSON.stringify({ 
        url: imageUrl,
        provider: 'openai',
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
      
    } else {
      // Use Gemini image generation via Lovable AI
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (!LOVABLE_API_KEY) {
        throw new Error("Lovable API key not configured");
      }
      
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image-preview',
          messages: [
            { role: 'user', content: prompt }
          ],
          modalities: ['image', 'text'],
        }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error('[Image Gen] Gemini error:', error);
        throw new Error(`Gemini error: ${response.status}`);
      }
      
      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      return new Response(JSON.stringify({ 
        url: imageUrl,
        provider: 'gemini',
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
  } catch (error: any) {
    console.error("[Image Gen] Error:", error);
    return new Response(JSON.stringify({ error: error?.message || "Image generation failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
