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
  trends: {
    works: { value: number; isPositive: boolean };
    artists: { value: number; isPositive: boolean };
    contracts: { value: number; isPositive: boolean };
    revenue: { value: number; isPositive: boolean };
  };
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
        totalWorks,
        worksLastMonth,
        activeContracts,
        contractsLastMonth,
        monthlyRevenue,
        lastMonthRevenue,
        recentActivities
      ] = await Promise.all([
        // Current artists count
        ArtistsService.getCount(),
        // Artists created before this month
        supabase
          .from('artists')
          .select('id', { count: 'exact', head: true })
          .lt('created_at', startOfMonth.toISOString())
          .then(res => res.count || 0),
        // Total works (music_registry)
        supabase
          .from('music_registry')
          .select('id', { count: 'exact', head: true })
          .then(res => res.count || 0),
        // Works created before this month
        supabase
          .from('music_registry')
          .select('id', { count: 'exact', head: true })
          .lt('created_at', startOfMonth.toISOString())
          .then(res => res.count || 0),
        // Active contracts
        ContractsService.getActive().then(contracts => contracts.length),
        // Contracts active last month
        supabase
          .from('contracts')
          .select('id', { count: 'exact', head: true })
          .lt('created_at', startOfMonth.toISOString())
          .or(`status.eq.active,status.eq.ativo`)
          .then(res => res.count || 0),
        // Monthly revenue (income transactions this month)
        supabase
          .from('financial_transactions')
          .select('amount')
          .or('type.eq.receitas,type.eq.income')
          .gte('date', formatDateForDB(startOfMonth) || '')
          .then(res => res.data?.reduce((sum, t) => sum + Number(t.amount), 0) || 0),
        // Last month revenue
        supabase
          .from('financial_transactions')
          .select('amount')
          .or('type.eq.receitas,type.eq.income')
          .gte('date', formatDateForDB(startOfLastMonth) || '')
          .lt('date', formatDateForDB(startOfMonth) || '')
          .then(res => res.data?.reduce((sum, t) => sum + Number(t.amount), 0) || 0),
        // Recent activities
        DashboardService.getRecentActivities()
      ]);

      // Calculate trends (percentage change from last month) - capped at 100%
      const calculateTrend = (current: number, previous: number) => {
        if (previous === 0) {
          return { value: current > 0 ? 100 : 0, isPositive: current >= 0 };
        }
        const change = ((current - previous) / previous) * 100;
        const cappedValue = Math.min(Math.abs(Math.round(change * 10) / 10), 100);
        return { value: cappedValue, isPositive: change >= 0 };
      };

      const worksAddedThisMonth = totalWorks - worksLastMonth;
      const artistsAddedThisMonth = totalArtists - artistsLastMonth;
      const contractsAddedThisMonth = activeContracts - contractsLastMonth;

      return {
        totalArtists,
        activeArtists: totalArtists,
        totalWorks,
        activeContracts,
        monthlyRevenue,
        recentActivities,
        trends: {
          works: calculateTrend(worksAddedThisMonth, worksLastMonth > 0 ? Math.max(1, Math.floor(worksLastMonth * 0.1)) : 1),
          artists: calculateTrend(artistsAddedThisMonth, artistsLastMonth > 0 ? Math.max(1, Math.floor(artistsLastMonth * 0.1)) : 1),
          contracts: calculateTrend(contractsAddedThisMonth, contractsLastMonth > 0 ? Math.max(1, Math.floor(contractsLastMonth * 0.1)) : 1),
          revenue: calculateTrend(monthlyRevenue, lastMonthRevenue),
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }


  // Get recent activities across all entities
  static async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    const activities: RecentActivity[] = [];

    try {
      // Get recent artists using secure RPC to avoid exposing PII via direct table access
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

      // Get recent projects
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

      // Get recent contracts
      const recentContracts = await supabase
        .from('contracts')
        .select('id, title, contract_type, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      if (recentContracts.data) {
        recentContracts.data.forEach(contract => {
          // Use the contract title for display, fallback to translated type
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

      // Get recent releases
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

      // Sort by timestamp and limit
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);

    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  }

  // Get monthly financial summary
  static async getMonthlyFinancialSummary(): Promise<{
    revenue: number;
    expenses: number;
    profit: number;
  }> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const [revenueResult, expensesResult] = await Promise.all([
        supabase
          .from('financial_transactions')
          .select('amount')
          .or('type.eq.receitas,type.eq.income')
          .gte('date', formatDateForDB(startOfMonth) || ''),
        supabase
          .from('financial_transactions')
          .select('amount')
          .or('type.eq.despesas,type.eq.expense')
          .gte('date', formatDateForDB(startOfMonth) || '')
      ]);

      const revenue = revenueResult.data?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const expenses = expensesResult.data?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      return {
        revenue,
        expenses,
        profit: revenue - expenses
      };
    } catch (error) {
      console.error('Error fetching monthly financial summary:', error);
      throw error;
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