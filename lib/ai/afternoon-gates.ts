import type {
  ActivityRoomAccess,
  AdviceAfternoonStatus,
  AdvicePrimaryOutcome,
  AdviceStatus,
} from "@/types/daily-advice";
import type { DailyBuddyStructuredOutput } from "@/lib/validations/daily-advice";

/** Only `yes` may be considered for afternoon group activity. */
export function canConsiderAfternoonActivity(
  access: ActivityRoomAccess | string | null | undefined,
): boolean {
  return access === "yes";
}

export function afternoonStatusForAccess(
  access: ActivityRoomAccess | string | null | undefined,
  hasPlan: boolean,
): AdviceAfternoonStatus {
  if (!canConsiderAfternoonActivity(access)) {
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

export function morningVisitAvailable(input: {
  primaryOutcome: AdvicePrimaryOutcome | null;
  secondaryMorningVisit: boolean;
}): boolean {
  return (
    input.primaryOutcome === "morning_volunteer_visit" ||
    (input.primaryOutcome === "rest" && input.secondaryMorningVisit)
  );
}

export const DEFAULT_CHOICE_REMINDER =
  "Deelname is jouw keuze. Doe alleen mee als je je daar goed genoeg voor voelt, en bespreek het met je zorgteam als je twijfelt.";

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

/** Complete rest fallback when afternoon outcome is blocked by care access. */
export function buildBlockedAfternoonRestFallback(input: {
  morningAvailable: boolean;
}): DailyBuddyStructuredOutput {
  const secondary = input.morningAvailable
    ? {
        suggest: true,
        note: "Als je daar zin in hebt, kun je een rustig vrijwilligersbezoek in de ochtend aanvragen.",
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
    afternoon: {
      recommend: false,
      note: null,
      claims_need_match: false,
    },
    safety_flags_applied: ["independent_access_blocked_afternoon"],
  };
}

/**
 * Deterministic post-LLM enforcement. Rewrites all patient-facing fields when
 * afternoon access is blocked so stored advice stays internally consistent.
 */
export function enforceAccessGateOnOutput(
  output: DailyBuddyStructuredOutput,
  options: {
    access: string | null | undefined;
    planCategory: string | null | undefined;
    participationNeeds: string[];
    morningAvailable: boolean;
  },
): DailyBuddyStructuredOutput {
  const mayAfternoon = canConsiderAfternoonActivity(options.access);
  const next: DailyBuddyStructuredOutput = {
    ...output,
    afternoon: output.afternoon ? { ...output.afternoon } : null,
    secondary_morning_visit: output.secondary_morning_visit
      ? { ...output.secondary_morning_visit }
      : null,
    safety_flags_applied: [...(output.safety_flags_applied ?? [])],
    inspiration_ids: [...output.inspiration_ids],
  };

  if (!mayAfternoon) {
    const afternoonPromoted =
      next.primary_outcome === "afternoon_group_activity" ||
      Boolean(next.afternoon?.recommend);

    if (afternoonPromoted) {
      const fallback = buildBlockedAfternoonRestFallback({
        morningAvailable: options.morningAvailable,
      });
      return {
        ...fallback,
        inspiration_ids: next.inspiration_ids,
        safety_flags_applied: [
          ...new Set([
            ...next.safety_flags_applied,
            ...fallback.safety_flags_applied,
          ]),
        ],
      };
    }

    if (next.afternoon) {
      next.afternoon = {
        recommend: false,
        note: null,
        claims_need_match: false,
      };
    }

    if (!options.morningAvailable && next.secondary_morning_visit?.suggest) {
      next.secondary_morning_visit = { suggest: false, note: null };
      next.safety_flags_applied = [
        ...new Set([
          ...next.safety_flags_applied,
          "morning_unavailable_cleared_secondary",
        ]),
      ];
    }

    return next;
  }

  if (next.afternoon) {
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

  if (!options.morningAvailable) {
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

  return next;
}

/** Lightweight guard — rejects clearly medical directive language. */
const MEDICAL_VERB_PATTERN =
  /\b(diagnose|diagnosticeren|behandelen|voorschrijven|medicatie|therapie|operatie|prognose)\b/i;

export function containsUnsafeMedicalLanguage(text: string): boolean {
  return MEDICAL_VERB_PATTERN.test(text);
}
