import {
  addAmsterdamDays,
  birthDateFromAge,
  getAmsterdamDateString,
  getDayOfWeekFromIsoDate,
} from "./amsterdam-date";
import {
  createDemoAdminClient,
  ensureDemoUser,
  ensurePatientRole,
  isDemoAuthUser,
  loadRoleMaps,
  type AdminClient,
} from "./demo-auth";
import {
  DEMO_DAILY_PLANS,
  DEMO_PATIENT_SCENARIOS,
  DEMO_STAFF_ACCOUNTS,
  DEMO_VOLUNTEER_ACCOUNTS,
  isDemoPatientRef,
  type DemoPatientScenario,
  type DemoVolunteerAccountDefinition,
} from "./demo-constants";
import { loadProjectEnv } from "./load-env";

interface SeedSummary {
  accountsCreated: number;
  accountsSkipped: number;
  rolesInserted: number;
  patientsCreated: number;
  patientsUpdated: number;
  admissionsCreated: number;
  admissionsUpdated: number;
  contextsCreated: number;
  contextsUpdated: number;
  linksCreated: number;
  linksSkipped: number;
  checkinsCreated: number;
  checkinsUpdated: number;
  volunteerBiosUpdated: number;
  weeklyBlockRowsWritten: number;
  absencesInserted: number;
  absencesSkipped: number;
  plansCreated: number;
  plansUpdated: number;
  plansSkipped: number;
}

function createEmptySummary(): SeedSummary {
  return {
    accountsCreated: 0,
    accountsSkipped: 0,
    rolesInserted: 0,
    patientsCreated: 0,
    patientsUpdated: 0,
    admissionsCreated: 0,
    admissionsUpdated: 0,
    contextsCreated: 0,
    contextsUpdated: 0,
    linksCreated: 0,
    linksSkipped: 0,
    checkinsCreated: 0,
    checkinsUpdated: 0,
    volunteerBiosUpdated: 0,
    weeklyBlockRowsWritten: 0,
    absencesInserted: 0,
    absencesSkipped: 0,
    plansCreated: 0,
    plansUpdated: 0,
    plansSkipped: 0,
  };
}

function printSummary(summary: SeedSummary, today: string, tomorrow: string): void {
  console.log("\n=== Demo seed summary ===");
  console.log(`Amsterdam today: ${today}`);
  console.log(`Amsterdam tomorrow: ${tomorrow}`);
  console.log(`Accounts created: ${summary.accountsCreated}`);
  console.log(`Accounts skipped (existing): ${summary.accountsSkipped}`);
  console.log(`Roles inserted: ${summary.rolesInserted}`);
  console.log(`Patients created: ${summary.patientsCreated}`);
  console.log(`Patients updated: ${summary.patientsUpdated}`);
  console.log(`Admissions created: ${summary.admissionsCreated}`);
  console.log(`Admissions updated: ${summary.admissionsUpdated}`);
  console.log(`Patient context created: ${summary.contextsCreated}`);
  console.log(`Patient context updated: ${summary.contextsUpdated}`);
  console.log(`Account links created: ${summary.linksCreated}`);
  console.log(`Account links skipped: ${summary.linksSkipped}`);
  console.log(`Check-ins created: ${summary.checkinsCreated}`);
  console.log(`Check-ins updated: ${summary.checkinsUpdated}`);
  console.log(`Volunteer bios updated: ${summary.volunteerBiosUpdated}`);
  console.log(`Weekly block rows written: ${summary.weeklyBlockRowsWritten}`);
  console.log(`Volunteer absences inserted: ${summary.absencesInserted}`);
  console.log(`Volunteer absences skipped: ${summary.absencesSkipped}`);
  console.log(`Daily plans created: ${summary.plansCreated}`);
  console.log(`Daily plans updated: ${summary.plansUpdated}`);
  console.log(`Daily plans skipped (non-demo owner): ${summary.plansSkipped}`);
  console.log("=========================\n");
}

async function loadDepartmentIdsByName(
  admin: AdminClient,
): Promise<Map<string, string>> {
  const { data, error } = await admin
    .from("departments")
    .select("id, name")
    .eq("is_active", true);

  if (error) {
    throw new Error(error.message);
  }

  return new Map((data ?? []).map((row) => [row.name, row.id]));
}

async function seedStaffAccounts(
  admin: AdminClient,
  summary: SeedSummary,
): Promise<Map<string, string>> {
  const roleMaps = await loadRoleMaps(admin);
  const userIds = new Map<string, string>();

  for (const account of DEMO_STAFF_ACCOUNTS) {
    const result = await ensureDemoUser(admin, roleMaps, {
      email: account.email,
      fullName: account.fullName,
      accountType: "staff",
      roles: account.roles,
    });

    userIds.set(account.email.toLowerCase(), result.userId);

    if (result.created) {
      summary.accountsCreated += 1;
    } else {
      summary.accountsSkipped += 1;
    }

    summary.rolesInserted += result.rolesInserted;
  }

  return userIds;
}

async function seedVolunteerAccounts(
  admin: AdminClient,
  summary: SeedSummary,
): Promise<Map<string, string>> {
  const roleMaps = await loadRoleMaps(admin);
  const userIds = new Map<string, string>();

  for (const volunteer of DEMO_VOLUNTEER_ACCOUNTS) {
    const result = await ensureDemoUser(admin, roleMaps, {
      email: volunteer.email,
      fullName: volunteer.fullName,
      accountType: "volunteer",
      roles: ["volunteer"],
    });

    userIds.set(volunteer.email.toLowerCase(), result.userId);

    if (result.created) {
      summary.accountsCreated += 1;
    } else {
      summary.accountsSkipped += 1;
    }

    summary.rolesInserted += result.rolesInserted;

    const { error: bioError } = await admin
      .from("profiles")
      .update({ volunteer_bio: volunteer.bio })
      .eq("id", result.userId);

    if (bioError) {
      throw new Error(bioError.message);
    }

    summary.volunteerBiosUpdated += 1;
  }

  return userIds;
}

async function seedPatientAccounts(
  admin: AdminClient,
  summary: SeedSummary,
): Promise<Map<string, string>> {
  const roleMaps = await loadRoleMaps(admin);
  const userIds = new Map<string, string>();

  for (const patient of DEMO_PATIENT_SCENARIOS) {
    const result = await ensureDemoUser(admin, roleMaps, {
      email: patient.accountEmail,
      fullName: patient.firstName,
      accountType: "patient",
      roles: ["patient"],
    });

    userIds.set(patient.accountEmail.toLowerCase(), result.userId);

    if (result.created) {
      summary.accountsCreated += 1;
    } else {
      summary.accountsSkipped += 1;
    }

    summary.rolesInserted += result.rolesInserted;
  }

  return userIds;
}

async function upsertDemoPatient(
  admin: AdminClient,
  scenario: DemoPatientScenario,
  staffUserId: string,
  departmentIds: Map<string, string>,
  today: string,
  summary: SeedSummary,
): Promise<{ patientId: string; admissionId: string }> {
  const departmentId = departmentIds.get(scenario.departmentName);

  if (!departmentId) {
    throw new Error(`Department not found: ${scenario.departmentName}`);
  }

  const birthDate = birthDateFromAge(scenario.age, today);
  const admittedOn = addAmsterdamDays(today, -scenario.daysAdmittedAgo);
  const expectedDischargeOn =
    scenario.expectedDischargeOffsetDays !== undefined
      ? addAmsterdamDays(today, scenario.expectedDischargeOffsetDays)
      : null;

  const { data: existingPatient, error: existingPatientError } = await admin
    .from("patients")
    .select("id, external_ref")
    .eq("external_ref", scenario.ref)
    .maybeSingle();

  if (existingPatientError) {
    throw new Error(existingPatientError.message);
  }

  let patientId: string;

  if (existingPatient) {
    if (!isDemoPatientRef(existingPatient.external_ref)) {
      throw new Error(`Refusing to update non-demo patient ref: ${scenario.ref}`);
    }

    const { error: updateError } = await admin
      .from("patients")
      .update({
        first_name: scenario.firstName,
        last_name: scenario.lastName,
        birth_date: birthDate,
        sex: scenario.sex,
      })
      .eq("id", existingPatient.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    patientId = existingPatient.id;
    summary.patientsUpdated += 1;
  } else {
    const { data: insertedPatient, error: insertError } = await admin
      .from("patients")
      .insert({
        first_name: scenario.firstName,
        last_name: scenario.lastName,
        birth_date: birthDate,
        sex: scenario.sex,
        external_ref: scenario.ref,
        created_by_staff_id: staffUserId,
      })
      .select("id")
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    patientId = insertedPatient.id;
    summary.patientsCreated += 1;
  }

  const { data: existingAdmission, error: existingAdmissionError } = await admin
    .from("admissions")
    .select("id")
    .eq("patient_id", patientId)
    .eq("status", "active")
    .maybeSingle();

  if (existingAdmissionError) {
    throw new Error(existingAdmissionError.message);
  }

  let admissionId: string;

  if (existingAdmission) {
    const { error: updateAdmissionError } = await admin
      .from("admissions")
      .update({
        department_id: departmentId,
        room_number: scenario.roomNumber,
        expected_discharge_on: expectedDischargeOn,
      })
      .eq("id", existingAdmission.id);

    if (updateAdmissionError) {
      throw new Error(updateAdmissionError.message);
    }

    admissionId = existingAdmission.id;
    summary.admissionsUpdated += 1;
  } else {
    const { data: insertedAdmission, error: insertAdmissionError } = await admin
      .from("admissions")
      .insert({
        patient_id: patientId,
        admitted_on: admittedOn,
        status: "active",
        department_id: departmentId,
        room_number: scenario.roomNumber,
        expected_discharge_on: expectedDischargeOn,
        created_by_staff_id: staffUserId,
      })
      .select("id")
      .single();

    if (insertAdmissionError) {
      throw new Error(insertAdmissionError.message);
    }

    admissionId = insertedAdmission.id;
    summary.admissionsCreated += 1;
  }

  const contextPayload = {
    admission_id: admissionId,
    mobility_status: scenario.context.mobilityStatus,
    transfer_support: scenario.context.transferSupport,
    fall_risk: scenario.context.fallRisk,
    requires_supervision: scenario.context.requiresSupervision,
    mobility_aid_type: scenario.context.mobilityAidType,
    mobility_aid_available: scenario.context.mobilityAidAvailable,
    isolation_type: "none" as const,
    room_restriction: scenario.context.roomRestriction,
    can_independently_reach_activity_room:
      scenario.context.canIndependentlyReachActivityRoom,
    additional_attention_points: scenario.context.additionalAttentionPoints,
    additional_attention_notes: scenario.admissionReason,
    notes: scenario.context.notes,
    updated_by_staff_id: staffUserId,
  };

  const { data: existingContext, error: existingContextError } = await admin
    .from("patient_context")
    .select("id")
    .eq("admission_id", admissionId)
    .maybeSingle();

  if (existingContextError) {
    throw new Error(existingContextError.message);
  }

  if (existingContext) {
    const { error: updateContextError } = await admin
      .from("patient_context")
      .update(contextPayload)
      .eq("id", existingContext.id);

    if (updateContextError) {
      throw new Error(updateContextError.message);
    }

    summary.contextsUpdated += 1;
  } else {
    const { error: insertContextError } = await admin
      .from("patient_context")
      .insert(contextPayload);

    if (insertContextError) {
      throw new Error(insertContextError.message);
    }

    summary.contextsCreated += 1;
  }

  return { patientId, admissionId };
}

async function ensurePatientAccountLink(
  admin: AdminClient,
  patientId: string,
  userId: string,
  summary: SeedSummary,
): Promise<void> {
  const { data: existingLink, error: existingLinkError } = await admin
    .from("patient_account_links")
    .select("id, patient_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingLinkError) {
    throw new Error(existingLinkError.message);
  }

  if (existingLink) {
    if (existingLink.patient_id !== patientId) {
      throw new Error(
        `Demo account ${userId} already linked to a different patient`,
      );
    }

    summary.linksSkipped += 1;
    return;
  }

  const { error: insertLinkError } = await admin
    .from("patient_account_links")
    .insert({
      patient_id: patientId,
      user_id: userId,
      method: "staff_manual",
    });

  if (insertLinkError) {
    throw new Error(insertLinkError.message);
  }

  const roleMaps = await loadRoleMaps(admin);
  await ensurePatientRole(admin, userId, roleMaps);
  summary.linksCreated += 1;
}

async function upsertTodayCheckIn(
  admin: AdminClient,
  admissionId: string,
  scenario: DemoPatientScenario,
  today: string,
  summary: SeedSummary,
): Promise<void> {
  const { data: existingCheckins, error: existingCheckinsError } = await admin
    .from("patient_checkins")
    .select("id")
    .eq("admission_id", admissionId)
    .eq("check_in_date", today)
    .order("created_at", { ascending: false })
    .limit(1);

  if (existingCheckinsError) {
    throw new Error(existingCheckinsError.message);
  }

  const payload = {
    admission_id: admissionId,
    check_in_date: today,
    pain_score: scenario.checkIn.painScore,
    energy_level: scenario.checkIn.energyLevel,
    mood: scenario.checkIn.mood,
    mobility_level: scenario.checkIn.mobilityLevel,
    motivation_score: scenario.checkIn.motivationScore,
    participation_needs: scenario.checkIn.participationNeeds,
    symptoms: scenario.checkIn.symptoms,
    note: scenario.checkIn.note || null,
  };

  const existing = existingCheckins?.[0];

  if (existing) {
    const { error: updateError } = await admin
      .from("patient_checkins")
      .update(payload)
      .eq("id", existing.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    summary.checkinsUpdated += 1;
    return;
  }

  const { error: insertError } = await admin
    .from("patient_checkins")
    .insert(payload);

  if (insertError) {
    throw new Error(insertError.message);
  }

  summary.checkinsCreated += 1;
}

function getVolunteerTodayAbsenceBlock(
  volunteer: DemoVolunteerAccountDefinition,
  today: string,
): "morning" | "afternoon" | null {
  if (!volunteer.absenceTodayFirstBlock) {
    return null;
  }

  const dayOfWeek = getDayOfWeekFromIsoDate(today);
  const todayBlocks = volunteer.weeklyBlocks.filter(
    (block) => block.dayOfWeek === dayOfWeek,
  );

  if (todayBlocks.length === 0) {
    return null;
  }

  const block = todayBlocks[0];

  if (block.morningAvailable) {
    return "morning";
  }

  if (block.afternoonAvailable) {
    return "afternoon";
  }

  return null;
}

async function seedVolunteerAvailability(
  admin: AdminClient,
  volunteer: DemoVolunteerAccountDefinition,
  userId: string,
  today: string,
  summary: SeedSummary,
): Promise<void> {
  const { error: deleteError } = await admin
    .from("volunteer_weekly_blocks")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  const rows = volunteer.weeklyBlocks
    .filter(
      (block) => block.morningAvailable || block.afternoonAvailable,
    )
    .map((block) => ({
      user_id: userId,
      day_of_week: block.dayOfWeek,
      morning_available: block.morningAvailable,
      afternoon_available: block.afternoonAvailable,
    }));

  if (rows.length > 0) {
    const { error: insertError } = await admin
      .from("volunteer_weekly_blocks")
      .insert(rows);

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  summary.weeklyBlockRowsWritten += rows.length;

  const absenceDates: Array<{ absenceDate: string; block: "morning" | "afternoon" }> =
    volunteer.absences.map((absence) => ({
      absenceDate: addAmsterdamDays(today, absence.dayOffset),
      block: absence.block,
    }));

  const todayAbsenceBlock = getVolunteerTodayAbsenceBlock(volunteer, today);

  if (todayAbsenceBlock) {
    absenceDates.push({
      absenceDate: today,
      block: todayAbsenceBlock,
    });
  }

  for (const absence of absenceDates) {
    const { data: existing, error: existingError } = await admin
      .from("volunteer_day_absences")
      .select("id")
      .eq("user_id", userId)
      .eq("absence_date", absence.absenceDate)
      .eq("block", absence.block)
      .maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (existing) {
      summary.absencesSkipped += 1;
      continue;
    }

    const { error: insertError } = await admin
      .from("volunteer_day_absences")
      .insert({
        user_id: userId,
        absence_date: absence.absenceDate,
        block: absence.block,
      });

    if (insertError) {
      if (insertError.code === "23505") {
        summary.absencesSkipped += 1;
        continue;
      }

      throw new Error(insertError.message);
    }

    summary.absencesInserted += 1;
  }
}

async function seedDailyPlans(
  admin: AdminClient,
  demoUserIds: Map<string, string>,
  today: string,
  summary: SeedSummary,
): Promise<void> {
  for (const plan of DEMO_DAILY_PLANS) {
    const planDate = addAmsterdamDays(today, plan.dayOffset);
    const recordedByUserId = demoUserIds.get(plan.recordedByEmail.toLowerCase());

    if (!recordedByUserId) {
      throw new Error(`Recorder not found for daily plan: ${plan.recordedByEmail}`);
    }

    const { data: existingPlan, error: existingPlanError } = await admin
      .from("daily_participation_plans")
      .select("id, recorded_by_user_id")
      .eq("plan_date", planDate)
      .maybeSingle();

    if (existingPlanError) {
      throw new Error(existingPlanError.message);
    }

    if (existingPlan) {
      const recorder = await admin.auth.admin.getUserById(
        existingPlan.recorded_by_user_id,
      );

      const recorderUser = recorder.data.user;

      if (recorderUser && !isDemoAuthUser(recorderUser)) {
        summary.plansSkipped += 1;
        console.warn(
          `Skipping plan for ${planDate}: owned by non-demo user ${recorderUser.email}`,
        );
        continue;
      }

      const { error: updateError } = await admin
        .from("daily_participation_plans")
        .update({
          afternoon_category: plan.afternoonCategory,
          afternoon_title: plan.afternoonTitle,
          participant_message: plan.participantMessage,
          recorded_by_user_id: recordedByUserId,
        })
        .eq("id", existingPlan.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      summary.plansUpdated += 1;
      continue;
    }

    const { error: insertError } = await admin
      .from("daily_participation_plans")
      .insert({
        plan_date: planDate,
        afternoon_category: plan.afternoonCategory,
        afternoon_title: plan.afternoonTitle,
        participant_message: plan.participantMessage,
        recorded_by_user_id: recordedByUserId,
      });

    if (insertError) {
      throw new Error(insertError.message);
    }

    summary.plansCreated += 1;
  }
}

async function main(): Promise<void> {
  loadProjectEnv();

  const summary = createEmptySummary();
  const today = getAmsterdamDateString();
  const tomorrow = addAmsterdamDays(today, 1);
  const admin = createDemoAdminClient();

  console.log("Seeding OpnameBuddy demo dataset...");

  const staffUserIds = await seedStaffAccounts(admin, summary);
  const volunteerUserIds = await seedVolunteerAccounts(admin, summary);
  const patientUserIds = await seedPatientAccounts(admin, summary);

  const caregiverUserId =
    staffUserIds.get("caregiver1.demo@opnamebuddy.test") ??
    (() => {
      throw new Error("Primary demo caregiver account missing");
    })();

  const departmentIds = await loadDepartmentIdsByName(admin);

  for (const scenario of DEMO_PATIENT_SCENARIOS) {
    const { patientId, admissionId } = await upsertDemoPatient(
      admin,
      scenario,
      caregiverUserId,
      departmentIds,
      today,
      summary,
    );

    const patientUserId = patientUserIds.get(scenario.accountEmail.toLowerCase());

    if (!patientUserId) {
      throw new Error(`Patient account missing for ${scenario.accountEmail}`);
    }

    await ensurePatientAccountLink(admin, patientId, patientUserId, summary);
    await upsertTodayCheckIn(admin, admissionId, scenario, today, summary);
  }

  for (const volunteer of DEMO_VOLUNTEER_ACCOUNTS) {
    const userId = volunteerUserIds.get(volunteer.email.toLowerCase());

    if (!userId) {
      throw new Error(`Volunteer account missing for ${volunteer.email}`);
    }

    await seedVolunteerAvailability(admin, volunteer, userId, today, summary);
  }

  const allDemoUserIds = new Map<string, string>([
    ...staffUserIds,
    ...volunteerUserIds,
    ...patientUserIds,
  ]);

  await seedDailyPlans(admin, allDemoUserIds, today, summary);

  printSummary(summary, today, tomorrow);
  console.log("Demo seed completed successfully.");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error("\nDemo seed failed:", message);
  process.exitCode = 1;
});
