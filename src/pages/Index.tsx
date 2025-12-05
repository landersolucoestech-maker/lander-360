import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDashboardStats } from "@/hooks/useDashboard";
import {
  Users,
  Music,
  DollarSign,
  Calendar,
  FileText,
} from "lucide-react";
import { mockDashboardStats, mockEvents } from "@/data/mockData";

const Index = () => {
  const { data: stats, isLoading, error } = useDashboardStats();

  // Use mock data when no database data exists
  const displayStats = stats || mockDashboardStats;

  if (error) {
    console.error('Dashboard error:', error);
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">
                Visão geral do seu negócio musical
              </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardCard
                title="Obras e Fonogramas"
                value={isLoading ? '...' : displayStats.totalWorks || 0}
                description="Cadastrados no sistema"
                icon={Music}
                trend={{ value: 12.5, isPositive: true }}
              />
              <DashboardCard
                title="Artistas Ativos"
                value={isLoading ? '...' : displayStats.activeArtists || 0}
                description="Artistas ativos no sistema"
                icon={Users}
                trend={{ value: 8.3, isPositive: true }}
              />
              <DashboardCard
                title="Contratos Vigentes"
                value={isLoading ? '...' : displayStats.activeContracts || 0}
                description="Contratos ativos no sistema"
                icon={FileText}
                trend={{ value: 5.2, isPositive: true }}
              />
              <DashboardCard
                title="Receita Mensal"
                value={isLoading ? '...' : formatCurrency(displayStats.monthlyRevenue || 0)}
                description="Receita do mês atual"
                icon={DollarSign}
                trend={{ value: 18.7, isPositive: true }}
              />
            </div>

            {/* Recent Activity and Today's Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentActivity />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Agenda de Hoje
                  </CardTitle>
                  <CardDescription>Compromissos agendados</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Nenhum evento agendado para hoje
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Eventos aparecerão aqui quando forem criados
                    </p>
                    <Button variant="outline" onClick={() => window.location.href = '/agenda'}>Ver Agenda Completa</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <QuickActions />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
