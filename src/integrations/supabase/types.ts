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
      item_attachments: {
        Row: {
          created_at: string
          id: string
          item_id: string
          kind: string
          mime_type: string | null
          size_bytes: number | null
          storage_path: string | null
          title: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          kind: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string | null
          title?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          kind?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string | null
          title?: string | null
          url?: string
        }
        Relationships: []
      }
      item_notes: {
        Row: {
          content: string
          created_at: string
          id: string
          item_id: string
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          item_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          item_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          ai_analysis: string | null
          ai_draft: string | null
          ai_next_day: string | null
          ai_tomorrow_plan: Json | null
          analyzed_at: string | null
          content: string
          created_at: string
          entry_date: string
          id: string
          updated_at: string
        }
        Insert: {
          ai_analysis?: string | null
          ai_draft?: string | null
          ai_next_day?: string | null
          ai_tomorrow_plan?: Json | null
          analyzed_at?: string | null
          content?: string
          created_at?: string
          entry_date: string
          id?: string
          updated_at?: string
        }
        Update: {
          ai_analysis?: string | null
          ai_draft?: string | null
          ai_next_day?: string | null
          ai_tomorrow_plan?: Json | null
          analyzed_at?: string | null
          content?: string
          created_at?: string
          entry_date?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      journey: {
        Row: {
          created_at: string
          duration_years: number
          id: string
          started_at: string
        }
        Insert: {
          created_at?: string
          duration_years?: number
          id?: string
          started_at?: string
        }
        Update: {
          created_at?: string
          duration_years?: number
          id?: string
          started_at?: string
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          created_at: string
          date_text: string | null
          deadline_at: string | null
          id: string
          intel: Json | null
          kind: string
          pillar: string | null
          reason: string | null
          source: string | null
          title: string
          url: string | null
        }
        Insert: {
          created_at?: string
          date_text?: string | null
          deadline_at?: string | null
          id?: string
          intel?: Json | null
          kind: string
          pillar?: string | null
          reason?: string | null
          source?: string | null
          title: string
          url?: string | null
        }
        Update: {
          created_at?: string
          date_text?: string | null
          deadline_at?: string | null
          id?: string
          intel?: Json | null
          kind?: string
          pillar?: string | null
          reason?: string | null
          source?: string | null
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      schedule_blocks: {
        Row: {
          activity: string
          category: string | null
          created_at: string
          day_of_week: number | null
          end_time: string
          id: string
          sort_order: number
          start_time: string
          updated_at: string
        }
        Insert: {
          activity: string
          category?: string | null
          created_at?: string
          day_of_week?: number | null
          end_time: string
          id?: string
          sort_order?: number
          start_time: string
          updated_at?: string
        }
        Update: {
          activity?: string
          category?: string | null
          created_at?: string
          day_of_week?: number | null
          end_time?: string
          id?: string
          sort_order?: number
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      topic_links: {
        Row: {
          created_at: string
          id: string
          item_id: string
          label: string | null
          links: Json
          overview: string | null
          refreshed_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          label?: string | null
          links?: Json
          overview?: string | null
          refreshed_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          label?: string | null
          links?: Json
          overview?: string | null
          refreshed_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
