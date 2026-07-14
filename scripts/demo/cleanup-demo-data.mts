import {
  createDemoAdminClient,
  isDemoAuthUser,
  listAllAuthUsers,
  type AdminClient,
} from "./demo-auth";
import {
  ALL_DEMO_EMAILS,
  DEMO_PATIENT_REF_PREFIX,
  isDemoEmail,
  isDemoPatientRef,
} from "./demo-constants";
import { loadProjectEnv } from "./load-env";

interface CleanupCounts {
  volunteerDayAbsences: number;
  volunteerWeeklyBlocks: number;
  dailyParticipationPlans: number;
  patientCheckins: number;
  patientContext: number;
  patientQuestions: number;
  patientAccountLinks: number;
  admissions: number;
  patients: number;
  accountAuditEvents: number;
  userRoles: number;
  authUsers: number;
}

function createEmptyCounts(): CleanupCounts {
  return {
    volunteerDayAbsences: 0,
    volunteerWeeklyBlocks: 0,
    dailyParticipationPlans: 0,
    patientCheckins: 0,
    patientContext: 0,
    patientQuestions: 0,
    patientAccountLinks: 0,
    admissions: 0,
    patients: 0,
    accountAuditEvents: 0,
    userRoles: 0,
    authUsers: 0,
  };
}

function printCounts(counts: CleanupCounts, dryRun: boolean): void {
  const mode = dryRun ? "would delete" : "deleted";

  console.log(`\n=== Demo cleanup (${dryRun ? "dry-run" : "live"}) ===`);
  console.log(`Volunteer day absences ${mode}: ${counts.volunteerDayAbsences}`);
  console.log(`Volunteer weekly blocks ${mode}: ${counts.volunteerWeeklyBlocks}`);
  console.log(`Daily participation plans ${mode}: ${counts.dailyParticipationPlans}`);
  console.log(`Patient check-ins ${mode}: ${counts.patientCheckins}`);
  console.log(`Patient context rows ${mode}: ${counts.patientContext}`);
  console.log(`Patient questions ${mode}: ${counts.patientQuestions}`);
  console.log(`Patient account links ${mode}: ${counts.patientAccountLinks}`);
  console.log(`Admissions ${mode}: ${counts.admissions}`);
  console.log(`Patients ${mode}: ${counts.patients}`);
  console.log(`Account audit events ${mode}: ${counts.accountAuditEvents}`);
  console.log(`User role rows ${mode}: ${counts.userRoles}`);
  console.log(`Auth users ${mode}: ${counts.authUsers}`);
  console.log("====================================\n");
}

async function getDemoAuthUsers(admin: AdminClient) {
  const users = await listAllAuthUsers(admin);
  const wantedEmails = new Set(ALL_DEMO_EMAILS.map((email) => email.toLowerCase()));

  return users.filter((user) => {
    const email = user.email?.toLowerCase();

    if (!email || !wantedEmails.has(email)) {
      return false;
    }

    if (!isDemoEmail(email)) {
      return false;
    }

    if (!isDemoAuthUser(user)) {
      console.warn(
        `Skipping auth user ${email}: missing demo_account metadata guard`,
      );
      return false;
    }

    return true;
  });
}

async function getDemoPatientIds(admin: AdminClient): Promise<string[]> {
  const { data, error } = await admin
    .from("patients")
    .select("id, external_ref")
    .like("external_ref", `${DEMO_PATIENT_REF_PREFIX}%`);

  if (error) {
    throw new Error(error.message);
  }

  const patientIds: string[] = [];

  for (const row of data ?? []) {
    if (!isDemoPatientRef(row.external_ref)) {
      console.warn(`Skipping patient ${row.id}: external_ref guard failed`);
      continue;
    }

    patientIds.push(row.id);
  }

  return patientIds;
}

async function getDemoAdmissionIds(
  admin: AdminClient,
  patientIds: string[],
): Promise<string[]> {
  if (patientIds.length === 0) {
    return [];
  }

  const { data, error } = await admin
    .from("admissions")
    .select("id")
    .in("patient_id", patientIds);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => row.id);
}

async function countByUserIds(
  admin: AdminClient,
  table: "volunteer_day_absences" | "volunteer_weekly_blocks" | "user_roles",
  userIds: string[],
): Promise<number> {
  if (userIds.length === 0) {
    return 0;
  }

  const { count, error } = await admin
    .from(table)
    .select("user_id", { count: "exact", head: true })
    .in("user_id", userIds);

  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }

  return count ?? 0;
}

async function deleteByUserIds(
  admin: AdminClient,
  table: "volunteer_day_absences" | "volunteer_weekly_blocks" | "user_roles",
  userIds: string[],
): Promise<number> {
  if (userIds.length === 0) {
    return 0;
  }

  const { data, error } = await admin
    .from(table)
    .delete()
    .in("user_id", userIds)
    .select("user_id");

  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }

  return data?.length ?? 0;
}

async function countByAdmissionIds(
  admin: AdminClient,
  table: "patient_checkins" | "patient_context" | "patient_questions",
  admissionIds: string[],
): Promise<number> {
  if (admissionIds.length === 0) {
    return 0;
  }

  const { count, error } = await admin
    .from(table)
    .select("admission_id", { count: "exact", head: true })
    .in("admission_id", admissionIds);

  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }

  return count ?? 0;
}

async function deleteByAdmissionIds(
  admin: AdminClient,
  table: "patient_checkins" | "patient_context" | "patient_questions",
  admissionIds: string[],
): Promise<number> {
  if (admissionIds.length === 0) {
    return 0;
  }

  const { data, error } = await admin
    .from(table)
    .delete()
    .in("admission_id", admissionIds)
    .select("admission_id");

  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }

  return data?.length ?? 0;
}

async function main(): Promise<void> {
  loadProjectEnv();

  const dryRun = process.argv.includes("--dry-run");
  const admin = createDemoAdminClient();
  const counts = createEmptyCounts();

  console.log(
    dryRun
      ? "Running demo cleanup dry-run..."
      : "Running demo cleanup (live delete)...",
  );

  const demoUsers = await getDemoAuthUsers(admin);
  const demoUserIds = demoUsers.map((user) => user.id);
  const volunteerUserIds = demoUsers
    .filter((user) => user.email?.includes("volunteer"))
    .map((user) => user.id);
  const patientAccountUserIds = demoUsers
    .filter((user) => user.email?.includes("patient"))
    .map((user) => user.id);
  const demoPatientIds = await getDemoPatientIds(admin);
  const demoAdmissionIds = await getDemoAdmissionIds(admin, demoPatientIds);

  counts.volunteerDayAbsences = await countByUserIds(
    admin,
    "volunteer_day_absences",
    volunteerUserIds,
  );
  counts.volunteerWeeklyBlocks = await countByUserIds(
    admin,
    "volunteer_weekly_blocks",
    volunteerUserIds,
  );

  if (demoUserIds.length > 0) {
    const { count, error } = await admin
      .from("daily_participation_plans")
      .select("id", { count: "exact", head: true })
      .in("recorded_by_user_id", demoUserIds);

    if (error) {
      throw new Error(error.message);
    }

    counts.dailyParticipationPlans = count ?? 0;
  }

  counts.patientCheckins = await countByAdmissionIds(
    admin,
    "patient_checkins",
    demoAdmissionIds,
  );
  counts.patientContext = await countByAdmissionIds(
    admin,
    "patient_context",
    demoAdmissionIds,
  );
  counts.patientQuestions = await countByAdmissionIds(
    admin,
    "patient_questions",
    demoAdmissionIds,
  );

  if (patientAccountUserIds.length > 0) {
    const { count, error } = await admin
      .from("patient_account_links")
      .select("id", { count: "exact", head: true })
      .in("user_id", patientAccountUserIds);

    if (error) {
      throw new Error(error.message);
    }

    counts.patientAccountLinks = count ?? 0;
  }

  if (demoPatientIds.length > 0) {
    const { count, error } = await admin
      .from("admissions")
      .select("id", { count: "exact", head: true })
      .in("patient_id", demoPatientIds);

    if (error) {
      throw new Error(error.message);
    }

    counts.admissions = count ?? 0;
  }

  counts.patients = demoPatientIds.length;

  if (demoUserIds.length > 0) {
    const { count, error } = await admin
      .from("account_audit_events")
      .select("id", { count: "exact", head: true })
      .in("target_user_id", demoUserIds);

    if (error) {
      throw new Error(error.message);
    }

    counts.accountAuditEvents = count ?? 0;
  }

  counts.userRoles = await countByUserIds(admin, "user_roles", demoUserIds);
  counts.authUsers = demoUsers.length;

  printCounts(counts, dryRun);

  if (dryRun) {
    console.log("Dry-run complete. No records were deleted.");
    return;
  }

  const liveCounts = createEmptyCounts();

  liveCounts.volunteerDayAbsences = await deleteByUserIds(
    admin,
    "volunteer_day_absences",
    volunteerUserIds,
  );
  liveCounts.volunteerWeeklyBlocks = await deleteByUserIds(
    admin,
    "volunteer_weekly_blocks",
    volunteerUserIds,
  );

  if (demoUserIds.length > 0) {
    const { data, error } = await admin
      .from("daily_participation_plans")
      .delete()
      .in("recorded_by_user_id", demoUserIds)
      .select("id");

    if (error) {
      throw new Error(error.message);
    }

    liveCounts.dailyParticipationPlans = data?.length ?? 0;
  }

  liveCounts.patientCheckins = await deleteByAdmissionIds(
    admin,
    "patient_checkins",
    demoAdmissionIds,
  );
  liveCounts.patientContext = await deleteByAdmissionIds(
    admin,
    "patient_context",
    demoAdmissionIds,
  );
  liveCounts.patientQuestions = await deleteByAdmissionIds(
    admin,
    "patient_questions",
    demoAdmissionIds,
  );

  if (patientAccountUserIds.length > 0) {
    const { data, error } = await admin
      .from("patient_account_links")
      .delete()
      .in("user_id", patientAccountUserIds)
      .select("id");

    if (error) {
      throw new Error(error.message);
    }

    liveCounts.patientAccountLinks = data?.length ?? 0;
  }

  if (demoPatientIds.length > 0) {
    const { data, error } = await admin
      .from("admissions")
      .delete()
      .in("patient_id", demoPatientIds)
      .select("id");

    if (error) {
      throw new Error(error.message);
    }

    liveCounts.admissions = data?.length ?? 0;
  }

  if (demoPatientIds.length > 0) {
    const { data, error } = await admin
      .from("patients")
      .delete()
      .in("id", demoPatientIds)
      .select("id");

    if (error) {
      throw new Error(error.message);
    }

    liveCounts.patients = data?.length ?? 0;
  }

  if (demoUserIds.length > 0) {
    const { data, error } = await admin
      .from("account_audit_events")
      .delete()
      .in("target_user_id", demoUserIds)
      .select("id");

    if (error) {
      throw new Error(error.message);
    }

    liveCounts.accountAuditEvents = data?.length ?? 0;
  }

  liveCounts.userRoles = await deleteByUserIds(admin, "user_roles", demoUserIds);

  for (const user of demoUsers) {
    const { error } = await admin.auth.admin.deleteUser(user.id);

    if (error) {
      throw new Error(`Failed to delete auth user ${user.email}: ${error.message}`);
    }

    liveCounts.authUsers += 1;
  }

  printCounts(liveCounts, false);
  console.log("Demo cleanup completed successfully.");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error("\nDemo cleanup failed:", message);
  process.exitCode = 1;
});
