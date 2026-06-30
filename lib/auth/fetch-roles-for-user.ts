import type { SupabaseClient } from "@supabase/supabase-js";

import { isRoleName } from "@/lib/auth/constants";
import type { Database, RoleName } from "@/types/database";

export interface FetchRolesResult {
  roles: RoleName[];
  error: string | null;
}

export async function fetchRolesForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<FetchRolesResult> {
  const { data: assignments, error: assignmentsError } = await supabase
    .from("user_roles")
    .select("role_id")
    .eq("user_id", userId);

  if (assignmentsError) {
    return { roles: [], error: assignmentsError.message };
  }

  if (!assignments?.length) {
    return { roles: [], error: null };
  }

  const roleIds = assignments.map((row) => row.role_id);

  const { data: roles, error: rolesError } = await supabase
    .from("roles")
    .select("name")
    .in("id", roleIds);

  if (rolesError) {
    return { roles: [], error: rolesError.message };
  }

  const roleNames = (roles ?? [])
    .map((row) => row.name)
    .filter((name): name is RoleName => isRoleName(name));

  return { roles: roleNames, error: null };
}
