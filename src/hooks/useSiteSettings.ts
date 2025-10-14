import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  setting_type: string;
  category: string;
  description: string | null;
  is_public: boolean;
}

export const useSiteSettings = (category?: string, isPublic?: boolean) => {
  return useQuery({
    queryKey: ["site-settings", category, isPublic],
    queryFn: async () => {
      const query = supabase.from("site_settings" as any).select("*") as any;
      
      let finalQuery = query;
      if (category) {
        finalQuery = finalQuery.eq("category", category);
      }
      
      if (isPublic !== undefined) {
        finalQuery = finalQuery.eq("is_public", isPublic);
      }

      const { data, error } = await finalQuery;

      if (error) throw error;
      return (data || []) as SiteSetting[];
    },
  });
};

export const useSiteSetting = (settingKey: string) => {
  return useQuery({
    queryKey: ["site-setting", settingKey],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("site_settings" as any)
        .select("*")
        .eq("setting_key", settingKey)
        .maybeSingle() as any);

      if (error) throw error;
      return (data || null) as SiteSetting | null;
    },
  });
};

export const useUpdateSiteSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      settingKey,
      settingValue,
    }: {
      settingKey: string;
      settingValue: any;
    }) => {
      const { data, error } = await (supabase
        .from("site_settings" as any)
        .update({ setting_value: settingValue })
        .eq("setting_key", settingKey)
        .select()
        .single() as any);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      queryClient.invalidateQueries({ queryKey: ["site-setting"] });
      toast.success("Setting updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update setting: ${error.message}`);
    },
  });
};

export const useCreateSiteSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (setting: Omit<SiteSetting, "id">) => {
      const { data, error } = await (supabase
        .from("site_settings" as any)
        .insert(setting)
        .select()
        .single() as any);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast.success("Setting created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create setting: ${error.message}`);
    },
  });
};
