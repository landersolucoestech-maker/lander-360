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

    console.log('Creating admin user...')

    // Use provided data for Deyvisson as default admin
    const email = 'deyvisson.gestao360@gmail.com';
    const full_name = 'Deyvisson Gestão 360 Andrade';
    const phone = '(33)99917-9552';

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers.users?.find(u => u.email === email);
    
    if (existingUser) {
      console.log('User already exists, updating profile...');
      const userId = existingUser.id;
      
      // Update existing user profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: userId,
          full_name: full_name,
          phone: phone,
          role_display: 'Administrador (Master)',
          is_active: true
        });

      if (profileError) {
        console.error('Profile update error:', profileError);
      }

      // Ensure admin role exists
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: 'admin'
        });

      if (roleError) {
        console.error('Role assignment error:', roleError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Admin user already exists and updated',
          user: {
            id: userId,
            email: email,
            full_name: full_name,
            role: 'Administrador (Master)'
          }
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create user with admin privileges
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: 'Admin@123456',
      email_confirm: true,
      user_metadata: {
        full_name: full_name,
        phone: phone
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Failed to create user', details: authError }),
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

    // Create profile with additional info
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        full_name: full_name,
        phone: phone,
        role_display: 'Administrador (Master)',
        is_active: true
      })

    if (profileError) {
      console.error('Profile error:', profileError)
    }

    // Assign admin role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: 'admin'
      })

    if (roleError) {
      console.error('Role assignment error:', roleError)
    }

    console.log('Admin user setup completed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin user created successfully',
        user: {
          id: userId,
          email: email,
          full_name: full_name,
          role: 'Administrador (Master)'
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