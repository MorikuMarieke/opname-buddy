import { z } from "zod";

import { VISIT_INSPIRATION_IDS } from "@/lib/constants/visit-inspirations";

export const advicePrimaryOutcomeSchema = z.enum([
  "rest",
  "morning_volunteer_visit",
  "afternoon_group_activity",
]);

export const dailyBuddyStructuredOutputSchema = z.object({
  primary_outcome: advicePrimaryOutcomeSchema,
  motivation: z.string().min(1).max(500),
  explanation: z.string().min(1).max(1200),
  choice_reminder: z.string().min(1).max(400),
  secondary_morning_visit: z
    .object({
      suggest: z.boolean(),
      note: z.string().nullable(),
    })
    .nullable(),
  inspiration_ids: z.array(z.string()).max(4),
  afternoon: z
    .object({
      recommend: z.boolean(),
      note: z.string().nullable(),
      claims_need_match: z.boolean(),
    })
    .nullable(),
  // Required (no .default) — OpenAI strict response_format needs every
  // properties key listed in required.
  safety_flags_applied: z.array(z.string()),
});

export type DailyBuddyStructuredOutput = z.infer<
  typeof dailyBuddyStructuredOutputSchema
>;

export const inspirationIdSchema = z.enum(
  VISIT_INSPIRATION_IDS as [string, ...string[]],
);
