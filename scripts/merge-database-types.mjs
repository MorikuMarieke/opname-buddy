import fs from "node:fs";

const header = `/**
 * Supabase database types for OpnameBuddy.
 *
 * Regenerate when the schema changes:
 * - Dashboard: Project Settings -> API -> Generate types
 * - CLI (remote, no Docker): npx supabase gen types typescript --project-id <ref>
 *
 * Custom convenience aliases and the RoleName union are appended at the bottom
 * and must be preserved when regenerating.
 */

`;

const footer = `
// -----------------------------------------------------------------------------
// Custom convenience aliases (preserve on regeneration)
// -----------------------------------------------------------------------------

export type Profile = Tables<"profiles">;
export type Role = Tables<"roles">;
export type UserRole = Tables<"user_roles">;
export type PatientCheckin = Tables<"patient_checkins">;
export type PatientQuestion = Tables<"patient_questions">;
export type PatientParticipationEvaluation =
  Tables<"patient_participation_evaluations">;
export type PatientContext = Tables<"patient_context">;
export type Patient = Tables<"patients">;
export type Admission = Tables<"admissions">;
export type PatientAccountLink = Tables<"patient_account_links">;
export type PatientLinkCode = Tables<"patient_link_codes">;

export type RoleName =
  | "patient"
  | "caregiver"
  | "activity_coordinator"
  | "admin";

export type AccountAuditEventRow = Tables<"account_audit_events">;
`;

let generated = fs.readFileSync("types/database.generated.ts", "utf8");
const start = generated.indexOf("export type Json");
if (start === -1) {
  throw new Error("Could not find generated types in database.generated.ts");
}
generated = generated.slice(start);
fs.writeFileSync("types/database.ts", header + generated + footer, "utf8");
fs.unlinkSync("types/database.generated.ts");
console.log("types/database.ts regenerated");
