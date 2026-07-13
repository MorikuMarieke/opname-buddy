/**
 * Supabase database types for OpnameBuddy.
 *
 * Regenerate when the schema changes:
 * - Dashboard: Project Settings -> API -> Generate types
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
      account_audit_events: {
        Row: {
          action: string
          actor_user_id: string
          created_at: string
          id: string
          metadata: Json
          target_user_id: string
        }
        Insert: {
          action: string
          actor_user_id: string
          created_at?: string
          id?: string
          metadata?: Json
          target_user_id: string
        }
        Update: {
          action?: string
          actor_user_id?: string
          created_at?: string
          id?: string
          metadata?: Json
          target_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_audit_events_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_audit_events_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      activities: {
        Row: {
          allowed_settings: string[]
          category: string
          created_at: string
          created_by_staff_id: string | null
          default_duration_minutes: number | null
          description: string
          id: string
          intensity: string
          is_active: boolean
          location: string | null
          max_participants: number
          min_participants: number
          mobility_notes: string | null
          title: string
          updated_at: string
        }
        Insert: {
          allowed_settings?: string[]
          category: string
          created_at?: string
          created_by_staff_id?: string | null
          default_duration_minutes?: number | null
          description: string
          id?: string
          intensity?: string
          is_active?: boolean
          location?: string | null
          max_participants: number
          min_participants?: number
          mobility_notes?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          allowed_settings?: string[]
          category?: string
          created_at?: string
          created_by_staff_id?: string | null
          default_duration_minutes?: number | null
          description?: string
          id?: string
          intensity?: string
          is_active?: boolean
          location?: string | null
          max_participants?: number
          min_participants?: number
          mobility_notes?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_created_by_staff_id_fkey"
            columns: ["created_by_staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_recurring_schedules: {
        Row: {
          activity_id: string
          created_at: string
          created_by_staff_id: string | null
          day_of_week: number
          end_time: string
          ended_at: string | null
          id: string
          interval_weeks: number
          is_active: boolean
          location: string | null
          max_participants: number | null
          min_participants: number | null
          series_ends_on: string
          series_starts_on: string
          start_time: string
          updated_at: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          created_by_staff_id?: string | null
          day_of_week: number
          end_time: string
          ended_at?: string | null
          id?: string
          interval_weeks?: number
          is_active?: boolean
          location?: string | null
          max_participants?: number | null
          min_participants?: number | null
          series_ends_on: string
          series_starts_on: string
          start_time: string
          updated_at?: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          created_by_staff_id?: string | null
          day_of_week?: number
          end_time?: string
          ended_at?: string | null
          id?: string
          interval_weeks?: number
          is_active?: boolean
          location?: string | null
          max_participants?: number | null
          min_participants?: number | null
          series_ends_on?: string
          series_starts_on?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_recurring_schedules_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_recurring_schedules_created_by_staff_id_fkey"
            columns: ["created_by_staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_session_participants: {
        Row: {
          admission_id: string
          assigned_at: string
          assigned_by_staff_id: string | null
          session_id: string
        }
        Insert: {
          admission_id: string
          assigned_at?: string
          assigned_by_staff_id?: string | null
          session_id: string
        }
        Update: {
          admission_id?: string
          assigned_at?: string
          assigned_by_staff_id?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_session_participants_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_session_participants_assigned_by_staff_id_fkey"
            columns: ["assigned_by_staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_session_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "activity_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_session_facilitators: {
        Row: {
          assigned_at: string
          assigned_by_staff_id: string | null
          session_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by_staff_id?: string | null
          session_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by_staff_id?: string | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_session_facilitators_assigned_by_staff_id_fkey"
            columns: ["assigned_by_staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_session_facilitators_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "activity_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_session_facilitators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_recurring_schedule_facilitators: {
        Row: {
          assigned_at: string
          assigned_by_staff_id: string | null
          recurring_schedule_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by_staff_id?: string | null
          recurring_schedule_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by_staff_id?: string | null
          recurring_schedule_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_recurring_schedule_facilitators_assigned_by_staff_id_fkey"
            columns: ["assigned_by_staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_recurring_schedule_facilitators_recurring_schedule_id_fkey"
            columns: ["recurring_schedule_id"]
            isOneToOne: false
            referencedRelation: "activity_recurring_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_recurring_schedule_facilitators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_sessions: {
        Row: {
          activity_id: string
          confirmed_at: string | null
          confirmed_by_staff_id: string | null
          created_at: string
          created_by_staff_id: string | null
          ends_at: string
          id: string
          is_detached: boolean
          location: string
          max_participants: number
          min_participants: number
          notes: string | null
          recurring_occurrence_date: string | null
          recurring_schedule_id: string | null
          session_kind: string
          starts_at: string
          status: string
          updated_at: string
        }
        Insert: {
          activity_id: string
          confirmed_at?: string | null
          confirmed_by_staff_id?: string | null
          created_at?: string
          created_by_staff_id?: string | null
          ends_at: string
          id?: string
          is_detached?: boolean
          location: string
          max_participants: number
          min_participants: number
          notes?: string | null
          recurring_occurrence_date?: string | null
          recurring_schedule_id?: string | null
          session_kind: string
          starts_at: string
          status?: string
          updated_at?: string
        }
        Update: {
          activity_id?: string
          confirmed_at?: string | null
          confirmed_by_staff_id?: string | null
          created_at?: string
          created_by_staff_id?: string | null
          ends_at?: string
          id?: string
          is_detached?: boolean
          location?: string
          max_participants?: number
          min_participants?: number
          notes?: string | null
          recurring_occurrence_date?: string | null
          recurring_schedule_id?: string | null
          session_kind?: string
          starts_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_sessions_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_sessions_confirmed_by_staff_id_fkey"
            columns: ["confirmed_by_staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_sessions_created_by_staff_id_fkey"
            columns: ["created_by_staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_sessions_recurring_schedule_id_fkey"
            columns: ["recurring_schedule_id"]
            isOneToOne: false
            referencedRelation: "activity_recurring_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      admissions: {
        Row: {
          admitted_on: string
          created_at: string
          created_by_staff_id: string | null
          department_id: string | null
          discharged_on: string | null
          expected_discharge_on: string | null
          id: string
          patient_id: string
          room_number: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admitted_on?: string
          created_at?: string
          created_by_staff_id?: string | null
          department_id?: string | null
          discharged_on?: string | null
          expected_discharge_on?: string | null
          id?: string
          patient_id: string
          room_number?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admitted_on?: string
          created_at?: string
          created_by_staff_id?: string | null
          department_id?: string | null
          discharged_on?: string | null
          expected_discharge_on?: string | null
          id?: string
          patient_id?: string
          room_number?: string | null
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
            foreignKeyName: "admissions_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
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
      departments: {
        Row: {
          code: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
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
          admission_id: string
          check_in_date: string
          created_at: string
          energy_level: number
          id: string
          mobility_level: number
          mood: number
          motivation_score: number
          note: string | null
          pain_score: number
          symptoms: string
          updated_at: string
        }
        Insert: {
          admission_id: string
          check_in_date: string
          created_at?: string
          energy_level: number
          id?: string
          mobility_level: number
          mood: number
          motivation_score: number
          note?: string | null
          pain_score: number
          symptoms?: string
          updated_at?: string
        }
        Update: {
          admission_id?: string
          check_in_date?: string
          created_at?: string
          energy_level?: number
          id?: string
          mobility_level?: number
          mood?: number
          motivation_score?: number
          note?: string | null
          pain_score?: number
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
        ]
      }
      patient_context: {
        Row: {
          additional_attention_notes: string | null
          additional_attention_points: string[]
          admission_id: string
          created_at: string
          fall_risk: string
          id: string
          isolation_type: string
          mobility_aid_available: string
          mobility_aid_type: string
          mobility_status: string
          notes: string | null
          requires_supervision: string
          room_restriction: string
          transfer_support: string
          updated_at: string
          updated_by_staff_id: string | null
        }
        Insert: {
          additional_attention_notes?: string | null
          additional_attention_points?: string[]
          admission_id: string
          created_at?: string
          fall_risk?: string
          id?: string
          isolation_type?: string
          mobility_aid_available?: string
          mobility_aid_type?: string
          mobility_status?: string
          notes?: string | null
          requires_supervision?: string
          room_restriction?: string
          transfer_support?: string
          updated_at?: string
          updated_by_staff_id?: string | null
        }
        Update: {
          additional_attention_notes?: string | null
          additional_attention_points?: string[]
          admission_id?: string
          created_at?: string
          fall_risk?: string
          id?: string
          isolation_type?: string
          mobility_aid_available?: string
          mobility_aid_type?: string
          mobility_status?: string
          notes?: string | null
          requires_supervision?: string
          room_restriction?: string
          transfer_support?: string
          updated_at?: string
          updated_by_staff_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_context_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: true
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_context_updated_by_staff_id_fkey"
            columns: ["updated_by_staff_id"]
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
          admission_id: string
          after_feeling_score: number
          created_at: string
          effort_score: number
          evaluation_date: string
          id: string
          notes: string | null
          reason: string | null
          status: string
          updated_at: string
        }
        Insert: {
          activity_session_id?: string | null
          activity_title: string
          admission_id: string
          after_feeling_score: number
          created_at?: string
          effort_score: number
          evaluation_date: string
          id?: string
          notes?: string | null
          reason?: string | null
          status: string
          updated_at?: string
        }
        Update: {
          activity_session_id?: string | null
          activity_title?: string
          admission_id?: string
          after_feeling_score?: number
          created_at?: string
          effort_score?: number
          evaluation_date?: string
          id?: string
          notes?: string | null
          reason?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_participation_evaluations_activity_session_id_fkey"
            columns: ["activity_session_id"]
            isOneToOne: false
            referencedRelation: "activity_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_participation_evaluations_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_questions: {
        Row: {
          admission_id: string
          answer_notes: string | null
          created_at: string
          id: string
          question_text: string
          status: string
          target_type: string
          updated_at: string
        }
        Insert: {
          admission_id: string
          answer_notes?: string | null
          created_at?: string
          id?: string
          question_text: string
          status?: string
          target_type: string
          updated_at?: string
        }
        Update: {
          admission_id?: string
          answer_notes?: string | null
          created_at?: string
          id?: string
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
        ]
      }
      patients: {
        Row: {
          birth_date: string | null
          created_at: string
          created_by_staff_id: string | null
          external_ref: string | null
          first_name: string
          id: string
          last_name: string
          sex: string | null
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          created_by_staff_id?: string | null
          external_ref?: string | null
          first_name: string
          id?: string
          last_name: string
          sex?: string | null
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          created_by_staff_id?: string | null
          external_ref?: string | null
          first_name?: string
          id?: string
          last_name?: string
          sex?: string | null
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
          is_active: boolean
          preferred_language: string
          updated_at: string
          volunteer_bio: string | null
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          is_active?: boolean
          preferred_language?: string
          updated_at?: string
          volunteer_bio?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          preferred_language?: string
          updated_at?: string
          volunteer_bio?: string | null
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
      volunteer_availability_exceptions: {
        Row: {
          created_at: string
          end_time: string
          exception_date: string
          id: string
          kind: string
          note: string | null
          start_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_time: string
          exception_date: string
          id?: string
          kind: string
          note?: string | null
          start_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_time?: string
          exception_date?: string
          id?: string
          kind?: string
          note?: string | null
          start_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_availability_exceptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteer_recurring_availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean
          start_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean
          start_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean
          start_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_recurring_availability_user_id_fkey"
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
      current_admission_ids: { Args: never; Returns: string[] }
      current_patient_ids: { Args: never; Returns: string[] }
      has_role: { Args: { role_name: string }; Returns: boolean }
      issue_patient_link_code: {
        Args: { p_created_by_staff_id: string; p_patient_id: string }
        Returns: Json
      }
      list_care_patients: {
        Args: never
        Returns: {
          admission_id: string
          birth_date: string
          expected_discharge_on: string
          first_name: string
          id: string
          last_name: string
          sex: string
          user_id: string
        }[]
      }
      list_facilitator_sessions: {
        Args: { p_from?: string; p_to?: string }
        Returns: {
          activity_description: string
          activity_title: string
          ends_at: string
          location: string
          participant_count: number
          participants: Json
          session_id: string
          starts_at: string
          status: string
        }[]
      }
      list_patient_activity_sessions: {
        Args: never
        Returns: {
          activity_description: string
          activity_title: string
          ends_at: string
          facilitator_names: string
          location: string
          session_id: string
          starts_at: string
        }[]
      }
      list_planning_patients: {
        Args: never
        Returns: {
          admission_id: string
          department_id: string
          department_name: string
          patient_display_name: string
          room_number: string
        }[]
      }
      list_planning_facilitator_candidates: {
        Args: { p_search?: string }
        Returns: {
          full_name: string
          role_names: string[]
          user_id: string
        }[]
      }
      list_planning_sessions: {
        Args: {
          p_from?: string
          p_session_kind?: string
          p_status?: string
          p_to?: string
        }
        Returns: {
          activity_category: string
          activity_description: string
          activity_id: string
          activity_intensity: string
          activity_title: string
          ends_at: string
          facilitator_count: number
          is_detached: boolean
          location: string
          max_participants: number
          min_participants: number
          participant_count: number
          recurring_schedule_id: string
          session_id: string
          session_kind: string
          starts_at: string
          status: string
        }[]
      }
      list_planning_volunteers: {
        Args: never
        Returns: {
          full_name: string
          user_id: string
          volunteer_bio: string
        }[]
      }
      materialize_recurring_sessions: {
        Args: { p_schedule_id: string; p_weeks_ahead?: number }
        Returns: number
      }
      planning_allowed_settings_valid: {
        Args: { settings: string[] }
        Returns: boolean
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
export type ActivityRow = Tables<"activities">;
export type ActivityRecurringScheduleRow = Tables<"activity_recurring_schedules">;
export type ActivitySessionRow = Tables<"activity_sessions">;
export type ActivitySessionParticipantRow = Tables<"activity_session_participants">;
export type ActivitySessionFacilitatorRow = Tables<"activity_session_facilitators">;
export type ActivityRecurringScheduleFacilitatorRow =
  Tables<"activity_recurring_schedule_facilitators">;
export type VolunteerRecurringAvailabilityRow =
  Tables<"volunteer_recurring_availability">;
export type VolunteerAvailabilityExceptionRow =
  Tables<"volunteer_availability_exceptions">;

export type RoleName =
  | "patient"
  | "caregiver"
  | "activity_coordinator"
  | "volunteer"
  | "admin";

export type AccountAuditEventRow = Tables<"account_audit_events">;
