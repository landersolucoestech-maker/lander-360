import { useMemo } from "react";
import { AIInsightsCard } from "./AIInsightsCard";
import { useDashboardStats } from "@/hooks/useDashboard";
import { useFinancialTransactions } from "@/hooks/useFinancial";
import { useContracts } from "@/hooks/useContracts";
import { useReleases } from "@/hooks/useReleases";

export function DashboardAIInsights() {
  const { data: stats } = useDashboardStats();
  const { data: transactions = [] } = useFinancialTransactions();
  const { data: contracts = [] } = useContracts();
  const { data: releases = [] } = useReleases();

  const dataContext = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    // Calculate financial summary
    const monthlyTransactions = transactions.filter((t: any) => {
      const date = new Date(t.date);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    });

    const receitas = monthlyTransactions
      .filter((t: any) => t.type === 'receitas' || t.type === 'income')
      .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

    const despesas = monthlyTransactions
      .filter((t: any) => t.type === 'despesas' || t.type === 'expense')
      .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

    // Contract analysis
    const activeContracts = contracts.filter((c: any) => c.status === 'active' || c.status === 'signed');
    const expiringContracts = contracts.filter((c: any) => {
      if (!c.end_date) return false;
      const endDate = new Date(c.end_date);
      const daysUntilExpiry = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
    });

    // Release analysis
    const pendingReleases = releases.filter((r: any) => r.status === 'pending' || r.status === 'planning');
    const recentReleases = releases.filter((r: any) => {
      if (!r.release_date) return false;
      const releaseDate = new Date(r.release_date);
      const daysSinceRelease = (now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceRelease >= 0 && daysSinceRelease <= 30;
    });

    return {
      kpis: {
        totalObras: stats?.totalWorks || 0,
        artistasAtivos: stats?.activeArtists || 0,
        contratosAtivos: activeContracts.length,
        receitaMensal: receitas,
        despesasMensais: despesas,
        lucroLiquido: receitas - despesas,
      },
      alertas: {
        contratosVencendo: expiringContracts.length,
        lancamentosPendentes: pendingReleases.length,
        lancamentosRecentes: recentReleases.length,
      },
      trends: stats?.trends || {},
    };
  }, [stats, transactions, contracts, releases]);

  const context = `
Analise os KPIs do dashboard da gravadora e identifique:
1. Oportunidades de melhoria financeira
2. Riscos com contratos ou lançamentos
3. Tendências positivas a destacar
4. Ações prioritárias para o gestor
`;

  return (
    <AIInsightsCard
      title="Insights do Dashboard"
      description="Análise automática dos seus KPIs"
      context={context}
      dataContext={dataContext}
      autoLoad={Object.keys(dataContext.kpis).length > 0}
    />
  );
}
