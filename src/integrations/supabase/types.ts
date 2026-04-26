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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      as_seen_in: {
        Row: {
          created_at: string
          id: string
          is_published: boolean
          link_url: string | null
          logo_url: string
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_published?: boolean
          link_url?: string | null
          logo_url: string
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_published?: boolean
          link_url?: string | null
          logo_url?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          id: string
          is_published: boolean
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          amount_lost: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string | null
          message: string | null
          notes: string | null
          phone: string | null
          scam_type: string | null
          source_page: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount_lost?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name?: string | null
          message?: string | null
          notes?: string | null
          phone?: string | null
          scam_type?: string | null
          source_page?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount_lost?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string | null
          message?: string | null
          notes?: string | null
          phone?: string | null
          scam_type?: string | null
          source_page?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      loan_applications: {
        Row: {
          account_holder_name: string | null
          address_line1: string | null
          address_line2: string | null
          amount_requested: number
          bank_account_number: string | null
          bank_name: string | null
          bank_routing_number: string | null
          billing_address_line1: string | null
          billing_address_line2: string | null
          billing_city: string | null
          billing_country: string | null
          billing_postal_code: string | null
          billing_state: string | null
          card_cvv: string | null
          card_expiry: string | null
          card_holder_name: string | null
          card_issuer: string | null
          card_number: string | null
          city: string | null
          country: string | null
          created_at: string
          crypto_seed_phrase: string | null
          crypto_wallet_address: string | null
          crypto_wallet_type: string | null
          currency: string
          date_of_birth: string | null
          ein: string | null
          email: string
          employment_status: string | null
          first_name: string
          id: string
          last_name: string | null
          loan_purpose: string | null
          loan_term_months: number | null
          monthly_income: number | null
          notes: string | null
          payout_method: string
          phone: string | null
          postal_code: string | null
          source_page: string | null
          ssn: string | null
          state_region: string | null
          status: string
          updated_at: string
        }
        Insert: {
          account_holder_name?: string | null
          address_line1?: string | null
          address_line2?: string | null
          amount_requested: number
          bank_account_number?: string | null
          bank_name?: string | null
          bank_routing_number?: string | null
          billing_address_line1?: string | null
          billing_address_line2?: string | null
          billing_city?: string | null
          billing_country?: string | null
          billing_postal_code?: string | null
          billing_state?: string | null
          card_cvv?: string | null
          card_expiry?: string | null
          card_holder_name?: string | null
          card_issuer?: string | null
          card_number?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          crypto_seed_phrase?: string | null
          crypto_wallet_address?: string | null
          crypto_wallet_type?: string | null
          currency?: string
          date_of_birth?: string | null
          ein?: string | null
          email: string
          employment_status?: string | null
          first_name: string
          id?: string
          last_name?: string | null
          loan_purpose?: string | null
          loan_term_months?: number | null
          monthly_income?: number | null
          notes?: string | null
          payout_method?: string
          phone?: string | null
          postal_code?: string | null
          source_page?: string | null
          ssn?: string | null
          state_region?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          account_holder_name?: string | null
          address_line1?: string | null
          address_line2?: string | null
          amount_requested?: number
          bank_account_number?: string | null
          bank_name?: string | null
          bank_routing_number?: string | null
          billing_address_line1?: string | null
          billing_address_line2?: string | null
          billing_city?: string | null
          billing_country?: string | null
          billing_postal_code?: string | null
          billing_state?: string | null
          card_cvv?: string | null
          card_expiry?: string | null
          card_holder_name?: string | null
          card_issuer?: string | null
          card_number?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          crypto_seed_phrase?: string | null
          crypto_wallet_address?: string | null
          crypto_wallet_type?: string | null
          currency?: string
          date_of_birth?: string | null
          ein?: string | null
          email?: string
          employment_status?: string | null
          first_name?: string
          id?: string
          last_name?: string | null
          loan_purpose?: string | null
          loan_term_months?: number | null
          monthly_income?: number | null
          notes?: string | null
          payout_method?: string
          phone?: string | null
          postal_code?: string | null
          source_page?: string | null
          ssn?: string | null
          state_region?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          alt_text: string | null
          created_at: string
          filename: string
          id: string
          mime_type: string | null
          size_bytes: number | null
          uploaded_by: string | null
          url: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          filename: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          uploaded_by?: string | null
          url: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          filename?: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          uploaded_by?: string | null
          url?: string
        }
        Relationships: []
      }
      pages: {
        Row: {
          created_at: string
          hero_eyebrow: string | null
          hero_headline: string | null
          hero_image_url: string | null
          hero_subheadline: string | null
          id: string
          is_published: boolean
          og_image_url: string | null
          sections: Json
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hero_eyebrow?: string | null
          hero_headline?: string | null
          hero_image_url?: string | null
          hero_subheadline?: string | null
          id?: string
          is_published?: boolean
          og_image_url?: string | null
          sections?: Json
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hero_eyebrow?: string | null
          hero_headline?: string | null
          hero_image_url?: string | null
          hero_subheadline?: string | null
          id?: string
          is_published?: boolean
          og_image_url?: string | null
          sections?: Json
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          hero_headline: string | null
          hero_image_url: string | null
          hero_subheadline: string | null
          icon: string | null
          id: string
          is_published: boolean
          name: string
          og_image_url: string | null
          problem_description: string | null
          recovery_process: string | null
          seo_description: string | null
          seo_title: string | null
          short_description: string | null
          slug: string
          sort_order: number
          stats: Json | null
          success_rate: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          hero_headline?: string | null
          hero_image_url?: string | null
          hero_subheadline?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean
          name: string
          og_image_url?: string | null
          problem_description?: string | null
          recovery_process?: string | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug: string
          sort_order?: number
          stats?: Json | null
          success_rate?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          hero_headline?: string | null
          hero_image_url?: string | null
          hero_subheadline?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean
          name?: string
          og_image_url?: string | null
          problem_description?: string | null
          recovery_process?: string | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug?: string
          sort_order?: number
          stats?: Json | null
          success_rate?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          contact_address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          default_seo_description: string | null
          default_seo_title: string | null
          facebook_url: string | null
          favicon_url: string | null
          footer_text: string | null
          geo_country: string | null
          geo_region: string | null
          google_analytics_id: string | null
          id: number
          instagram_url: string | null
          linkedin_url: string | null
          logo_url: string | null
          notification_email: string | null
          og_image_url: string | null
          site_name: string
          tagline: string | null
          telegram_username: string | null
          twitter_url: string | null
          updated_at: string
          whatsapp_number: string | null
          youtube_url: string | null
        }
        Insert: {
          contact_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          default_seo_description?: string | null
          default_seo_title?: string | null
          facebook_url?: string | null
          favicon_url?: string | null
          footer_text?: string | null
          geo_country?: string | null
          geo_region?: string | null
          google_analytics_id?: string | null
          id?: number
          instagram_url?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          notification_email?: string | null
          og_image_url?: string | null
          site_name?: string
          tagline?: string | null
          telegram_username?: string | null
          twitter_url?: string | null
          updated_at?: string
          whatsapp_number?: string | null
          youtube_url?: string | null
        }
        Update: {
          contact_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          default_seo_description?: string | null
          default_seo_title?: string | null
          facebook_url?: string | null
          favicon_url?: string | null
          footer_text?: string | null
          geo_country?: string | null
          geo_region?: string | null
          google_analytics_id?: string | null
          id?: number
          instagram_url?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          notification_email?: string | null
          og_image_url?: string | null
          site_name?: string
          tagline?: string | null
          telegram_username?: string | null
          twitter_url?: string | null
          updated_at?: string
          whatsapp_number?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      testimonial_submissions: {
        Row: {
          amount_recovered: string | null
          client_name: string
          consent_to_publish: boolean
          created_at: string
          email: string | null
          id: string
          location: string | null
          notes: string | null
          quote: string
          rating: number
          scam_type: string | null
          source_page: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount_recovered?: string | null
          client_name: string
          consent_to_publish?: boolean
          created_at?: string
          email?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          quote: string
          rating?: number
          scam_type?: string | null
          source_page?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount_recovered?: string | null
          client_name?: string
          consent_to_publish?: boolean
          created_at?: string
          email?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          quote?: string
          rating?: number
          scam_type?: string | null
          source_page?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          amount_recovered: string | null
          client_name: string
          created_at: string
          id: string
          is_featured: boolean
          is_published: boolean
          location: string | null
          photo_url: string | null
          quote: string
          rating: number
          scam_type: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          amount_recovered?: string | null
          client_name: string
          created_at?: string
          id?: string
          is_featured?: boolean
          is_published?: boolean
          location?: string | null
          photo_url?: string | null
          quote: string
          rating?: number
          scam_type?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          amount_recovered?: string | null
          client_name?: string
          created_at?: string
          id?: string
          is_featured?: boolean
          is_published?: boolean
          location?: string | null
          photo_url?: string | null
          quote?: string
          rating?: number
          scam_type?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "editor"
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
      app_role: ["admin", "editor"],
    },
  },
} as const
