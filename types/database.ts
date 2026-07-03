/**
 * Supabase database types for OpnameBuddy.
 *
 * Regenerate when the schema changes:
 * - Dashboard: Project Settings → API → Generate types
 * - CLI (remote, no Docker): npx supabase gen types typescript --project-id <ref>
 *
 * Custom convenience aliases and the RoleName union are appended at the bottom
 * and must be preserved when regenerating.
 */

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
      admissions: {
        Row: {
          admitted_on: string
          created_at: string
          created_by_staff_id: string | null
          discharged_on: string | null
          id: string
          location: string | null
          patient_id: string
          status: string
          updated_at: string
        }
        Insert: {
          admitted_on?: string
          created_at?: string
          created_by_staff_id?: string | null
          discharged_on?: string | null
          id?: string
          location?: string | null
          patient_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          admitted_on?: string
          created_at?: string
          created_by_staff_id?: string | null
          discharged_on?: string | null
          id?: string
          location?: string | null
          patient_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admissions_created_by_staff_id_fkey"
            columns: ["created_by_staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admissions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_account_links: {
        Row: {
          id: string
          linked_at: string
          method: string
          patient_id: string
          user_id: string
        }
        Insert: {
          id?: string
          linked_at?: string
          method?: string
          patient_id: string
          user_id: string
        }
        Update: {
          id?: string
          linked_at?: string
          method?: string
          patient_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_account_links_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_account_links_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_checkins: {
        Row: {
          admission_id: string | null
          check_in_date: string
          created_at: string
          energy_level: number
          id: string
          mobility_level: number
          mood: number
          motivation_score: number
          note: string | null
          pain_score: number
          patient_id: string
          symptoms: string
          updated_at: string
        }
        Insert: {
          admission_id?: string | null
          check_in_date: string
          created_at?: string
          energy_level: number
          id?: string
          mobility_level: number
          mood: number
          motivation_score: number
          note?: string | null
          pain_score: number
          patient_id: string
          symptoms?: string
          updated_at?: string
        }
        Update: {
          admission_id?: string | null
          check_in_date?: string
          created_at?: string
          energy_level?: number
          id?: string
          mobility_level?: number
          mood?: number
          motivation_score?: number
          note?: string | null
          pain_score?: number
          patient_id?: string
          symptoms?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_checkins_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_checkins_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_context: {
        Row: {
          additional_attention_notes: string | null
          additional_attention_points: string[]
          admission_id: string | null
          created_at: string
          fall_risk: string
          id: string
          isolation_type: string
          mobility_aid_available: string
          mobility_aid_type: string
          mobility_status: string
          notes: string | null
          patient_id: string
          requires_supervision: string
          room_restriction: string
          transfer_support: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          additional_attention_notes?: string | null
          additional_attention_points?: string[]
          admission_id?: string | null
          created_at?: string
          fall_risk?: string
          id?: string
          isolation_type?: string
          mobility_aid_available?: string
          mobility_aid_type?: string
          mobility_status?: string
          notes?: string | null
          patient_id: string
          requires_supervision?: string
          room_restriction?: string
          transfer_support?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          additional_attention_notes?: string | null
          additional_attention_points?: string[]
          admission_id?: string | null
          created_at?: string
          fall_risk?: string
          id?: string
          isolation_type?: string
          mobility_aid_available?: string
          mobility_aid_type?: string
          mobility_status?: string
          notes?: string | null
          patient_id?: string
          requires_supervision?: string
          room_restriction?: string
          transfer_support?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_context_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_context_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_context_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_link_codes: {
        Row: {
          code_hash: string
          created_at: string
          created_by_staff_id: string | null
          expires_at: string
          id: string
          patient_id: string
          used_at: string | null
        }
        Insert: {
          code_hash: string
          created_at?: string
          created_by_staff_id?: string | null
          expires_at: string
          id?: string
          patient_id: string
          used_at?: string | null
        }
        Update: {
          code_hash?: string
          created_at?: string
          created_by_staff_id?: string | null
          expires_at?: string
          id?: string
          patient_id?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_link_codes_created_by_staff_id_fkey"
            columns: ["created_by_staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_link_codes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_participation_evaluations: {
        Row: {
          activity_session_id: string | null
          activity_title: string
          admission_id: string | null
          after_feeling_score: number
          created_at: string
          effort_score: number
          evaluation_date: string
          id: string
          notes: string | null
          patient_id: string
          reason: string | null
          status: string
          updated_at: string
        }
        Insert: {
          activity_session_id?: string | null
          activity_title: string
          admission_id?: string | null
          after_feeling_score: number
          created_at?: string
          effort_score: number
          evaluation_date: string
          id?: string
          notes?: string | null
          patient_id: string
          reason?: string | null
          status: string
          updated_at?: string
        }
        Update: {
          activity_session_id?: string | null
          activity_title?: string
          admission_id?: string | null
          after_feeling_score?: number
          created_at?: string
          effort_score?: number
          evaluation_date?: string
          id?: string
          notes?: string | null
          patient_id?: string
          reason?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_participation_evaluations_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_participation_evaluations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_questions: {
        Row: {
          admission_id: string | null
          answer_notes: string | null
          created_at: string
          id: string
          patient_id: string
          question_text: string
          status: string
          target_type: string
          updated_at: string
        }
        Insert: {
          admission_id?: string | null
          answer_notes?: string | null
          created_at?: string
          id?: string
          patient_id: string
          question_text: string
          status?: string
          target_type: string
          updated_at?: string
        }
        Update: {
          admission_id?: string | null
          answer_notes?: string | null
          created_at?: string
          id?: string
          patient_id?: string
          question_text?: string
          status?: string
          target_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_questions_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_questions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          birth_date: string | null
          created_at: string
          created_by_staff_id: string | null
          external_ref: string | null
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          created_by_staff_id?: string | null
          external_ref?: string | null
          full_name: string
          id?: string
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          created_by_staff_id?: string | null
          external_ref?: string | null
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_created_by_staff_id_fkey"
            columns: ["created_by_staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          preferred_language: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          preferred_language?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          preferred_language?: string
          updated_at?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          role_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_patient_ids: { Args: never; Returns: string[] }
      has_role: { Args: { role_name: string }; Returns: boolean }
      list_care_patients: {
        Args: never
        Returns: {
          full_name: string
          id: string
        }[]
      }
      redeem_patient_link_code: { Args: { p_code: string }; Returns: string }
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

// -----------------------------------------------------------------------------
// Custom convenience aliases (preserve on regeneration)
// -----------------------------------------------------------------------------

export type Profile = Tables<"profiles">;
export type Role = Tables<"roles">;
export type UserRole = Tables<"user_roles">;
export type PatientCheckin = Tables<"patient_checkins">;
export type PatientQuestion = Tables<"patient_questions">;
export type PatientParticipationEvaluation =
  Tables<"patient_participation_evaluations">;
export type PatientContext = Tables<"patient_context">;
export type Patient = Tables<"patients">;
export type Admission = Tables<"admissions">;
export type PatientAccountLink = Tables<"patient_account_links">;
export type PatientLinkCode = Tables<"patient_link_codes">;

export type RoleName =
  | "patient"
  | "caregiver"
  | "activity_coordinator"
  | "admin";
