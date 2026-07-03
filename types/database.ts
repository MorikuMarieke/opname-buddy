/**
 * Supabase database types for OpnameBuddy.
 *
 * Regenerate when the schema changes:
 * - Dashboard: Project Settings → API → Generate types
 * - CLI (remote, no Docker): npx supabase gen types typescript --project-id <ref>
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          preferred_language: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          preferred_language?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          preferred_language?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      roles: {
        Row: {
          id: string;
          name: string;
        };
        Insert: {
          id?: string;
          name: string;
        };
        Update: {
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          user_id: string;
          role_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          role_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          role_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_roles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      patient_checkins: {
        Row: {
          id: string;
          patient_id: string;
          check_in_date: string;
          pain_score: number;
          energy_level: number;
          mood: number;
          mobility_level: number;
          motivation_score: number;
          symptoms: string;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          check_in_date: string;
          pain_score: number;
          energy_level: number;
          mood: number;
          mobility_level: number;
          motivation_score: number;
          symptoms?: string;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          check_in_date?: string;
          pain_score?: number;
          energy_level?: number;
          mood?: number;
          mobility_level?: number;
          motivation_score?: number;
          symptoms?: string;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "patient_checkins_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      patient_questions: {
        Row: {
          id: string;
          patient_id: string;
          question_text: string;
          target_type: string;
          status: string;
          answer_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          question_text: string;
          target_type: string;
          status?: string;
          answer_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          question_text?: string;
          target_type?: string;
          status?: string;
          answer_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "patient_questions_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      patient_participation_evaluations: {
        Row: {
          id: string;
          patient_id: string;
          evaluation_date: string;
          activity_title: string;
          activity_session_id: string | null;
          status: string;
          reason: string | null;
          effort_score: number;
          after_feeling_score: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          evaluation_date: string;
          activity_title: string;
          activity_session_id?: string | null;
          status: string;
          reason?: string | null;
          effort_score: number;
          after_feeling_score: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          evaluation_date?: string;
          activity_title?: string;
          activity_session_id?: string | null;
          status?: string;
          reason?: string | null;
          effort_score?: number;
          after_feeling_score?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "patient_participation_evaluations_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      patient_context: {
        Row: {
          id: string;
          patient_id: string;
          mobility_status: string;
          transfer_support: string;
          fall_risk: string;
          requires_supervision: string;
          mobility_aid_type: string;
          mobility_aid_available: string;
          isolation_type: string;
          room_restriction: string;
          additional_attention_points: string[];
          additional_attention_notes: string | null;
          notes: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          mobility_status?: string;
          transfer_support?: string;
          fall_risk?: string;
          requires_supervision?: string;
          mobility_aid_type?: string;
          mobility_aid_available?: string;
          isolation_type?: string;
          room_restriction?: string;
          additional_attention_points?: string[];
          additional_attention_notes?: string | null;
          notes?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          mobility_status?: string;
          transfer_support?: string;
          fall_risk?: string;
          requires_supervision?: string;
          mobility_aid_type?: string;
          mobility_aid_available?: string;
          isolation_type?: string;
          room_restriction?: string;
          additional_attention_points?: string[];
          additional_attention_notes?: string | null;
          notes?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "patient_context_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "patient_context_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          role_name: string;
        };
        Returns: boolean;
      };
      list_care_patients: {
        Args: Record<PropertyKey, never>;
        Returns: {
          id: string;
          full_name: string | null;
        }[];
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

type DefaultSchema = Database["public"];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database;
}
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database;
}
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database;
}
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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

export type Profile = Tables<"profiles">;
export type Role = Tables<"roles">;
export type UserRole = Tables<"user_roles">;
export type PatientCheckin = Tables<"patient_checkins">;
export type PatientQuestion = Tables<"patient_questions">;
export type PatientParticipationEvaluation =
  Tables<"patient_participation_evaluations">;
export type PatientContext = Tables<"patient_context">;

export type RoleName =
  | "patient"
  | "caregiver"
  | "activity_coordinator"
  | "admin";
