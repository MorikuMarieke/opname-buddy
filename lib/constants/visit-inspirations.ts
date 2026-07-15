/**
 * Controlled personal-visit inspiration library for DailyBuddy.
 * The LLM may only select IDs from this list — never invent activities.
 */

import type { ParticipationNeedValue } from "@/lib/constants/daily-participation";

export type VisitInspirationCategory = ParticipationNeedValue;

export interface VisitInspiration {
  id: string;
  category: VisitInspirationCategory;
  labelNl: string;
  risk: "low";
}

export const VISIT_INSPIRATIONS: readonly VisitInspiration[] = [
  {
    id: "coffee_together",
    category: "social",
    labelNl: "Samen een kopje koffie drinken",
    risk: "low",
  },
  {
    id: "quiet_conversation",
    category: "social",
    labelNl: "Een rustig gesprek",
    risk: "low",
  },
  {
    id: "read_newspaper",
    category: "social",
    labelNl: "Samen een krant of magazine lezen",
    risk: "low",
  },
  {
    id: "look_at_photos",
    category: "social",
    labelNl: "Samen foto's bekijken",
    risk: "low",
  },
  {
    id: "short_walk",
    category: "movement",
    labelNl: "Een korte wandeling op de afdeling",
    risk: "low",
  },
  {
    id: "gentle_stretch",
    category: "movement",
    labelNl: "Lichte beweging op de stoel",
    risk: "low",
  },
  {
    id: "corridor_stroll",
    category: "movement",
    labelNl: "Even rustig de gang oplopen",
    risk: "low",
  },
  {
    id: "colouring",
    category: "creative",
    labelNl: "Samen kleuren",
    risk: "low",
  },
  {
    id: "simple_puzzle",
    category: "creative",
    labelNl: "Een puzzel maken",
    risk: "low",
  },
  {
    id: "craft_simple",
    category: "creative",
    labelNl: "Een eenvoudige knutselactiviteit",
    risk: "low",
  },
  {
    id: "listen_music",
    category: "relaxation",
    labelNl: "Samen naar muziek luisteren",
    risk: "low",
  },
  {
    id: "quiet_company",
    category: "relaxation",
    labelNl: "Stille aanwezigheid / rustig gezelschap",
    risk: "low",
  },
  {
    id: "breathing_pause",
    category: "relaxation",
    labelNl: "Een kort rustmoment samen",
    risk: "low",
  },
  {
    id: "read_aloud",
    category: "relaxation",
    labelNl: "Voorlezen of samen een verhaal lezen",
    risk: "low",
  },
] as const;

export const VISIT_INSPIRATION_IDS = VISIT_INSPIRATIONS.map((item) => item.id);

export const VISIT_INSPIRATION_BY_ID: Record<string, VisitInspiration> =
  Object.fromEntries(VISIT_INSPIRATIONS.map((item) => [item.id, item]));

export function filterValidInspirationIds(ids: string[]): string[] {
  const allowed = new Set(VISIT_INSPIRATION_IDS);
  const unique: string[] = [];

  for (const id of ids) {
    if (allowed.has(id) && !unique.includes(id)) {
      unique.push(id);
    }
  }

  return unique.slice(0, 4);
}

export function getInspirationLabels(ids: string[]): string[] {
  return filterValidInspirationIds(ids).map(
    (id) => VISIT_INSPIRATION_BY_ID[id]?.labelNl ?? id,
  );
}
