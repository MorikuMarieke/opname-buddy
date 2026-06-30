"use server";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getPrimaryRole } from "@/lib/auth/get-primary-role";
import { getRoleRedirectPath } from "@/lib/auth/get-role-redirect-path";
import { fetchRolesForUser } from "@/lib/auth/fetch-roles-for-user";
import { createAdminClient } from "@/lib/supabase/admin";

export async function resolvePostLoginRedirect(): Promise<string> {
  const user = await getCurrentUser();

  if (!user) {
    return "/login";
  }

  const admin = createAdminClient();
  const { roles, error } = await fetchRolesForUser(admin, user.id);

  if (error) {
    return "/login?error=roles";
  }

  return getRoleRedirectPath(getPrimaryRole(roles));
}
