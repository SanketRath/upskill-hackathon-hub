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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      events: {
        Row: {
          created_at: string
          dates_deadlines: string | null
          description: string
          details: string | null
          eligibility: string
          event_date: string
          event_type: string
          id: string
          impressions: number
          location: string
          organizer: string
          poster_url: string | null
          prize_money: number | null
          prizes: string | null
          registered_count: number
          registration_deadline: string
          registration_fee: number
          stages: string | null
          tags: string[] | null
          team_size_max: number
          team_size_min: number
          title: string
          total_slots: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          dates_deadlines?: string | null
          description: string
          details?: string | null
          eligibility?: string
          event_date: string
          event_type: string
          id?: string
          impressions?: number
          location: string
          organizer: string
          poster_url?: string | null
          prize_money?: number | null
          prizes?: string | null
          registered_count?: number
          registration_deadline: string
          registration_fee?: number
          stages?: string | null
          tags?: string[] | null
          team_size_max?: number
          team_size_min?: number
          title: string
          total_slots?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          dates_deadlines?: string | null
          description?: string
          details?: string | null
          eligibility?: string
          event_date?: string
          event_type?: string
          id?: string
          impressions?: number
          location?: string
          organizer?: string
          poster_url?: string | null
          prize_money?: number | null
          prizes?: string | null
          registered_count?: number
          registration_deadline?: string
          registration_fee?: number
          stages?: string | null
          tags?: string[] | null
          team_size_max?: number
          team_size_min?: number
          title?: string
          total_slots?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          college_name: string
          created_at: string
          degree: string
          full_name: string
          heard_from: string
          id: string
          passout_year: number
          updated_at: string
          user_id: string
        }
        Insert: {
          college_name: string
          created_at?: string
          degree: string
          full_name: string
          heard_from: string
          id?: string
          passout_year: number
          updated_at?: string
          user_id: string
        }
        Update: {
          college_name?: string
          created_at?: string
          degree?: string
          full_name?: string
          heard_from?: string
          id?: string
          passout_year?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recently_viewed: {
        Row: {
          event_id: string
          id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          event_id: string
          id?: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          event_id?: string
          id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recently_viewed_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          created_at: string
          event_id: string
          id: string
          payment_status: string
          status: string
          team_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          payment_status?: string
          status?: string
          team_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          payment_status?: string
          status?: string
          team_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          additional_info: Json | null
          college_name: string
          created_at: string
          email: string
          id: string
          is_leader: boolean
          name: string
          phone: string
          photo_url: string | null
          registration_id: string
        }
        Insert: {
          additional_info?: Json | null
          college_name: string
          created_at?: string
          email: string
          id?: string
          is_leader?: boolean
          name: string
          phone: string
          photo_url?: string | null
          registration_id: string
        }
        Update: {
          additional_info?: Json | null
          college_name?: string
          created_at?: string
          email?: string
          id?: string
          is_leader?: boolean
          name?: string
          phone?: string
          photo_url?: string | null
          registration_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist: {
        Row: {
          created_at: string
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_registered_count: {
        Args: { event_id: string }
        Returns: undefined
      }
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
