import { openai } from "@ai-sdk/openai";
import { generateText, Output, stepCountIs } from "ai";

import {
  containsUnsafeMedicalLanguage,
  DEFAULT_CHOICE_REMINDER,
} from "@/lib/ai/participation-advice-policy";
import {
  filterInspirationIdsForPatient,
  formatInspirationCatalogForPrompt,
  getAllowedVisitInspirations,
  type InspirationCareContext,
} from "@/lib/ai/inspiration-filter";
import {
  createProgressEmitter,
  type DailyBuddyProgressEvent,
} from "@/lib/daily-advice/progress";
import {
  createDailyBuddyTools,
  type DailyBuddyToolContext,
} from "@/lib/tools/dailybuddy-tools";
import {
  dailyBuddyStructuredOutputSchema,
  type DailyBuddyStructuredOutput,
} from "@/lib/validations/daily-advice";

export const DAILYBUDDY_MODEL_ID = "gpt-4.1";

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
- morning_volunteer_visit — optioneel persoonlijk vrijwilligersbezoek op de afdeling in het ochtendblok 10:00–12:00 (geen groepsactiviteit, geen afspraakijd, geen toewijzing). Alleen als primary wanneer er WEL een geregistreerde middagtitel is, of wanneer middaggroep sowieso niet past.
- afternoon_group_activity — alleen de GÉREGISTREERDE middagactiviteit (14:00–16:00). Nooit zonder geregistreerde titel.
- awaiting_afternoon_programme — er is wel een vaste middagactiviteit vandaag, maar de concrete titel/invulling is nog niet bekend (wordt later afgestemd). Geen ochtendbezoek als primary in die situatie.

Belangrijke regels:
- Motiveer en leg uit. Beslis NOOIT voor de patiënt.
- Gebruik voorzichtige Nederlandse formulering: "kan vandaag bij je passen", "op basis van wat je hebt ingevuld", "als je je daar goed genoeg voor voelt", "deelname is jouw keuze", "bespreek het met je zorgteam als je twijfelt".
- can_independently_reach_activity_room: alleen "yes" mag middaggroep overwegen; "no" of "unknown" → NOOIT afternoon_group_activity en afternoon.recommend=false.
- Gebruik participation_routes uit getPatientContext als goedgekeurde feiten: on_ward_visit en afternoon_activity bepalen wat je mag voorstellen. Leg patient_visible_reason rustig uit wanneer aanwezig. Bedenk zelf geen isolatie/medische betekenis, herinterpreteer bescherming niet, en noem geen interne enum-, database- of beleidslabels.
- Geen geregistreerde middagtitel (plan=null of zonder afternoon_title): kies awaiting_afternoon_programme of rest. Formuleer awaiting_afternoon_programme zo dat er WEL een gezamenlijke middagactiviteit is, waarvan de invulling later vandaag bekend wordt — zeg NOOIT dat er geen activiteit is gepland of dat het programma ontbreekt. Kies NOOIT morning_volunteer_visit als primary alleen omdat de titel ontbreekt. Ochtendcontact mag dan hoogstens als secondary_morning_visit (persoonlijk bezoek op de afdeling, geen groepsactiviteit).
- Verzin nooit een middagactiviteit. Gebruik alleen de geregistreerde titel/categorie.
- Exacte match tussen participation_needs en afternoon_category is een STERK positief signaal, geen harde eis. claims_need_match mag ALLEEN true zijn als de categorie letterlijk in de needs-lijst staat. Zeg nooit dat iets bij een behoefte past die de patiënt niet heeft gekozen.
- Bij primary_outcome=rest of awaiting_afternoon_programme mag secondary_morning_visit.suggest=true voor een rustig optioneel persoonlijk ochtendbezoek op de afdeling (alleen als morning signal true is én on_ward_visit dat toelaat).
- inspiration_ids: kies 0–4 IDs UIT DEZE PATIËNTSPECIFIEKE LIJST (niet verzinnen, niets daarbuiten):
${allowedCatalog}
- Als morning niet beschikbaar is (signal false) of on_ward_visit=not_offered, adviseer geen ochtendbezoek (primary noch secondary).
- Nooit: diagnostiseren, behandelen, zorgrestricties overrulen, goedgekeurde participatiefeiten negeren, vrijwilligers toewijzen, deelname garanderen of onder druk zetten, andere patiënten noemen. Gebruik geen vrije zorgnotities voor beslissingen. Stel geen bezoek voor alsof het al geregeld is.

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
    onProgress?: (event: DailyBuddyProgressEvent) => void;
  },
): Promise<GenerateDailyBuddyAdviceResult> {
  const tools = createDailyBuddyTools(ctx);
  const allowed = getAllowedVisitInspirations(ctx.careContext);
  const system = buildSystemPrompt(formatInspirationCatalogForPrompt(allowed));
  const progress = createProgressEmitter(ctx.onProgress);

  const result = await generateText({
    model: openai(DAILYBUDDY_MODEL_ID),
    system,
    prompt: `Genereer het dagelijkse participatieadvies voor adviesdatum ${ctx.adviceDate}. Gebruik de tools om context op te halen en lever daarna het gestructureerde advies.`,
    tools,
    stopWhen: stepCountIs(8),
    output: Output.object({
      schema: dailyBuddyStructuredOutputSchema,
    }),
    onToolExecutionStart: (event) => {
      progress.emitTool(event.toolCall.toolName, "llm");
    },
    onStepEnd: (event) => {
      if (!event.toolCalls || event.toolCalls.length === 0) {
        progress.emit("composing", "llm");
      }
    },
  });

  if (!result.output) {
    throw new Error("DailyBuddy leverde geen gestructureerd advies op.");
  }

  progress.emit("composing", "llm");

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

  if (
    output.primary_outcome !== "rest" &&
    output.primary_outcome !== "awaiting_afternoon_programme"
  ) {
    output.secondary_morning_visit = output.secondary_morning_visit
      ? { suggest: false, note: null }
      : null;
  }

  return output;
}

export { enforceAccessGateOnOutput } from "@/lib/ai/participation-advice-policy";
