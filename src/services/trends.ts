import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

export interface TrendData {
  value: number;
  isPositive: boolean;
}

export interface TrendStats {
  artistsTrend: TrendData | null;
  activeArtistsTrend: TrendData | null;
  worksTrend: TrendData | null;
  revenueTrend: TrendData | null;
}

// Calculate percentage change between two values
function calculateTrend(current: number, previous: number): TrendData | null {
  if (previous === 0 && current === 0) return null;
  if (previous === 0) return { value: 100, isPositive: current > 0 };
  
  const percentChange = ((current - previous) / previous) * 100;
  return {
    value: Math.abs(Math.round(percentChange * 10) / 10),
    isPositive: percentChange >= 0
  };
}

export class TrendsService {
  // Get artist trends comparing current month vs previous month
  static async getArtistsTrend(): Promise<TrendData | null> {
    try {
      const now = new Date();
      const currentMonthStart = startOfMonth(now);
      const currentMonthEnd = endOfMonth(now);
      const previousMonthStart = startOfMonth(subMonths(now, 1));
      const previousMonthEnd = endOfMonth(subMonths(now, 1));

      const [currentMonth, previousMonth] = await Promise.all([
        supabase
          .from('artists')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', currentMonthStart.toISOString())
          .lte('created_at', currentMonthEnd.toISOString()),
        supabase
          .from('artists')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', previousMonthStart.toISOString())
          .lte('created_at', previousMonthEnd.toISOString())
      ]);

      return calculateTrend(currentMonth.count || 0, previousMonth.count || 0);
    } catch (error) {
      console.error('Error calculating artists trend:', error);
      return null;
    }
  }

  // Get active contracts trend
  static async getActiveContractsTrend(): Promise<TrendData | null> {
    try {
      const now = new Date();
      const oneMonthAgo = subMonths(now, 1);

      const [currentActive, previousActive] = await Promise.all([
        supabase
          .from('contracts')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active'),
        supabase
          .from('contracts')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active')
          .lte('created_at', oneMonthAgo.toISOString())
      ]);

      return calculateTrend(currentActive.count || 0, previousActive.count || 0);
    } catch (error) {
      console.error('Error calculating contracts trend:', error);
      return null;
    }
  }

  // Get music works trend (tracks + music_registry)
  static async getWorksTrend(): Promise<TrendData | null> {
    try {
      const now = new Date();
      const currentMonthStart = startOfMonth(now);
      const currentMonthEnd = endOfMonth(now);
      const previousMonthStart = startOfMonth(subMonths(now, 1));
      const previousMonthEnd = endOfMonth(subMonths(now, 1));

      const [currentTracks, previousTracks, currentRegistry, previousRegistry] = await Promise.all([
        supabase
          .from('tracks')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', currentMonthStart.toISOString())
          .lte('created_at', currentMonthEnd.toISOString()),
        supabase
          .from('tracks')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', previousMonthStart.toISOString())
          .lte('created_at', previousMonthEnd.toISOString()),
        supabase
          .from('music_registry')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', currentMonthStart.toISOString())
          .lte('created_at', currentMonthEnd.toISOString()),
        supabase
          .from('music_registry')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', previousMonthStart.toISOString())
          .lte('created_at', previousMonthEnd.toISOString())
      ]);

      const currentTotal = (currentTracks.count || 0) + (currentRegistry.count || 0);
      const previousTotal = (previousTracks.count || 0) + (previousRegistry.count || 0);

      return calculateTrend(currentTotal, previousTotal);
    } catch (error) {
      console.error('Error calculating works trend:', error);
      return null;
    }
  }

  // Get revenue trend
  static async getRevenueTrend(): Promise<TrendData | null> {
    try {
      const now = new Date();
      const currentMonthStart = startOfMonth(now);
      const currentMonthEnd = endOfMonth(now);
      const previousMonthStart = startOfMonth(subMonths(now, 1));
      const previousMonthEnd = endOfMonth(subMonths(now, 1));

      const [currentRevenue, previousRevenue] = await Promise.all([
        supabase
          .from('financial_transactions')
          .select('amount')
          .eq('type', 'receita')
          .gte('date', currentMonthStart.toISOString().split('T')[0])
          .lte('date', currentMonthEnd.toISOString().split('T')[0]),
        supabase
          .from('financial_transactions')
          .select('amount')
          .eq('type', 'receita')
          .gte('date', previousMonthStart.toISOString().split('T')[0])
          .lte('date', previousMonthEnd.toISOString().split('T')[0])
      ]);

      const currentTotal = (currentRevenue.data || []).reduce((sum, t) => sum + Number(t.amount), 0);
      const previousTotal = (previousRevenue.data || []).reduce((sum, t) => sum + Number(t.amount), 0);

      return calculateTrend(currentTotal, previousTotal);
    } catch (error) {
      console.error('Error calculating revenue trend:', error);
      return null;
    }
  }

  // Get all artist page trends at once
  static async getArtistPageTrends(): Promise<TrendStats> {
    try {
      const [artistsTrend, activeArtistsTrend, worksTrend, revenueTrend] = await Promise.all([
        this.getArtistsTrend(),
        this.getActiveContractsTrend(),
        this.getWorksTrend(),
        this.getRevenueTrend()
      ]);

      return {
        artistsTrend,
        activeArtistsTrend,
        worksTrend,
        revenueTrend
      };
    } catch (error) {
      console.error('Error fetching artist page trends:', error);
      return {
        artistsTrend: null,
        activeArtistsTrend: null,
        worksTrend: null,
        revenueTrend: null
      };
    }
  }
}
