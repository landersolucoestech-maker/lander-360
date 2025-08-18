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
    const { email, password, full_name, phone, role, permissions } = await req.json();

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
      'https://drftrdectyobzritmugt.supabase.co',
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
        phone: phone || '',
        role: role || 'member',
        permissions: permissions || []
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

    // Convert role to proper role display
    const roleMapping: { [key: string]: string } = {
      'Master': 'Administrador (Master)',
      'Administrador': 'Administrador',
      'Gerente': 'Gerente',
      'Produtor Musical': 'Produtor Musical',
      'Artista': 'Artista',
      'Editor': 'Editor',
      'Analista Financeiro': 'Analista Financeiro',
      'Especialista em Marketing': 'Especialista em Marketing',
    };

    const roleDisplay = roleMapping[role] || role || 'Membro';

    // Update profile with additional info (the trigger should have created the basic profile)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: full_name,
        phone: phone || null,
        role_display: roleDisplay,
        is_active: true,
        permissions: permissions || []
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
      'Produtor Musical': 'producer',
      'Artista': 'artist'
    };

    const systemRole = roleMap[role] || 'member';

    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userId,
        role: systemRole
      })

    if (roleError) {
      console.error('Role assignment error:', roleError)
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
          role: roleDisplay
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})