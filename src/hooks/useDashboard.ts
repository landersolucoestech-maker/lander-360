import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '@/services/dashboard';

// Query keys
export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardQueryKeys.all, 'stats'] as const,
  activities: () => [...dashboardQueryKeys.all, 'activities'] as const,
  financial: () => [...dashboardQueryKeys.all, 'financial'] as const,
  expiring: (days: number) => [...dashboardQueryKeys.all, 'expiring', days] as const,
};

// Get dashboard statistics
export const useDashboardStats = () => {
  return useQuery({
    queryKey: dashboardQueryKeys.stats(),
    queryFn: DashboardService.getStats,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// Get recent activities
export const useRecentActivities = (limit: number = 10) => {
  return useQuery({
    queryKey: [...dashboardQueryKeys.activities(), limit],
    queryFn: () => DashboardService.getRecentActivities(limit),
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};

// Get monthly financial summary
export const useMonthlyFinancialSummary = () => {
  return useQuery({
    queryKey: dashboardQueryKeys.financial(),
    queryFn: DashboardService.getMonthlyFinancialSummary,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// Get contracts expiring soon
export const useContractsExpiringSoon = (days: number = 30) => {
  return useQuery({
    queryKey: dashboardQueryKeys.expiring(days),
    queryFn: () => DashboardService.getContractsExpiringSoon(days),
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
  });
};