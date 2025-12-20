import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GoogleCalendarEvent {
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
    const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      throw new Error('Google credentials not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    const { action, eventId, eventData, accessToken, refreshToken, code, redirectUri } = await req.json();
    console.log('Google Calendar request:', { action, eventId });

    // Handle OAuth token exchange
    if (action === 'exchange_code') {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      });

      const tokens = await tokenResponse.json();
      console.log('Token exchange response:', tokens.error || 'success');

      if (tokens.error) {
        throw new Error(tokens.error_description || tokens.error);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresIn: tokens.expires_in
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Refresh access token if needed
    if (action === 'refresh_token') {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      const tokens = await tokenResponse.json();

      if (tokens.error) {
        throw new Error(tokens.error_description || tokens.error);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          accessToken: tokens.access_token,
          expiresIn: tokens.expires_in
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create calendar event
    if (action === 'create_event') {
      if (!accessToken) {
        throw new Error('Access token required');
      }

      const calendarEvent: GoogleCalendarEvent = {
        summary: eventData.title,
        description: eventData.description || '',
        location: eventData.location || '',
        start: {
          dateTime: `${eventData.start_date}T${eventData.start_time || '09:00'}:00`,
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: `${eventData.end_date || eventData.start_date}T${eventData.end_time || '10:00'}:00`,
          timeZone: 'America/Sao_Paulo',
        },
      };

      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(calendarEvent),
        }
      );

      const result = await response.json();
      console.log('Calendar event created:', result.id || result.error);

      if (result.error) {
        throw new Error(result.error.message || 'Failed to create calendar event');
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          eventId: result.id,
          htmlLink: result.htmlLink
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update calendar event
    if (action === 'update_event') {
      if (!accessToken || !eventId) {
        throw new Error('Access token and event ID required');
      }

      const calendarEvent: GoogleCalendarEvent = {
        summary: eventData.title,
        description: eventData.description || '',
        location: eventData.location || '',
        start: {
          dateTime: `${eventData.start_date}T${eventData.start_time || '09:00'}:00`,
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: `${eventData.end_date || eventData.start_date}T${eventData.end_time || '10:00'}:00`,
          timeZone: 'America/Sao_Paulo',
        },
      };

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(calendarEvent),
        }
      );

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error.message || 'Failed to update calendar event');
      }

      return new Response(
        JSON.stringify({ success: true, eventId: result.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Delete calendar event
    if (action === 'delete_event') {
      if (!accessToken || !eventId) {
        throw new Error('Access token and event ID required');
      }

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok && response.status !== 204) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to delete calendar event');
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // List calendar events
    if (action === 'list_events') {
      if (!accessToken) {
        throw new Error('Access token required');
      }

      const now = new Date().toISOString();
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&maxResults=50&singleEvents=true&orderBy=startTime`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error.message || 'Failed to list calendar events');
      }

      return new Response(
        JSON.stringify({ success: true, events: result.items }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error: any) {
    console.error('Google Calendar error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
