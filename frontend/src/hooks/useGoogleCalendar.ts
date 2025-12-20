import { useState, useEffect, useCallback } from 'react';
import { GoogleCalendarService, CalendarEventData } from '@/services/googleCalendarService';
import { useToast } from '@/hooks/use-toast';

export function useGoogleCalendar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsAuthenticated(GoogleCalendarService.isAuthenticated());
  }, []);

  const connect = useCallback(() => {
    const authUrl = GoogleCalendarService.getAuthUrl();
    window.location.href = authUrl;
  }, []);

  const disconnect = useCallback(() => {
    GoogleCalendarService.disconnect();
    setIsAuthenticated(false);
    toast({
      title: "Desconectado",
      description: "Google Calendar desconectado com sucesso.",
    });
  }, [toast]);

  const handleCallback = useCallback(async (code: string) => {
    setIsLoading(true);
    try {
      const tokens = await GoogleCalendarService.exchangeCode(code);
      if (tokens) {
        setIsAuthenticated(true);
        toast({
          title: "Conectado!",
          description: "Google Calendar conectado com sucesso.",
        });
        return true;
      } else {
        toast({
          title: "Erro",
          description: "Falha ao conectar com Google Calendar.",
          variant: "destructive",
        });
        return false;
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createEvent = useCallback(async (eventData: CalendarEventData) => {
    setIsLoading(true);
    try {
      const result = await GoogleCalendarService.createEvent(eventData);
      if (result.success) {
        toast({
          title: "Evento criado",
          description: "Evento adicionado ao Google Calendar.",
        });
      } else {
        toast({
          title: "Erro",
          description: result.error || "Falha ao criar evento no Google Calendar.",
          variant: "destructive",
        });
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateEvent = useCallback(async (eventId: string, eventData: CalendarEventData) => {
    setIsLoading(true);
    try {
      const result = await GoogleCalendarService.updateEvent(eventId, eventData);
      if (result.success) {
        toast({
          title: "Evento atualizado",
          description: "Evento atualizado no Google Calendar.",
        });
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const deleteEvent = useCallback(async (eventId: string) => {
    setIsLoading(true);
    try {
      const result = await GoogleCalendarService.deleteEvent(eventId);
      if (result.success) {
        toast({
          title: "Evento removido",
          description: "Evento removido do Google Calendar.",
        });
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const listEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await GoogleCalendarService.listEvents();
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isAuthenticated,
    isLoading,
    connect,
    disconnect,
    handleCallback,
    createEvent,
    updateEvent,
    deleteEvent,
    listEvents,
  };
}
