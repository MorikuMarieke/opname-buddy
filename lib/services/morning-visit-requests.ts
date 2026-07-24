import { createClient } from "@/lib/supabase/client";
import { filterValidInspirationIds } from "@/lib/constants/visit-inspirations";
import { getAmsterdamDateString } from "@/lib/utils/amsterdam-date";
import { getActiveAdmissionId } from "@/lib/services/admissions";
import {
  assertVolunteerSafeMorningVisitDto,
  deriveMorningVisitDecisionContext,
} from "@/lib/services/morning-visit-decision-context";
import type {
  MorningVisitRequestListItem,
  MorningVolunteerVisitRequest,
} from "@/types/daily-advice";

function getSupabaseErrorMessage(error: { message: string; code?: string }): string {
  if (error.message.includes("permission denied")) {
    return "Je hebt geen toegang tot deze actie.";
  }

  if (error.code === "23505") {
    return "Je hebt vandaag al een actief verzoek staan.";
  }

  return "Er ging iets mis. Probeer het opnieuw.";
}

export async function getOwnMorningVisitRequest(
  requestDate = getAmsterdamDateString(),
): Promise<MorningVolunteerVisitRequest | null> {
  const supabase = createClient();
  const admissionId = await getActiveAdmissionId();

  if (!admissionId) {
    return null;
  }

  const { data, error } = await supabase
    .from("morning_volunteer_visit_requests")
    .select("*")
    .eq("admission_id", admissionId)
    .eq("request_date", requestDate)
    .eq("status", "requested")
    .maybeSingle();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return data;
}

export async function createMorningVisitRequest(input: {
  patientMessage?: string;
  inspirationIds?: string[];
}): Promise<MorningVolunteerVisitRequest> {
  const supabase = createClient();
  const admissionId = await getActiveAdmissionId();

  if (!admissionId) {
    throw new Error("Geen actieve opname gevonden.");
  }

  const requestDate = getAmsterdamDateString();

  const { data, error } = await supabase
    .from("morning_volunteer_visit_requests")
    .insert({
      admission_id: admissionId,
      request_date: requestDate,
      block: "morning",
      patient_message: input.patientMessage?.trim() || null,
      inspiration_ids: filterValidInspirationIds(input.inspirationIds ?? []),
      status: "requested",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return data;
}

export async function cancelMorningVisitRequest(
  requestId: string,
): Promise<MorningVolunteerVisitRequest> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("morning_volunteer_visit_requests")
    .update({ status: "cancelled" })
    .eq("id", requestId)
    .eq("status", "requested")
    .select("*")
    .single();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return data;
}

export async function listMorningVisitRequestsForDate(
  requestDate = getAmsterdamDateString(),
): Promise<MorningVisitRequestListItem[]> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc(
    "list_morning_volunteer_visit_requests",
    { p_request_date: requestDate },
  );

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return (data ?? []).map((row) => {
    const decision = deriveMorningVisitDecisionContext({
      can_independently_reach_activity_room:
        row.can_independently_reach_activity_room,
      visit_activity_possibility: row.visit_activity_possibility,
      room_restriction: row.room_restriction,
    });

    const item: MorningVisitRequestListItem = {
      id: row.id,
      admission_id: row.admission_id,
      request_date: row.request_date,
      block: row.block,
      patient_message: row.patient_message,
      inspiration_ids: row.inspiration_ids ?? [],
      status: row.status,
      created_at: row.created_at,
      patient_display_name: row.patient_display_name,
      room_number: row.room_number,
      cannot_participate_in_afternoon_activity:
        decision.cannot_participate_in_afternoon_activity,
      requires_protection_before_room_entry:
        decision.requires_protection_before_room_entry,
    };

    assertVolunteerSafeMorningVisitDto(
      item as unknown as Record<string, unknown>,
    );

    return item;
  });
}
