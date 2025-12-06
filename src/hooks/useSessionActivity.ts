import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Session expires after 30 minutes of inactivity
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
// Update activity every 5 minutes
const ACTIVITY_UPDATE_INTERVAL_MS = 5 * 60 * 1000;
// Check for expired sessions every minute
const EXPIRY_CHECK_INTERVAL_MS = 60 * 1000;

export function useSessionActivity() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const lastActivityRef = useRef<Date>(new Date());
  const sessionTokenRef = useRef<string | null>(null);
  const warningShownRef = useRef(false);

  // Update last activity timestamp
  const updateActivity = useCallback(() => {
    lastActivityRef.current = new Date();
    warningShownRef.current = false;
  }, []);

  // Update session activity in database
  const updateSessionActivity = useCallback(async () => {
    if (!user || !sessionTokenRef.current) return;

    try {
      await supabase
        .from('user_sessions')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('session_token', sessionTokenRef.current)
        .eq('is_active', true);
    } catch (error) {
      console.error('Error updating session activity:', error);
    }
  }, [user]);

  // Check if session should be expired
  const checkSessionExpiry = useCallback(async () => {
    if (!user || !sessionTokenRef.current) return;

    const now = new Date();
    const timeSinceLastActivity = now.getTime() - lastActivityRef.current.getTime();

    // Show warning 5 minutes before expiry
    const WARNING_THRESHOLD_MS = SESSION_TIMEOUT_MS - (5 * 60 * 1000);
    
    if (timeSinceLastActivity >= WARNING_THRESHOLD_MS && !warningShownRef.current) {
      warningShownRef.current = true;
      toast({
        title: "Sessão expirando",
        description: "Sua sessão irá expirar em 5 minutos por inatividade. Mova o mouse ou clique para continuar.",
        variant: "destructive"
      });
    }

    // Expire session if timeout reached
    if (timeSinceLastActivity >= SESSION_TIMEOUT_MS) {
      try {
        // Mark session as expired in database
        await supabase
          .from('user_sessions')
          .update({
            is_active: false,
            terminated_at: new Date().toISOString(),
            terminated_reason: 'session_expired'
          })
          .eq('session_token', sessionTokenRef.current);

        toast({
          title: "Sessão expirada",
          description: "Sua sessão foi encerrada por inatividade",
          variant: "destructive"
        });

        // Sign out user
        await signOut();
      } catch (error) {
        console.error('Error expiring session:', error);
      }
    }
  }, [user, signOut, toast]);

  // Get current session token
  useEffect(() => {
    const getSessionToken = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        sessionTokenRef.current = sessionData.session.access_token.substring(0, 32);
      }
    };

    if (user) {
      getSessionToken();
    }
  }, [user]);

  // Set up activity listeners
  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    
    // Throttle activity updates to avoid too many calls
    let throttleTimeout: NodeJS.Timeout | null = null;
    const throttledUpdateActivity = () => {
      if (throttleTimeout) return;
      
      updateActivity();
      throttleTimeout = setTimeout(() => {
        throttleTimeout = null;
      }, 1000);
    };

    events.forEach(event => {
      window.addEventListener(event, throttledUpdateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, throttledUpdateActivity);
      });
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [user, updateActivity]);

  // Set up interval to update session activity in database
  useEffect(() => {
    if (!user) return;

    const activityInterval = setInterval(updateSessionActivity, ACTIVITY_UPDATE_INTERVAL_MS);
    
    // Initial update
    updateSessionActivity();

    return () => clearInterval(activityInterval);
  }, [user, updateSessionActivity]);

  // Set up interval to check for session expiry
  useEffect(() => {
    if (!user) return;

    const expiryInterval = setInterval(checkSessionExpiry, EXPIRY_CHECK_INTERVAL_MS);

    return () => clearInterval(expiryInterval);
  }, [user, checkSessionExpiry]);

  return {
    updateActivity,
    lastActivity: lastActivityRef.current
  };
}
