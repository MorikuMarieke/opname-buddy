import { fetchRolesForUser } from "@/lib/auth/fetch-roles-for-user";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAdminClient } from "@/lib/supabase/admin";
import type { RoleName } from "@/types/database";

export async function getCurrentUserRoles(): Promise<RoleName[]> {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  const admin = createAdminClient();
  const { roles, error } = await fetchRolesForUser(admin, user.id);

  if (error) {
    console.error("[getCurrentUserRoles]", error);
    return [];
  }

  return roles;
}
