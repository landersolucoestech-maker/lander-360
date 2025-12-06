import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });
    
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    // Record login history if successful
    if (!error && data.user) {
      recordLoginHistory(data.user.id, data.user.email || email);
    }
    
    return { error: error as Error | null };
  };

  const recordLoginHistory = async (userId: string, userEmail: string) => {
    try {
      const userAgent = navigator.userAgent;
      const browser = getBrowserName(userAgent);
      const deviceType = getDeviceType(userAgent);
      
      // Check if this is a new device
      const isNewDevice = await checkIfNewDevice(userId, browser, deviceType);
      
      await supabase.from('login_history').insert({
        user_id: userId,
        user_agent: userAgent,
        browser: browser,
        device_type: deviceType,
      });

      // Send notification if new device detected
      if (isNewDevice && userEmail) {
        sendNewDeviceNotification(userEmail, deviceType, browser);
      }
    } catch (error) {
      console.error('Error recording login history:', error);
    }
  };

  const checkIfNewDevice = async (userId: string, browser: string, deviceType: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('login_history')
        .select('id')
        .eq('user_id', userId)
        .eq('browser', browser)
        .eq('device_type', deviceType)
        .limit(1);

      if (error) {
        console.error('Error checking device history:', error);
        return false;
      }

      // If no records found, it's a new device
      return !data || data.length === 0;
    } catch (error) {
      console.error('Error checking if new device:', error);
      return false;
    }
  };

  const sendNewDeviceNotification = async (email: string, deviceType: string, browser: string) => {
    try {
      const response = await supabase.functions.invoke('send-new-device-notification', {
        body: {
          email: email,
          deviceType: deviceType,
          browser: browser,
          loginTime: new Date().toISOString()
        }
      });

      if (response.error) {
        console.error('Error sending new device notification:', response.error);
      } else {
        console.log('New device notification sent to:', email);
      }
    } catch (error) {
      console.error('Error calling new device notification function:', error);
    }
  };

  const getBrowserName = (userAgent: string): string => {
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Edg')) return 'Microsoft Edge';
    if (userAgent.includes('Chrome')) return 'Google Chrome';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
    return 'Navegador desconhecido';
  };

  const getDeviceType = (userAgent: string): string => {
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'Tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(userAgent)) return 'Mobile';
    return 'Desktop';
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
