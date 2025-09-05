export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      auth_rate_limits: {
        Row: {
          attempt_type: string
          attempts: number | null
          blocked_until: string | null
          created_at: string | null
          first_attempt: string | null
          id: string
          identifier: string
          last_attempt: string | null
        }
        Insert: {
          attempt_type: string
          attempts?: number | null
          blocked_until?: string | null
          created_at?: string | null
          first_attempt?: string | null
          id?: string
          identifier: string
          last_attempt?: string | null
        }
        Update: {
          attempt_type?: string
          attempts?: number | null
          blocked_until?: string | null
          created_at?: string | null
          first_attempt?: string | null
          id?: string
          identifier?: string
          last_attempt?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_name: string | null
          category: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["blog_status"]
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_name?: string | null
          category?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["blog_status"]
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string | null
          category?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["blog_status"]
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      brand_assets: {
        Row: {
          asset_type: string
          asset_url: string
          created_at: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          asset_type: string
          asset_url: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          asset_type?: string
          asset_url?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      breed_templates: {
        Row: {
          akc_group: string | null
          average_weight_max: number | null
          average_weight_min: number | null
          breed_name: string
          care_instructions: string | null
          common_traits: string[] | null
          created_at: string | null
          description: string | null
          exercise_needs: string | null
          gallery_urls: string[] | null
          good_with_kids: boolean | null
          good_with_pets: boolean | null
          grooming_needs: string | null
          health_considerations: string[] | null
          hypoallergenic: boolean | null
          id: string
          life_expectancy_max: number | null
          life_expectancy_min: number | null
          origin_country: string | null
          photo_url: string | null
          size: string | null
          temperament: string[] | null
          updated_at: string | null
        }
        Insert: {
          akc_group?: string | null
          average_weight_max?: number | null
          average_weight_min?: number | null
          breed_name: string
          care_instructions?: string | null
          common_traits?: string[] | null
          created_at?: string | null
          description?: string | null
          exercise_needs?: string | null
          gallery_urls?: string[] | null
          good_with_kids?: boolean | null
          good_with_pets?: boolean | null
          grooming_needs?: string | null
          health_considerations?: string[] | null
          hypoallergenic?: boolean | null
          id?: string
          life_expectancy_max?: number | null
          life_expectancy_min?: number | null
          origin_country?: string | null
          photo_url?: string | null
          size?: string | null
          temperament?: string[] | null
          updated_at?: string | null
        }
        Update: {
          akc_group?: string | null
          average_weight_max?: number | null
          average_weight_min?: number | null
          breed_name?: string
          care_instructions?: string | null
          common_traits?: string[] | null
          created_at?: string | null
          description?: string | null
          exercise_needs?: string | null
          gallery_urls?: string[] | null
          good_with_kids?: boolean | null
          good_with_pets?: boolean | null
          grooming_needs?: string | null
          health_considerations?: string[] | null
          hypoallergenic?: boolean | null
          id?: string
          life_expectancy_max?: number | null
          life_expectancy_min?: number | null
          origin_country?: string | null
          photo_url?: string | null
          size?: string | null
          temperament?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      change_logs: {
        Row: {
          action: string
          context: string | null
          created_at: string
          details: Json | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          context?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          context?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      data_deletion_requests: {
        Row: {
          account_creation_timeframe: string | null
          additional_details: string | null
          admin_notes: string | null
          email: string | null
          id: string
          name: string | null
          processed_at: string | null
          puppy_ids: string | null
          requested_at: string
          status: Database["public"]["Enums"]["deletion_status"]
        }
        Insert: {
          account_creation_timeframe?: string | null
          additional_details?: string | null
          admin_notes?: string | null
          email?: string | null
          id?: string
          name?: string | null
          processed_at?: string | null
          puppy_ids?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["deletion_status"]
        }
        Update: {
          account_creation_timeframe?: string | null
          additional_details?: string | null
          admin_notes?: string | null
          email?: string | null
          id?: string
          name?: string | null
          processed_at?: string | null
          puppy_ids?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["deletion_status"]
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          created_at: string
          html_body: string
          id: string
          is_system_template: boolean
          name: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          html_body: string
          id?: string
          is_system_template?: boolean
          name: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          html_body?: string
          id?: string
          is_system_template?: boolean
          name?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      google_business_config: {
        Row: {
          access_token_encrypted: string | null
          account_id: string | null
          business_name: string
          created_at: string | null
          id: string
          last_sync: string | null
          location_id: string | null
          place_id: string
          refresh_token_encrypted: string | null
          sync_enabled: boolean | null
          sync_frequency_hours: number | null
          token_expires_at: string | null
          updated_at: string | null
        }
        Insert: {
          access_token_encrypted?: string | null
          account_id?: string | null
          business_name: string
          created_at?: string | null
          id?: string
          last_sync?: string | null
          location_id?: string | null
          place_id: string
          refresh_token_encrypted?: string | null
          sync_enabled?: boolean | null
          sync_frequency_hours?: number | null
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Update: {
          access_token_encrypted?: string | null
          account_id?: string | null
          business_name?: string
          created_at?: string | null
          id?: string
          last_sync?: string | null
          location_id?: string | null
          place_id?: string
          refresh_token_encrypted?: string | null
          sync_enabled?: boolean | null
          sync_frequency_hours?: number | null
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      google_reviews_cache: {
        Row: {
          created_at: string | null
          google_review_id: string
          id: string
          last_synced: string | null
          rating: number
          relative_time_description: string | null
          reply_text: string | null
          reply_time_created: string | null
          reviewer_name: string
          reviewer_photo_url: string | null
          text: string
          time_created: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          google_review_id: string
          id?: string
          last_synced?: string | null
          rating: number
          relative_time_description?: string | null
          reply_text?: string | null
          reply_time_created?: string | null
          reviewer_name: string
          reviewer_photo_url?: string | null
          text: string
          time_created: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          google_review_id?: string
          id?: string
          last_synced?: string | null
          rating?: number
          relative_time_description?: string | null
          reply_text?: string | null
          reply_time_created?: string | null
          reviewer_name?: string
          reviewer_photo_url?: string | null
          text?: string
          time_created?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      litters: {
        Row: {
          breed: string
          breed_template_id: string | null
          cover_image_url: string | null
          created_at: string
          dam_name: string | null
          date_of_birth: string | null
          description: string | null
          expected_date: string | null
          id: string
          image_urls: string[] | null
          name: string
          puppy_count: number | null
          sire_name: string | null
          status: Database["public"]["Enums"]["litter_status"]
          updated_at: string
          video_urls: string[] | null
        }
        Insert: {
          breed: string
          breed_template_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          dam_name?: string | null
          date_of_birth?: string | null
          description?: string | null
          expected_date?: string | null
          id?: string
          image_urls?: string[] | null
          name: string
          puppy_count?: number | null
          sire_name?: string | null
          status?: Database["public"]["Enums"]["litter_status"]
          updated_at?: string
          video_urls?: string[] | null
        }
        Update: {
          breed?: string
          breed_template_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          dam_name?: string | null
          date_of_birth?: string | null
          description?: string | null
          expected_date?: string | null
          id?: string
          image_urls?: string[] | null
          name?: string
          puppy_count?: number | null
          sire_name?: string | null
          status?: Database["public"]["Enums"]["litter_status"]
          updated_at?: string
          video_urls?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "litters_breed_template_id_fkey"
            columns: ["breed_template_id"]
            isOneToOne: false
            referencedRelation: "breed_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      puppies: {
        Row: {
          banner_color: string | null
          banner_text: string | null
          birth_date: string | null
          breed: string
          breed_template_id: string | null
          color: string | null
          created_at: string
          description: string | null
          gender: string | null
          id: string
          image_urls: string[] | null
          is_featured: boolean | null
          litter_id: string | null
          name: string
          photo_url: string | null
          price: number | null
          status: Database["public"]["Enums"]["puppy_status"]
          temperament: string[] | null
          updated_at: string
          video_urls: string[] | null
          weight: number | null
        }
        Insert: {
          banner_color?: string | null
          banner_text?: string | null
          birth_date?: string | null
          breed: string
          breed_template_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          gender?: string | null
          id?: string
          image_urls?: string[] | null
          is_featured?: boolean | null
          litter_id?: string | null
          name: string
          photo_url?: string | null
          price?: number | null
          status?: Database["public"]["Enums"]["puppy_status"]
          temperament?: string[] | null
          updated_at?: string
          video_urls?: string[] | null
          weight?: number | null
        }
        Update: {
          banner_color?: string | null
          banner_text?: string | null
          birth_date?: string | null
          breed?: string
          breed_template_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          gender?: string | null
          id?: string
          image_urls?: string[] | null
          is_featured?: boolean | null
          litter_id?: string | null
          name?: string
          photo_url?: string | null
          price?: number | null
          status?: Database["public"]["Enums"]["puppy_status"]
          temperament?: string[] | null
          updated_at?: string
          video_urls?: string[] | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "puppies_breed_template_id_fkey"
            columns: ["breed_template_id"]
            isOneToOne: false
            referencedRelation: "breed_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "puppies_litter_fk"
            columns: ["litter_id"]
            isOneToOne: false
            referencedRelation: "litters"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_log: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      seo_meta: {
        Row: {
          canonical_url: string | null
          created_at: string | null
          id: string
          meta_description: string | null
          meta_keywords: string[] | null
          meta_title: string | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          og_type: string | null
          page_id: string | null
          page_slug: string | null
          page_type: string
          robots: string | null
          schema_markup: Json | null
          twitter_card: string | null
          twitter_description: string | null
          twitter_image: string | null
          twitter_title: string | null
          updated_at: string | null
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          og_type?: string | null
          page_id?: string | null
          page_slug?: string | null
          page_type: string
          robots?: string | null
          schema_markup?: Json | null
          twitter_card?: string | null
          twitter_description?: string | null
          twitter_image?: string | null
          twitter_title?: string | null
          updated_at?: string | null
        }
        Update: {
          canonical_url?: string | null
          created_at?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          og_type?: string | null
          page_id?: string | null
          page_slug?: string | null
          page_type?: string
          robots?: string | null
          schema_markup?: Json | null
          twitter_card?: string | null
          twitter_description?: string | null
          twitter_image?: string | null
          twitter_title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      stud_dogs: {
        Row: {
          age: number | null
          breed_id: string
          certifications: string[] | null
          created_at: string
          description: string | null
          id: string
          image_urls: string[] | null
          is_available: boolean
          name: string
          owner_user_id: string | null
          stud_fee: number
          temperament: string | null
          updated_at: string
        }
        Insert: {
          age?: number | null
          breed_id: string
          certifications?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          image_urls?: string[] | null
          is_available?: boolean
          name: string
          owner_user_id?: string | null
          stud_fee: number
          temperament?: string | null
          updated_at?: string
        }
        Update: {
          age?: number | null
          breed_id?: string
          certifications?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          image_urls?: string[] | null
          is_available?: boolean
          name?: string
          owner_user_id?: string | null
          stud_fee?: number
          temperament?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          admin_approved: boolean | null
          content: string
          created_at: string
          google_review_id: string | null
          id: string
          image: string | null
          is_featured: boolean | null
          location: string | null
          name: string
          puppy_name: string | null
          rating: number | null
          response_date: string | null
          response_text: string | null
          review_date: string | null
          reviewer_avatar: string | null
          source: string | null
          testimonial_text: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          admin_approved?: boolean | null
          content: string
          created_at?: string
          google_review_id?: string | null
          id?: string
          image?: string | null
          is_featured?: boolean | null
          location?: string | null
          name: string
          puppy_name?: string | null
          rating?: number | null
          response_date?: string | null
          response_text?: string | null
          review_date?: string | null
          reviewer_avatar?: string | null
          source?: string | null
          testimonial_text?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          admin_approved?: boolean | null
          content?: string
          created_at?: string
          google_review_id?: string | null
          id?: string
          image?: string | null
          is_featured?: boolean | null
          location?: string | null
          name?: string
          puppy_name?: string | null
          rating?: number | null
          response_date?: string | null
          response_text?: string | null
          review_date?: string | null
          reviewer_avatar?: string | null
          source?: string | null
          testimonial_text?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      third_party_integrations: {
        Row: {
          created_at: string
          created_by: string | null
          data_ciphertext: string
          environment: string
          id: string
          is_active: boolean
          name: string | null
          other_config: Json
          service: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_ciphertext: string
          environment: string
          id?: string
          is_active?: boolean
          name?: string | null
          other_config?: Json
          service: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_ciphertext?: string
          environment?: string
          id?: string
          is_active?: boolean
          name?: string | null
          other_config?: Json
          service?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          payment_method_details: Json | null
          puppy_id: string | null
          square_payment_id: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          payment_method_details?: Json | null
          puppy_id?: string | null
          square_payment_id?: string | null
          status: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          payment_method_details?: Json | null
          puppy_id?: string | null
          square_payment_id?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_admin_exists: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      create_first_admin: {
        Args: { user_email: string; user_name: string; user_password: string }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_security_event: {
        Args: {
          p_event_data?: Json
          p_event_type: string
          p_ip_address?: string
          p_user_agent?: string
          p_user_id: string
        }
        Returns: string
      }
      promote_user_to_admin: {
        Args: { target_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "super-admin"
      blog_status: "draft" | "published" | "archived"
      deletion_status: "pending" | "processing" | "completed" | "rejected"
      litter_status:
        | "Active"
        | "Available Soon"
        | "All Reserved"
        | "All Sold"
        | "Archived"
      puppy_status: "Available" | "Reserved" | "Sold" | "Not For Sale"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user", "super-admin"],
      blog_status: ["draft", "published", "archived"],
      deletion_status: ["pending", "processing", "completed", "rejected"],
      litter_status: [
        "Active",
        "Available Soon",
        "All Reserved",
        "All Sold",
        "Archived",
      ],
      puppy_status: ["Available", "Reserved", "Sold", "Not For Sale"],
    },
  },
} as const
