import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { encode as base64Encode } from 'https://deno.land/std@0.168.0/encoding/base64.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, voiceId = 'JBFqnCBsd6RMkjVDRZzb' } = await req.json();

    if (!text || typeof text !== 'string') {
      return json({ error: 'Text is required' }, 400);
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      return json(
        { error: 'ElevenLabs credentials not configured. Please connect ElevenLabs in project settings.' },
        500,
      );
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        output_format: 'mp3_44100_128',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const errorText = await response.text();

      // Make the most common problem obvious to fix.
      if (status === 401) {
        return json(
          {
            error:
              'ElevenLabs authentication failed (401). Please update your ElevenLabs connector credentials (API key) and try again.',
          },
          401,
        );
      }

      console.error('ElevenLabs API error:', status, errorText);
      return json(
        {
          error: `ElevenLabs API error: ${status}${errorText ? ` - ${errorText}` : ''}`,
        },
        status,
      );
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = base64Encode(audioBuffer);

    return json({ audioContent: base64Audio });
  } catch (error) {
    console.error('tutorial-tts error:', error);
    return json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});
