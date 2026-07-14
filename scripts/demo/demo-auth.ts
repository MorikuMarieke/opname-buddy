import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

import type { Database, RoleName } from "../../types/database";
import { DEMO_PASSWORD, isDemoEmail } from "./demo-constants";

export type AdminClient = SupabaseClient<Database>;

export interface RoleMaps {
  byName: Map<RoleName, string>;
  byId: Map<string, RoleName>;
}

export function createDemoAdminClient(): AdminClient {
  const url =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function loadRoleMaps(admin: AdminClient): Promise<RoleMaps> {
  const { data, error } = await admin.from("roles").select("id, name");

  if (error) {
    throw new Error(error.message);
  }

  const byName = new Map<RoleName, string>();
  const byId = new Map<string, RoleName>();
  const roleNames: RoleName[] = [
    "patient",
    "caregiver",
    "activity_coordinator",
    "volunteer",
    "admin",
  ];

  for (const row of data ?? []) {
    if (!roleNames.includes(row.name as RoleName)) {
      continue;
    }

    const roleName = row.name as RoleName;
    byName.set(roleName, row.id);
    byId.set(row.id, roleName);
  }

  return { byName, byId };
}

export async function listAllAuthUsers(admin: AdminClient): Promise<User[]> {
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

export function isDemoAuthUser(user: User): boolean {
  return (
    isDemoEmail(user.email) &&
    user.app_metadata?.demo_account === true
  );
}

export async function findAuthUserByEmail(
  admin: AdminClient,
  email: string,
): Promise<User | null> {
  const users = await listAllAuthUsers(admin);
  const normalized = email.toLowerCase();

  return (
    users.find((user) => user.email?.toLowerCase() === normalized) ?? null
  );
}

async function removeAutoAssignedPatientRole(
  admin: AdminClient,
  userId: string,
  roleMaps: RoleMaps,
): Promise<void> {
  const patientRoleId = roleMaps.byName.get("patient");

  if (!patientRoleId) {
    return;
  }

  const { error } = await admin
    .from("user_roles")
    .delete()
    .eq("user_id", userId)
    .eq("role_id", patientRoleId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function ensureUserRoles(
  admin: AdminClient,
  userId: string,
  roleNames: RoleName[],
  roleMaps: RoleMaps,
): Promise<number> {
  let inserted = 0;

  for (const roleName of roleNames) {
    const roleId = roleMaps.byName.get(roleName);

    if (!roleId) {
      throw new Error(`Role not found: ${roleName}`);
    }

    const { data: existing, error: existingError } = await admin
      .from("user_roles")
      .select("user_id")
      .eq("user_id", userId)
      .eq("role_id", roleId)
      .maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (existing) {
      continue;
    }

    const { error } = await admin.from("user_roles").insert({
      user_id: userId,
      role_id: roleId,
    });

    if (error) {
      throw new Error(error.message);
    }

    inserted += 1;
  }

  return inserted;
}

export interface EnsureDemoUserOptions {
  email: string;
  fullName: string;
  accountType?: "staff" | "volunteer" | "patient";
  roles?: RoleName[];
}

export interface EnsureDemoUserResult {
  userId: string;
  created: boolean;
  rolesInserted: number;
}

export async function ensureDemoUser(
  admin: AdminClient,
  roleMaps: RoleMaps,
  options: EnsureDemoUserOptions,
): Promise<EnsureDemoUserResult> {
  const existing = await findAuthUserByEmail(admin, options.email);

  if (existing) {
    if (!isDemoAuthUser(existing)) {
      throw new Error(
        `Refusing to modify non-demo account with demo email: ${options.email}`,
      );
    }

    const { error: profileError } = await admin
      .from("profiles")
      .update({
        full_name: options.fullName,
        preferred_language: "nl",
        is_active: true,
      })
      .eq("id", existing.id);

    if (profileError) {
      throw new Error(profileError.message);
    }

    const rolesInserted = options.roles
      ? await ensureUserRoles(admin, existing.id, options.roles, roleMaps)
      : 0;

    return {
      userId: existing.id,
      created: false,
      rolesInserted,
    };
  }

  const metadata: Record<string, string> = {
    full_name: options.fullName,
  };

  const appMetadata: Record<string, unknown> = {
    demo_account: true,
  };

  if (options.accountType === "staff") {
    metadata.account_type = "staff";
    appMetadata.account_type = "staff";
  } else if (options.accountType === "volunteer") {
    metadata.account_type = "volunteer";
    appMetadata.account_type = "volunteer";
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: options.email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: metadata,
    app_metadata: appMetadata,
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? "Failed to create demo user");
  }

  const userId = data.user.id;

  if (options.accountType === "staff" || options.accountType === "volunteer") {
    await removeAutoAssignedPatientRole(admin, userId, roleMaps);
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      full_name: options.fullName,
      preferred_language: "nl",
      is_active: true,
    })
    .eq("id", userId);

  if (profileError) {
    await admin.auth.admin.deleteUser(userId);
    throw new Error(profileError.message);
  }

  const rolesToAssign =
    options.roles ??
    (options.accountType === "patient" ? (["patient"] as RoleName[]) : []);

  const rolesInserted = await ensureUserRoles(
    admin,
    userId,
    rolesToAssign,
    roleMaps,
  );

  return {
    userId,
    created: true,
    rolesInserted,
  };
}

export async function ensurePatientRole(
  admin: AdminClient,
  userId: string,
  roleMaps: RoleMaps,
): Promise<void> {
  await ensureUserRoles(admin, userId, ["patient"], roleMaps);
}

export async function getDemoUserIdsByEmail(
  admin: AdminClient,
  emails: string[],
): Promise<Map<string, string>> {
  const users = await listAllAuthUsers(admin);
  const wanted = new Set(emails.map((email) => email.toLowerCase()));
  const map = new Map<string, string>();

  for (const user of users) {
    const email = user.email?.toLowerCase();

    if (!email || !wanted.has(email)) {
      continue;
    }

    if (!isDemoAuthUser(user)) {
      continue;
    }

    map.set(email, user.id);
  }

  return map;
}
