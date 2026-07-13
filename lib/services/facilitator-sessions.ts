import { createClient } from "@/lib/supabase/client";
import { isSessionStatus } from "@/lib/constants/planning-enums";
import type {
  FacilitatorSessionListItem,
  FacilitatorSessionParticipantPickup,
} from "@/types/activity";

function parseParticipantPickups(
  value: unknown,
): FacilitatorSessionParticipantPickup[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const record = item as Record<string, unknown>;
    if (typeof record.displayName !== "string") {
      return [];
    }

    return [
      {
        displayName: record.displayName,
        departmentName:
          typeof record.departmentName === "string"
            ? record.departmentName
            : null,
        roomNumber:
          typeof record.roomNumber === "string" ? record.roomNumber : null,
      },
    ];
  });
}

function getSupabaseErrorMessage(error: { message: string }): string {
  if (error.message.includes("permission denied")) {
    return "Je hebt geen toegang tot deze actie.";
  }

  return "Er ging iets mis. Probeer het opnieuw.";
}

export async function listFacilitatorSessions(
  from?: string,
  to?: string,
): Promise<FacilitatorSessionListItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("list_facilitator_sessions", {
    p_from: from ?? new Date().toISOString(),
    p_to:
      to ??
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return (data ?? []).map((row) => ({
    sessionId: row.session_id,
    activityTitle: row.activity_title,
    activityDescription: row.activity_description,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    location: row.location,
    status: isSessionStatus(row.status) ? row.status : "draft",
    participantCount: Number(row.participant_count),
    participants: parseParticipantPickups(row.participants),
  }));
}
