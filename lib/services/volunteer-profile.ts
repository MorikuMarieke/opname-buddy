import { createClient } from "@/lib/supabase/client";
import { volunteerBioSchema } from "@/lib/validations/volunteer-profile";

function getSupabaseErrorMessage(error: { message: string; code?: string }): string {
  if (error.message.includes("permission denied")) {
    return "Je hebt geen toegang tot deze actie.";
  }

  if (error.message.includes("profiles_volunteer_bio_length_check")) {
    return "Maximaal 500 tekens.";
  }

  return "Er ging iets mis. Probeer het opnieuw.";
}

async function getCurrentUserId(): Promise<string> {
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

export interface VolunteerProfile {
  userId: string;
  fullName: string | null;
  volunteerBio: string | null;
}

export async function getVolunteerProfile(): Promise<VolunteerProfile> {
  const supabase = createClient();
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, volunteer_bio")
    .eq("id", userId)
    .single();

  if (error || !data) {
    throw new Error(getSupabaseErrorMessage(error ?? { message: "Profile not found" }));
  }

  return {
    userId: data.id,
    fullName: data.full_name,
    volunteerBio: data.volunteer_bio,
  };
}

export async function updateVolunteerBio(bio: string | null): Promise<VolunteerProfile> {
  const parsed = volunteerBioSchema.safeParse(bio ?? "");

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Ongeldige invoer.");
  }

  const supabase = createClient();
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("profiles")
    .update({ volunteer_bio: parsed.data })
    .eq("id", userId)
    .select("id, full_name, volunteer_bio")
    .single();

  if (error || !data) {
    throw new Error(getSupabaseErrorMessage(error ?? { message: "Update failed" }));
  }

  return {
    userId: data.id,
    fullName: data.full_name,
    volunteerBio: data.volunteer_bio,
  };
}
