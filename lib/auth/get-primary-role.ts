import { ROLE_PRIORITY } from "@/lib/auth/constants";
import type { RoleName } from "@/types/database";

export function getPrimaryRole(roles: RoleName[]): RoleName | null {
  for (const role of ROLE_PRIORITY) {
    if (roles.includes(role)) {
      return role;
    }
  }

  return null;
}
