import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PaidCampaign {
  id: string;
  name: string;
  description?: string;
  platform: string;
  campaign_type?: string;
  artist_id?: string;
  release_id?: string;
  marketing_campaign_id?: string;
  budget?: number;
  daily_budget?: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  cpm?: number;
  cpc?: number;
  ctr?: number;
  roas?: number;
  start_date?: string;
  end_date?: string;
  status: string;
  ad_url?: string;
  landing_url?: string;
  creative_urls?: string[];
  target_audience?: Record<string, any>;
  created_at: string;
  updated_at: string;
  artists?: { name: string; full_name?: string };
  releases?: { title: string };
}

export const usePaidCampaigns = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["paid-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("paid_campaigns")
        .select(`
          *,
          artists(name, full_name),
          releases(title)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PaidCampaign[];
    },
  });

  const createCampaign = useMutation({
    mutationFn: async (campaign: Partial<PaidCampaign>) => {
      const { data, error } = await supabase
        .from("paid_campaigns")
        .insert([campaign as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paid-campaigns"] });
      toast({ title: "Campanha criada com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao criar campanha", variant: "destructive" });
    },
  });

  const updateCampaign = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PaidCampaign> & { id: string }) => {
      const { data, error } = await supabase
        .from("paid_campaigns")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paid-campaigns"] });
      toast({ title: "Campanha atualizada com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar campanha", variant: "destructive" });
    },
  });

  const deleteCampaign = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("paid_campaigns").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paid-campaigns"] });
      toast({ title: "Campanha excluída com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir campanha", variant: "destructive" });
    },
  });

  // Métricas agregadas
  const totalSpent = campaigns.reduce((sum, c) => sum + (c.spent || 0), 0);
  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);

  return {
    campaigns,
    isLoading,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    metrics: {
      totalSpent,
      totalBudget,
      totalClicks,
      totalImpressions,
      avgCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
    },
  };
};
