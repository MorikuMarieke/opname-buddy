import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export function isAuthUserBanned(user: User | undefined): boolean {
  if (!user?.banned_until) {
    return false;
  }

  return new Date(user.banned_until) > new Date();
}

export function isProfileAccountActive(
  profile: { is_active: boolean } | null | undefined,
): boolean {
  return profile?.is_active !== false;
}

export function isAccountActiveState(
  profile: { is_active: boolean } | null | undefined,
  authUser: User | undefined,
): boolean {
  if (!isProfileAccountActive(profile)) {
    return false;
  }

  return !isAuthUserBanned(authUser);
}

export async function getProfileAccountActive(
  userId: string,
): Promise<boolean | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("is_active")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[account-active] Failed to load profile state:", error.message);
    return null;
  }

  if (!data) {
    return null;
  }

  return data.is_active;
}

export async function isCurrentAccountActive(user: User): Promise<boolean> {
  if (isAuthUserBanned(user)) {
    return false;
  }

  const profileActive = await getProfileAccountActive(user.id);

  if (profileActive === false) {
    return false;
  }

  return true;
}

export async function signOutCurrentUser(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
