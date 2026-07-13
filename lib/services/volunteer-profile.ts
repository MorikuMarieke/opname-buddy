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

async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Je bent niet ingelogd.");
  }

  return user;
}

export interface VolunteerProfile {
  userId: string;
  fullName: string | null;
  email: string | null;
  preferredLanguage: string;
  volunteerBio: string | null;
}

function mapVolunteerProfile(
  profile: {
    id: string;
    full_name: string | null;
    preferred_language: string;
    volunteer_bio: string | null;
  },
  email: string | null,
): VolunteerProfile {
  return {
    userId: profile.id,
    fullName: profile.full_name,
    email,
    preferredLanguage: profile.preferred_language,
    volunteerBio: profile.volunteer_bio,
  };
}

export async function getVolunteerProfile(): Promise<VolunteerProfile> {
  const supabase = createClient();
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, volunteer_bio, preferred_language")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    throw new Error(getSupabaseErrorMessage(error ?? { message: "Profile not found" }));
  }

  return mapVolunteerProfile(data, user.email ?? null);
}

export async function updateVolunteerBio(bio: string | null): Promise<VolunteerProfile> {
  const parsed = volunteerBioSchema.safeParse(bio ?? "");

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Ongeldige invoer.");
  }

  const supabase = createClient();
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from("profiles")
    .update({ volunteer_bio: parsed.data })
    .eq("id", user.id)
    .select("id, full_name, volunteer_bio, preferred_language")
    .single();

  if (error || !data) {
    throw new Error(getSupabaseErrorMessage(error ?? { message: "Update failed" }));
  }

  return mapVolunteerProfile(data, user.email ?? null);
}
