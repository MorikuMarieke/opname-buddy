import type { StaffRoleName } from "@/lib/constants/admin-account-copy";
import type { RoleName } from "@/types/database";

export type AdminUsersTab = "staff" | "patients" | "volunteers";

export type AdminUsersStatus = "active" | "inactive";

export interface AdminUsersFilters {
  tab: AdminUsersTab;
  role?: StaffRoleName;
  status?: AdminUsersStatus;
  search?: string;
}

const STAFF_ROLES: readonly StaffRoleName[] = [
  "caregiver",
  "activity_coordinator",
  "admin",
];

interface ReadonlyURLSearchParamsLike {
  get(name: string): string | null;
}

function isStaffRole(value: string): value is StaffRoleName {
  return (STAFF_ROLES as readonly string[]).includes(value);
}

function isValidTab(value: string | null): value is AdminUsersTab {
  return value === "staff" || value === "patients" || value === "volunteers";
}

function isValidStatus(value: string | null): value is AdminUsersStatus {
  return value === "active" || value === "inactive";
}

export function parseAdminUsersFilters(
  searchParams: URLSearchParams | ReadonlyURLSearchParamsLike,
): AdminUsersFilters {
  const rawTab = searchParams.get("tab");
  const rawRole = searchParams.get("role");
  const rawStatus = searchParams.get("status");
  const search = searchParams.get("search")?.trim() ?? "";

  let tab: AdminUsersTab = isValidTab(rawTab) ? rawTab : "staff";

  if (rawRole === "patient") {
    tab = "patients";
  }

  if (rawRole === "volunteer") {
    tab = "volunteers";
  }

  const role =
    rawRole &&
    rawRole !== "patient" &&
    rawRole !== "volunteer" &&
    isStaffRole(rawRole)
      ? rawRole
      : undefined;

  const status = isValidStatus(rawStatus) ? rawStatus : undefined;

  return {
    tab,
    role: tab === "staff" ? role : undefined,
    status: tab === "staff" || tab === "volunteers" ? status : undefined,
    search:
      (tab === "staff" || tab === "volunteers") && search ? search : undefined,
  };
}

export function buildAdminUsersUrl(
  filters: Partial<AdminUsersFilters>,
): string {
  const params = new URLSearchParams();

  const tab = filters.tab ?? "staff";

  if (tab === "patients") {
    params.set("tab", "patients");
  } else if (tab === "volunteers") {
    params.set("tab", "volunteers");
  } else if (filters.role || filters.status || filters.search) {
    params.set("tab", "staff");
  }

  if (tab === "staff" && filters.role) {
    params.set("role", filters.role);
  }

  if (tab === "staff" && filters.status) {
    params.set("status", filters.status);
  }

  if (tab === "staff" && filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  if (tab === "volunteers" && filters.status) {
    params.set("status", filters.status);
  }

  if (tab === "volunteers" && filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  const query = params.toString();
  return query ? `/admin/users?${query}` : "/admin/users";
}

export function getUsersUrlForRole(role: RoleName): string {
  if (role === "patient") {
    return buildAdminUsersUrl({ tab: "patients" });
  }

  if (role === "volunteer") {
    return buildAdminUsersUrl({ tab: "volunteers" });
  }

  if (isStaffRole(role)) {
    return buildAdminUsersUrl({ tab: "staff", role });
  }

  return buildAdminUsersUrl({ tab: "staff" });
}
