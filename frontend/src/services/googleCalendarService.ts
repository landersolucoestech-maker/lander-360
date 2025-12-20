import { supabase } from '@/integrations/supabase/client';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const REDIRECT_URI = `${window.location.origin}/callback/google`;

export interface GoogleCalendarTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface CalendarEventData {
  title: string;
  description?: string;
  location?: string;
  start_date: string;
  start_time?: string;
  end_date?: string;
  end_time?: string;
}

export class GoogleCalendarService {
  private static STORAGE_KEY = 'google_calendar_tokens';

  // Get OAuth URL for authorization
  static getAuthUrl(): string {
    const scope = 'https://www.googleapis.com/auth/calendar.events';
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: scope,
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  // Exchange authorization code for tokens
  static async exchangeCode(code: string): Promise<GoogleCalendarTokens | null> {
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: { 
          action: 'exchange_code', 
          code,
          redirectUri: REDIRECT_URI
        }
      });

      if (error) throw error;

      const tokens: GoogleCalendarTokens = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: Date.now() + (data.expiresIn * 1000)
      };

      this.saveTokens(tokens);
      return tokens;
    } catch (error) {
      console.error('Error exchanging code:', error);
      return null;
    }
  }

  // Refresh access token
  static async refreshAccessToken(): Promise<string | null> {
    const tokens = this.getTokens();
    if (!tokens?.refreshToken) return null;

    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: { 
          action: 'refresh_token', 
          refreshToken: tokens.refreshToken 
        }
      });

      if (error) throw error;

      const updatedTokens: GoogleCalendarTokens = {
        ...tokens,
        accessToken: data.accessToken,
        expiresAt: Date.now() + (data.expiresIn * 1000)
      };

      this.saveTokens(updatedTokens);
      return data.accessToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.clearTokens();
      return null;
    }
  }

  // Get valid access token (refresh if needed)
  static async getValidAccessToken(): Promise<string | null> {
    const tokens = this.getTokens();
    if (!tokens) return null;

    // Check if token is expired or about to expire (5 min buffer)
    if (Date.now() >= tokens.expiresAt - 300000) {
      return this.refreshAccessToken();
    }

    return tokens.accessToken;
  }

  // Create calendar event
  static async createEvent(eventData: CalendarEventData): Promise<{ success: boolean; eventId?: string; error?: string }> {
    const accessToken = await this.getValidAccessToken();
    if (!accessToken) {
      return { success: false, error: 'Not authenticated with Google Calendar' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: { 
          action: 'create_event', 
          eventData,
          accessToken 
        }
      });

      if (error) throw error;
      return { success: true, eventId: data.eventId };
    } catch (error: any) {
      console.error('Error creating event:', error);
      return { success: false, error: error.message };
    }
  }

  // Update calendar event
  static async updateEvent(eventId: string, eventData: CalendarEventData): Promise<{ success: boolean; error?: string }> {
    const accessToken = await this.getValidAccessToken();
    if (!accessToken) {
      return { success: false, error: 'Not authenticated with Google Calendar' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: { 
          action: 'update_event', 
          eventId,
          eventData,
          accessToken 
        }
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error updating event:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete calendar event
  static async deleteEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
    const accessToken = await this.getValidAccessToken();
    if (!accessToken) {
      return { success: false, error: 'Not authenticated with Google Calendar' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: { 
          action: 'delete_event', 
          eventId,
          accessToken 
        }
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting event:', error);
      return { success: false, error: error.message };
    }
  }

  // List upcoming events
  static async listEvents(): Promise<{ success: boolean; events?: any[]; error?: string }> {
    const accessToken = await this.getValidAccessToken();
    if (!accessToken) {
      return { success: false, error: 'Not authenticated with Google Calendar' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: { 
          action: 'list_events', 
          accessToken 
        }
      });

      if (error) throw error;
      return { success: true, events: data.events };
    } catch (error: any) {
      console.error('Error listing events:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if authenticated
  static isAuthenticated(): boolean {
    const tokens = this.getTokens();
    return !!tokens?.accessToken;
  }

  // Save tokens to localStorage
  private static saveTokens(tokens: GoogleCalendarTokens): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tokens));
  }

  // Get tokens from localStorage
  static getTokens(): GoogleCalendarTokens | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  // Clear tokens
  static clearTokens(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Disconnect from Google Calendar
  static disconnect(): void {
    this.clearTokens();
  }
}
