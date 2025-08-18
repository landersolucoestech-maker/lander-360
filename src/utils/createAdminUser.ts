import { supabase } from "@/integrations/supabase/client";

export async function createAdminUser() {
  try {
    const { data, error } = await supabase.functions.invoke('create-admin-user', {
      method: 'POST'
    });

    if (error) {
      console.error('Error creating admin user:', error);
      return { success: false, error };
    }

    console.log('Admin user created successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to create admin user:', error);
    return { success: false, error };
  }
}