"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/require-role";
import {
  createStaffAccount,
  createVolunteerAccount,
  getAdminOverviewStats,
  getStaffAccountById,
  getVolunteerAccountById,
  listPatientAccounts,
  listRecentAuditEvents,
  listRecentAuditEventsForTargetUser,
  listRolesWithCounts,
  listStaffAccounts,
  listVolunteerAccounts,
  setAccountActive,
  setStaffRoles,
  updateAccountProfile,
} from "@/lib/services/admin-accounts";
import {
  createStaffAccountSchema,
  createVolunteerAccountSchema,
  setStaffRolesSchema,
  updateAccountProfileSchema,
} from "@/lib/validations/admin-account";
import type {
  AdminOverviewStats,
  AccountAuditEvent,
  PatientAccountSummary,
  RoleWithCount,
  StaffAccountSummary,
  VolunteerAccountSummary,
} from "@/types/admin-account";

import type { StaffRoleName } from "@/lib/constants/admin-account-copy";

function revalidateAdminPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/admin/roles");
}

export async function fetchStaffAccountsAction(options?: {
  search?: string;
  status?: "active" | "inactive" | "all";
  role?: StaffRoleName;
}): Promise<StaffAccountSummary[]> {
  await requireRole("admin");
  return listStaffAccounts(options);
}

export async function fetchPatientAccountsAction(options?: {
  linkStatus?: "linked" | "unlinked" | "all";
}): Promise<PatientAccountSummary[]> {
  await requireRole("admin");
  return listPatientAccounts(options);
}

export async function fetchVolunteerAccountsAction(options?: {
  search?: string;
  status?: "active" | "inactive" | "all";
}): Promise<VolunteerAccountSummary[]> {
  await requireRole("admin");
  return listVolunteerAccounts(options);
}

export async function fetchStaffAccountAction(
  userId: string,
): Promise<StaffAccountSummary | null> {
  await requireRole("admin");
  return getStaffAccountById(userId);
}

export async function fetchVolunteerAccountAction(
  userId: string,
): Promise<VolunteerAccountSummary | null> {
  await requireRole("admin");
  return getVolunteerAccountById(userId);
}

export async function fetchRolesWithCountsAction(): Promise<RoleWithCount[]> {
  await requireRole("admin");
  return listRolesWithCounts();
}

export async function fetchAdminOverviewStatsAction(): Promise<AdminOverviewStats> {
  await requireRole("admin");
  return getAdminOverviewStats();
}

export async function fetchRecentAuditEventsAction(
  limit = 10,
): Promise<AccountAuditEvent[]> {
  await requireRole("admin");
  return listRecentAuditEvents(limit);
}

export async function fetchRecentAuditEventsForTargetUserAction(
  targetUserId: string,
  limit = 10,
): Promise<AccountAuditEvent[]> {
  await requireRole("admin");
  return listRecentAuditEventsForTargetUser(targetUserId, limit);
}

export async function createStaffAccountAction(
  input: unknown,
): Promise<{ userId: string } | { error: string }> {
  const { user } = await requireRole("admin");
  const parsed = createStaffAccountSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }

  try {
    const result = await createStaffAccount(parsed.data, user.id);
    revalidateAdminPaths();
    return result;
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Account aanmaken is mislukt.",
    };
  }
}

export async function createVolunteerAccountAction(
  input: unknown,
): Promise<{ userId: string } | { error: string }> {
  const { user } = await requireRole("admin");
  const parsed = createVolunteerAccountSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }

  try {
    const result = await createVolunteerAccount(parsed.data, user.id);
    revalidateAdminPaths();
    return result;
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Account aanmaken is mislukt.",
    };
  }
}

export async function updateAccountProfileAction(
  userId: string,
  input: unknown,
): Promise<{ ok: true } | { error: string }> {
  const { user } = await requireRole("admin");
  const parsed = updateAccountProfileSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }

  try {
    await updateAccountProfile(userId, parsed.data, user.id);
    revalidateAdminPaths();
    revalidatePath(`/admin/users/${userId}`);
    return { ok: true };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Profiel bijwerken is mislukt.",
    };
  }
}

export async function setStaffRolesAction(
  userId: string,
  input: unknown,
): Promise<{ ok: true } | { error: string }> {
  const { user } = await requireRole("admin");
  const parsed = setStaffRolesSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }

  try {
    await setStaffRoles(userId, parsed.data.roles as StaffRoleName[], user.id);
    revalidateAdminPaths();
    revalidatePath(`/admin/users/${userId}`);
    return { ok: true };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Rollen bijwerken is mislukt.",
    };
  }
}

export async function setAccountActiveAction(
  userId: string,
  active: boolean,
): Promise<{ ok: true } | { error: string }> {
  const { user } = await requireRole("admin");

  try {
    await setAccountActive(userId, active, user.id);
    revalidateAdminPaths();
    revalidatePath(`/admin/users/${userId}`);
    return { ok: true };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Accountstatus bijwerken is mislukt.",
    };
  }
}
