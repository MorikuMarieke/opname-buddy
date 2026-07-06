import type { RoleName } from "@/types/database";

export type AccountAuditAction =
  | "role_assigned"
  | "role_revoked"
  | "profile_updated"
  | "account_created"
  | "account_deactivated"
  | "account_reactivated";

export interface StaffAccountSummary {
  id: string;
  email: string;
  fullName: string | null;
  preferredLanguage: string;
  roles: RoleName[];
  isActive: boolean;
  departmentId: null;
  createdAt: string;
}

export interface PatientAccountSummary {
  id: string;
  email: string;
  fullName: string | null;
  isActive: boolean;
  isLinked: boolean;
  linkedPatientId: string | null;
  linkedPatientName: string | null;
  createdAt: string;
}

export interface RoleWithCount {
  name: RoleName;
  label: string;
  description: string;
  userCount: number;
}

export interface AccountAuditEvent {
  id: string;
  actorUserId: string;
  actorName: string | null;
  targetUserId: string;
  targetName: string | null;
  action: AccountAuditAction;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface AdminOverviewStats {
  staffTotal: number;
  staffActive: number;
  staffInactive: number;
  patientAccountsTotal: number;
  patientAccountsLinked: number;
  roleCounts: Record<RoleName, number>;
}
