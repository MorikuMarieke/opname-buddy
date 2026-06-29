import { ROLE_ROUTES } from "@/lib/auth/constants";
import type { RoleName } from "@/types/database";

export function getRoleRedirectPath(role: RoleName | null): string {
  if (!role) {
    return "/unauthorized";
  }

  return ROLE_ROUTES[role];
}
