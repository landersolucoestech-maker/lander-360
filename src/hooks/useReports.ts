import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Fetch financial transactions for reports
export const useFinancialReport = () => {
  return useQuery({
    queryKey: ["reports", "financial"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_transactions")
        .select(`
          id,
          description,
          type,
          amount,
          category,
          date,
          status,
          payment_method,
          observations,
          artists:artist_id(name, stage_name),
          crm_contacts:crm_contact_id(name, company)
        `)
        .order("date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

// Fetch artists for reports
export const useArtistsReport = () => {
  return useQuery({
    queryKey: ["reports", "artists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artists")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
};

// Fetch music registry for reports
export const useMusicReport = () => {
  return useQuery({
    queryKey: ["reports", "music"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("music_registry")
        .select(`
          id,
          title,
          genre,
          isrc,
          iswc,
          abramus_code,
          ecad_code,
          duration,
          status,
          release_date,
          writers,
          publishers,
          artists:artist_id(name, stage_name)
        `)
        .order("title", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
};

// Fetch releases for reports
export const useReleasesReport = () => {
  return useQuery({
    queryKey: ["reports", "releases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("releases")
        .select(`
          id,
          title,
          release_type,
          type,
          release_date,
          status,
          genre,
          label,
          distributors,
          copyright,
          artists:artist_id(name, stage_name)
        `)
        .order("release_date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

// Fetch inventory for reports
export const useInventoryReport = () => {
  return useQuery({
    queryKey: ["reports", "inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
};

// Fetch CRM contacts for reports
export const useCrmReport = () => {
  return useQuery({
    queryKey: ["reports", "crm"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_contacts")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
};

// Fetch phonograms for reports
export const usePhonogramsReport = () => {
  return useQuery({
    queryKey: ["reports", "phonograms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("phonograms")
        .select(`
          id,
          title,
          isrc,
          genre,
          duration,
          status,
          recording_date,
          label,
          master_owner,
          artists:artist_id(name, stage_name)
        `)
        .order("title", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
};

// Fetch contracts for reports
export const useContractsReport = () => {
  return useQuery({
    queryKey: ["reports", "contracts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts")
        .select(`
          id,
          title,
          contract_type,
          service_type,
          client_type,
          status,
          start_date,
          end_date,
          value,
          royalties_percentage,
          artists:artist_id(name, stage_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

// Fetch projects for reports
export const useProjectsReport = () => {
  return useQuery({
    queryKey: ["reports", "projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          id,
          name,
          description,
          status,
          audio_files,
          start_date,
          end_date,
          budget,
          created_at,
          artists:artist_id(name, stage_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};
