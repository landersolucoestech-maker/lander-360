import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export interface RateLimitConfig {
  maxRequests?: number;
  windowSeconds?: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 100,
  windowSeconds: 3600 // 1 hour
};

/**
 * Check rate limit for a given key (e.g., user ID, IP address)
 * Returns true if request is allowed, false if rate limited
 */
export async function checkRateLimit(
  key: string,
  config: RateLimitConfig = {}
): Promise<boolean> {
  const { maxRequests, windowSeconds } = { ...DEFAULT_CONFIG, ...config };
  
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  try {
    const { data, error } = await supabaseAdmin.rpc('check_rate_limit', {
      p_key: key,
      p_max_requests: maxRequests,
      p_window_seconds: windowSeconds
    });

    if (error) {
      console.error('Rate limit check error:', error);
      // On error, allow the request but log it
      return true;
    }

    return data === true;
  } catch (error) {
    console.error('Rate limit check exception:', error);
    return true; // Allow on error
  }
}

/**
 * Create a rate limit response
 */
export function rateLimitResponse(corsHeaders: Record<string, string>) {
  return new Response(
    JSON.stringify({ 
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.'
    }),
    { 
      status: 429, 
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Retry-After': '3600'
      } 
    }
  );
}
