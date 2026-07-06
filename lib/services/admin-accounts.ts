import type { User } from "@supabase/supabase-js";

import { isRoleName } from "@/lib/auth/constants";
import {
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  STAFF_ROLE_NAMES,
} from "@/lib/constants/admin-account-copy";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json, RoleName } from "@/types/database";
import type {
  AccountAuditAction,
  AccountAuditEvent,
  AdminOverviewStats,
  PatientAccountSummary,
  RoleWithCount,
  StaffAccountSummary,
} from "@/types/admin-account";
import type { CreateStaffAccountInput } from "@/lib/validations/admin-account";
import type { UpdateAccountProfileInput } from "@/lib/validations/admin-account";

type StaffRoleName = (typeof STAFF_ROLE_NAMES)[number];

interface RoleMaps {
  byName: Map<RoleName, string>;
  byId: Map<string, RoleName>;
}

interface AccountContext {
  authUsersById: Map<string, User>;
  profilesById: Map<string, { full_name: string | null; preferred_language: string; created_at: string }>;
  rolesByUserId: Map<string, RoleName[]>;
  patientLinksByUserId: Map<string, { patient_id: string; patient_name: string | null }>;
}

function isStaffRole(role: RoleName): role is StaffRoleName {
  return (STAFF_ROLE_NAMES as readonly RoleName[]).includes(role);
}

function isUserActive(user: User | undefined): boolean {
  if (!user?.banned_until) {
    return true;
  }

  return new Date(user.banned_until) <= new Date();
}

function hasStaffRoles(roles: RoleName[]): boolean {
  return roles.some(isStaffRole);
}

function hasPatientRole(roles: RoleName[]): boolean {
  return roles.includes("patient");
}

async function loadRoleMaps(): Promise<RoleMaps> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("roles").select("id, name");

  if (error) {
    throw new Error(error.message);
  }

  const byName = new Map<RoleName, string>();
  const byId = new Map<string, RoleName>();

  for (const row of data ?? []) {
    if (!isRoleName(row.name)) {
      continue;
    }

    byName.set(row.name, row.id);
    byId.set(row.id, row.name);
  }

  return { byName, byId };
}

async function listAllAuthUsers(): Promise<User[]> {
  const admin = createAdminClient();
  const users: User[] = [];
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });

    if (error) {
      throw new Error(error.message);
    }

    const batch = data.users ?? [];
    users.push(...batch);

    if (batch.length < perPage) {
      break;
    }

    page += 1;
  }

  return users;
}

async function loadAccountContext(): Promise<AccountContext> {
  const admin = createAdminClient();
  const roleMaps = await loadRoleMaps();

  const [authUsers, profilesResult, assignmentsResult, linksResult] =
    await Promise.all([
      listAllAuthUsers(),
      admin.from("profiles").select("id, full_name, preferred_language, created_at"),
      admin.from("user_roles").select("user_id, role_id"),
      admin
        .from("patient_account_links")
        .select("user_id, patient_id, patients(full_name)"),
    ]);

  if (profilesResult.error) {
    throw new Error(profilesResult.error.message);
  }

  if (assignmentsResult.error) {
    throw new Error(assignmentsResult.error.message);
  }

  if (linksResult.error) {
    throw new Error(linksResult.error.message);
  }

  const authUsersById = new Map(authUsers.map((user) => [user.id, user]));
  const profilesById = new Map(
    (profilesResult.data ?? []).map((profile) => [profile.id, profile]),
  );

  const rolesByUserId = new Map<string, RoleName[]>();

  for (const assignment of assignmentsResult.data ?? []) {
    const roleName = roleMaps.byId.get(assignment.role_id);

    if (!roleName) {
      continue;
    }

    const existing = rolesByUserId.get(assignment.user_id) ?? [];
    existing.push(roleName);
    rolesByUserId.set(assignment.user_id, existing);
  }

  const patientLinksByUserId = new Map<
    string,
    { patient_id: string; patient_name: string | null }
  >();

  for (const link of linksResult.data ?? []) {
    const patient = link.patients as { full_name: string } | null;

    patientLinksByUserId.set(link.user_id, {
      patient_id: link.patient_id,
      patient_name: patient?.full_name ?? null,
    });
  }

  return {
    authUsersById,
    profilesById,
    rolesByUserId,
    patientLinksByUserId,
  };
}

async function writeAuditEvent(
  actorUserId: string,
  targetUserId: string,
  action: AccountAuditAction,
  metadata: Json = {},
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("account_audit_events").insert({
    actor_user_id: actorUserId,
    target_user_id: targetUserId,
    action,
    metadata,
  });

  if (error) {
    throw new Error(error.message);
  }
}

async function countActiveAdmins(excludeUserId?: string): Promise<number> {
  const admin = createAdminClient();
  const roleMaps = await loadRoleMaps();
  const adminRoleId = roleMaps.byName.get("admin");

  if (!adminRoleId) {
    return 0;
  }

  let query = admin
    .from("user_roles")
    .select("user_id", { count: "exact", head: true })
    .eq("role_id", adminRoleId);

  if (excludeUserId) {
    query = query.neq("user_id", excludeUserId);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

function toStaffSummary(
  userId: string,
  context: AccountContext,
): StaffAccountSummary | null {
  const roles = context.rolesByUserId.get(userId) ?? [];
  const staffRoles = roles.filter(isStaffRole);

  if (staffRoles.length === 0) {
    return null;
  }

  const profile = context.profilesById.get(userId);
  const authUser = context.authUsersById.get(userId);

  return {
    id: userId,
    email: authUser?.email ?? "",
    fullName: profile?.full_name ?? null,
    preferredLanguage: profile?.preferred_language ?? "nl",
    roles: staffRoles,
    isActive: isUserActive(authUser),
    departmentId: null,
    createdAt: profile?.created_at ?? authUser?.created_at ?? "",
  };
}

function toPatientSummary(
  userId: string,
  context: AccountContext,
): PatientAccountSummary | null {
  const roles = context.rolesByUserId.get(userId) ?? [];

  if (!hasPatientRole(roles) || hasStaffRoles(roles)) {
    return null;
  }

  const profile = context.profilesById.get(userId);
  const authUser = context.authUsersById.get(userId);
  const link = context.patientLinksByUserId.get(userId);

  return {
    id: userId,
    email: authUser?.email ?? "",
    fullName: profile?.full_name ?? null,
    isActive: isUserActive(authUser),
    isLinked: Boolean(link),
    linkedPatientId: link?.patient_id ?? null,
    linkedPatientName: link?.patient_name ?? null,
    createdAt: profile?.created_at ?? authUser?.created_at ?? "",
  };
}

export async function listStaffAccounts(options?: {
  search?: string;
  status?: "active" | "inactive" | "all";
}): Promise<StaffAccountSummary[]> {
  const context = await loadAccountContext();
  const search = options?.search?.trim().toLowerCase() ?? "";
  const status = options?.status ?? "all";

  let accounts: StaffAccountSummary[] = [];

  for (const userId of context.profilesById.keys()) {
    const summary = toStaffSummary(userId, context);

    if (!summary) {
      continue;
    }

    accounts.push(summary);
  }

  if (search) {
    accounts = accounts.filter((account) => {
      const haystack = `${account.fullName ?? ""} ${account.email}`.toLowerCase();
      return haystack.includes(search);
    });
  }

  if (status === "active") {
    accounts = accounts.filter((account) => account.isActive);
  } else if (status === "inactive") {
    accounts = accounts.filter((account) => !account.isActive);
  }

  return accounts.sort((a, b) =>
    (a.fullName ?? a.email).localeCompare(b.fullName ?? b.email, "nl"),
  );
}

export async function listPatientAccounts(options?: {
  linkStatus?: "linked" | "unlinked" | "all";
}): Promise<PatientAccountSummary[]> {
  const context = await loadAccountContext();
  const linkStatus = options?.linkStatus ?? "all";

  let accounts: PatientAccountSummary[] = [];

  for (const userId of context.profilesById.keys()) {
    const summary = toPatientSummary(userId, context);

    if (!summary) {
      continue;
    }

    accounts.push(summary);
  }

  if (linkStatus === "linked") {
    accounts = accounts.filter((account) => account.isLinked);
  } else if (linkStatus === "unlinked") {
    accounts = accounts.filter((account) => !account.isLinked);
  }

  return accounts.sort((a, b) =>
    (a.fullName ?? a.email).localeCompare(b.fullName ?? b.email, "nl"),
  );
}

export async function getStaffAccountById(
  userId: string,
): Promise<StaffAccountSummary | null> {
  const context = await loadAccountContext();
  return toStaffSummary(userId, context);
}

export async function createStaffAccount(
  input: CreateStaffAccountInput,
  actorUserId: string,
): Promise<{ userId: string }> {
  const admin = createAdminClient();
  const roleMaps = await loadRoleMaps();

  const { data, error } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.fullName },
    app_metadata: { account_type: "staff" },
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? "Account aanmaken is mislukt.");
  }

  const userId = data.user.id;

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      full_name: input.fullName,
      preferred_language: "nl",
    })
    .eq("id", userId);

  if (profileError) {
    throw new Error(profileError.message);
  }

  const roleRows = input.roles.map((roleName) => ({
    user_id: userId,
    role_id: roleMaps.byName.get(roleName)!,
  }));

  const { error: rolesError } = await admin.from("user_roles").insert(roleRows);

  if (rolesError) {
    throw new Error(rolesError.message);
  }

  await writeAuditEvent(actorUserId, userId, "account_created", {
    email: input.email,
    roles: input.roles,
  });

  for (const roleName of input.roles) {
    await writeAuditEvent(actorUserId, userId, "role_assigned", {
      role: roleName,
    });
  }

  return { userId };
}

export async function updateAccountProfile(
  userId: string,
  input: UpdateAccountProfileInput,
  actorUserId: string,
): Promise<void> {
  const admin = createAdminClient();

  const { error } = await admin
    .from("profiles")
    .update({
      full_name: input.fullName,
      preferred_language: input.preferredLanguage,
    })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }

  await writeAuditEvent(actorUserId, userId, "profile_updated", {
    full_name: input.fullName,
    preferred_language: input.preferredLanguage,
  });
}

export async function setStaffRoles(
  userId: string,
  roleNames: StaffRoleName[],
  actorUserId: string,
): Promise<void> {
  if (roleNames.length === 0) {
    throw new Error("Selecteer minimaal één rol.");
  }

  const account = await getStaffAccountById(userId);

  if (!account) {
    throw new Error("Geen staffaccount gevonden.");
  }

  const currentStaffRoles = account.roles;
  const removingAdmin =
    currentStaffRoles.includes("admin") && !roleNames.includes("admin");

  if (userId === actorUserId && removingAdmin) {
    const otherAdmins = await countActiveAdmins(userId);

    if (otherAdmins === 0) {
      throw new Error("Je kunt je eigen laatste beheerdersrol niet verwijderen.");
    }
  }

  const roleMaps = await loadRoleMaps();
  const admin = createAdminClient();

  const toAssign = roleNames.filter(
    (roleName) => !currentStaffRoles.includes(roleName),
  );
  const toRevoke = currentStaffRoles.filter(
    (roleName): roleName is StaffRoleName =>
      isStaffRole(roleName) && !roleNames.includes(roleName),
  );

  if (toRevoke.length > 0) {
    const revokeIds = toRevoke.map((roleName) => roleMaps.byName.get(roleName)!);

    const { error } = await admin
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .in("role_id", revokeIds);

    if (error) {
      throw new Error(error.message);
    }

    for (const roleName of toRevoke) {
      await writeAuditEvent(actorUserId, userId, "role_revoked", {
        role: roleName,
      });
    }
  }

  if (toAssign.length > 0) {
    const rows = toAssign.map((roleName) => ({
      user_id: userId,
      role_id: roleMaps.byName.get(roleName)!,
    }));

    const { error } = await admin.from("user_roles").insert(rows);

    if (error) {
      throw new Error(error.message);
    }

    for (const roleName of toAssign) {
      await writeAuditEvent(actorUserId, userId, "role_assigned", {
        role: roleName,
      });
    }
  }
}

export async function setAccountActive(
  userId: string,
  active: boolean,
  actorUserId: string,
): Promise<void> {
  if (userId === actorUserId && !active) {
    throw new Error("Je kunt je eigen account niet deactiveren.");
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: active ? "none" : "876000h",
  });

  if (error) {
    throw new Error(error.message);
  }

  await writeAuditEvent(
    actorUserId,
    userId,
    active ? "account_reactivated" : "account_deactivated",
  );
}

export async function listRolesWithCounts(): Promise<RoleWithCount[]> {
  const context = await loadAccountContext();
  const counts = new Map<RoleName, number>();

  for (const roles of context.rolesByUserId.values()) {
    for (const role of roles) {
      counts.set(role, (counts.get(role) ?? 0) + 1);
    }
  }

  const allRoles: RoleName[] = [
    "patient",
    "caregiver",
    "activity_coordinator",
    "admin",
  ];

  return allRoles.map((name) => ({
    name,
    label: ROLE_LABELS[name],
    description: ROLE_DESCRIPTIONS[name],
    userCount: counts.get(name) ?? 0,
  }));
}

export async function listRecentAuditEvents(
  limit = 10,
): Promise<AccountAuditEvent[]> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("account_audit_events")
    .select("id, actor_user_id, target_user_id, action, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  const events = data ?? [];

  if (events.length === 0) {
    return [];
  }

  const profileIds = [
    ...new Set(
      events.flatMap((event) => [event.actor_user_id, event.target_user_id]),
    ),
  ];

  const { data: profiles, error: profilesError } = await admin
    .from("profiles")
    .select("id, full_name")
    .in("id", profileIds);

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  const namesById = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile.full_name]),
  );

  return events.map((row) => ({
    id: row.id,
    actorUserId: row.actor_user_id,
    actorName: namesById.get(row.actor_user_id) ?? null,
    targetUserId: row.target_user_id,
    targetName: namesById.get(row.target_user_id) ?? null,
    action: row.action as AccountAuditAction,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: row.created_at,
  }));
}

export async function getAdminOverviewStats(): Promise<AdminOverviewStats> {
  const [staffAccounts, patientAccounts, roleCountsList] = await Promise.all([
    listStaffAccounts(),
    listPatientAccounts(),
    listRolesWithCounts(),
  ]);

  const roleCounts = Object.fromEntries(
    roleCountsList.map((role) => [role.name, role.userCount]),
  ) as Record<RoleName, number>;

  return {
    staffTotal: staffAccounts.length,
    staffActive: staffAccounts.filter((account) => account.isActive).length,
    staffInactive: staffAccounts.filter((account) => !account.isActive).length,
    patientAccountsTotal: patientAccounts.length,
    patientAccountsLinked: patientAccounts.filter((account) => account.isLinked)
      .length,
    roleCounts,
  };
}

export async function ensurePatientRole(userId: string): Promise<void> {
  const admin = createAdminClient();
  const roleMaps = await loadRoleMaps();
  const patientRoleId = roleMaps.byName.get("patient");

  if (!patientRoleId) {
    throw new Error("Patiëntrol niet gevonden.");
  }

  const { data: existing, error: existingError } = await admin
    .from("user_roles")
    .select("user_id")
    .eq("user_id", userId)
    .eq("role_id", patientRoleId)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing) {
    return;
  }

  const { error } = await admin.from("user_roles").insert({
    user_id: userId,
    role_id: patientRoleId,
  });

  if (error) {
    throw new Error(error.message);
  }
}



