import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { getCurrentUserRoles } from "@/lib/auth/get-current-user-roles";
import { requireAuth } from "@/lib/auth/require-auth";
import type { RoleName } from "@/types/database";

interface RequireRoleResult {
  user: User;
  roles: RoleName[];
}

export async function requireRole(role: RoleName): Promise<RequireRoleResult> {
  const user = await requireAuth();
  const roles = await getCurrentUserRoles();

  if (!roles.includes(role)) {
    redirect("/unauthorized");
  }

  return { user, roles };
}
