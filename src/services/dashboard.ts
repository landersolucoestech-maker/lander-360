import { supabase } from '@/integrations/supabase/client';
import { DashboardStats, RecentActivity } from '@/types/database';
import { ArtistsService } from './artists';
import { ContractsService } from './contracts';

export class DashboardService {
  // Get dashboard statistics
  static async getStats(): Promise<DashboardStats> {
    try {
      const [
        totalArtists,
        totalWorks,
        activeContracts,
        monthlyRevenue,
        recentActivities
      ] = await Promise.all([
        ArtistsService.getCount(),
        0, // totalWorks - removed mock service
        ContractsService.getActive().then(contracts => contracts.length),
        0, // monthlyRevenue - removed mock service
        DashboardService.getRecentActivities()
      ]);

      // For now, considering active artists as total artists
      // This could be enhanced with a proper active status field
      const activeArtists = totalArtists;

      return {
        totalArtists,
        activeArtists,
        totalWorks,
        activeContracts,
        monthlyRevenue,
        recentActivities
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
        .select('id, contract_type, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      if (recentContracts.data) {
        recentContracts.data.forEach(contract => {
          activities.push({
            id: contract.id,
            type: 'contract',
            title: 'Novo Contrato',
            description: `Contrato "${contract.contract_type}" foi criado`,
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
      // Temporarily return zero values since financial service was removed
      const revenue = 0;
      const expenses = 0;

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