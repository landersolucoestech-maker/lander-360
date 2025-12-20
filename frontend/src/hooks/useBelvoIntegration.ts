import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BelvoLink {
  id: string;
  institution: string;
  access_mode: string;
  status: string;
  created_at: string;
  last_accessed_at: string;
}

interface BelvoAccount {
  id: string;
  link: string;
  institution: {
    name: string;
    type: string;
  };
  name: string;
  type: string;
  number: string;
  balance: {
    current: number;
    available: number;
  };
  currency: string;
}

interface BelvoTransaction {
  id: string;
  account: { id: string };
  collected_at: string;
  value_date: string;
  accounting_date: string;
  amount: number;
  balance: number;
  currency: string;
  description: string;
  type: string;
  status: string;
  category: string;
  subcategory: string;
}

export function useBelvoIntegration() {
  const [isLoading, setIsLoading] = useState(false);
  const [links, setLinks] = useState<BelvoLink[]>([]);
  const [accounts, setAccounts] = useState<BelvoAccount[]>([]);
  const [transactions, setTransactions] = useState<BelvoTransaction[]>([]);
  const { toast } = useToast();

  const callBelvoApi = useCallback(async (action: string, payload?: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('belvo-integration', {
        body: { action, payload }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Belvo API error:', error);
      throw error;
    }
  }, []);

  const listLinks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await callBelvoApi('list_links');
      setLinks(data.results || []);
      return data.results || [];
    } catch (error) {
      toast({
        title: 'Erro ao carregar contas',
        description: 'Não foi possível carregar as contas conectadas.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [callBelvoApi, toast]);

  const createWidgetToken = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await callBelvoApi('create_widget_token');
      return data.access;
    } catch (error) {
      toast({
        title: 'Erro na autenticação',
        description: 'Não foi possível criar token de acesso.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [callBelvoApi, toast]);

  const getAccounts = useCallback(async (linkId: string) => {
    setIsLoading(true);
    try {
      const data = await callBelvoApi('get_accounts', { link_id: linkId });
      setAccounts(prev => [...prev, ...(data || [])]);
      return data || [];
    } catch (error) {
      toast({
        title: 'Erro ao carregar contas',
        description: 'Não foi possível carregar os detalhes das contas.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [callBelvoApi, toast]);

  const getTransactions = useCallback(async (linkId: string, dateFrom: string, dateTo: string) => {
    setIsLoading(true);
    try {
      const data = await callBelvoApi('get_transactions', {
        link_id: linkId,
        date_from: dateFrom,
        date_to: dateTo,
      });
      setTransactions(data || []);
      return data || [];
    } catch (error) {
      toast({
        title: 'Erro ao carregar transações',
        description: 'Não foi possível carregar as transações.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [callBelvoApi, toast]);

  const deleteLink = useCallback(async (linkId: string) => {
    setIsLoading(true);
    try {
      await callBelvoApi('delete_link', { link_id: linkId });
      setLinks(prev => prev.filter(l => l.id !== linkId));
      toast({
        title: 'Conta desconectada',
        description: 'A conta bancária foi desconectada com sucesso.',
      });
      return true;
    } catch (error) {
      toast({
        title: 'Erro ao desconectar',
        description: 'Não foi possível desconectar a conta.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [callBelvoApi, toast]);

  const syncAccount = useCallback(async (linkId: string) => {
    setIsLoading(true);
    try {
      // Get last 30 days of transactions
      const dateTo = new Date().toISOString().split('T')[0];
      const dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const txns = await getTransactions(linkId, dateFrom, dateTo);
      
      toast({
        title: 'Sincronização concluída',
        description: `${txns.length} transações sincronizadas.`,
      });
      
      return txns;
    } catch (error) {
      toast({
        title: 'Erro na sincronização',
        description: 'Não foi possível sincronizar as transações.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [getTransactions, toast]);

  return {
    isLoading,
    links,
    accounts,
    transactions,
    listLinks,
    createWidgetToken,
    getAccounts,
    getTransactions,
    deleteLink,
    syncAccount,
  };
}
