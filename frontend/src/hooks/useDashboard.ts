import { useQuery } from '@tanstack/react-query';
import { DashboardService, FinancialSummary, DashboardAlerts } from '@/services/dashboard';
import { useDemoData } from '@/contexts/DemoDataContext';

// Query keys
export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardQueryKeys.all, 'stats'] as const,
  activities: () => [...dashboardQueryKeys.all, 'activities'] as const,
  financial: () => [...dashboardQueryKeys.all, 'financial'] as const,
  financialSummary: () => [...dashboardQueryKeys.all, 'financialSummary'] as const,
  alerts: () => [...dashboardQueryKeys.all, 'alerts'] as const,
  expiring: (days: number) => [...dashboardQueryKeys.all, 'expiring', days] as const,
  todayEvents: () => [...dashboardQueryKeys.all, 'todayEvents'] as const,
};

// Get dashboard statistics
export const useDashboardStats = () => {
  const { isDemo, dashboardStats } = useDemoData();
  
  return useQuery({
    queryKey: dashboardQueryKeys.stats(),
    queryFn: async () => {
      if (isDemo) {
        return {
          totalWorks: dashboardStats.totalWorks,
          activeArtists: dashboardStats.activeArtists,
          activeContracts: dashboardStats.activeContracts,
          monthlyRevenue: dashboardStats.monthlyRevenue,
          monthlyStreams: dashboardStats.totalStreams,
          trends: {
            artists: { value: 12.5, isPositive: true },
            contracts: { value: 8.3, isPositive: true },
            revenue: { value: 15.2, isPositive: true },
            streams: { value: 22.1, isPositive: true },
          }
        };
      }
      return DashboardService.getStats();
    },
    refetchInterval: isDemo ? false : 5 * 60 * 1000,
  });
};

// Get recent activities
export const useRecentActivities = (limit: number = 10) => {
  const { isDemo, activities } = useDemoData();
  
  return useQuery({
    queryKey: [...dashboardQueryKeys.activities(), limit],
    queryFn: async () => {
      if (isDemo) {
        return activities.slice(0, limit);
      }
      return DashboardService.getRecentActivities(limit);
    },
    refetchInterval: isDemo ? false : 2 * 60 * 1000,
  });
};

// Get monthly financial summary (simplified)
export const useMonthlyFinancialSummary = () => {
  const { isDemo, dashboardStats } = useDemoData();
  
  return useQuery({
    queryKey: dashboardQueryKeys.financial(),
    queryFn: async () => {
      if (isDemo) {
        return {
          revenue: dashboardStats.monthlyRevenue,
          expenses: 125000,
          balance: dashboardStats.monthlyRevenue - 125000,
        };
      }
      return DashboardService.getMonthlyFinancialSummary();
    },
    refetchInterval: isDemo ? false : 5 * 60 * 1000,
  });
};

// Get comprehensive financial summary
export const useFinancialSummary = () => {
  const { isDemo, dashboardStats } = useDemoData();
  
  return useQuery<FinancialSummary>({
    queryKey: dashboardQueryKeys.financialSummary(),
    queryFn: async () => {
      if (isDemo) {
        return {
          revenue: dashboardStats.monthlyRevenue,
          expenses: 125000,
          profit: dashboardStats.monthlyRevenue - 125000,
          contractsValue: 850000,
          pendingPayments: dashboardStats.pendingPayments,
          revenueByCategory: [
            { category: 'Streaming', value: 245000 },
            { category: 'Shows', value: 185000 },
            { category: 'Licenciamento', value: 55000 },
          ],
          expensesByCategory: [
            { category: 'Produção', value: 65000 },
            { category: 'Marketing', value: 35000 },
            { category: 'Administrativo', value: 25000 },
          ],
          monthlyTrend: [
            { month: 'Jul', revenue: 320000, expenses: 95000 },
            { month: 'Ago', revenue: 380000, expenses: 110000 },
            { month: 'Set', revenue: 420000, expenses: 105000 },
            { month: 'Out', revenue: 450000, expenses: 120000 },
            { month: 'Nov', revenue: 465000, expenses: 115000 },
            { month: 'Dez', revenue: 485000, expenses: 125000 },
          ],
        };
      }
      return DashboardService.getFinancialSummary();
    },
    refetchInterval: isDemo ? false : 5 * 60 * 1000,
  });
};

// Get dashboard alerts
export const useDashboardAlerts = () => {
  const { isDemo } = useDemoData();
  
  return useQuery<DashboardAlerts>({
    queryKey: dashboardQueryKeys.alerts(),
    queryFn: async () => {
      if (isDemo) {
        return {
          contractsExpiring30Days: 2,
          contractsExpiring60Days: 4,
          contractsExpiring90Days: 6,
          releasesInAnalysis: 3,
          releasesWithoutDate: 1,
          pendingApprovals: 5,
          overduePayments: 2,
        };
      }
      return DashboardService.getDashboardAlerts();
    },
    refetchInterval: isDemo ? false : 5 * 60 * 1000,
  });
};

// Get contracts expiring soon
export const useContractsExpiringSoon = (days: number = 30) => {
  const { isDemo, contracts } = useDemoData();
  
  return useQuery({
    queryKey: dashboardQueryKeys.expiring(days),
    queryFn: async () => {
      if (isDemo) {
        return contracts.slice(0, 2);
      }
      return DashboardService.getContractsExpiringSoon(days);
    },
    refetchInterval: isDemo ? false : 30 * 60 * 1000,
  });
};

// Get today's events
export const useTodayEvents = () => {
  const { isDemo, events } = useDemoData();
  
  return useQuery({
    queryKey: dashboardQueryKeys.todayEvents(),
    queryFn: async () => {
      if (isDemo) {
        return events.map(e => ({
          ...e,
          artists: { name: 'Marina Silva', stage_name: 'Marina' }
        }));
      }
      return DashboardService.getTodayEvents();
    },
    refetchInterval: isDemo ? false : 5 * 60 * 1000,
  });
};
