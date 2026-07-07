import type { RoleName } from "@/types/database";

export const STAFF_ROLE_NAMES = [
  "caregiver",
  "activity_coordinator",
  "admin",
] as const satisfies readonly RoleName[];

export const ROLE_LABELS: Record<RoleName, string> = {
  patient: "Patiënt",
  caregiver: "Zorgverlener",
  activity_coordinator: "Activiteitencoördinator",
  admin: "Beheerder",
};

export const ROLE_DESCRIPTIONS: Record<RoleName, string> = {
  patient: "Toegang tot het patiëntdashboard en eigen zorggegevens.",
  caregiver: "Toegang tot het zorgdashboard en patiëntinformatie.",
  activity_coordinator: "Beheer van activiteiten, sessies en vrijwilligers.",
  admin: "Beheer van gebruikers, rollen en accountinstellingen.",
};

export type StaffRoleName = (typeof STAFF_ROLE_NAMES)[number];

