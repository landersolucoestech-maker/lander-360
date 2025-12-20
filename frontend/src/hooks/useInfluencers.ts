import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Influencer {
  id: string;
  name: string;
  handle?: string;
  platform: string;
  followers?: number;
  engagement_rate?: number;
  niche?: string;
  contact_email?: string;
  contact_phone?: string;
  price_per_post?: number;
  price_per_story?: number;
  price_per_video?: number;
  notes?: string;
  status: string;
  last_collaboration?: string;
  total_collaborations: number;
  created_at: string;
  updated_at: string;
}

export const useInfluencers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: influencers = [], isLoading } = useQuery({
    queryKey: ["influencers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("influencers")
        .select("*")
        .order("followers", { ascending: false });

      if (error) throw error;
      return data as Influencer[];
    },
  });

  const createInfluencer = useMutation({
    mutationFn: async (influencer: Partial<Influencer>) => {
      const { data, error } = await supabase
        .from("influencers")
        .insert([influencer as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["influencers"] });
      toast({ title: "Influenciador cadastrado com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao cadastrar influenciador", variant: "destructive" });
    },
  });

  const updateInfluencer = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Influencer> & { id: string }) => {
      const { data, error } = await supabase
        .from("influencers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["influencers"] });
      toast({ title: "Influenciador atualizado com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar influenciador", variant: "destructive" });
    },
  });

  const deleteInfluencer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("influencers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["influencers"] });
      toast({ title: "Influenciador excluído com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir influenciador", variant: "destructive" });
    },
  });

  // Agrupar por plataforma
  const byPlatform = influencers.reduce((acc, inf) => {
    acc[inf.platform] = (acc[inf.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    influencers,
    isLoading,
    createInfluencer,
    updateInfluencer,
    deleteInfluencer,
    byPlatform,
    totalFollowers: influencers.reduce((sum, i) => sum + (i.followers || 0), 0),
  };
};
