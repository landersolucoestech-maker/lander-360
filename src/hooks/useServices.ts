import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  service_type: string;
  sale_price: number;
  discount_value: number;
  discount_type: string;
  final_price: number;
  observations?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const useServices = () => {
  return useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data as Service[];
    },
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (service: Omit<Service, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("services")
        .insert([service])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Serviço criado com sucesso!");
    },
    onError: (error) => {
      console.error("Error creating service:", error);
      toast.error("Erro ao criar serviço");
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...service }: Partial<Service> & { id: string }) => {
      const { data, error } = await supabase
        .from("services")
        .update(service)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Serviço atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Error updating service:", error);
      toast.error("Erro ao atualizar serviço");
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Serviço excluído com sucesso!");
    },
    onError: (error) => {
      console.error("Error deleting service:", error);
      toast.error("Erro ao excluir serviço");
    },
  });
};
