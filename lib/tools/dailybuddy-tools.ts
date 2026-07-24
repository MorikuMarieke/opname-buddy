import type { SupabaseClient } from "@supabase/supabase-js";
import { tool } from "ai";
import { z } from "zod";

import { deriveParticipationFacts } from "@/lib/ai/participation-advice-policy";
import { getAmsterdamDateString } from "@/lib/utils/amsterdam-date";
import type { Database } from "@/types/database";

type ServerSupabase = SupabaseClient<Database>;

export class DailyBuddyToolFailureError extends Error {
  constructor(toolName: string, cause: string) {
    super(`DailyBuddy tool "${toolName}" failed: ${cause}`);
    this.name = "DailyBuddyToolFailureError";
  }
}

export interface DailyBuddyToolContext {
  supabase: ServerSupabase;
  admissionId: string;
  adviceDate: string;
}

/**
 * Essential tools throw on query/RPC failure so generation stops.
 * Valid absence (e.g. no plan row) returns null data with ok: true.
 */
export function createDailyBuddyTools(ctx: DailyBuddyToolContext) {
  return {
    getPatientCheckin: tool({
      description:
        "Haal de check-in van vandaag op voor deze patiënt (pijn, energie, stemming, mobiliteit, symptomen, notitie, participatiebehoeften).",
      inputSchema: z.object({}),
      execute: async () => {
        const { data, error } = await ctx.supabase
          .from("patient_checkins")
          .select(
            "id, check_in_date, pain_score, energy_level, mood, mobility_level, motivation_score, participation_needs, symptoms, note, created_at",
          )
          .eq("admission_id", ctx.admissionId)
          .eq("check_in_date", ctx.adviceDate)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          throw new DailyBuddyToolFailureError(
            "getPatientCheckin",
            error.message,
          );
        }

        return { ok: true as const, checkin: data };
      },
    }),

    getPatientContext: tool({
      description:
        "Haal goedgekeurde participatiefeiten en praktische zorgcontext op. Gebruik participation_routes als autoritatieve route-feiten (niet zelf afleiden). Alleen can_independently_reach_activity_room=yes mag middaggroep overwegen wanneer afternoon_activity dat toelaat. additional_attention_points zijn alleen praktische herinneringen, geen routebeslissing.",
      inputSchema: z.object({}),
      execute: async () => {
        const { data, error } = await ctx.supabase
          .from("patient_context")
          .select(
            "mobility_status, transfer_support, fall_risk, requires_supervision, mobility_aid_type, mobility_aid_available, visit_activity_possibility, room_restriction, can_independently_reach_activity_room, additional_attention_points",
          )
          .eq("admission_id", ctx.admissionId)
          .maybeSingle();

        if (error) {
          throw new DailyBuddyToolFailureError(
            "getPatientContext",
            error.message,
          );
        }

        if (!data) {
          return { ok: true as const, context: null };
        }

        const {
          visit_activity_possibility: visitActivityPossibility,
          ...practicalContext
        } = data;

        return {
          ok: true as const,
          context: {
            ...practicalContext,
            participation_routes: deriveParticipationFacts(
              visitActivityPossibility,
            ),
          },
        };
      },
    }),

    getDailyParticipationPlan: tool({
      description:
        "Haal het geregistreerde middagplan van vandaag op (categorie, titel, deelnemersbericht). Verzin nooit zelf een activiteit. plan=null of ontbrekende titel betekent dat de concrete invulling nog niet bekend is (er is wel een vast middagvak); dat is geen fout.",
      inputSchema: z.object({}),
      execute: async () => {
        const { data, error } = await ctx.supabase
          .from("daily_participation_plans")
          .select(
            "plan_date, afternoon_category, afternoon_title, participant_message, updated_at",
          )
          .eq("plan_date", ctx.adviceDate)
          .maybeSingle();

        if (error) {
          throw new DailyBuddyToolFailureError(
            "getDailyParticipationPlan",
            error.message,
          );
        }

        return { ok: true as const, plan: data };
      },
    }),

    getMorningVolunteerAvailabilitySignal: tool({
      description:
        "Boolean of er ochtend-vrijwilligerscontact (10:00–12:00) redelijkerwijs beschikbaar is. Geen namen of roosters.",
      inputSchema: z.object({}),
      execute: async () => {
        const { data, error } = await ctx.supabase.rpc(
          "get_morning_contact_availability_signal",
          { p_plan_date: ctx.adviceDate },
        );

        if (error) {
          throw new DailyBuddyToolFailureError(
            "getMorningVolunteerAvailabilitySignal",
            error.message,
          );
        }

        return {
          ok: true as const,
          morning_available: Boolean(data),
          block: "10:00–12:00",
        };
      },
    }),
  };
}

export function todayAdviceDate(): string {
  return getAmsterdamDateString();
}
