import { createClient } from "@/lib/supabase/client";
import type {
  Activity,
  CreateActivityInput,
  UpdateActivityInput,
} from "@/types/activity";
import type { ActivityRow } from "@/types/database";

function getSupabaseErrorMessage(error: { message: string; code?: string }): string {
  if (error.message.includes("permission denied")) {
    return "Je hebt geen toegang tot deze actie.";
  }

  if (
    error.message.includes("does not exist") ||
    error.code === "42P01"
  ) {
    return "De database is nog niet bijgewerkt. Neem contact op met beheer.";
  }

  if (error.code === "23514") {
    return "Controleer de ingevulde waarden en probeer opnieuw.";
  }

  return "Er ging iets mis. Probeer het opnieuw.";
}

function mapActivity(row: ActivityRow): Activity {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category as Activity["category"],
    intensity: row.intensity as Activity["intensity"],
    location: row.location,
    allowedSettings: row.allowed_settings as Activity["allowedSettings"],
    defaultDurationMinutes: row.default_duration_minutes,
    minParticipants: row.min_participants,
    maxParticipants: row.max_participants,
    requiresSupervision: row.requires_supervision,
    requiresVolunteer: row.requires_volunteer,
    mobilityNotes: row.mobility_notes,
    isActive: row.is_active,
    createdByStaffId: row.created_by_staff_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toInsertPayload(input: CreateActivityInput, staffId: string) {
  return {
    title: input.title.trim(),
    description: input.description.trim(),
    category: input.category,
    intensity: input.intensity,
    location: input.location?.trim() || null,
    allowed_settings: input.allowedSettings,
    default_duration_minutes: input.defaultDurationMinutes,
    min_participants: input.minParticipants,
    max_participants: input.maxParticipants,
    requires_supervision: input.requiresSupervision,
    requires_volunteer: input.requiresVolunteer,
    mobility_notes: input.mobilityNotes?.trim() || null,
    created_by_staff_id: staffId,
  };
}

function toUpdatePayload(input: UpdateActivityInput): Partial<ActivityRow> {
  const payload: Partial<ActivityRow> = {};

  if (input.title !== undefined) payload.title = input.title.trim();
  if (input.description !== undefined) payload.description = input.description.trim();
  if (input.category !== undefined) payload.category = input.category;
  if (input.intensity !== undefined) payload.intensity = input.intensity;
  if (input.location !== undefined) payload.location = input.location?.trim() || null;
  if (input.allowedSettings !== undefined) payload.allowed_settings = input.allowedSettings;
  if (input.defaultDurationMinutes !== undefined) {
    payload.default_duration_minutes = input.defaultDurationMinutes;
  }
  if (input.minParticipants !== undefined) payload.min_participants = input.minParticipants;
  if (input.maxParticipants !== undefined) payload.max_participants = input.maxParticipants;
  if (input.requiresSupervision !== undefined) {
    payload.requires_supervision = input.requiresSupervision;
  }
  if (input.requiresVolunteer !== undefined) payload.requires_volunteer = input.requiresVolunteer;
  if (input.mobilityNotes !== undefined) {
    payload.mobility_notes = input.mobilityNotes?.trim() || null;
  }
  if (input.isActive !== undefined) payload.is_active = input.isActive;

  return payload;
}

async function getCurrentStaffId(): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Je bent niet ingelogd.");
  }

  return user.id;
}

export async function listActivities(): Promise<Activity[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .order("title", { ascending: true });

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return (data ?? []).map(mapActivity);
}

export async function getActivity(activityId: string): Promise<Activity> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("id", activityId)
    .single();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return mapActivity(data);
}

export async function createActivity(input: CreateActivityInput): Promise<Activity> {
  const supabase = createClient();
  const staffId = await getCurrentStaffId();

  const { data, error } = await supabase
    .from("activities")
    .insert(toInsertPayload(input, staffId))
    .select()
    .single();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return mapActivity(data);
}

export async function updateActivity(
  activityId: string,
  input: UpdateActivityInput,
): Promise<Activity> {
  const supabase = createClient();
  const payload = toUpdatePayload(input);

  if (Object.keys(payload).length === 0) {
    return getActivity(activityId);
  }

  const { data, error } = await supabase
    .from("activities")
    .update(payload)
    .eq("id", activityId)
    .select()
    .single();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return mapActivity(data);
}

export async function setActivityActive(
  activityId: string,
  isActive: boolean,
): Promise<Activity> {
  return updateActivity(activityId, { isActive });
}
