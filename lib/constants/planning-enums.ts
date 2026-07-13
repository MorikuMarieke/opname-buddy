/**
 * Shared planning enums — single source for DB CHECK constraints, Zod, and UI selects.
 * Keep in sync with supabase/migrations/00039+ planning schema.
 */

export const ACTIVITY_CATEGORIES = [
  "creative",
  "movement",
  "social",
  "relaxation",
  "other",
] as const;

export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number];

export const ACTIVITY_INTENSITIES = ["low", "medium", "high"] as const;

export type ActivityIntensity = (typeof ACTIVITY_INTENSITIES)[number];

export const ACTIVITY_ALLOWED_SETTINGS = [
  "bed",
  "chair",
  "room",
  "ward",
  "outside",
] as const;

export type ActivityAllowedSetting = (typeof ACTIVITY_ALLOWED_SETTINGS)[number];

export const SESSION_KINDS = ["recurring_instance", "one_off"] as const;

export type SessionKind = (typeof SESSION_KINDS)[number];

export const SESSION_STATUSES = [
  "draft",
  "confirmed",
  "completed",
  "cancelled",
] as const;

export type SessionStatus = (typeof SESSION_STATUSES)[number];

/** Valid status transitions for coordinator workflow (human approval). */
export const SESSION_STATUS_TRANSITIONS: Record<
  SessionStatus,
  readonly SessionStatus[]
> = {
  draft: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export const AVAILABILITY_EXCEPTION_KINDS = ["extra", "unavailable"] as const;

export type AvailabilityExceptionKind =
  (typeof AVAILABILITY_EXCEPTION_KINDS)[number];

/** 0 = Sunday … 6 = Saturday (matches PostgreSQL extract(dow)). */
export const DAYS_OF_WEEK = [0, 1, 2, 3, 4, 5, 6] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export const DAY_OF_WEEK_LABELS: Record<DayOfWeek, string> = {
  0: "Zondag",
  1: "Maandag",
  2: "Dinsdag",
  3: "Woensdag",
  4: "Donderdag",
  5: "Vrijdag",
  6: "Zaterdag",
};

/** Weeks of draft sessions to materialize from a recurring schedule. */
export const RECURRING_MATERIALIZE_WEEKS_AHEAD = 4;

export function isActivityCategory(value: string): value is ActivityCategory {
  return (ACTIVITY_CATEGORIES as readonly string[]).includes(value);
}

export function isActivityIntensity(value: string): value is ActivityIntensity {
  return (ACTIVITY_INTENSITIES as readonly string[]).includes(value);
}

export function isSessionStatus(value: string): value is SessionStatus {
  return (SESSION_STATUSES as readonly string[]).includes(value);
}

export function canTransitionSessionStatus(
  from: SessionStatus,
  to: SessionStatus,
): boolean {
  return SESSION_STATUS_TRANSITIONS[from].includes(to);
}

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  draft: "Gepland",
  confirmed: "Gepubliceerd",
  completed: "Voltooid",
  cancelled: "Geannuleerd",
};

export const RECURRING_INTERVAL_WEEKS = [1, 2, 4] as const;

export type RecurringIntervalWeeks = (typeof RECURRING_INTERVAL_WEEKS)[number];

export const SESSION_KIND_LABELS: Record<SessionKind, string> = {
  recurring_instance: "Terugkerend",
  one_off: "Eenmalig",
};
