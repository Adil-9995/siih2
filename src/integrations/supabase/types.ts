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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_public: boolean
          message: string
          priority: Database["public"]["Enums"]["priority_level"]
          published_at: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_public?: boolean
          message: string
          priority?: Database["public"]["Enums"]["priority_level"]
          published_at?: string
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_public?: boolean
          message?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          published_at?: string
          title?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          entity: string | null
          entity_id: string | null
          id: string
          meta: Json
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          meta?: Json
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          meta?: Json
        }
        Relationships: []
      }
      hackathon_settings: {
        Row: {
          announcement: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          custom_fields: Json
          description: string
          end_at: string
          event_name: string
          event_subtitle: string
          id: string
          login_open: boolean
          logo_url: string | null
          max_upload_mb: number
          payment_qr_url: string | null
          poster_url: string | null
          prize_text: string
          public_show_leader: boolean
          public_show_reg_id: boolean
          registration_deadline: string
          registration_fee: number
          registration_open: boolean
          rounds_text: string
          rules_text: string
          singleton: boolean
          socials: Json
          start_at: string
          submissions_open: boolean
          tagline: string
          team_max_size: number
          team_min_size: number
          updated_at: string
          upi_id: string | null
        }
        Insert: {
          announcement?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          custom_fields?: Json
          description?: string
          end_at?: string
          event_name?: string
          event_subtitle?: string
          id?: string
          login_open?: boolean
          logo_url?: string | null
          max_upload_mb?: number
          payment_qr_url?: string | null
          poster_url?: string | null
          prize_text?: string
          public_show_leader?: boolean
          public_show_reg_id?: boolean
          registration_deadline?: string
          registration_fee?: number
          registration_open?: boolean
          rounds_text?: string
          rules_text?: string
          singleton?: boolean
          socials?: Json
          start_at?: string
          submissions_open?: boolean
          tagline?: string
          team_max_size?: number
          team_min_size?: number
          updated_at?: string
          upi_id?: string | null
        }
        Update: {
          announcement?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          custom_fields?: Json
          description?: string
          end_at?: string
          event_name?: string
          event_subtitle?: string
          id?: string
          login_open?: boolean
          logo_url?: string | null
          max_upload_mb?: number
          payment_qr_url?: string | null
          poster_url?: string | null
          prize_text?: string
          public_show_leader?: boolean
          public_show_reg_id?: boolean
          registration_deadline?: string
          registration_fee?: number
          registration_open?: boolean
          rounds_text?: string
          rules_text?: string
          singleton?: boolean
          socials?: Json
          start_at?: string
          submissions_open?: boolean
          tagline?: string
          team_max_size?: number
          team_min_size?: number
          updated_at?: string
          upi_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          priority: Database["public"]["Enums"]["priority_level"]
          read_at: string | null
          team_id: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          priority?: Database["public"]["Enums"]["priority_level"]
          read_at?: string | null
          team_id?: string | null
          title: string
          type?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          read_at?: string | null
          team_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          proof_mime: string | null
          proof_path: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["payment_status"]
          team_id: string
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          proof_mime?: string | null
          proof_path?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          team_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          proof_mime?: string | null
          proof_path?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          content_text: string | null
          created_at: string
          evaluated_at: string | null
          evaluated_by: string | null
          feedback: string | null
          file_path: string | null
          id: string
          link_url: string | null
          notes: string | null
          score: number | null
          status: string
          submitted_by: string | null
          task_id: string
          team_id: string
          version: number
        }
        Insert: {
          content_text?: string | null
          created_at?: string
          evaluated_at?: string | null
          evaluated_by?: string | null
          feedback?: string | null
          file_path?: string | null
          id?: string
          link_url?: string | null
          notes?: string | null
          score?: number | null
          status?: string
          submitted_by?: string | null
          task_id: string
          team_id: string
          version?: number
        }
        Update: {
          content_text?: string | null
          created_at?: string
          evaluated_at?: string | null
          evaluated_by?: string | null
          feedback?: string | null
          file_path?: string | null
          id?: string
          link_url?: string | null
          notes?: string | null
          score?: number | null
          status?: string
          submitted_by?: string | null
          task_id?: string
          team_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "submissions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      task_assignments: {
        Row: {
          created_at: string
          id: string
          task_id: string
          team_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          task_id: string
          team_id: string
        }
        Update: {
          created_at?: string
          id?: string
          task_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      task_documents: {
        Row: {
          category: string
          created_at: string
          id: string
          is_public: boolean
          mime_type: string | null
          size_bytes: number | null
          storage_path: string
          task_id: string | null
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          is_public?: boolean
          mime_type?: string | null
          size_bytes?: number | null
          storage_path: string
          task_id?: string | null
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_public?: boolean
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string
          task_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_documents_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          allow_resubmission: boolean
          assign_all: boolean
          code: string
          created_at: string
          created_by: string | null
          deadline: string | null
          description: string | null
          id: string
          instructions: string | null
          max_attempts: number
          priority: Database["public"]["Enums"]["priority_level"]
          start_at: string | null
          status: Database["public"]["Enums"]["task_status"]
          submission_type: string
          title: string
          updated_at: string
        }
        Insert: {
          allow_resubmission?: boolean
          assign_all?: boolean
          code: string
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          instructions?: string | null
          max_attempts?: number
          priority?: Database["public"]["Enums"]["priority_level"]
          start_at?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          submission_type?: string
          title: string
          updated_at?: string
        }
        Update: {
          allow_resubmission?: boolean
          assign_all?: boolean
          code?: string
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          instructions?: string | null
          max_attempts?: number
          priority?: Database["public"]["Enums"]["priority_level"]
          start_at?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          submission_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          college: string | null
          created_at: string
          department: string | null
          email: string
          full_name: string
          id: string
          is_leader: boolean
          phone: string | null
          student_id: string | null
          team_id: string
          updated_at: string
          year: string | null
        }
        Insert: {
          college?: string | null
          created_at?: string
          department?: string | null
          email: string
          full_name: string
          id?: string
          is_leader?: boolean
          phone?: string | null
          student_id?: string | null
          team_id: string
          updated_at?: string
          year?: string | null
        }
        Update: {
          college?: string | null
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          is_leader?: boolean
          phone?: string | null
          student_id?: string | null
          team_id?: string
          updated_at?: string
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          city: string | null
          college: string
          created_at: string
          department: string
          form_responses: Json
          id: string
          is_demo: boolean
          leader_email: string
          leader_name: string
          leader_phone: string
          leader_user_id: string | null
          pass_code: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          registration_id: string | null
          rejection_reason: string | null
          state: string | null
          status: Database["public"]["Enums"]["registration_status"]
          team_name: string
          updated_at: string
          venue_id: string | null
          year: string | null
        }
        Insert: {
          city?: string | null
          college: string
          created_at?: string
          department: string
          form_responses?: Json
          id?: string
          is_demo?: boolean
          leader_email: string
          leader_name: string
          leader_phone: string
          leader_user_id?: string | null
          pass_code?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          registration_id?: string | null
          rejection_reason?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          team_name: string
          updated_at?: string
          venue_id?: string | null
          year?: string | null
        }
        Update: {
          city?: string | null
          college?: string
          created_at?: string
          department?: string
          form_responses?: Json
          id?: string
          is_demo?: boolean
          leader_email?: string
          leader_name?: string
          leader_phone?: string
          leader_user_id?: string | null
          pass_code?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          registration_id?: string | null
          rejection_reason?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          team_name?: string
          updated_at?: string
          venue_id?: string | null
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
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
      venue_checkins: {
        Row: {
          created_at: string
          id: string
          scanned_by: string | null
          scanned_by_email: string | null
          team_id: string
          venue_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          scanned_by?: string | null
          scanned_by_email?: string | null
          team_id: string
          venue_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          scanned_by?: string | null
          scanned_by_email?: string | null
          team_id?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "venue_checkins_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venue_checkins_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_volunteers: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          user_id: string | null
          venue_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          user_id?: string | null
          venue_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          user_id?: string | null
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_volunteers_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          capacity: number | null
          created_at: string
          id: string
          name: string
          notes: string | null
          room: string | null
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          room?: string | null
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          room?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bootstrap_session: {
        Args: never
        Returns: {
          is_admin: boolean
          team_id: string
        }[]
      }
      claim_first_super_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_volunteer: { Args: { _user_id: string }; Returns: boolean }
      owns_team: { Args: { _team_id: string }; Returns: boolean }
      public_stats: {
        Args: never
        Returns: {
          colleges: number
          tasks_released: number
          total_students: number
          total_teams: number
          verified_teams: number
        }[]
      }
      public_team_directory: {
        Args: never
        Returns: {
          city: string
          college: string
          created_at: string
          department: string
          member_count: number
          registration_id: string
          state: string
          status: Database["public"]["Enums"]["registration_status"]
          team_name: string
        }[]
      }
      scan_venue_pass: { Args: { _code: string }; Returns: Json }
      staff_directory: {
        Args: never
        Returns: {
          created_at: string
          email: string
          full_name: string
          role: string
          user_id: string
        }[]
      }
      submit_registration: {
        Args: { p: Json }
        Returns: {
          registration_id: string
          team_id: string
        }[]
      }
      task_visible: { Args: { _task_id: string }; Returns: boolean }
      volunteer_venue_ids: { Args: { _user_id: string }; Returns: string[] }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin"
        | "team_leader"
        | "evaluator"
        | "co_admin"
        | "volunteer"
      payment_status: "pending" | "under_review" | "verified" | "rejected"
      priority_level: "normal" | "important" | "urgent"
      registration_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "payment_pending"
        | "payment_verification"
        | "verified"
        | "rejected"
        | "cancelled"
        | "suspended"
      task_status: "draft" | "scheduled" | "active" | "closed" | "archived"
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
      app_role: [
        "super_admin",
        "admin",
        "team_leader",
        "evaluator",
        "co_admin",
        "volunteer",
      ],
      payment_status: ["pending", "under_review", "verified", "rejected"],
      priority_level: ["normal", "important", "urgent"],
      registration_status: [
        "draft",
        "submitted",
        "under_review",
        "payment_pending",
        "payment_verification",
        "verified",
        "rejected",
        "cancelled",
        "suspended",
      ],
      task_status: ["draft", "scheduled", "active", "closed", "archived"],
    },
  },
} as const
