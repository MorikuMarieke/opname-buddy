import { createClient } from "@/lib/supabase/client";
import type { VolunteerSessionListItem } from "@/types/activity";
import type { SessionStatus } from "@/lib/constants/planning-enums";
import { isSessionStatus } from "@/lib/constants/planning-enums";

function getSupabaseErrorMessage(error: { message: string; code?: string }): string {
  if (error.message.includes("permission denied")) {
    return "Je hebt geen toegang tot deze actie.";
  }

  if (error.message.includes("does not exist") || error.code === "42P01") {
    return "De database is nog niet bijgewerkt. Neem contact op met beheer.";
  }

  return "Er ging iets mis. Probeer het opnieuw.";
}

interface VolunteerSessionRow {
  session_id: string;
  activity_title: string;
  starts_at: string;
  ends_at: string;
  location: string;
  status: string;
  participants: Array<{
    display_name: string;
    department_name: string | null;
    room_number: string | null;
  }> | null;
}

export async function listVolunteerSessions(options?: {
  from?: string;
  to?: string;
}): Promise<VolunteerSessionListItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("list_volunteer_sessions", {
    p_from: options?.from ?? new Date().toISOString(),
    p_to:
      options?.to ??
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return ((data ?? []) as VolunteerSessionRow[]).map((row) => ({
    sessionId: row.session_id,
    activityTitle: row.activity_title,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    location: row.location,
    status: isSessionStatus(row.status) ? row.status : ("proposed" as SessionStatus),
    participants: (row.participants ?? []).map((participant) => ({
      displayName: participant.display_name,
      departmentName: participant.department_name,
      roomNumber: participant.room_number,
    })),
  }));
}
