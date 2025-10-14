import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AnalyticsSettings {
  id: string;
  google_analytics_id: string | null;
  google_analytics_enabled: boolean;
  facebook_pixel_id: string | null;
  facebook_pixel_enabled: boolean;
  google_tag_manager_id: string | null;
  google_tag_manager_enabled: boolean;
  microsoft_clarity_id: string | null;
  microsoft_clarity_enabled: boolean;
  hotjar_site_id: string | null;
  hotjar_enabled: boolean;
}

export const useAnalytics = () => {
  return useQuery({
    queryKey: ["analytics-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analytics_settings")
        .select("*")
        .single();

      if (error) throw error;
      return data as AnalyticsSettings;
    },
  });
};

export const useUpdateAnalytics = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<AnalyticsSettings>) => {
      const { data: existing } = await supabase
        .from("analytics_settings")
        .select("id")
        .single();

      if (!existing) {
        throw new Error("Analytics settings not found");
      }

      const { data, error } = await supabase
        .from("analytics_settings")
        .update(settings)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analytics-settings"] });
      toast.success("Analytics settings updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update settings: ${error.message}`);
    },
  });
};
