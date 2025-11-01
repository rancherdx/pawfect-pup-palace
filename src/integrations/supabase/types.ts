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
      addon_items: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      adoption_preferences: {
        Row: {
          created_at: string | null
          has_fenced_yard: boolean | null
          has_kids: boolean | null
          has_other_pets: boolean | null
          health_guarantee_acknowledged: boolean | null
          health_guarantee_acknowledged_at: string | null
          home_type: string | null
          id: string
          kids_ages: Json | null
          other_pets: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          has_fenced_yard?: boolean | null
          has_kids?: boolean | null
          has_other_pets?: boolean | null
          health_guarantee_acknowledged?: boolean | null
          health_guarantee_acknowledged_at?: string | null
          home_type?: string | null
          id?: string
          kids_ages?: Json | null
          other_pets?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          has_fenced_yard?: boolean | null
          has_kids?: boolean | null
          has_other_pets?: boolean | null
          health_guarantee_acknowledged?: boolean | null
          health_guarantee_acknowledged_at?: string | null
          home_type?: string | null
          id?: string
          kids_ages?: Json | null
          other_pets?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      analytics_settings: {
        Row: {
          created_at: string | null
          facebook_pixel_enabled: boolean | null
          facebook_pixel_id: string | null
          google_analytics_enabled: boolean | null
          google_analytics_id: string | null
          google_tag_manager_enabled: boolean | null
          google_tag_manager_id: string | null
          hotjar_enabled: boolean | null
          hotjar_site_id: string | null
          id: string
          microsoft_clarity_enabled: boolean | null
          microsoft_clarity_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          facebook_pixel_enabled?: boolean | null
          facebook_pixel_id?: string | null
          google_analytics_enabled?: boolean | null
          google_analytics_id?: string | null
          google_tag_manager_enabled?: boolean | null
          google_tag_manager_id?: string | null
          hotjar_enabled?: boolean | null
          hotjar_site_id?: string | null
          id?: string
          microsoft_clarity_enabled?: boolean | null
          microsoft_clarity_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          facebook_pixel_enabled?: boolean | null
          facebook_pixel_id?: string | null
          google_analytics_enabled?: boolean | null
          google_analytics_id?: string | null
          google_tag_manager_enabled?: boolean | null
          google_tag_manager_id?: string | null
          hotjar_enabled?: boolean | null
          hotjar_site_id?: string | null
          id?: string
          microsoft_clarity_enabled?: boolean | null
          microsoft_clarity_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
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
          breed_specific_faqs: Json | null
          care_instructions: string | null
          common_faqs: Json | null
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
          breed_specific_faqs?: Json | null
          care_instructions?: string | null
          common_faqs?: Json | null
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
          breed_specific_faqs?: Json | null
          care_instructions?: string | null
          common_faqs?: Json | null
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
      chat_presence: {
        Row: {
          conversation_id: string
          current_page: string | null
          id: string
          is_online: boolean | null
          is_typing: boolean | null
          last_seen: string | null
          session_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          conversation_id: string
          current_page?: string | null
          id?: string
          is_online?: boolean | null
          is_typing?: boolean | null
          last_seen?: string | null
          session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          conversation_id?: string
          current_page?: string | null
          id?: string
          is_online?: boolean | null
          is_typing?: boolean | null
          last_seen?: string | null
          session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_presence_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      color_templates: {
        Row: {
          color_name: string
          created_at: string | null
          id: string
          layman_description: string | null
        }
        Insert: {
          color_name: string
          created_at?: string | null
          id?: string
          layman_description?: string | null
        }
        Update: {
          color_name?: string
          created_at?: string | null
          id?: string
          layman_description?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          current_page: string | null
          id: string
          last_message_at: string | null
          session_id: string | null
          status: string | null
          time_on_site: number | null
          updated_at: string | null
          user_id: string | null
          visitor_city: string | null
          visitor_email: string | null
          visitor_name: string | null
          visitor_state: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          current_page?: string | null
          id?: string
          last_message_at?: string | null
          session_id?: string | null
          status?: string | null
          time_on_site?: number | null
          updated_at?: string | null
          user_id?: string | null
          visitor_city?: string | null
          visitor_email?: string | null
          visitor_name?: string | null
          visitor_state?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          current_page?: string | null
          id?: string
          last_message_at?: string | null
          session_id?: string | null
          status?: string | null
          time_on_site?: number | null
          updated_at?: string | null
          user_id?: string | null
          visitor_city?: string | null
          visitor_email?: string | null
          visitor_name?: string | null
          visitor_state?: string | null
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
      design_tokens: {
        Row: {
          created_at: string
          dark_value: string | null
          description: string | null
          dimmed_value: string | null
          id: string
          light_value: string | null
          token_category: string
          token_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dark_value?: string | null
          description?: string | null
          dimmed_value?: string | null
          id?: string
          light_value?: string | null
          token_category: string
          token_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dark_value?: string | null
          description?: string | null
          dimmed_value?: string | null
          id?: string
          light_value?: string | null
          token_category?: string
          token_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_providers: {
        Row: {
          api_key_encrypted: string | null
          created_at: string | null
          dkim_private_key_vault_id: string | null
          dkim_public_key: string | null
          dkim_verified: boolean | null
          id: string
          is_active: boolean | null
          last_test_at: string | null
          provider_name: string
          smtp_host: string | null
          smtp_password_encrypted: string | null
          smtp_port: number | null
          smtp_username: string | null
          test_error_message: string | null
          test_status: string | null
          updated_at: string | null
        }
        Insert: {
          api_key_encrypted?: string | null
          created_at?: string | null
          dkim_private_key_vault_id?: string | null
          dkim_public_key?: string | null
          dkim_verified?: boolean | null
          id?: string
          is_active?: boolean | null
          last_test_at?: string | null
          provider_name: string
          smtp_host?: string | null
          smtp_password_encrypted?: string | null
          smtp_port?: number | null
          smtp_username?: string | null
          test_error_message?: string | null
          test_status?: string | null
          updated_at?: string | null
        }
        Update: {
          api_key_encrypted?: string | null
          created_at?: string | null
          dkim_private_key_vault_id?: string | null
          dkim_public_key?: string | null
          dkim_verified?: boolean | null
          id?: string
          is_active?: boolean | null
          last_test_at?: string | null
          provider_name?: string
          smtp_host?: string | null
          smtp_password_encrypted?: string | null
          smtp_port?: number | null
          smtp_username?: string | null
          test_error_message?: string | null
          test_status?: string | null
          updated_at?: string | null
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
      form_submissions: {
        Row: {
          created_at: string | null
          form_data: Json
          form_name: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          form_data: Json
          form_name: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          form_data?: Json
          form_name?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_email?: string | null
          user_id?: string | null
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
      image_metadata: {
        Row: {
          alt_text: string
          created_at: string | null
          display_order: number | null
          entity_id: string | null
          entity_type: string
          id: string
          image_url: string
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          alt_text: string
          created_at?: string | null
          display_order?: number | null
          entity_id?: string | null
          entity_type: string
          id?: string
          image_url: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          alt_text?: string
          created_at?: string | null
          display_order?: number | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          image_url?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      litters: {
        Row: {
          breed: string
          breed_template_id: string | null
          cover_image_url: string | null
          created_at: string
          dam_id: string | null
          dam_name: string | null
          date_of_birth: string | null
          description: string | null
          expected_date: string | null
          id: string
          image_urls: string[] | null
          name: string
          puppy_count: number | null
          sire_id: string | null
          sire_name: string | null
          slug: string | null
          status: Database["public"]["Enums"]["litter_status"]
          updated_at: string
          video_urls: string[] | null
        }
        Insert: {
          breed: string
          breed_template_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          dam_id?: string | null
          dam_name?: string | null
          date_of_birth?: string | null
          description?: string | null
          expected_date?: string | null
          id?: string
          image_urls?: string[] | null
          name: string
          puppy_count?: number | null
          sire_id?: string | null
          sire_name?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["litter_status"]
          updated_at?: string
          video_urls?: string[] | null
        }
        Update: {
          breed?: string
          breed_template_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          dam_id?: string | null
          dam_name?: string | null
          date_of_birth?: string | null
          description?: string | null
          expected_date?: string | null
          id?: string
          image_urls?: string[] | null
          name?: string
          puppy_count?: number | null
          sire_id?: string | null
          sire_name?: string | null
          slug?: string | null
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
          {
            foreignKeyName: "litters_dam_id_fkey"
            columns: ["dam_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "litters_sire_id_fkey"
            columns: ["sire_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
        ]
      }
      login_attempts: {
        Row: {
          attempted_at: string | null
          browser: string | null
          device: string | null
          id: string
          ip_address: unknown
          location: Json | null
          os: string | null
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          attempted_at?: string | null
          browser?: string | null
          device?: string | null
          id?: string
          ip_address?: unknown
          location?: Json | null
          os?: string | null
          success: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          attempted_at?: string | null
          browser?: string | null
          device?: string | null
          id?: string
          ip_address?: unknown
          location?: Json | null
          os?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          conversation_id: string
          created_at: string | null
          id: string
          message: string
          read_at: string | null
          sender_id: string | null
          sender_type: string
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          id?: string
          message: string
          read_at?: string | null
          sender_id?: string | null
          sender_type: string
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          id?: string
          message?: string
          read_at?: string | null
          sender_id?: string | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          chat_messages: boolean | null
          created_at: string | null
          form_submissions: boolean | null
          id: string
          new_orders: boolean | null
          site_visits: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          chat_messages?: boolean | null
          created_at?: string | null
          form_submissions?: boolean | null
          id?: string
          new_orders?: boolean | null
          site_visits?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          chat_messages?: boolean | null
          created_at?: string | null
          form_submissions?: boolean | null
          id?: string
          new_orders?: boolean | null
          site_visits?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      parents: {
        Row: {
          bloodline_info: string | null
          breed: string
          certifications: string[] | null
          created_at: string
          description: string | null
          gender: string
          health_clearances: string[] | null
          id: string
          image_urls: string[] | null
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          bloodline_info?: string | null
          breed: string
          certifications?: string[] | null
          created_at?: string
          description?: string | null
          gender: string
          health_clearances?: string[] | null
          id?: string
          image_urls?: string[] | null
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          bloodline_info?: string | null
          breed?: string
          certifications?: string[] | null
          created_at?: string
          description?: string | null
          gender?: string
          health_clearances?: string[] | null
          id?: string
          image_urls?: string[] | null
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_method_configs: {
        Row: {
          api_key_encrypted: string | null
          api_secret_encrypted: string | null
          created_at: string | null
          custom_instructions: string | null
          environment: string | null
          id: string
          is_enabled: boolean | null
          last_tested_at: string | null
          method_name: string
          payment_link: string | null
          qr_code_url: string | null
          test_status: string | null
          updated_at: string | null
        }
        Insert: {
          api_key_encrypted?: string | null
          api_secret_encrypted?: string | null
          created_at?: string | null
          custom_instructions?: string | null
          environment?: string | null
          id?: string
          is_enabled?: boolean | null
          last_tested_at?: string | null
          method_name: string
          payment_link?: string | null
          qr_code_url?: string | null
          test_status?: string | null
          updated_at?: string | null
        }
        Update: {
          api_key_encrypted?: string | null
          api_secret_encrypted?: string | null
          created_at?: string | null
          custom_instructions?: string | null
          environment?: string | null
          id?: string
          is_enabled?: boolean | null
          last_tested_at?: string | null
          method_name?: string
          payment_link?: string | null
          qr_code_url?: string | null
          test_status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          notes: string | null
          payment_date: string | null
          payment_method: string
          purchase_id: string | null
          square_transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method: string
          purchase_id?: string | null
          square_transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string
          purchase_id?: string | null
          square_transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "puppy_purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_transactions: {
        Row: {
          created_at: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          invoice_url: string | null
          items: Json
          notes: string | null
          payment_method: string
          payment_status: string | null
          processed_by: string | null
          receipt_html: string | null
          receipt_url: string | null
          square_transaction_id: string | null
          subtotal: number
          tax_amount: number
          total_amount: number
          transaction_number: string
        }
        Insert: {
          created_at?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          invoice_url?: string | null
          items: Json
          notes?: string | null
          payment_method: string
          payment_status?: string | null
          processed_by?: string | null
          receipt_html?: string | null
          receipt_url?: string | null
          square_transaction_id?: string | null
          subtotal: number
          tax_amount: number
          total_amount: number
          transaction_number: string
        }
        Update: {
          created_at?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          invoice_url?: string | null
          items?: Json
          notes?: string | null
          payment_method?: string
          payment_status?: string | null
          processed_by?: string | null
          receipt_html?: string | null
          receipt_url?: string | null
          square_transaction_id?: string | null
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          transaction_number?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          force_password_change: boolean | null
          id: string
          name: string | null
          password_changed_at: string | null
          phone: string | null
          preferred_contact: string | null
          preferred_name: string | null
          profile_photo_url: string | null
          secondary_email: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          force_password_change?: boolean | null
          id: string
          name?: string | null
          password_changed_at?: string | null
          phone?: string | null
          preferred_contact?: string | null
          preferred_name?: string | null
          profile_photo_url?: string | null
          secondary_email?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          force_password_change?: boolean | null
          id?: string
          name?: string | null
          password_changed_at?: string | null
          phone?: string | null
          preferred_contact?: string | null
          preferred_name?: string | null
          profile_photo_url?: string | null
          secondary_email?: string | null
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
          owner_user_id: string | null
          photo_url: string | null
          price: number | null
          slug: string | null
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
          owner_user_id?: string | null
          photo_url?: string | null
          price?: number | null
          slug?: string | null
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
          owner_user_id?: string | null
          photo_url?: string | null
          price?: number | null
          slug?: string | null
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
      puppy_purchases: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          customer_email: string
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          deposit_amount: number | null
          due_date: string
          id: string
          notes: string | null
          puppy_id: string | null
          refund_amount: number | null
          refund_reason: string | null
          remaining_amount: number
          square_invoice_id: string | null
          status: string | null
          total_price: number
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          customer_email: string
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          deposit_amount?: number | null
          due_date: string
          id?: string
          notes?: string | null
          puppy_id?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          remaining_amount: number
          square_invoice_id?: string | null
          status?: string | null
          total_price: number
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          customer_email?: string
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          deposit_amount?: number | null
          due_date?: string
          id?: string
          notes?: string | null
          puppy_id?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          remaining_amount?: number
          square_invoice_id?: string | null
          status?: string | null
          total_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "puppy_purchases_puppy_id_fkey"
            columns: ["puppy_id"]
            isOneToOne: false
            referencedRelation: "puppies"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      pwa_settings: {
        Row: {
          app_name: string
          background_color: string
          created_at: string | null
          description: string
          display: string
          icon_192_url: string | null
          icon_512_url: string | null
          id: string
          orientation: string
          push_notifications_enabled: boolean | null
          scope: string
          short_name: string
          start_url: string
          theme_color: string
          updated_at: string | null
        }
        Insert: {
          app_name?: string
          background_color?: string
          created_at?: string | null
          description?: string
          display?: string
          icon_192_url?: string | null
          icon_512_url?: string | null
          id?: string
          orientation?: string
          push_notifications_enabled?: boolean | null
          scope?: string
          short_name?: string
          start_url?: string
          theme_color?: string
          updated_at?: string | null
        }
        Update: {
          app_name?: string
          background_color?: string
          created_at?: string | null
          description?: string
          display?: string
          icon_192_url?: string | null
          icon_512_url?: string | null
          id?: string
          orientation?: string
          push_notifications_enabled?: boolean | null
          scope?: string
          short_name?: string
          start_url?: string
          theme_color?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sent_emails_log: {
        Row: {
          error_message: string | null
          id: string
          message_id: string | null
          provider_id: string | null
          recipient_email: string
          sent_at: string | null
          status: string | null
          subject: string
          template_name: string | null
        }
        Insert: {
          error_message?: string | null
          id?: string
          message_id?: string | null
          provider_id?: string | null
          recipient_email: string
          sent_at?: string | null
          status?: string | null
          subject: string
          template_name?: string | null
        }
        Update: {
          error_message?: string | null
          id?: string
          message_id?: string | null
          provider_id?: string | null
          recipient_email?: string
          sent_at?: string | null
          status?: string | null
          subject?: string
          template_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sent_emails_log_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "email_providers"
            referencedColumns: ["id"]
          },
        ]
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
      services: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          price: number
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
        }
        Relationships: []
      }
      site_contact_info: {
        Row: {
          address_city: string | null
          address_state: string | null
          created_at: string | null
          email: string | null
          holiday_hours: Json | null
          hours_of_operation: Json | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address_city?: string | null
          address_state?: string | null
          created_at?: string | null
          email?: string | null
          holiday_hours?: Json | null
          hours_of_operation?: Json | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address_city?: string | null
          address_state?: string | null
          created_at?: string | null
          email?: string | null
          holiday_hours?: Json | null
          hours_of_operation?: Json | null
          id?: string
          phone?: string | null
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
      theme_presets: {
        Row: {
          created_at: string
          id: string
          is_default: boolean | null
          preset_name: string
          theme_mode: string
          tokens: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          preset_name: string
          theme_mode: string
          tokens?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          preset_name?: string
          theme_mode?: string
          tokens?: Json
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
          is_active: boolean
          other_config: Json
          service: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_ciphertext: string
          environment: string
          is_active?: boolean
          other_config?: Json
          service: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_ciphertext?: string
          environment?: string
          is_active?: boolean
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
      user_2fa: {
        Row: {
          backup_codes: string[] | null
          created_at: string | null
          enabled: boolean | null
          id: string
          secret: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          secret: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          secret?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      user_addresses: {
        Row: {
          address_type: string | null
          city: string
          country: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          state: string
          street_address: string
          street_address_2: string | null
          updated_at: string | null
          user_id: string
          validated_by_usps: boolean | null
          validation_timestamp: string | null
          zip_code: string
        }
        Insert: {
          address_type?: string | null
          city: string
          country?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          state: string
          street_address: string
          street_address_2?: string | null
          updated_at?: string | null
          user_id: string
          validated_by_usps?: boolean | null
          validation_timestamp?: string | null
          zip_code: string
        }
        Update: {
          address_type?: string | null
          city?: string
          country?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          state?: string
          street_address?: string
          street_address_2?: string | null
          updated_at?: string | null
          user_id?: string
          validated_by_usps?: boolean | null
          validation_timestamp?: string | null
          zip_code?: string
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
      user_sessions: {
        Row: {
          browser: string | null
          created_at: string | null
          device: string | null
          expires_at: string
          id: string
          ip_address: unknown
          last_activity: string | null
          os: string | null
          refresh_token: string | null
          revoked: boolean | null
          revoked_at: string | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          created_at?: string | null
          device?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown
          last_activity?: string | null
          os?: string | null
          refresh_token?: string | null
          revoked?: boolean | null
          revoked_at?: string | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          browser?: string | null
          created_at?: string | null
          device?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          last_activity?: string | null
          os?: string | null
          refresh_token?: string | null
          revoked?: boolean | null
          revoked_at?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_theme_preferences: {
        Row: {
          created_at: string
          custom_tokens: Json | null
          id: string
          theme_mode: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_tokens?: Json | null
          id?: string
          theme_mode?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_tokens?: Json | null
          id?: string
          theme_mode?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      encrypt_payment_details: {
        Args: { details: Json; user_id: string }
        Returns: string
      }
      generate_slug: { Args: { input_text: string }; Returns: string }
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
      mask_payment_method: { Args: { details: Json }; Returns: Json }
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
