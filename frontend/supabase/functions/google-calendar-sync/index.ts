import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getSupabaseClient } from '../_shared/supabase.ts';

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');

async function refreshGoogleToken(refreshToken: string): Promise<string> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh Google token');
  }

  const data = await response.json();
  return data.access_token;
}

async function listCalendarEvents(accessToken: string, calendarId = 'primary', maxResults = 10) {
  const now = new Date().toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${now}&maxResults=${maxResults}&singleEvents=true&orderBy=startTime`;

  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch calendar events');
  }

  return response.json();
}

async function createCalendarEvent(accessToken: string, event: any, calendarId = 'primary') {
  const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create event: ${error}`);
  }

  return response.json();
}

async function updateCalendarEvent(accessToken: string, eventId: string, event: any, calendarId = 'primary') {
  const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    throw new Error('Failed to update event');
  }

  return response.json();
}

async function deleteCalendarEvent(accessToken: string, eventId: string, calendarId = 'primary') {
  const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error('Failed to delete event');
  }

  return { success: true };
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return new Response(
        JSON.stringify({ error: 'Google credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, userId, refreshToken, event, eventId, calendarId } = await req.json();

    if (!refreshToken) {
      return new Response(
        JSON.stringify({ error: 'Refresh token required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accessToken = await refreshGoogleToken(refreshToken);
    let result;

    switch (action) {
      case 'list':
        result = await listCalendarEvents(accessToken, calendarId);
        break;

      case 'create':
        if (!event) {
          return new Response(
            JSON.stringify({ error: 'Event data required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        result = await createCalendarEvent(accessToken, event, calendarId);
        
        // Save sync record
        if (userId && event.agendaEventId) {
          const supabase = getSupabaseClient();
          await supabase.from('google_calendar_events_sync').upsert({
            user_id: userId,
            agenda_event_id: event.agendaEventId,
            google_event_id: result.id,
            last_synced_at: new Date().toISOString(),
            sync_status: 'synced',
          });
        }
        break;

      case 'update':
        if (!eventId || !event) {
          return new Response(
            JSON.stringify({ error: 'Event ID and data required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        result = await updateCalendarEvent(accessToken, eventId, event, calendarId);
        break;

      case 'delete':
        if (!eventId) {
          return new Response(
            JSON.stringify({ error: 'Event ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        result = await deleteCalendarEvent(accessToken, eventId, calendarId);
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action. Use: list, create, update, or delete' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
