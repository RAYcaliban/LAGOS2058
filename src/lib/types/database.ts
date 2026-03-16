export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      action_submissions: {
        Row: {
          action_type: string
          created_at: string
          description: string
          gm_notes: string | null
          id: string
          language: string
          params: Json
          party_id: string
          pc_cost: number
          quality_score: number | null
          status: string
          target_azs: Json | null
          target_lgas: Json | null
          turn: number
        }
        Insert: {
          action_type: string
          created_at?: string
          description?: string
          gm_notes?: string | null
          id?: string
          language?: string
          params?: Json
          party_id: string
          pc_cost?: number
          quality_score?: number | null
          status?: string
          target_azs?: Json | null
          target_lgas?: Json | null
          turn: number
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string
          gm_notes?: string | null
          id?: string
          language?: string
          params?: Json
          party_id?: string
          pc_cost?: number
          quality_score?: number | null
          status?: string
          target_azs?: Json | null
          target_lgas?: Json | null
          turn?: number
        }
        Relationships: [
          {
            foreignKeyName: "action_submissions_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          author_id: string
          category: string
          content: string
          created_at: string
          id: string
          is_gm_post: boolean
          parent_id: string | null
          pinned: boolean
          title: string | null
        }
        Insert: {
          author_id: string
          category?: string
          content: string
          created_at?: string
          id?: string
          is_gm_post?: boolean
          parent_id?: string | null
          pinned?: boolean
          title?: string | null
        }
        Update: {
          author_id?: string
          category?: string
          content?: string
          created_at?: string
          id?: string
          is_gm_post?: boolean
          parent_id?: string | null
          pinned?: boolean
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_posts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      game_config: {
        Row: {
          description: string | null
          id: string
          key: string
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          value?: Json
        }
        Relationships: []
      }
      game_state: {
        Row: {
          announcements: Json | null
          created_at: string
          deadline: string | null
          id: string
          lga_results: Json | null
          national_results: Json | null
          phase: string
          submission_open: boolean
          turn: number
        }
        Insert: {
          announcements?: Json | null
          created_at?: string
          deadline?: string | null
          id?: string
          lga_results?: Json | null
          national_results?: Json | null
          phase?: string
          submission_open?: boolean
          turn: number
        }
        Update: {
          announcements?: Json | null
          created_at?: string
          deadline?: string | null
          id?: string
          lga_results?: Json | null
          national_results?: Json | null
          phase?: string
          submission_open?: boolean
          turn?: number
        }
        Relationships: []
      }
      parties: {
        Row: {
          color: string
          created_at: string
          description: string | null
          ethnicity: string | null
          full_name: string
          id: string
          leader_name: string | null
          logo_url: string | null
          name: string
          owner_id: string | null
          religion: string | null
        }
        Insert: {
          color: string
          created_at?: string
          description?: string | null
          ethnicity?: string | null
          full_name: string
          id?: string
          leader_name?: string | null
          logo_url?: string | null
          name: string
          owner_id?: string | null
          religion?: string | null
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          ethnicity?: string | null
          full_name?: string
          id?: string
          leader_name?: string | null
          logo_url?: string | null
          name?: string
          owner_id?: string | null
          religion?: string | null
        }
        Relationships: []
      }
      party_state: {
        Row: {
          action_history: Json | null
          awareness: number
          cohesion: number
          created_at: string
          epo_scores: Json
          exposure: number
          id: string
          momentum: number
          party_id: string
          pc: number
          poll_results: Json | null
          scandal_history: Json | null
          seats: number
          turn: number
          vote_share: number
        }
        Insert: {
          action_history?: Json | null
          awareness?: number
          cohesion?: number
          created_at?: string
          epo_scores?: Json
          exposure?: number
          id?: string
          momentum?: number
          party_id: string
          pc?: number
          poll_results?: Json | null
          scandal_history?: Json | null
          seats?: number
          turn: number
          vote_share?: number
        }
        Update: {
          action_history?: Json | null
          awareness?: number
          cohesion?: number
          created_at?: string
          epo_scores?: Json
          exposure?: number
          id?: string
          momentum?: number
          party_id?: string
          pc?: number
          poll_results?: Json | null
          scandal_history?: Json | null
          seats?: number
          turn?: number
          vote_share?: number
        }
        Relationships: [
          {
            foreignKeyName: "party_state_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          character_name: string | null
          created_at: string
          display_name: string
          email: string
          ethnicity: string | null
          id: string
          party_id: string | null
          religion: string | null
          role: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          character_name?: string | null
          created_at?: string
          display_name: string
          email: string
          ethnicity?: string | null
          id: string
          party_id?: string | null
          religion?: string | null
          role?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          character_name?: string | null
          created_at?: string
          display_name?: string
          email?: string
          ethnicity?: string | null
          id?: string
          party_id?: string | null
          religion?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_pages: {
        Row: {
          content: string
          created_at: string
          id: string
          last_edited_by: string | null
          page_type: string
          party_id: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          last_edited_by?: string | null
          page_type?: string
          party_id?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          last_edited_by?: string | null
          page_type?: string
          party_id?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiki_pages_last_edited_by_fkey"
            columns: ["last_edited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_pages_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_gm_or_admin: { Args: never; Returns: boolean }
      is_party_owner: { Args: never; Returns: boolean }
      my_party_id: { Args: never; Returns: string }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

