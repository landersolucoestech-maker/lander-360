import { useMemo } from "react";
import { AIInsightsCard, AIInsight } from "./AIInsightsCard";
import { useFinancialTransactions } from "@/hooks/useFinancial";
import { useNavigate } from "react-router-dom";

export function FinanceiroAIInsights() {
  const navigate = useNavigate();
  const { data: transactions = [] } = useFinancialTransactions();

  const dataContext = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const thisYear = now.getFullYear();
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    // This month
    const thisMonthTransactions = transactions.filter((t: any) => {
      const date = new Date(t.date);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    });

    // Last month
    const lastMonthTransactions = transactions.filter((t: any) => {
      const date = new Date(t.date);
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    });

    const calculateTotals = (txns: any[]) => {
      const receitas = txns
        .filter((t: any) => t.type === 'receitas' || t.type === 'income')
        .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
      const despesas = txns
        .filter((t: any) => t.type === 'despesas' || t.type === 'expense')
        .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
      return { receitas, despesas, lucro: receitas - despesas };
    };

    const thisMonthTotals = calculateTotals(thisMonthTransactions);
    const lastMonthTotals = calculateTotals(lastMonthTransactions);

    // Categories breakdown
    const categorias: Record<string, number> = {};
    thisMonthTransactions.forEach((t: any) => {
      const cat = t.category || 'Sem categoria';
      categorias[cat] = (categorias[cat] || 0) + Number(t.amount || 0);
    });

    // Pending transactions
    const pendentes = transactions.filter((t: any) => t.status === 'pending' || t.status === 'pendente');

    return {
      meseAtual: thisMonthTotals,
      mesAnterior: lastMonthTotals,
      variacao: {
        receitas: lastMonthTotals.receitas > 0 
          ? ((thisMonthTotals.receitas - lastMonthTotals.receitas) / lastMonthTotals.receitas * 100).toFixed(1)
          : 'N/A',
        despesas: lastMonthTotals.despesas > 0
          ? ((thisMonthTotals.despesas - lastMonthTotals.despesas) / lastMonthTotals.despesas * 100).toFixed(1)
          : 'N/A',
      },
      categoriasPrincipais: Object.entries(categorias)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([nome, valor]) => ({ nome, valor })),
      transacoesPendentes: pendentes.length,
      totalTransacoes: transactions.length,
    };
  }, [transactions]);

  const context = `
Analise os dados financeiros da gravadora e identifique:
1. Tendências de receitas e despesas
2. Categorias que mais impactam o resultado
3. Riscos financeiros
4. Oportunidades de otimização de custos
5. Previsões e recomendações
`;

  const handleInsightAction = (insight: AIInsight) => {
    if (insight.action?.toLowerCase().includes('relatório')) {
      navigate('/relatorios');
    }
  };

  return (
    <AIInsightsCard
      title="Insights Financeiros"
      description="Análise automática de receitas e despesas"
      context={context}
      dataContext={dataContext}
      onInsightAction={handleInsightAction}
    />
  );
}
