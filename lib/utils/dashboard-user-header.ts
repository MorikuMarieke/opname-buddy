import type { User } from "@supabase/supabase-js";

import { ROLE_LABELS } from "@/lib/constants/admin-account-copy";
import type { Profile, RoleName } from "@/types/database";

export interface DashboardUserHeader {
  displayName: string;
  roleLabel: string | null;
  initials: string;
}

const ROLE_PRIORITY: RoleName[] = [
  "admin",
  "caregiver",
  "activity_coordinator",
  "patient",
];

export function resolveUserDisplayName(
  user: User,
  profile: Profile | null,
): string {
  const profileName = profile?.full_name?.trim();

  if (profileName) {
    return profileName;
  }

  const displayName = user.user_metadata?.display_name;

  if (typeof displayName === "string" && displayName.trim()) {
    return displayName.trim();
  }

  if (user.email) {
    return user.email;
  }

  return "Gebruiker";
}

export function getUserInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  }

  if (parts.length === 1 && parts[0]) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return "??";
}

export function getPrimaryRoleLabel(roles: RoleName[]): string | null {
  for (const role of ROLE_PRIORITY) {
    if (roles.includes(role)) {
      return ROLE_LABELS[role];
    }
  }

  return null;
}

export function buildDashboardUserHeader(
  user: User,
  profile: Profile | null,
  roles: RoleName[],
): DashboardUserHeader {
  const displayName = resolveUserDisplayName(user, profile);

  return {
    displayName,
    roleLabel: getPrimaryRoleLabel(roles),
    initials: getUserInitials(displayName),
  };
}
