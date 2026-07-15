import type { RoleName } from "@/types/database";

export const ROLE_PRIORITY: RoleName[] = [
  "admin",
  "activity_coordinator",
  "caregiver",
  "volunteer",
  "patient",
];

export const ROLE_ROUTES: Record<RoleName, string> = {
  admin: "/admin",
  activity_coordinator: "/planning",
  caregiver: "/care",
  volunteer: "/volunteer",
  patient: "/dashboard",
};

const ROLE_NAMES = new Set<string>(ROLE_PRIORITY);

export function isRoleName(value: string): value is RoleName {
  return ROLE_NAMES.has(value);
}
