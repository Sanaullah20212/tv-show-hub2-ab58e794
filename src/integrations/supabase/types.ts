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
      activities: {
        Row: {
          action: string
          created_at: string
          description: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      advertisements: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          position: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          position: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          position?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          name_bangla: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          name_bangla: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          name_bangla?: string
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          attempt_type: string
          city: string | null
          country: string | null
          created_at: string | null
          device_fingerprint: string
          id: string
          ip_address: string
          mobile_number: string | null
          reason: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          attempt_type: string
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_fingerprint: string
          id?: string
          ip_address: string
          mobile_number?: string | null
          reason?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          attempt_type?: string
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_fingerprint?: string
          id?: string
          ip_address?: string
          mobile_number?: string | null
          reason?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      movies: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          director: string | null
          download_links: Json | null
          duration: string
          genre: string[]
          id: string
          is_featured: boolean | null
          is_premium: boolean
          movie_cast: string[] | null
          poster_url: string | null
          quality: string
          rating: number | null
          size: string
          slug: string | null
          title: string
          title_bangla: string
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          director?: string | null
          download_links?: Json | null
          duration: string
          genre?: string[]
          id?: string
          is_featured?: boolean | null
          is_premium?: boolean
          movie_cast?: string[] | null
          poster_url?: string | null
          quality?: string
          rating?: number | null
          size: string
          slug?: string | null
          title: string
          title_bangla: string
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          director?: string | null
          download_links?: Json | null
          duration?: string
          genre?: string[]
          id?: string
          is_featured?: boolean | null
          is_premium?: boolean
          movie_cast?: string[] | null
          poster_url?: string | null
          quality?: string
          rating?: number | null
          size?: string
          slug?: string | null
          title?: string
          title_bangla?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string
          read: boolean
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message: string
          read?: boolean
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          read?: boolean
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          account_number: string | null
          created_at: string | null
          display_name: string
          display_name_bangla: string
          id: string
          instructions: string | null
          instructions_bangla: string | null
          is_active: boolean | null
          method_key: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          account_number?: string | null
          created_at?: string | null
          display_name: string
          display_name_bangla: string
          id?: string
          instructions?: string | null
          instructions_bangla?: string | null
          is_active?: boolean | null
          method_key: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          account_number?: string | null
          created_at?: string | null
          display_name?: string
          display_name_bangla?: string
          id?: string
          instructions?: string | null
          instructions_bangla?: string | null
          is_active?: boolean | null
          method_key?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          author_id: string | null
          author_name: string | null
          categories: string[] | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          imported_from: string | null
          imported_id: string | null
          is_featured: boolean | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          slug: string | null
          status: string
          tags: string[] | null
          title: string
          title_bangla: string | null
          updated_at: string
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          categories?: string[] | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          imported_from?: string | null
          imported_id?: string | null
          is_featured?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string | null
          status?: string
          tags?: string[] | null
          title: string
          title_bangla?: string | null
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          categories?: string[] | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          imported_from?: string | null
          imported_id?: string | null
          is_featured?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          title_bangla?: string | null
          updated_at?: string
          view_count?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          display_name: string | null
          id: string
          mobile_number: string | null
          rejection_reason: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          mobile_number?: string | null
          rejection_reason?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          mobile_number?: string | null
          rejection_reason?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string
          id: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      security_overrides: {
        Row: {
          approved_at: string
          approved_by: string
          created_at: string
          device_fingerprint: string
          expires_at: string | null
          id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          approved_at?: string
          approved_by: string
          created_at?: string
          device_fingerprint: string
          expires_at?: string | null
          id?: string
          reason?: string | null
          user_id: string
        }
        Update: {
          approved_at?: string
          approved_by?: string
          created_at?: string
          device_fingerprint?: string
          expires_at?: string | null
          id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      sliders: {
        Row: {
          created_at: string
          cta_text: string | null
          cta_text_bangla: string | null
          description: string | null
          id: string
          image_url: string
          is_active: boolean | null
          movie_id: string | null
          order_index: number | null
          title: string
          title_bangla: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_text?: string | null
          cta_text_bangla?: string | null
          description?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          movie_id?: string | null
          order_index?: number | null
          title: string
          title_bangla: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_text?: string | null
          cta_text_bangla?: string | null
          description?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          movie_id?: string | null
          order_index?: number | null
          title?: string
          title_bangla?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sliders_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sliders_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies_safe_public"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          admin_notes: string | null
          created_at: string
          downgraded_from: string | null
          end_date: string
          id: string
          is_paused: boolean | null
          paused_at: string | null
          paused_days_remaining: number | null
          payment_last_digits: string | null
          payment_method: string | null
          plan_months: number
          price_taka: number
          start_date: string
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          upgraded_from: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          downgraded_from?: string | null
          end_date: string
          id?: string
          is_paused?: boolean | null
          paused_at?: string | null
          paused_days_remaining?: number | null
          payment_last_digits?: string | null
          payment_method?: string | null
          plan_months: number
          price_taka: number
          start_date?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          upgraded_from?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          downgraded_from?: string | null
          end_date?: string
          id?: string
          is_paused?: boolean | null
          paused_at?: string | null
          paused_days_remaining?: number | null
          payment_last_digits?: string | null
          payment_method?: string | null
          plan_months?: number
          price_taka?: number
          start_date?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          upgraded_from?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_downgraded_from_fkey"
            columns: ["downgraded_from"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_upgraded_from_fkey"
            columns: ["upgraded_from"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          accent_color: string | null
          created_at: string
          dashboard_layout: Json | null
          email_notifications_enabled: boolean | null
          font_size: string | null
          id: string
          language: string | null
          primary_color: string | null
          push_notifications_enabled: boolean | null
          theme_mode: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accent_color?: string | null
          created_at?: string
          dashboard_layout?: Json | null
          email_notifications_enabled?: boolean | null
          font_size?: string | null
          id?: string
          language?: string | null
          primary_color?: string | null
          push_notifications_enabled?: boolean | null
          theme_mode?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accent_color?: string | null
          created_at?: string
          dashboard_layout?: Json | null
          email_notifications_enabled?: boolean | null
          font_size?: string | null
          id?: string
          language?: string | null
          primary_color?: string | null
          push_notifications_enabled?: boolean | null
          theme_mode?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          city: string | null
          country: string | null
          created_at: string | null
          device_fingerprint: string
          device_name: string | null
          id: string
          ip_address: string
          is_active: boolean | null
          is_approved: boolean | null
          last_active_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_fingerprint: string
          device_name?: string | null
          id?: string
          ip_address: string
          is_active?: boolean | null
          is_approved?: boolean | null
          last_active_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_fingerprint?: string
          device_name?: string | null
          id?: string
          ip_address?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          last_active_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      zip_passwords: {
        Row: {
          applicable_month: string | null
          created_at: string
          description: string | null
          id: string
          password: string
          updated_at: string
        }
        Insert: {
          applicable_month?: string | null
          created_at?: string
          description?: string | null
          id?: string
          password: string
          updated_at?: string
        }
        Update: {
          applicable_month?: string | null
          created_at?: string
          description?: string | null
          id?: string
          password?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      movies_safe_public: {
        Row: {
          created_at: string | null
          description: string | null
          director: string | null
          duration: string | null
          genre: string[] | null
          id: string | null
          is_featured: boolean | null
          movie_cast: string[] | null
          poster_url: string | null
          quality: string | null
          rating: number | null
          size: string | null
          slug: string | null
          title: string | null
          title_bangla: string | null
          updated_at: string | null
          year: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          director?: string | null
          duration?: string | null
          genre?: string[] | null
          id?: string | null
          is_featured?: boolean | null
          movie_cast?: string[] | null
          poster_url?: string | null
          quality?: string | null
          rating?: number | null
          size?: string | null
          slug?: string | null
          title?: string | null
          title_bangla?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          director?: string | null
          duration?: string | null
          genre?: string[] | null
          id?: string | null
          is_featured?: boolean | null
          movie_cast?: string[] | null
          poster_url?: string | null
          quality?: string | null
          rating?: number | null
          size?: string | null
          slug?: string | null
          title?: string | null
          title_bangla?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_access_downloads: { Args: never; Returns: boolean }
      check_suspicious_login: {
        Args: { p_country: string; p_ip_address: string; p_user_id: string }
        Returns: boolean
      }
      create_initial_admin_user: { Args: never; Returns: undefined }
      create_notification: {
        Args: {
          p_link?: string
          p_message: string
          p_title: string
          p_type?: string
          p_user_id: string
        }
        Returns: string
      }
      generate_post_slug: { Args: { post_title: string }; Returns: string }
      generate_slug: { Args: { title: string }; Returns: string }
      get_movie_by_slug: {
        Args: { movie_slug: string }
        Returns: {
          created_at: string
          description: string
          director: string
          download_links: Json
          duration: string
          genre: string[]
          has_download_access: boolean
          id: string
          is_featured: boolean
          is_premium: boolean
          movie_cast: string[]
          poster_url: string
          quality: string
          rating: number
          size: string
          slug: string
          title: string
          title_bangla: string
          updated_at: string
          year: number
        }[]
      }
      get_movie_with_download_check: {
        Args: { movie_id: string }
        Returns: {
          created_at: string
          description: string
          director: string
          download_links: Json
          duration: string
          genre: string[]
          has_download_access: boolean
          id: string
          is_featured: boolean
          is_premium: boolean
          movie_cast: string[]
          poster_url: string
          quality: string
          rating: number
          size: string
          title: string
          title_bangla: string
          updated_at: string
          year: number
        }[]
      }
      get_movies_public_safe: {
        Args: never
        Returns: {
          created_at: string
          description: string
          director: string
          duration: string
          genre: string[]
          id: string
          is_featured: boolean
          movie_cast: string[]
          poster_url: string
          quality: string
          rating: number
          size: string
          title: string
          title_bangla: string
          updated_at: string
          year: number
        }[]
      }
      get_movies_safe_list: {
        Args: never
        Returns: {
          created_at: string
          description: string
          director: string
          duration: string
          genre: string[]
          id: string
          is_featured: boolean
          movie_cast: string[]
          poster_url: string
          quality: string
          rating: number
          size: string
          title: string
          title_bangla: string
          updated_at: string
          year: number
        }[]
      }
      get_public_movies: {
        Args: never
        Returns: {
          created_at: string
          description: string
          director: string
          duration: string
          genre: string[]
          id: string
          is_featured: boolean
          movie_cast: string[]
          poster_url: string
          quality: string
          rating: number
          size: string
          title: string
          title_bangla: string
          updated_at: string
          year: number
        }[]
      }
      has_active_subscription: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_user_approved: { Args: { _user_id?: string }; Returns: boolean }
      log_activity: {
        Args: {
          p_action: string
          p_description: string
          p_metadata?: Json
          p_user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      subscription_status:
        | "active"
        | "expired"
        | "cancelled"
        | "pending"
        | "rejected"
      user_role: "user" | "admin"
      user_type: "mobile" | "business"
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
      subscription_status: [
        "active",
        "expired",
        "cancelled",
        "pending",
        "rejected",
      ],
      user_role: ["user", "admin"],
      user_type: ["mobile", "business"],
    },
  },
} as const
