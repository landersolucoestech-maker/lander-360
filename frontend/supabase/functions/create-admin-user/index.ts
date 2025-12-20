import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Generate a cryptographically secure random password
function generateSecurePassword(length: number = 20): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const allChars = uppercase + lowercase + numbers + symbols;
  
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  // Ensure at least one character from each category
  let password = '';
  password += uppercase[array[0] % uppercase.length];
  password += lowercase[array[1] % lowercase.length];
  password += numbers[array[2] % numbers.length];
  password += symbols[array[3] % symbols.length];
  
  // Fill the rest with random characters
  for (let i = 4; i < length; i++) {
    password += allChars[array[i] % allChars.length];
  }
  
  // Shuffle the password
  const passwordArray = password.split('');
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = array[i] % (i + 1);
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }
  
  return passwordArray.join('');
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

    // Parse request body - email is now required as a parameter
    const { email, full_name, phone } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const adminFullName = full_name || 'Administrador';
    const adminPhone = phone || '';

    console.log('Admin user', callerUser.id, 'creating new admin account for:', email);

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    if (existingUser) {
      console.log('User already exists, updating to admin role:', existingUser.id);
      
      // Update profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({
          full_name: adminFullName,
          phone: adminPhone,
          role_display: 'Administrador',
          roles: ['Administrador']
        })
        .eq('id', existingUser.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
      }

      // Upsert admin role
      const { error: upsertRoleError } = await supabaseAdmin
        .from('user_roles')
        .upsert({
          user_id: existingUser.id,
          role: 'admin'
        }, {
          onConflict: 'user_id'
        });

      if (upsertRoleError) {
        console.error('Role upsert error:', upsertRoleError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Existing user updated to admin role',
          user: {
            id: existingUser.id,
            email: email,
            full_name: adminFullName,
            note: 'User already existed, role updated to admin. Password unchanged.'
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate secure random password
    const generatedPassword = generateSecurePassword(20);

    // Create new admin user
    const { data: authData, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: generatedPassword,
      email_confirm: true,
      user_metadata: {
        full_name: adminFullName,
        phone: adminPhone
      }
    });

    if (createAuthError) {
      console.error('Auth creation error:', createAuthError);
      return new Response(
        JSON.stringify({ error: 'Failed to create admin user', details: createAuthError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = authData.user?.id;
    if (!userId) {
      throw new Error('No user ID returned from auth creation');
    }

    console.log('Admin user created with ID:', userId);

    // Update profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: adminFullName,
        phone: adminPhone,
        email: email,
        role_display: 'Administrador',
        roles: ['Administrador']
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Profile update error:', profileError);
    }

    // Assign admin role
    const { error: roleAssignError } = await supabaseAdmin
      .from('user_roles')
      .update({ role: 'admin' })
      .eq('user_id', userId);

    if (roleAssignError) {
      console.error('Role assignment error:', roleAssignError);
    }

    console.log('Admin user setup completed by:', callerUser.id);

    // Note: In production, send the password via secure email using Resend
    // The password is returned here for immediate use but should be changed immediately
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin user created successfully',
        user: {
          id: userId,
          email: email,
          full_name: adminFullName,
          temporaryPassword: generatedPassword,
          note: 'IMPORTANT: Change this password immediately after first login. Consider sending via secure email.'
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})
