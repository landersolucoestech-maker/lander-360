import { useMemo } from "react";
import { AIInsightsCard, AIInsight } from "./AIInsightsCard";
import { useContracts } from "@/hooks/useContracts";
import { useArtists } from "@/hooks/useArtists";
import { useNavigate } from "react-router-dom";

export function ContratosAIInsights() {
  const navigate = useNavigate();
  const { data: contracts = [] } = useContracts();
  const { data: artists = [] } = useArtists();

  const dataContext = useMemo(() => {
    const now = new Date();

    // Status breakdown
    const statusCount: Record<string, number> = {};
    contracts.forEach((c: any) => {
      const status = c.status || 'indefinido';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    // Contracts by type
    const typeCount: Record<string, number> = {};
    contracts.forEach((c: any) => {
      const type = c.contract_type || c.service_type || 'outro';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    // Expiring contracts (next 60 days)
    const expiringSoon = contracts.filter((c: any) => {
      if (!c.end_date) return false;
      const endDate = new Date(c.end_date);
      const daysUntilExpiry = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysUntilExpiry > 0 && daysUntilExpiry <= 60;
    }).map((c: any) => ({
      titulo: c.title,
      dataFim: c.end_date,
      artista: artists.find((a: any) => a.id === c.artist_id)?.name || 'N/A',
      diasRestantes: Math.ceil((new Date(c.end_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    }));

    // Contracts without end date
    const semDataFim = contracts.filter((c: any) => !c.end_date).length;

    // Total value
    const valorTotal = contracts.reduce((sum: number, c: any) => sum + Number(c.value || 0), 0);
    const valorRoyalties = contracts
      .filter((c: any) => c.royalty_rate || c.royalties_percentage)
      .reduce((sum: number, c: any) => sum + Number(c.royalty_rate || c.royalties_percentage || 0), 0);

    return {
      totalContratos: contracts.length,
      porStatus: statusCount,
      porTipo: typeCount,
      vencendoEm60Dias: expiringSoon,
      semDataFim,
      valorTotalContratos: valorTotal,
      mediaRoyalties: contracts.length > 0 ? (valorRoyalties / contracts.length).toFixed(1) : 0,
      artistasSemContrato: artists.filter((a: any) => 
        !contracts.some((c: any) => c.artist_id === a.id && (c.status === 'active' || c.status === 'signed'))
      ).length,
    };
  }, [contracts, artists]);

  const context = `
Analise a situação contratual da gravadora e identifique:
1. Contratos que precisam de atenção imediata (vencendo)
2. Oportunidades de renovação
3. Artistas sem contrato ativo
4. Riscos legais ou comerciais
5. Recomendações de gestão contratual
`;

  const handleInsightAction = (insight: AIInsight) => {
    if (insight.action?.toLowerCase().includes('contrato')) {
      navigate('/contratos');
    }
  };

  return (
    <AIInsightsCard
      title="Insights de Contratos"
      description="Análise automática da gestão contratual"
      context={context}
      dataContext={dataContext}
      onInsightAction={handleInsightAction}
    />
  );
}
