import { supabase } from '@/integrations/supabase/client';
import { DashboardStats, RecentActivity } from '@/types/database';
import { ArtistsService } from './artists';
import { ContractsService } from './contracts';
import { formatDateForDB } from '@/lib/utils';

// Tradução de tipos de contrato
const translateContractType = (type: string | null): string => {
  const translations: Record<string, string> = {
    'recording': 'Gravação',
    'publishing': 'Edição',
    'distribution': 'Distribuição',
    'management': 'Gestão',
    'agency': 'Agenciamento',
    'license': 'Licenciamento',
    'sync': 'Sincronização',
    'production': 'Produção',
    'audiovisual': 'Audiovisual',
    'marketing': 'Marketing',
    'partnership': 'Parceria',
    'shows': 'Shows',
    'other': 'Outro'
  };
  return translations[type?.toLowerCase() || ''] || type || 'Contrato';
};

export interface DashboardStatsWithTrends extends DashboardStats {
  totalObras: number;
  totalFonogramas: number;
  monthlyStreams: number;
  trends: {
    obras: { value: number; isPositive: boolean };
    fonogramas: { value: number; isPositive: boolean };
    artists: { value: number; isPositive: boolean };
    contracts: { value: number; isPositive: boolean };
    revenue: { value: number; isPositive: boolean };
    streams: { value: number; isPositive: boolean };
  };
}

export interface FinancialSummary {
  revenue: number;
  expenses: number;
  profit: number;
  contractsValue: number;
  pendingPayments: number;
  revenueByCategory: { category: string; value: number }[];
  expensesByCategory: { category: string; value: number }[];
  monthlyTrend: { month: string; revenue: number; expenses: number }[];
}

export interface DashboardAlerts {
  contractsExpiring30Days: number;
  contractsExpiring60Days: number;
  contractsExpiring90Days: number;
  releasesInAnalysis: number;
  releasesWithoutDate: number;
  pendingApprovals: number;
  overduePayments: number;
}

export class DashboardService {
  // Get dashboard statistics with trends
  static async getStats(): Promise<DashboardStatsWithTrends> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      const [
        totalArtists,
        artistsLastMonth,
        totalObras,
        totalFonogramas,
        obrasLastMonth,
        fonogramasLastMonth,
        activeContracts,
        contractsLastMonth,
        monthlyRevenue,
        lastMonthRevenue,
        recentActivities,
        monthlyStreamsData,
        lastMonthStreamsData
      ] = await Promise.all([
        ArtistsService.getCount(),
        supabase
          .from('artists')
          .select('id', { count: 'exact', head: true })
          .lt('created_at', startOfMonth.toISOString())
          .then(res => res.count || 0),
        supabase.from('music_registry').select('id', { count: 'exact', head: true }).then(res => res.count || 0),
        supabase.from('phonograms').select('id', { count: 'exact', head: true }).then(res => res.count || 0),
        supabase.from('music_registry').select('id', { count: 'exact', head: true }).lt('created_at', startOfMonth.toISOString()).then(res => res.count || 0),
        supabase.from('phonograms').select('id', { count: 'exact', head: true }).lt('created_at', startOfMonth.toISOString()).then(res => res.count || 0),
        ContractsService.getActive().then(contracts => contracts.length),
        supabase
          .from('contracts')
          .select('id', { count: 'exact', head: true })
          .lt('created_at', startOfMonth.toISOString())
          .or(`status.eq.active,status.eq.ativo,status.eq.assinado`)
          .then(res => res.count || 0),
        DashboardService.calculateMonthlyRevenue(startOfMonth),
        DashboardService.calculateMonthlyRevenue(startOfLastMonth, startOfMonth),
        DashboardService.getRecentActivities(),
        // Get current month streams from releases metrics
        supabase
          .from('releases')
          .select('spotify_streams, apple_music_streams, deezer_streams, youtube_views')
          .gte('updated_at', startOfMonth.toISOString())
          .then(res => res.data || []),
        // Get last month streams for trend calculation
        supabase
          .from('releases')
          .select('spotify_streams, apple_music_streams, deezer_streams, youtube_views')
          .gte('updated_at', startOfLastMonth.toISOString())
          .lt('updated_at', startOfMonth.toISOString())
          .then(res => res.data || [])
      ]);

      // Calculate total streams
      const calculateTotalStreams = (data: any[]) => {
        return data.reduce((sum, r) => {
          return sum + 
            (Number(r.spotify_streams) || 0) + 
            (Number(r.apple_music_streams) || 0) + 
            (Number(r.deezer_streams) || 0) + 
            (Number(r.youtube_views) || 0);
        }, 0);
      };

      const monthlyStreams = calculateTotalStreams(monthlyStreamsData);
      const lastMonthStreams = calculateTotalStreams(lastMonthStreamsData);

      const calculateTrend = (current: number, previous: number) => {
        if (previous === 0) {
          return { value: current > 0 ? 100 : 0, isPositive: current >= 0 };
        }
        const change = ((current - previous) / previous) * 100;
        const cappedValue = Math.min(Math.abs(Math.round(change * 10) / 10), 100);
        return { value: cappedValue, isPositive: change >= 0 };
      };

      const obrasAddedThisMonth = totalObras - obrasLastMonth;
      const fonogramasAddedThisMonth = totalFonogramas - fonogramasLastMonth;
      const artistsAddedThisMonth = totalArtists - artistsLastMonth;
      const contractsAddedThisMonth = activeContracts - contractsLastMonth;

      return {
        totalArtists,
        activeArtists: totalArtists,
        totalWorks: totalObras + totalFonogramas,
        totalObras,
        totalFonogramas,
        activeContracts,
        monthlyRevenue,
        monthlyStreams,
        recentActivities,
        trends: {
          obras: calculateTrend(obrasAddedThisMonth, obrasLastMonth > 0 ? Math.max(1, Math.floor(obrasLastMonth * 0.1)) : 1),
          fonogramas: calculateTrend(fonogramasAddedThisMonth, fonogramasLastMonth > 0 ? Math.max(1, Math.floor(fonogramasLastMonth * 0.1)) : 1),
          artists: calculateTrend(artistsAddedThisMonth, artistsLastMonth > 0 ? Math.max(1, Math.floor(artistsLastMonth * 0.1)) : 1),
          contracts: calculateTrend(contractsAddedThisMonth, contractsLastMonth > 0 ? Math.max(1, Math.floor(contractsLastMonth * 0.1)) : 1),
          revenue: calculateTrend(monthlyRevenue, lastMonthRevenue),
          streams: calculateTrend(monthlyStreams, lastMonthStreams),
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // Calculate monthly revenue (only from financial transactions, not contracts)
  static async calculateMonthlyRevenue(startDate: Date, endDate?: Date): Promise<number> {
    // Get financial transactions only
    const transactionsQuery = supabase
      .from('financial_transactions')
      .select('amount, type, transaction_type, status')
      .gte('date', formatDateForDB(startDate) || '');
    
    if (endDate) {
      transactionsQuery.lt('date', formatDateForDB(endDate) || '');
    }
    
    const transactionsResult = await transactionsQuery;
    
    if (!transactionsResult.data) return 0;
    
    // Only count paid income transactions as revenue
    const incomeTransactions = transactionsResult.data.filter(t => 
      (t.status === 'Pago' || t.status === 'pago' || t.status === 'paid') &&
      (t.type === 'receita' || t.type === 'receitas' || t.type === 'income' ||
       t.transaction_type === 'receita' || t.transaction_type === 'receitas' || t.transaction_type === 'income')
    );
    
    return incomeTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  }

  // Get comprehensive financial summary
  static async getFinancialSummary(): Promise<FinancialSummary> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Get all transactions for current month
    const transactionsResult = await supabase
      .from('financial_transactions')
      .select('amount, type, transaction_type, status, category')
      .gte('date', formatDateForDB(startOfMonth) || '');

    const transactions = transactionsResult.data || [];

    // Calculate revenue and expenses
    const paidTransactions = transactions.filter(t => 
      t.status === 'Pago' || t.status === 'pago' || t.status === 'paid'
    );

    const revenue = paidTransactions
      .filter(t => 
        t.type === 'receita' || t.type === 'receitas' || t.type === 'income' ||
        t.transaction_type === 'receita' || t.transaction_type === 'receitas' || t.transaction_type === 'income'
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = paidTransactions
      .filter(t => 
        t.type === 'despesa' || t.type === 'despesas' || t.type === 'expense' ||
        t.transaction_type === 'despesa' || t.transaction_type === 'despesas' || t.transaction_type === 'expense'
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Get contract values
    const contractsResult = await supabase
      .from('contracts')
      .select('value, advance_amount, fixed_value')
      .in('status', ['assinado', 'ativo']);

    const contractsValue = (contractsResult.data || []).reduce((sum, c) => 
      sum + Number(c.value || 0) + Number(c.advance_amount || 0) + Number(c.fixed_value || 0), 0
    );

    // Get pending payments
    const pendingResult = await supabase
      .from('financial_transactions')
      .select('amount')
      .in('status', ['pending', 'pendente', 'Pendente']);

    const pendingPayments = (pendingResult.data || []).reduce((sum, t) => sum + Number(t.amount), 0);

    // Revenue by category
    const revenueByCategory = paidTransactions
      .filter(t => 
        t.type === 'receita' || t.type === 'receitas' || t.type === 'income' ||
        t.transaction_type === 'receita'
      )
      .reduce((acc, t) => {
        const category = t.category || 'Outros';
        acc[category] = (acc[category] || 0) + Number(t.amount);
        return acc;
      }, {} as Record<string, number>);

    // Expenses by category
    const expensesByCategory = paidTransactions
      .filter(t => 
        t.type === 'despesa' || t.type === 'despesas' || t.type === 'expense' ||
        t.transaction_type === 'despesa'
      )
      .reduce((acc, t) => {
        const category = t.category || 'Outros';
        acc[category] = (acc[category] || 0) + Number(t.amount);
        return acc;
      }, {} as Record<string, number>);

    // Monthly trend (last 6 months)
    const monthlyTrend: { month: string; revenue: number; expenses: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthName = monthStart.toLocaleDateString('pt-BR', { month: 'short' });

      const monthTransactions = await supabase
        .from('financial_transactions')
        .select('amount, type, transaction_type, status')
        .gte('date', formatDateForDB(monthStart) || '')
        .lte('date', formatDateForDB(monthEnd) || '');

      const monthPaid = (monthTransactions.data || []).filter(t => 
        t.status === 'Pago' || t.status === 'pago' || t.status === 'paid'
      );

      const monthRevenue = monthPaid
        .filter(t => t.type === 'receita' || t.type === 'receitas' || t.type === 'income' || t.transaction_type === 'receita')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const monthExpenses = monthPaid
        .filter(t => t.type === 'despesa' || t.type === 'despesas' || t.type === 'expense' || t.transaction_type === 'despesa')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      monthlyTrend.push({ month: monthName, revenue: monthRevenue, expenses: monthExpenses });
    }

    return {
      revenue,
      expenses,
      profit: revenue - expenses,
      contractsValue,
      pendingPayments,
      revenueByCategory: Object.entries(revenueByCategory).map(([category, value]) => ({ category, value })),
      expensesByCategory: Object.entries(expensesByCategory).map(([category, value]) => ({ category, value })),
      monthlyTrend
    };
  }

  // Get monthly financial summary (simplified)
  static async getMonthlyFinancialSummary(): Promise<{
    revenue: number;
    expenses: number;
    profit: number;
    contractsValue: number;
  }> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Get ALL financial transactions for current month (not just paid)
      const transactionsResult = await supabase
        .from('financial_transactions')
        .select('amount, type, transaction_type, status')
        .gte('date', formatDateForDB(startOfMonth) || '');
      
      const transactions = transactionsResult.data || [];
      
      // Calculate revenue from transactions (paid + pending as "receita")
      const revenueTransactions = transactions.filter(t => 
        t.type === 'receita' || t.type === 'receitas' || t.type === 'income' ||
        t.transaction_type === 'receita' || t.transaction_type === 'receitas'
      );
      
      // Only count paid transactions as actual revenue
      const paidRevenue = revenueTransactions
        .filter(t => t.status === 'Pago' || t.status === 'pago' || t.status === 'paid')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      // Get expenses (only paid)
      const expenses = transactions
        .filter(t => 
          (t.type === 'despesa' || t.type === 'despesas' || t.type === 'expense' ||
           t.transaction_type === 'despesa' || t.transaction_type === 'despesas') &&
          (t.status === 'Pago' || t.status === 'pago' || t.status === 'paid')
        )
        .reduce((sum, t) => sum + Number(t.amount), 0);

      // Get total active contract values (for reference, not included in monthly revenue)
      const contractsResult = await supabase
        .from('contracts')
        .select('value, advance_amount, fixed_value')
        .in('status', ['assinado', 'ativo', 'signed', 'active']);
      
      const contractsValue = (contractsResult.data || []).reduce((sum, c) => 
        sum + Number(c.value || 0) + Number(c.advance_amount || 0) + Number(c.fixed_value || 0), 0
      );

      return {
        revenue: paidRevenue,
        expenses,
        profit: paidRevenue - expenses,
        contractsValue
      };
    } catch (error) {
      console.error('Error fetching monthly financial summary:', error);
      throw error;
    }
  }

  // Get dashboard alerts
  static async getDashboardAlerts(): Promise<DashboardAlerts> {
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const in60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const [
      contracts30,
      contracts60,
      contracts90,
      releasesInAnalysis,
      releasesWithoutDate,
      pendingApprovals,
      overduePayments
    ] = await Promise.all([
      // Contracts expiring in 30 days
      supabase
        .from('contracts')
        .select('id', { count: 'exact', head: true })
        .in('status', ['assinado', 'ativo'])
        .lte('end_date', in30Days.toISOString().split('T')[0])
        .gte('end_date', now.toISOString().split('T')[0])
        .then(res => res.count || 0),
      // Contracts expiring in 60 days
      supabase
        .from('contracts')
        .select('id', { count: 'exact', head: true })
        .in('status', ['assinado', 'ativo'])
        .lte('end_date', in60Days.toISOString().split('T')[0])
        .gte('end_date', now.toISOString().split('T')[0])
        .then(res => res.count || 0),
      // Contracts expiring in 90 days
      supabase
        .from('contracts')
        .select('id', { count: 'exact', head: true })
        .in('status', ['assinado', 'ativo'])
        .lte('end_date', in90Days.toISOString().split('T')[0])
        .gte('end_date', now.toISOString().split('T')[0])
        .then(res => res.count || 0),
      // Releases in analysis
      supabase
        .from('releases')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'em_analise')
        .then(res => res.count || 0),
      // Releases without date
      supabase
        .from('releases')
        .select('id', { count: 'exact', head: true })
        .is('release_date', null)
        .then(res => res.count || 0),
      // Pending approvals (works + releases)
      Promise.all([
        supabase.from('music_registry').select('id', { count: 'exact', head: true }).eq('status', 'em_analise').then(res => res.count || 0),
        supabase.from('releases').select('id', { count: 'exact', head: true }).eq('status', 'em_analise').then(res => res.count || 0)
      ]).then(([works, releases]) => works + releases),
      // Overdue payments
      supabase
        .from('financial_transactions')
        .select('id', { count: 'exact', head: true })
        .in('status', ['pending', 'pendente', 'Pendente'])
        .lt('date', now.toISOString().split('T')[0])
        .then(res => res.count || 0)
    ]);

    return {
      contractsExpiring30Days: contracts30,
      contractsExpiring60Days: contracts60,
      contractsExpiring90Days: contracts90,
      releasesInAnalysis,
      releasesWithoutDate,
      pendingApprovals,
      overduePayments
    };
  }

  // Get recent activities across all entities
  static async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    const activities: RecentActivity[] = [];

    try {
      try {
        const artists = await ArtistsService.getAll();
        artists
          .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
          .slice(0, 3)
          .forEach(artist => {
            activities.push({
              id: artist.id,
              type: 'artist',
              title: 'Novo Artista',
              description: `${artist.name} foi adicionado ao sistema`,
              timestamp: artist.created_at || new Date().toISOString()
            });
          });
      } catch (e) {
        console.warn('Fallback: unable to load artists via secure RPC', e);
      }

      const recentProjects = await supabase
        .from('projects')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      if (recentProjects.data) {
        recentProjects.data.forEach(project => {
          activities.push({
            id: project.id,
            type: 'project',
            title: 'Novo Projeto',
            description: `Projeto "${project.name}" foi criado`,
            timestamp: project.created_at || new Date().toISOString()
          });
        });
      }

      const recentContracts = await supabase
        .from('contracts')
        .select('id, title, contract_type, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      if (recentContracts.data) {
        recentContracts.data.forEach(contract => {
          const displayName = contract.title || translateContractType(contract.contract_type);
          activities.push({
            id: contract.id,
            type: 'contract',
            title: 'Novo Contrato',
            description: `"${displayName}" foi criado`,
            timestamp: contract.created_at || new Date().toISOString()
          });
        });
      }

      const recentReleases = await supabase
        .from('releases')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      if (recentReleases.data) {
        recentReleases.data.forEach(release => {
          activities.push({
            id: release.id,
            type: 'release',
            title: 'Novo Lançamento',
            description: `"${release.title}" foi criado`,
            timestamp: release.created_at || new Date().toISOString()
          });
        });
      }

      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);

    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  }

  // Get today's agenda events
  static async getTodayEvents(): Promise<any[]> {
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('agenda_events')
        .select(`
          id, title, start_date, start_time, end_date, end_time, 
          location, venue_name, venue_address, status, event_type, description,
          expected_audience, ticket_price, observations,
          artists:artist_id (id, name, full_name)
        `)
        .gte('start_date', todayStr)
        .lt('start_date', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching today events:', error);
      return [];
    }
  }

  // Get contracts expiring soon
  static async getContractsExpiringSoon(days: number = 30): Promise<any[]> {
    try {
      return await ContractsService.getExpiringSoon(days);
    } catch (error) {
      console.error('Error fetching expiring contracts:', error);
      throw error;
    }
  }
}