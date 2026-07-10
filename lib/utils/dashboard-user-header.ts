import type { User } from "@supabase/supabase-js";

import { ROLE_LABELS } from "@/lib/constants/admin-account-copy";
import { getPrimaryRole } from "@/lib/auth/get-primary-role";
import type { Profile, RoleName } from "@/types/database";

export interface DashboardUserHeader {
  displayName: string;
  roleLabel: string | null;
  initials: string;
}

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
  const role = getPrimaryRole(roles);

  return role ? ROLE_LABELS[role] : null;
}

export function buildDashboardUserHeader(
  user: User,
  profile: Profile | null,
  roles: RoleName[],
  activeRole?: RoleName,
): DashboardUserHeader {
  const displayName = resolveUserDisplayName(user, profile);
  const role =
    activeRole && roles.includes(activeRole) ? activeRole : getPrimaryRole(roles);

  return {
    displayName,
    roleLabel: role ? ROLE_LABELS[role] : null,
    initials: getUserInitials(displayName),
  };
}
