import type {
  ActivityRoomAccess,
  AdviceAfternoonStatus,
  AdvicePrimaryOutcome,
  AdviceStatus,
} from "@/types/daily-advice";
import type { DailyBuddyStructuredOutput } from "@/lib/validations/daily-advice";
import type { InspirationCareContext } from "@/lib/ai/inspiration-filter";

/** Patient-visible wording for visit_allowed_with_protection (facts + fallbacks). */
export const VISIT_PROTECTION_PATIENT_REASON =
  "Bij bezoek op de afdeling zijn beschermingsmaatregelen nodig.";

export const VISIT_PROTECTION_FALLBACK =
  "Bezoek op de afdeling kan mogelijk zijn. De vrijwilliger volgt daarbij de benodigde beschermingsmaatregelen.";

export const NO_NON_CARE_CONTACT_FALLBACK =
  "Vanwege de afspraken in je zorgcontext stellen we vandaag geen bezoek op de afdeling of gezamenlijke activiteit voor.";

/** On-ward visit allowed when other conditions allow it. */
export function allowsOnWardVisit(
  visitActivityPossibility: string | null | undefined,
): boolean {
  return (
    visitActivityPossibility === "no_relevant_restriction" ||
    visitActivityPossibility === "visit_allowed_with_protection"
  );
}

/** Afternoon group / interest only when no relevant restriction. */
export function allowsAfternoonGroupFromVisitPossibility(
  visitActivityPossibility: string | null | undefined,
): boolean {
  return visitActivityPossibility === "no_relevant_restriction";
}

export function blocksAllNonCareContact(
  visitActivityPossibility: string | null | undefined,
): boolean {
  return visitActivityPossibility === "no_non_care_contact";
}

export type OnWardVisitFact =
  | "allowed"
  | "allowed_with_protection"
  | "not_offered";

export type AfternoonActivityFact =
  | "allowed_when_other_conditions"
  | "not_offered";

export interface ParticipationRouteFacts {
  on_ward_visit: OnWardVisitFact;
  afternoon_activity: AfternoonActivityFact;
  patient_visible_reason: string | null;
}

/** Approved participation facts for the LLM (not clinical isolation terminology). */
export function deriveParticipationFacts(
  visitActivityPossibility: string | null | undefined,
): ParticipationRouteFacts {
  if (visitActivityPossibility === "no_relevant_restriction") {
    return {
      on_ward_visit: "allowed",
      afternoon_activity: "allowed_when_other_conditions",
      patient_visible_reason: null,
    };
  }

  if (visitActivityPossibility === "visit_allowed_with_protection") {
    return {
      on_ward_visit: "allowed_with_protection",
      afternoon_activity: "not_offered",
      patient_visible_reason: VISIT_PROTECTION_PATIENT_REASON,
    };
  }

  return {
    on_ward_visit: "not_offered",
    afternoon_activity: "not_offered",
    patient_visible_reason:
      visitActivityPossibility === "no_non_care_contact"
        ? NO_NON_CARE_CONTACT_FALLBACK
        : null,
  };
}

/** Only `yes` may be considered for afternoon group activity or interest. */
export function canConsiderAfternoonActivity(
  access: ActivityRoomAccess | string | null | undefined,
): boolean {
  return access === "yes";
}

export function isRoomOnlyRestriction(
  roomRestriction: string | null | undefined,
): boolean {
  return roomRestriction === "room_only";
}

/** Group afternoon route (plan recommend, awaiting, interest CTA). */
export function canConsiderAfternoonGroupRoute(input: {
  access: string | null | undefined;
  visitActivityPossibility?: string | null | undefined;
  roomRestriction?: string | null | undefined;
}): boolean {
  return (
    canConsiderAfternoonActivity(input.access) &&
    allowsAfternoonGroupFromVisitPossibility(input.visitActivityPossibility) &&
    !isRoomOnlyRestriction(input.roomRestriction)
  );
}

export function afternoonStatusForAccess(
  access: ActivityRoomAccess | string | null | undefined,
  hasPlan: boolean,
  careRoute?: {
    visitActivityPossibility?: string | null | undefined;
    roomRestriction?: string | null | undefined;
  },
): AdviceAfternoonStatus {
  if (
    !canConsiderAfternoonGroupRoute({
      access,
      visitActivityPossibility: careRoute?.visitActivityPossibility,
      roomRestriction: careRoute?.roomRestriction,
    })
  ) {
    return "not_recommended";
  }

  if (!hasPlan) {
    return "pending_plan";
  }

  return "none";
}

export function isAdviceStale(
  status: AdviceStatus,
  sourceCheckinId: string | null,
  latestCheckinId: string | null,
): boolean {
  if (status === "stale") {
    return true;
  }

  if (!latestCheckinId) {
    return false;
  }

  return sourceCheckinId !== latestCheckinId;
}

/** Fingerprint of care fields that change participation routing. */
export function buildCareContextFingerprint(
  context: Pick<
    InspirationCareContext,
    | "can_independently_reach_activity_room"
    | "visit_activity_possibility"
    | "room_restriction"
    | "requires_supervision"
    | "mobility_status"
    | "transfer_support"
    | "fall_risk"
  > | null,
): string {
  return [
    context?.can_independently_reach_activity_room ?? "unknown",
    context?.visit_activity_possibility ?? "unknown",
    context?.room_restriction ?? "unknown",
    context?.requires_supervision ?? "unknown",
    context?.mobility_status ?? "unknown",
    context?.transfer_support ?? "unknown",
    context?.fall_risk ?? "unknown",
  ].join("|");
}

export function morningVisitAvailable(input: {
  primaryOutcome: AdvicePrimaryOutcome | null;
  secondaryMorningVisit: boolean;
}): boolean {
  return (
    input.primaryOutcome === "morning_volunteer_visit" ||
    ((input.primaryOutcome === "rest" ||
      input.primaryOutcome === "awaiting_afternoon_programme") &&
      input.secondaryMorningVisit)
  );
}

/**
 * Product-routing only (not a clinical conclusion).
 * Uses Likert scores: 1 = Zeer slecht, 2 = Slecht.
 */
export function isRestUnsuitableForGroupInterest(checkin: {
  energy_level: number;
  mood: number;
  motivation_score: number;
} | null | undefined): boolean {
  if (
    !checkin ||
    typeof checkin.energy_level !== "number" ||
    typeof checkin.mood !== "number" ||
    typeof checkin.motivation_score !== "number"
  ) {
    return true;
  }

  return (
    checkin.energy_level <= 2 ||
    checkin.mood <= 2 ||
    checkin.motivation_score <= 2
  );
}

/** Interest CTA eligibility — independent of DailyBuddy primary outcome. */
export function canShowAfternoonInterestCta(input: {
  access: string | null | undefined;
  visitActivityPossibility?: string | null | undefined;
  roomRestriction?: string | null | undefined;
  hasPlan: boolean;
  hasCheckIn: boolean;
  careContextComplete: boolean;
  energy_level: number;
  mood: number;
  motivation_score: number;
}): boolean {
  return (
    canConsiderAfternoonGroupRoute({
      access: input.access,
      visitActivityPossibility: input.visitActivityPossibility,
      roomRestriction: input.roomRestriction,
    }) &&
    !input.hasPlan &&
    input.hasCheckIn &&
    input.careContextComplete &&
    !isRestUnsuitableForGroupInterest(input)
  );
}

export const DEFAULT_CHOICE_REMINDER =
  "Deelname is jouw keuze. Doe alleen mee als je je daar goed genoeg voor voelt, en bespreek het met je zorgteam als je twijfelt.";

const SECONDARY_MORNING_NOTE =
  "Los van de middagactiviteit kun je, als je daar zin in hebt, een rustig persoonlijk vrijwilligersbezoek op de afdeling in de ochtend aanvragen.";

/** Model id stored when advice is produced without calling the LLM. */
export const DETERMINISTIC_POLICY_MODEL_ID = "deterministic-policy";

export function buildAfternoonPatchNote(input: {
  title: string;
  claimsNeedMatch: boolean;
}): string {
  if (input.claimsNeedMatch) {
    return `De middagactiviteit "${input.title}" kan vandaag bij je passen op basis van wat je hebt ingevuld. Deelname is jouw keuze.`;
  }

  return `De middagactiviteit "${input.title}" staat vandaag gepland en kan mogelijk bij je passen, als je je daar goed genoeg voor voelt. Deelname is jouw keuze.`;
}

/** Neutral note for rest primary — informational only, not a personal recommendation. */
export function buildNeutralAfternoonNote(title: string): string {
  return `De activiteit voor vanmiddag is bekend: ${title}. Je kunt later zelf bekijken of je je goed genoeg voelt om mee te doen.`;
}

function emptyAfternoon() {
  return {
    recommend: false,
    note: null,
    claims_need_match: false,
  };
}

/** Complete rest fallback when afternoon outcome is blocked by care access. */
export function buildBlockedAfternoonRestFallback(input: {
  morningAvailable: boolean;
}): DailyBuddyStructuredOutput {
  const secondary = input.morningAvailable
    ? {
        suggest: true,
        note: SECONDARY_MORNING_NOTE,
      }
    : { suggest: false, note: null };

  return {
    primary_outcome: "rest",
    motivation:
      "Op basis van je zorgcontext past vandaag vooral rust of rustige contacten dichtbij.",
    explanation:
      "De gezamenlijke middagactiviteit wordt nu niet aangeraden, omdat je de activiteitenruimte niet zelfstandig kunt bereiken volgens je zorgcontext. Neem het rustig aan; jij bepaalt wat je aankunt.",
    choice_reminder: DEFAULT_CHOICE_REMINDER,
    secondary_morning_visit: secondary,
    inspiration_ids: [],
    afternoon: emptyAfternoon(),
    safety_flags_applied: ["independent_access_blocked_afternoon"],
  };
}

function buildNoNonCareContactOutput(): DailyBuddyStructuredOutput {
  return {
    primary_outcome: "rest",
    motivation:
      "Op basis van je zorgcontext past vandaag vooral rust of contact via je zorgteam.",
    explanation: NO_NON_CARE_CONTACT_FALLBACK,
    choice_reminder: DEFAULT_CHOICE_REMINDER,
    secondary_morning_visit: { suggest: false, note: null },
    inspiration_ids: [],
    afternoon: emptyAfternoon(),
    safety_flags_applied: ["no_non_care_contact"],
  };
}

function offersOnWardVisit(output: DailyBuddyStructuredOutput): boolean {
  return (
    output.primary_outcome === "morning_volunteer_visit" ||
    Boolean(output.secondary_morning_visit?.suggest)
  );
}

function applyProtectionWordingIfNeeded(
  output: DailyBuddyStructuredOutput,
  visitActivityPossibility: string | null | undefined,
): DailyBuddyStructuredOutput {
  if (
    visitActivityPossibility !== "visit_allowed_with_protection" ||
    !offersOnWardVisit(output)
  ) {
    return output;
  }

  const alreadyMentionsProtection =
    output.explanation.includes("beschermingsmaatregelen") ||
    output.motivation.includes("beschermingsmaatregelen");

  return {
    ...output,
    explanation: alreadyMentionsProtection
      ? output.explanation
      : `${output.explanation} ${VISIT_PROTECTION_FALLBACK}`.trim(),
    safety_flags_applied: [
      ...new Set([
        ...output.safety_flags_applied,
        "visit_allowed_with_protection",
      ]),
    ],
  };
}

function buildRoomOnlyOutput(input: {
  morningAvailable: boolean;
  inspirationIds: string[];
  safetyFlags: string[];
}): DailyBuddyStructuredOutput {
  if (input.morningAvailable) {
    return {
      primary_outcome: "morning_volunteer_visit",
      motivation:
        "Een rustig persoonlijk vrijwilligersbezoek in de ochtend kan vandaag bij je passen.",
      explanation:
        "Je blijft volgens je zorgcontext op de kamer, dus een gezamenlijke middagactiviteit past nu niet. Een optioneel vrijwilligersbezoek dichtbij kan wel. Deelname is jouw keuze.",
      choice_reminder: DEFAULT_CHOICE_REMINDER,
      secondary_morning_visit: { suggest: false, note: null },
      inspiration_ids: input.inspirationIds,
      afternoon: emptyAfternoon(),
      safety_flags_applied: [
        ...new Set([...input.safetyFlags, "room_only_morning_route"]),
      ],
    };
  }

  return {
    primary_outcome: "rest",
    motivation:
      "Op basis van je zorgcontext past vandaag vooral rust of lage prikkels dichtbij.",
    explanation:
      "Je blijft volgens je zorgcontext op de kamer, dus een gezamenlijke middagactiviteit past nu niet. Neem het rustig aan; deelname is jouw keuze.",
    choice_reminder: DEFAULT_CHOICE_REMINDER,
    secondary_morning_visit: { suggest: false, note: null },
    inspiration_ids: input.inspirationIds,
    afternoon: emptyAfternoon(),
    safety_flags_applied: [
      ...new Set([...input.safetyFlags, "room_only_rest_route"]),
    ],
  };
}

function buildAwaitingProgrammeOutput(input: {
  morningAvailable: boolean;
  inspirationIds: string[];
  safetyFlags: string[];
}): DailyBuddyStructuredOutput {
  const secondary = input.morningAvailable
    ? { suggest: true, note: SECONDARY_MORNING_NOTE }
    : { suggest: false, note: null };

  return {
    primary_outcome: "awaiting_afternoon_programme",
    motivation:
      "Vanmiddag is er een gezamenlijke activiteit. De invulling wordt later vandaag afgestemd op de interesses van deelnemers.",
    explanation:
      "Er is altijd een middagactiviteit in het vaste tijdvak. De exacte inhoud is nog niet bekend en kan later vandaag worden afgestemd. Deelname blijft jouw keuze — dit is geen inschrijving of gereserveerde plek.",
    choice_reminder: DEFAULT_CHOICE_REMINDER,
    secondary_morning_visit: secondary,
    inspiration_ids: input.inspirationIds,
    afternoon: emptyAfternoon(),
    safety_flags_applied: [
      ...new Set([...input.safetyFlags, "empty_plan_awaiting_programme"]),
    ],
  };
}

function buildEmptyPlanRestOutput(input: {
  morningAvailable: boolean;
  inspirationIds: string[];
  safetyFlags: string[];
}): DailyBuddyStructuredOutput {
  const secondary = input.morningAvailable
    ? { suggest: true, note: SECONDARY_MORNING_NOTE }
    : { suggest: false, note: null };

  return {
    primary_outcome: "rest",
    motivation:
      "Op basis van wat je hebt ingevuld past vandaag vooral rust of lage prikkels.",
    explanation:
      "Neem het rustig aan op basis van wat je hebt ingevuld. Deelname is jouw keuze; bespreek twijfels met je zorgteam.",
    choice_reminder: DEFAULT_CHOICE_REMINDER,
    secondary_morning_visit: secondary,
    inspiration_ids: input.inspirationIds,
    afternoon: emptyAfternoon(),
    safety_flags_applied: [
      ...new Set([...input.safetyFlags, "empty_plan_rest_unsuitable"]),
    ],
  };
}

export interface EnforceAdvicePolicyOptions {
  access: string | null | undefined;
  hasPlan: boolean;
  planCategory: string | null | undefined;
  participationNeeds: string[];
  morningAvailable: boolean;
  visitActivityPossibility?: string | null | undefined;
  roomRestriction?: string | null | undefined;
  checkinScores: {
    energy_level: number;
    mood: number;
    motivation_score: number;
  } | null;
}

function effectiveMorningAvailable(
  options: EnforceAdvicePolicyOptions,
): boolean {
  return (
    options.morningAvailable &&
    allowsOnWardVisit(options.visitActivityPossibility)
  );
}

/**
 * Fully deterministic advice when no afternoon title is registered.
 * Returns null when an afternoon plan exists (LLM path may still run).
 */
export function buildDeterministicAdviceWhenNoPlan(
  options: EnforceAdvicePolicyOptions,
): DailyBuddyStructuredOutput | null {
  if (options.hasPlan) {
    return null;
  }

  if (blocksAllNonCareContact(options.visitActivityPossibility)) {
    return buildNoNonCareContactOutput();
  }

  const morningAvailable = effectiveMorningAvailable(options);

  if (isRoomOnlyRestriction(options.roomRestriction)) {
    return applyProtectionWordingIfNeeded(
      buildRoomOnlyOutput({
        morningAvailable,
        inspirationIds: [],
        safetyFlags: [],
      }),
      options.visitActivityPossibility,
    );
  }

  const mayGroup = canConsiderAfternoonGroupRoute({
    access: options.access,
    visitActivityPossibility: options.visitActivityPossibility,
    roomRestriction: options.roomRestriction,
  });

  if (!mayGroup) {
    return applyProtectionWordingIfNeeded(
      buildBlockedAfternoonRestFallback({
        morningAvailable,
      }),
      options.visitActivityPossibility,
    );
  }

  const restUnsuitable = isRestUnsuitableForGroupInterest(options.checkinScores);

  if (restUnsuitable) {
    return applyProtectionWordingIfNeeded(
      buildEmptyPlanRestOutput({
        morningAvailable,
        inspirationIds: [],
        safetyFlags: [],
      }),
      options.visitActivityPossibility,
    );
  }

  return applyProtectionWordingIfNeeded(
    buildAwaitingProgrammeOutput({
      morningAvailable,
      inspirationIds: [],
      safetyFlags: [],
    }),
    options.visitActivityPossibility,
  );
}

/**
 * Deterministic post-LLM enforcement. Access, empty-plan, visit/activity
 * possibility, room, and restUnsuitable rules are authoritative here — not in the prompt.
 */
export function enforceAccessGateOnOutput(
  output: DailyBuddyStructuredOutput,
  options: EnforceAdvicePolicyOptions,
): DailyBuddyStructuredOutput {
  let next: DailyBuddyStructuredOutput = {
    ...output,
    afternoon: output.afternoon ? { ...output.afternoon } : null,
    secondary_morning_visit: output.secondary_morning_visit
      ? { ...output.secondary_morning_visit }
      : null,
    safety_flags_applied: [...(output.safety_flags_applied ?? [])],
    inspiration_ids: [...output.inspiration_ids],
  };

  if (blocksAllNonCareContact(options.visitActivityPossibility)) {
    const blocked = buildNoNonCareContactOutput();
    return {
      ...blocked,
      inspiration_ids: [],
      safety_flags_applied: [
        ...new Set([
          ...next.safety_flags_applied,
          ...blocked.safety_flags_applied,
        ]),
      ],
    };
  }

  const morningAvailable = effectiveMorningAvailable(options);

  if (isRoomOnlyRestriction(options.roomRestriction)) {
    return applyProtectionWordingIfNeeded(
      buildRoomOnlyOutput({
        morningAvailable,
        inspirationIds: next.inspiration_ids,
        safetyFlags: next.safety_flags_applied,
      }),
      options.visitActivityPossibility,
    );
  }

  const mayAfternoon = canConsiderAfternoonGroupRoute({
    access: options.access,
    visitActivityPossibility: options.visitActivityPossibility,
    roomRestriction: options.roomRestriction,
  });

  if (!mayAfternoon) {
    const afternoonPromoted =
      next.primary_outcome === "afternoon_group_activity" ||
      next.primary_outcome === "awaiting_afternoon_programme" ||
      Boolean(next.afternoon?.recommend);

    if (afternoonPromoted) {
      const fallback = buildBlockedAfternoonRestFallback({
        morningAvailable,
      });
      return applyProtectionWordingIfNeeded(
        {
          ...fallback,
          inspiration_ids: next.inspiration_ids,
          safety_flags_applied: [
            ...new Set([
              ...next.safety_flags_applied,
              ...fallback.safety_flags_applied,
            ]),
          ],
        },
        options.visitActivityPossibility,
      );
    }

    if (next.afternoon) {
      next.afternoon = emptyAfternoon();
    }

    if (!morningAvailable && next.secondary_morning_visit?.suggest) {
      next.secondary_morning_visit = { suggest: false, note: null };
      next.safety_flags_applied = [
        ...new Set([
          ...next.safety_flags_applied,
          "morning_unavailable_cleared_secondary",
        ]),
      ];
    }

    if (
      !morningAvailable &&
      next.primary_outcome === "morning_volunteer_visit"
    ) {
      next.primary_outcome = "rest";
      next.secondary_morning_visit = { suggest: false, note: null };
      next.safety_flags_applied = [
        ...new Set([
          ...next.safety_flags_applied,
          "morning_unavailable_blocked_primary",
        ]),
      ];
    }

    return applyProtectionWordingIfNeeded(
      next,
      options.visitActivityPossibility,
    );
  }

  // Empty-plan coercion — overrides rest / morning / afternoon when no title.
  if (!options.hasPlan) {
    const restUnsuitable = isRestUnsuitableForGroupInterest(
      options.checkinScores,
    );

    if (restUnsuitable) {
      next = buildEmptyPlanRestOutput({
        morningAvailable,
        inspirationIds: next.inspiration_ids,
        safetyFlags: [
          ...next.safety_flags_applied,
          ...(next.primary_outcome === "morning_volunteer_visit"
            ? ["empty_plan_morning_demoted"]
            : []),
        ],
      });
    } else {
      const demoteMorning =
        next.primary_outcome === "morning_volunteer_visit"
          ? ["empty_plan_morning_demoted"]
          : [];
      next = buildAwaitingProgrammeOutput({
        morningAvailable,
        inspirationIds: next.inspiration_ids,
        safetyFlags: [...next.safety_flags_applied, ...demoteMorning],
      });
    }
  }

  if (options.hasPlan && next.afternoon) {
    const exactMatch = Boolean(
      options.planCategory &&
        options.participationNeeds.includes(options.planCategory),
    );
    if (next.afternoon.claims_need_match && !exactMatch) {
      next.afternoon = {
        ...next.afternoon,
        claims_need_match: false,
      };
      next.safety_flags_applied = [
        ...new Set([...next.safety_flags_applied, "coerced_false_need_match"]),
      ];
    }
  }

  if (!morningAvailable) {
    if (next.primary_outcome === "morning_volunteer_visit") {
      next.primary_outcome = "rest";
      next.secondary_morning_visit = { suggest: false, note: null };
      next.motivation =
        "Op basis van wat je hebt ingevuld past vandaag vooral rust of lage prikkels.";
      next.explanation =
        "Een ochtendbezoek wordt nu niet aangeraden omdat er geen ochtend-vrijwilligerscontact beschikbaar lijkt. Neem het rustig aan; deelname is jouw keuze.";
      next.choice_reminder = DEFAULT_CHOICE_REMINDER;
      next.safety_flags_applied = [
        ...new Set([
          ...next.safety_flags_applied,
          "morning_unavailable_blocked_primary",
        ]),
      ];
    } else if (next.secondary_morning_visit?.suggest) {
      next.secondary_morning_visit = { suggest: false, note: null };
      next.safety_flags_applied = [
        ...new Set([
          ...next.safety_flags_applied,
          "morning_unavailable_cleared_secondary",
        ]),
      ];
    }
  }

  return applyProtectionWordingIfNeeded(
    next,
    options.visitActivityPossibility,
  );
}

/** Lightweight guard — rejects clearly medical directive language. */
const MEDICAL_VERB_PATTERN =
  /\b(diagnose|diagnosticeren|behandelen|voorschrijven|medicatie|therapie|operatie|prognose)\b/i;

export function containsUnsafeMedicalLanguage(text: string): boolean {
  return MEDICAL_VERB_PATTERN.test(text);
}
