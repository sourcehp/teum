export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: { extensions?: Json; operationName?: string; query?: string; variables?: Json };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string;
          id: string;
          updated_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      banners: {
        Row: {
          created_at: string;
          ends_on: string;
          id: string;
          is_active: boolean;
          link_url: string | null;
          message: string;
          starts_on: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          ends_on: string;
          id?: string;
          is_active?: boolean;
          link_url?: string | null;
          message: string;
          starts_on: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          ends_on?: string;
          id?: string;
          is_active?: boolean;
          link_url?: string | null;
          message?: string;
          starts_on?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      faqs: {
        Row: {
          answer: string;
          created_at: string;
          id: string;
          is_published: boolean;
          question: string;
          sort_order: number;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          answer: string;
          created_at?: string;
          id?: string;
          is_published?: boolean;
          question: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          answer?: string;
          created_at?: string;
          id?: string;
          is_published?: boolean;
          question?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      inquiries: {
        Row: {
          admin_memo: string | null;
          area_pyeong: number | null;
          budget_range: string | null;
          created_at: string;
          desired_start: string | null;
          detail_token_expires_at: string | null;
          detail_token_hash: string | null;
          email: string | null;
          id: string;
          ip_hash: string;
          landing_path: string | null;
          message: string | null;
          name: string;
          notify_status: string;
          phone: string;
          privacy_agreed_at: string;
          referrer: string | null;
          region: string | null;
          space_type: string;
          status: string;
          updated_at: string;
          utm_campaign: string | null;
          utm_medium: string | null;
          utm_source: string | null;
        };
        ComputedFields: never;
        Insert: {
          admin_memo?: string | null;
          area_pyeong?: number | null;
          budget_range?: string | null;
          created_at?: string;
          desired_start?: string | null;
          detail_token_expires_at?: string | null;
          detail_token_hash?: string | null;
          email?: string | null;
          id?: string;
          ip_hash: string;
          landing_path?: string | null;
          message?: string | null;
          name: string;
          notify_status?: string;
          phone: string;
          privacy_agreed_at: string;
          referrer?: string | null;
          region?: string | null;
          space_type: string;
          status?: string;
          updated_at?: string;
          utm_campaign?: string | null;
          utm_medium?: string | null;
          utm_source?: string | null;
        };
        Update: {
          admin_memo?: string | null;
          area_pyeong?: number | null;
          budget_range?: string | null;
          created_at?: string;
          desired_start?: string | null;
          detail_token_expires_at?: string | null;
          detail_token_hash?: string | null;
          email?: string | null;
          id?: string;
          ip_hash?: string;
          landing_path?: string | null;
          message?: string | null;
          name?: string;
          notify_status?: string;
          phone?: string;
          privacy_agreed_at?: string;
          referrer?: string | null;
          region?: string | null;
          space_type?: string;
          status?: string;
          updated_at?: string;
          utm_campaign?: string | null;
          utm_medium?: string | null;
          utm_source?: string | null;
        };
        Relationships: [];
      };
      project_images: {
        Row: {
          alt: string;
          created_at: string;
          height: number;
          id: string;
          project_id: string;
          sort_order: number;
          storage_path: string;
          updated_at: string;
          width: number;
        };
        ComputedFields: never;
        Insert: {
          alt?: string;
          created_at?: string;
          height: number;
          id?: string;
          project_id: string;
          sort_order?: number;
          storage_path: string;
          updated_at?: string;
          width: number;
        };
        Update: {
          alt?: string;
          created_at?: string;
          height?: number;
          id?: string;
          project_id?: string;
          sort_order?: number;
          storage_path?: string;
          updated_at?: string;
          width?: number;
        };
        Relationships: [
          {
            foreignKeyName: "project_images_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          after_image_id: string | null;
          area_pyeong: number | null;
          before_image_id: string | null;
          body: string;
          budget_range: string;
          category: string;
          completed_on: string | null;
          cover_image_id: string | null;
          created_at: string;
          duration_weeks: number | null;
          id: string;
          is_featured: boolean;
          is_published: boolean;
          is_sample: boolean;
          location: string;
          seo_description: string | null;
          seo_title: string | null;
          slug: string;
          sort_order: number;
          summary: string;
          title: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          after_image_id?: string | null;
          area_pyeong?: number | null;
          before_image_id?: string | null;
          body?: string;
          budget_range?: string;
          category: string;
          completed_on?: string | null;
          cover_image_id?: string | null;
          created_at?: string;
          duration_weeks?: number | null;
          id?: string;
          is_featured?: boolean;
          is_published?: boolean;
          is_sample?: boolean;
          location?: string;
          seo_description?: string | null;
          seo_title?: string | null;
          slug: string;
          sort_order?: number;
          summary?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          after_image_id?: string | null;
          area_pyeong?: number | null;
          before_image_id?: string | null;
          body?: string;
          budget_range?: string;
          category?: string;
          completed_on?: string | null;
          cover_image_id?: string | null;
          created_at?: string;
          duration_weeks?: number | null;
          id?: string;
          is_featured?: boolean;
          is_published?: boolean;
          is_sample?: boolean;
          location?: string;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string;
          sort_order?: number;
          summary?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_after_image_id_fkey";
            columns: ["after_image_id"];
            isOneToOne: false;
            referencedRelation: "project_images";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "projects_before_image_id_fkey";
            columns: ["before_image_id"];
            isOneToOne: false;
            referencedRelation: "project_images";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "projects_cover_image_id_fkey";
            columns: ["cover_image_id"];
            isOneToOne: false;
            referencedRelation: "project_images";
            referencedColumns: ["id"];
          },
        ];
      };
      site_settings: {
        Row: {
          address: string;
          benefit_text: string;
          blog_url: string;
          business_number: string;
          ceo_greeting: string;
          ceo_image_path: string | null;
          ceo_name: string;
          company_name: string;
          created_at: string;
          email: string;
          ga4_id: string;
          google_site_verification: string;
          guarantees: NonNullable<Json>;
          hero_image_path: string | null;
          hero_subtitle: string;
          hero_title: string;
          id: number;
          instagram_url: string;
          kakao_channel_url: string;
          logo_path: string | null;
          naver_site_verification: string;
          notify_email: string;
          partners: NonNullable<Json>;
          philosophy_text: string;
          phone: string;
          process_steps: NonNullable<Json>;
          section_title_before_after: string;
          section_title_faq: string;
          section_title_guarantees: string;
          section_title_process: string;
          section_title_projects: string;
          section_title_testimonials: string;
          section_title_visual: string;
          stats: NonNullable<Json>;
          updated_at: string;
          visual_works: NonNullable<Json>;
        };
        ComputedFields: never;
        Insert: {
          address?: string;
          benefit_text?: string;
          blog_url?: string;
          business_number?: string;
          ceo_greeting?: string;
          ceo_image_path?: string | null;
          ceo_name?: string;
          company_name?: string;
          created_at?: string;
          email?: string;
          ga4_id?: string;
          google_site_verification?: string;
          guarantees?: NonNullable<Json>;
          hero_image_path?: string | null;
          hero_subtitle?: string;
          hero_title?: string;
          id?: number;
          instagram_url?: string;
          kakao_channel_url?: string;
          logo_path?: string | null;
          naver_site_verification?: string;
          notify_email?: string;
          partners?: NonNullable<Json>;
          philosophy_text?: string;
          phone?: string;
          process_steps?: NonNullable<Json>;
          section_title_before_after?: string;
          section_title_faq?: string;
          section_title_guarantees?: string;
          section_title_process?: string;
          section_title_projects?: string;
          section_title_testimonials?: string;
          section_title_visual?: string;
          stats?: NonNullable<Json>;
          updated_at?: string;
          visual_works?: NonNullable<Json>;
        };
        Update: {
          address?: string;
          benefit_text?: string;
          blog_url?: string;
          business_number?: string;
          ceo_greeting?: string;
          ceo_image_path?: string | null;
          ceo_name?: string;
          company_name?: string;
          created_at?: string;
          email?: string;
          ga4_id?: string;
          google_site_verification?: string;
          guarantees?: NonNullable<Json>;
          hero_image_path?: string | null;
          hero_subtitle?: string;
          hero_title?: string;
          id?: number;
          instagram_url?: string;
          kakao_channel_url?: string;
          logo_path?: string | null;
          naver_site_verification?: string;
          notify_email?: string;
          partners?: NonNullable<Json>;
          philosophy_text?: string;
          phone?: string;
          process_steps?: NonNullable<Json>;
          section_title_before_after?: string;
          section_title_faq?: string;
          section_title_guarantees?: string;
          section_title_process?: string;
          section_title_projects?: string;
          section_title_testimonials?: string;
          section_title_visual?: string;
          stats?: NonNullable<Json>;
          updated_at?: string;
          visual_works?: NonNullable<Json>;
        };
        Relationships: [];
      };
      testimonials: {
        Row: {
          body: string;
          created_at: string;
          customer_label: string;
          id: string;
          is_featured: boolean;
          is_published: boolean;
          is_sample: boolean;
          project_id: string | null;
          rating: number;
          sort_order: number;
          space_label: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          body: string;
          created_at?: string;
          customer_label: string;
          id?: string;
          is_featured?: boolean;
          is_published?: boolean;
          is_sample?: boolean;
          project_id?: string | null;
          rating: number;
          sort_order?: number;
          space_label?: string;
          updated_at?: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          customer_label?: string;
          id?: string;
          is_featured?: boolean;
          is_published?: boolean;
          is_sample?: boolean;
          project_id?: string | null;
          rating?: number;
          sort_order?: number;
          space_label?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "testimonials_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      public_site_settings: {
        Row: {
          address: string;
          benefit_text: string;
          blog_url: string;
          business_number: string;
          ceo_greeting: string;
          ceo_image_path: string | null;
          ceo_name: string;
          company_name: string;
          email: string;
          ga4_id: string;
          google_site_verification: string;
          guarantees: NonNullable<Json>;
          hero_image_path: string | null;
          hero_subtitle: string;
          hero_title: string;
          id: number;
          instagram_url: string;
          kakao_channel_url: string;
          logo_path: string | null;
          naver_site_verification: string;
          partners: NonNullable<Json>;
          philosophy_text: string;
          phone: string;
          process_steps: NonNullable<Json>;
          section_title_before_after: string;
          section_title_faq: string;
          section_title_guarantees: string;
          section_title_process: string;
          section_title_projects: string;
          section_title_testimonials: string;
          section_title_visual: string;
          stats: NonNullable<Json>;
          updated_at: string;
          visual_works: NonNullable<Json>;
        };
        ComputedFields: never;
        Insert: {
          address?: string | null;
          benefit_text?: string | null;
          blog_url?: string | null;
          business_number?: string | null;
          ceo_greeting?: string | null;
          ceo_image_path?: string | null;
          ceo_name?: string | null;
          company_name?: string | null;
          email?: string | null;
          ga4_id?: string | null;
          google_site_verification?: string | null;
          guarantees?: Json | null;
          hero_image_path?: string | null;
          hero_subtitle?: string | null;
          hero_title?: string | null;
          id?: number | null;
          instagram_url?: string | null;
          kakao_channel_url?: string | null;
          logo_path?: string | null;
          naver_site_verification?: string | null;
          partners?: Json | null;
          philosophy_text?: string | null;
          phone?: string | null;
          process_steps?: Json | null;
          section_title_before_after?: string | null;
          section_title_faq?: string | null;
          section_title_guarantees?: string | null;
          section_title_process?: string | null;
          section_title_projects?: string | null;
          section_title_testimonials?: string | null;
          section_title_visual?: string | null;
          stats?: Json | null;
          updated_at?: string | null;
          visual_works?: Json | null;
        };
        Update: {
          address?: string | null;
          benefit_text?: string | null;
          blog_url?: string | null;
          business_number?: string | null;
          ceo_greeting?: string | null;
          ceo_image_path?: string | null;
          ceo_name?: string | null;
          company_name?: string | null;
          email?: string | null;
          ga4_id?: string | null;
          google_site_verification?: string | null;
          guarantees?: Json | null;
          hero_image_path?: string | null;
          hero_subtitle?: string | null;
          hero_title?: string | null;
          id?: number | null;
          instagram_url?: string | null;
          kakao_channel_url?: string | null;
          logo_path?: string | null;
          naver_site_verification?: string | null;
          partners?: Json | null;
          philosophy_text?: string | null;
          phone?: string | null;
          process_steps?: Json | null;
          section_title_before_after?: string | null;
          section_title_faq?: string | null;
          section_title_guarantees?: string | null;
          section_title_process?: string | null;
          section_title_projects?: string | null;
          section_title_testimonials?: string | null;
          section_title_visual?: string | null;
          stats?: Json | null;
          updated_at?: string | null;
          visual_works?: Json | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      set_inquiry_notify_status: {
        Args: { p_id: string; p_secret: string; p_status: string };
        Returns: undefined;
      };
      submit_inquiry_step1: {
        Args: {
          p_ip_hash: string;
          p_landing_path: string;
          p_name: string;
          p_phone: string;
          p_referrer: string;
          p_secret: string;
          p_space_type: string;
          p_token_hash: string;
          p_utm_campaign: string;
          p_utm_medium: string;
          p_utm_source: string;
        };
        Returns: {
          id: string;
          notify_email: string;
        }[];
      };
      submit_inquiry_step2: {
        Args: {
          p_area_pyeong: number;
          p_budget_range: string;
          p_desired_start: string;
          p_email: string;
          p_id: string;
          p_message: string;
          p_region: string;
          p_secret: string;
          p_token_hash: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
