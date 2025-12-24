import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ArtistGoal {
  id: string;
  artist_id: string;
  title: string;
  description?: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  unit?: string;
  platform?: string;
  period?: string;
  start_date: string;
  end_date: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  artists?: { name: string; full_name?: string };
}

export const useArtistGoals = (artistId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["artist-goals", artistId],
    queryFn: async () => {
      let query = supabase
        .from("artist_goals")
        .select(`
          *,
          artists(name, full_name)
        `)
        .order("created_at", { ascending: false });

      if (artistId) {
        query = query.eq("artist_id", artistId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ArtistGoal[];
    },
  });

  const createGoal = useMutation({
    mutationFn: async (goal: Partial<ArtistGoal>) => {
      const { data, error } = await supabase
        .from("artist_goals")
        .insert([goal as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist-goals"] });
      toast({ title: "Meta criada com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao criar meta", variant: "destructive" });
    },
  });

  const updateGoal = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ArtistGoal> & { id: string }) => {
      const { data, error } = await supabase
        .from("artist_goals")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist-goals"] });
      toast({ title: "Meta atualizada com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar meta", variant: "destructive" });
    },
  });

  const deleteGoal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("artist_goals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist-goals"] });
      toast({ title: "Meta excluída com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir meta", variant: "destructive" });
    },
  });

  // Calcular progresso
  const getProgress = (goal: ArtistGoal) => {
    if (!goal.target_value) return 0;
    return Math.min(100, (goal.current_value / goal.target_value) * 100);
  };

  return {
    goals,
    isLoading,
    createGoal,
    updateGoal,
    deleteGoal,
    getProgress,
  };
};
