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

    console.log('Creating user:', { email, full_name, role })

    // Create user through Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name,
        phone: phone || ''
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Failed to create user', details: authError.message }),
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
        phone: phone || null
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
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .update({ role: systemRole })
        .eq('user_id', userId)

      if (roleError) {
        console.error('Role assignment error:', roleError)
      }
    }

    console.log('User setup completed successfully')

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