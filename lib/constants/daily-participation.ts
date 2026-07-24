/**
 * Fixed daily participation structure for the planning proof-of-concept.
 * Block times and room are application constants — not database-managed locations.
 */

export const PARTICIPATION_BLOCKS = {
  morning: {
    id: "morning",
    start: "10:00",
    end: "12:00",
    label: "10:00–12:00",
    dutchTitle: "Ochtend",
    dutchDescription:
      "Individuele momenten tussen een patiënt en een vrijwilliger. De concrete invulling wordt in onderling overleg bepaald.",
  },
  afternoon: {
    id: "afternoon",
    start: "14:00",
    end: "16:00",
    label: "14:00–16:00",
    dutchTitle: "Middag",
    dutchDescription:
      "Een gezamenlijke groepsactiviteit in dit tijdvak. De concrete invulling kan later vandaag worden afgestemd.",
  },
} as const;

export type ParticipationBlockId = keyof typeof PARTICIPATION_BLOCKS;

/** Stable block identifiers for volunteer absences */
export const PARTICIPATION_BLOCK_VALUES = [
  "morning",
  "afternoon",
] as const satisfies readonly ParticipationBlockId[];

/** Fixed shared room for the afternoon group block. */
export const AFTERNOON_GROUP_ROOM_NAME =
  "Gemeenschappelijke activiteitenruimte";

/** Display-only capacity for the afternoon group block. Not enforced in the database. */
export const AFTERNOON_GROUP_MAX_CAPACITY = 10;

/** Shown on patient and coordinator views — not clinically validated by the app. */
export const AFTERNOON_REQUIRES_INDEPENDENT_ACCESS = true;

export const AFTERNOON_INDEPENDENT_ACCESS_COPY =
  "Je moet de ruimte zelfstandig kunnen bereiken.";

/** Stable internal values stored on patient_checkins.participation_needs */
export const PARTICIPATION_NEED_VALUES = [
  "social",
  "movement",
  "creative",
  "relaxation",
] as const;

export type ParticipationNeedValue = (typeof PARTICIPATION_NEED_VALUES)[number];

/** Dutch UI labels for participation needs */
export const PARTICIPATION_NEED_LABELS: Record<ParticipationNeedValue, string> =
  {
    social: "Sociaal contact",
    movement: "Beweging",
    creative: "Creatieve activiteit",
    relaxation: "Ontspanning",
  };

/** Afternoon activity categories align with patient need values */
export const AFTERNOON_CATEGORY_VALUES = PARTICIPATION_NEED_VALUES;

export type AfternoonCategoryValue = ParticipationNeedValue;

export const AFTERNOON_CATEGORY_LABELS = PARTICIPATION_NEED_LABELS;

/** Minimum volunteers available in the morning block to signal "reasonable" individual contact to AI */
export const MORNING_CONTACT_AVAILABILITY_THRESHOLD = 1;

/** Shown when a volunteer saves weekly availability changes */
export const WEEKLY_AVAILABILITY_CHANGE_CONFIRMATION =
  "Het wijzigen van je wekelijkse beschikbaarheid kan invloed hebben op toekomstige vrijwilligersplanning.";

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
