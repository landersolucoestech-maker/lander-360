import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SyncLicense {
  id: string;
  title: string;
  description?: string;
  license_type: string;
  media_type?: string;
  territory?: string;
  duration?: string;
  exclusivity?: boolean;
  artist_id?: string;
  music_registry_id?: string;
  phonogram_id?: string;
  contact_id?: string;
  license_fee?: number;
  advance_payment?: number;
  royalty_percentage?: number;
  status: string;
  proposal_date?: string;
  start_date?: string;
  end_date?: string;
  signed_date?: string;
  usage_description?: string;
  project_name?: string;
  client_name?: string;
  client_company?: string;
  contract_url?: string;
  brief_url?: string;
  created_at: string;
  updated_at: string;
  artists?: { name: string; stage_name?: string };
  music_registry?: { title: string };
  crm_contacts?: { name: string; company?: string };
}

export const useSyncLicenses = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: licenses = [], isLoading } = useQuery({
    queryKey: ["sync-licenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sync_licenses")
        .select(`
          *,
          artists(name, full_name),
          music_registry(title),
          crm_contacts(name, company)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SyncLicense[];
    },
  });

  const createLicense = useMutation({
    mutationFn: async (license: Partial<SyncLicense>) => {
      const { data, error } = await supabase
        .from("sync_licenses")
        .insert([license as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sync-licenses"] });
      toast({ title: "Licença criada com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao criar licença", variant: "destructive" });
    },
  });

  const updateLicense = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SyncLicense> & { id: string }) => {
      const { data, error } = await supabase
        .from("sync_licenses")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sync-licenses"] });
      toast({ title: "Licença atualizada com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar licença", variant: "destructive" });
    },
  });

  const deleteLicense = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sync_licenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sync-licenses"] });
      toast({ title: "Licença excluída com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir licença", variant: "destructive" });
    },
  });

  return {
    licenses,
    isLoading,
    createLicense,
    updateLicense,
    deleteLicense,
  };
};
