import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Create Supabase admin client
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

    // Verify the token and get the user
    const { data: { user: callerUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !callerUser) {
      console.error('Invalid token:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the caller has admin role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', callerUser.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      console.error('User is not an admin:', callerUser.id);
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin privileges required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { email, password, full_name, phone, role } = await req.json();

    if (!email || !password || !full_name) {
      return new Response(
        JSON.stringify({ error: 'Email, password and full_name are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Admin user', callerUser.id, 'creating user:', { email, full_name, role })

    // Create user through Supabase Auth
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
      console.error('Auth error:', createAuthError)
      return new Response(
        JSON.stringify({ error: 'Failed to create user', details: createAuthError.message }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const userId = authData.user?.id
    if (!userId) {
      throw new Error('No user ID returned from auth creation')
    }

    console.log('User created with ID:', userId)

    // Update profile with additional info (the trigger should have created the basic profile)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: full_name,
        phone: phone || null,
        email: email,
        role_display: role || 'Usuário',
        roles: [role || 'Usuário']
      })
      .eq('id', userId)

    if (profileError) {
      console.error('Profile update error:', profileError)
    }

    // Assign appropriate role in user_roles table
    const roleMap: { [key: string]: string } = {
      'Master': 'admin',
      'Administrador': 'admin', 
      'Gerente': 'manager',
      'Produtor Musical': 'user',
      'Artista': 'user'
    };

    const systemRole = roleMap[role] || 'user';

    // The trigger already creates a default 'user' role, so update if different
    if (systemRole !== 'user') {
      const { error: userRoleError } = await supabaseAdmin
        .from('user_roles')
        .update({ role: systemRole })
        .eq('user_id', userId)

      if (userRoleError) {
        console.error('Role assignment error:', userRoleError)
      }
    }

    console.log('User setup completed successfully by admin:', callerUser.id)

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
    console.error('Unexpected error:', error)
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
