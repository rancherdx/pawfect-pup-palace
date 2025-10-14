import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SEOMeta {
  id: string;
  page_type: string;
  page_id: string | null;
  page_slug: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  og_type: string | null;
  twitter_card: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  twitter_image: string | null;
  canonical_url: string | null;
  robots: string | null;
  schema_markup: any | null;
}

export const useSEOMeta = (pageType?: string, pageSlug?: string) => {
  return useQuery({
    queryKey: ["seo-meta", pageType, pageSlug],
    queryFn: async () => {
      let query = supabase.from("seo_meta").select("*");
      
      if (pageType) {
        query = query.eq("page_type", pageType);
      }
      
      if (pageSlug) {
        query = query.eq("page_slug", pageSlug);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SEOMeta[];
    },
  });
};

export const useUpdateSEOMeta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SEOMeta> & { id: string }) => {
      const { data, error } = await supabase
        .from("seo_meta")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo-meta"] });
      toast.success("SEO metadata updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update SEO metadata: ${error.message}`);
    },
  });
};

export const useCreateSEOMeta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (seoMeta: Omit<SEOMeta, "id">) => {
      const { data, error } = await supabase
        .from("seo_meta")
        .insert(seoMeta)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo-meta"] });
      toast.success("SEO metadata created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create SEO metadata: ${error.message}`);
    },
  });
};

export interface SitemapEntry {
  id: string;
  url: string;
  priority: number;
  change_frequency: string;
  last_modified: string;
  is_active: boolean;
  is_auto_generated: boolean;
}

export interface RobotsTxtConfig {
  id: string;
  content: string;
  is_active: boolean;
}

export const useSitemapEntries = () => {
  return useQuery({
    queryKey: ["sitemap-entries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sitemap_entries" as any)
        .select("*")
        .order("url");

      if (error) throw error;
      return (data || []) as any as SitemapEntry[];
    },
  });
};

export const useRobotsTxt = () => {
  return useQuery({
    queryKey: ["robots-txt"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("robots_txt_config" as any)
        .select("*")
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return (data || null) as any as RobotsTxtConfig | null;
    },
  });
};

export const useUpdateRobotsTxt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { data, error } = await supabase
        .from("robots_txt_config" as any)
        .update({ content } as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["robots-txt"] });
      toast.success("Robots.txt updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update robots.txt: ${error.message}`);
    },
  });
};
