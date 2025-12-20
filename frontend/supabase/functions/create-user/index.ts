import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { checkRateLimit, rateLimitResponse } from '../_shared/rate-limit.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting - 10 user creations per hour per caller
    const token = authHeader.replace('Bearer ', '');
    const isAllowed = await checkRateLimit(`create-user:${token.slice(-10)}`, { 
      maxRequests: 10, 
      windowSeconds: 3600 
    });
    if (!isAllowed) {
      return rateLimitResponse(corsHeaders);
    }
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { data: { user: callerUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !callerUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', callerUser.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin privileges required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { email, password, full_name, phone, role } = await req.json();

    if (!email || !password || !full_name) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'VALIDATION_ERROR',
          details: 'Email, password and full_name are required'
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { data: authData, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name,
        phone: phone || ''
      }
    })

    if (createAuthError) {
      const details = createAuthError.message || 'Unknown error';
      const isEmailExists = details.includes('email address has already been registered');

      return new Response(
        JSON.stringify({
          success: false,
          error: 'FAILED_TO_CREATE_USER',
          error_code: isEmailExists ? 'email_exists' : undefined,
          details,
        }),
        {
          // IMPORTANT: return 200 so the frontend does not crash on non-2xx
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const userId = authData.user?.id
    if (!userId) {
      throw new Error('No user ID returned from auth creation')
    }

    await supabaseAdmin
      .from('profiles')
      .update({
        full_name: full_name,
        phone: phone || null,
        email: email,
        role_display: role || 'Usuário',
        roles: [role || 'Usuário']
      })
      .eq('id', userId)

    const roleMap: { [key: string]: string } = {
      'Master': 'admin',
      'Administrador': 'admin', 
      'Gerente': 'manager',
      'Produtor Musical': 'user',
      'Artista': 'artista',
      'Analista Financeiro': 'financeiro'
    };

    const systemRole = roleMap[role] || 'user';

    // Update user_roles table with the correct system role
    await supabaseAdmin
      .from('user_roles')
      .update({ role: systemRole })
      .eq('user_id', userId)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'User created successfully',
        user: {
          id: userId,
          email: email,
          full_name: full_name,
          role: role || 'user'
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: errorMessage 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
