import type { SupabaseClient } from "@supabase/supabase-js";

import { fetchRolesForUser } from "@/lib/auth/fetch-roles-for-user";
import { getPrimaryRole } from "@/lib/auth/get-primary-role";
import { getRoleRedirectPath } from "@/lib/auth/get-role-redirect-path";
import type { Database } from "@/types/database";

export interface ResolveRedirectResult {
  path: string;
  error: string | null;
}

export async function resolveRedirectForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<ResolveRedirectResult> {
  const { roles, error } = await fetchRolesForUser(supabase, userId);
  const primaryRole = getPrimaryRole(roles);

  return {
    path: getRoleRedirectPath(primaryRole),
    error,
  };
}
