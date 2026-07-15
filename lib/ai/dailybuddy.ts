import { openai } from "@ai-sdk/openai";
import { generateText, Output, stepCountIs } from "ai";

import {
  containsUnsafeMedicalLanguage,
  DEFAULT_CHOICE_REMINDER,
} from "@/lib/ai/afternoon-gates";
import {
  filterInspirationIdsForPatient,
  formatInspirationCatalogForPrompt,
  getAllowedVisitInspirations,
  type InspirationCareContext,
} from "@/lib/ai/inspiration-filter";
import {
  createDailyBuddyTools,
  type DailyBuddyToolContext,
} from "@/lib/tools/dailybuddy-tools";
import {
  dailyBuddyStructuredOutputSchema,
  type DailyBuddyStructuredOutput,
} from "@/lib/validations/daily-advice";

export const DAILYBUDDY_MODEL_ID = "gpt-4o-mini";

function buildSystemPrompt(allowedCatalog: string): string {
  return `Je bent DailyBuddy (DagBuddy), een patiëntgerichte assistent voor herstelparticipatie in het ziekenhuis.

Je bent GEEN chatbot voor conversatie, GEEN planningsengine, GEEN vrijwilligersmatcher en GEEN medisch adviesysteem.

Taak: geef één persoonlijk participatieadvies voor vandaag nadat de patiënt de check-in heeft ingevuld.

Haal ALTIJD eerst context op via tools voordat je adviseert:
1. getPatientCheckin
2. getPatientContext
3. getDailyParticipationPlan
4. getMorningVolunteerAvailabilitySignal

Uitkomsten (kies één primary_outcome):
- rest — vandaag past vooral rust of lage prikkels
- morning_volunteer_visit — persoonlijk vrijwilligersbezoek in het ochtendblok 10:00–12:00 (geen afspraakijd, geen toewijzing)
- afternoon_group_activity — alleen de GÉREGISTREERDE middagactiviteit (14:00–16:00)

Belangrijke regels:
- Motiveer en leg uit. Beslis NOOIT voor de patiënt.
- Gebruik voorzichtige Nederlandse formulering: "kan vandaag bij je passen", "op basis van wat je hebt ingevuld", "als je je daar goed genoeg voor voelt", "deelname is jouw keuze", "bespreek het met je zorgteam als je twijfelt".
- can_independently_reach_activity_room: alleen "yes" mag middaggroep overwegen; "no" of "unknown" → NOOIT afternoon_group_activity en afternoon.recommend=false.
- Verzin nooit een middagactiviteit. Gebruik alleen de geregistreerde titel/categorie.
- Exacte match tussen participation_needs en afternoon_category is een STERK positief signaal, geen harde eis. claims_need_match mag ALLEEN true zijn als de categorie letterlijk in de needs-lijst staat. Zeg nooit dat iets bij een behoefte past die de patiënt niet heeft gekozen.
- Bij primary_outcome=rest mag secondary_morning_visit.suggest=true voor een rustig optioneel ochtendbezoek (alleen als morning signal true is).
- inspiration_ids: kies 0–4 IDs UIT DEZE PATIËNTSPECIFIEKE LIJST (niet verzinnen, niets daarbuiten):
${allowedCatalog}
- Als morning niet beschikbaar is (signal false), adviseer geen ochtendbezoek (primary noch secondary).
- Nooit: diagnostiseren, behandelen, zorgrestricties overrulen, isolatie negeren, vrijwilligers toewijzen, deelname garanderen of onder druk zetten, andere patiënten noemen.

safety_flags_applied: lever altijd een array (mag leeg zijn), bijvoorbeeld ["independent_access_no"] wanneer van toepassing.

choice_reminder moet patiëntautonomie benadrukken.`;
}

export interface GenerateDailyBuddyAdviceResult {
  output: DailyBuddyStructuredOutput;
  modelId: string;
}

export async function generateDailyBuddyAdvice(
  ctx: DailyBuddyToolContext & {
    careContext: InspirationCareContext | null;
  },
): Promise<GenerateDailyBuddyAdviceResult> {
  const tools = createDailyBuddyTools(ctx);
  const allowed = getAllowedVisitInspirations(ctx.careContext);
  const system = buildSystemPrompt(formatInspirationCatalogForPrompt(allowed));

  const result = await generateText({
    model: openai(DAILYBUDDY_MODEL_ID),
    system,
    prompt: `Genereer het dagelijkse participatieadvies voor adviesdatum ${ctx.adviceDate}. Gebruik de tools om context op te halen en lever daarna het gestructureerde advies.`,
    tools,
    stopWhen: stepCountIs(8),
    output: Output.object({
      schema: dailyBuddyStructuredOutputSchema,
    }),
  });

  if (!result.output) {
    throw new Error("DailyBuddy leverde geen gestructureerd advies op.");
  }

  const sanitized = sanitizeStructuredOutput(result.output, ctx.careContext);

  return {
    output: sanitized,
    modelId: DAILYBUDDY_MODEL_ID,
  };
}

function sanitizeStructuredOutput(
  raw: DailyBuddyStructuredOutput,
  careContext: InspirationCareContext | null,
): DailyBuddyStructuredOutput {
  const output = { ...raw };

  output.inspiration_ids = filterInspirationIdsForPatient(
    output.inspiration_ids,
    careContext,
  );
  output.safety_flags_applied = Array.isArray(raw.safety_flags_applied)
    ? raw.safety_flags_applied
    : [];
  output.choice_reminder =
    output.choice_reminder?.trim() || DEFAULT_CHOICE_REMINDER;

  if (
    containsUnsafeMedicalLanguage(output.motivation) ||
    containsUnsafeMedicalLanguage(output.explanation) ||
    containsUnsafeMedicalLanguage(output.choice_reminder)
  ) {
    throw new Error("DailyBuddy-antwoord bevatte onveilige medische taal.");
  }

  if (output.primary_outcome !== "rest") {
    output.secondary_morning_visit = output.secondary_morning_visit
      ? { suggest: false, note: null }
      : null;
  }

  return output;
}

export { enforceAccessGateOnOutput } from "@/lib/ai/afternoon-gates";
