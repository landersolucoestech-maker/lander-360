import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Takedown {
  id: string;
  title: string;
  reason: string;
  platform: string;
  artist_id?: string;
  release_id?: string;
  music_registry_id?: string;
  content_url?: string;
  infringing_party?: string;
  description?: string;
  status: string;
  request_date: string;
  submitted_date?: string;
  resolved_date?: string;
  evidence_urls?: string[];
  response_notes?: string;
  is_incoming: boolean;
  dispute_status?: string;
  created_at: string;
  updated_at: string;
  artists?: { name: string; stage_name?: string };
  releases?: { title: string };
  music_registry?: { title: string };
}

export const useTakedowns = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: takedowns = [], isLoading } = useQuery({
    queryKey: ["takedowns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("takedowns")
        .select(`
          *,
          artists(name, stage_name),
          releases(title),
          music_registry(title)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Takedown[];
    },
  });

  const createTakedown = useMutation({
    mutationFn: async (takedown: Partial<Takedown>) => {
      const { data, error } = await supabase
        .from("takedowns")
        .insert([takedown as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["takedowns"] });
      toast({ title: "Takedown registrado com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao registrar takedown", variant: "destructive" });
    },
  });

  const updateTakedown = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Takedown> & { id: string }) => {
      const { data, error } = await supabase
        .from("takedowns")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["takedowns"] });
      toast({ title: "Takedown atualizado com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar takedown", variant: "destructive" });
    },
  });

  const deleteTakedown = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("takedowns").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["takedowns"] });
      toast({ title: "Takedown excluído com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir takedown", variant: "destructive" });
    },
  });

  // Estatísticas
  const pending = takedowns.filter(t => t.status === 'pending').length;
  const resolved = takedowns.filter(t => t.status === 'resolved').length;
  const incoming = takedowns.filter(t => t.is_incoming).length;
  const outgoing = takedowns.filter(t => !t.is_incoming).length;

  return {
    takedowns,
    isLoading,
    createTakedown,
    updateTakedown,
    deleteTakedown,
    stats: { pending, resolved, incoming, outgoing, total: takedowns.length },
  };
};
