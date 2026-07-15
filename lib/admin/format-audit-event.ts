import { ROLE_LABELS } from "@/lib/constants/admin-account-copy";
import type { RoleName } from "@/types/database";
import type { AccountAuditAction, AccountAuditEvent } from "@/types/admin-account";

export interface AuditEventOverviewParts {
  actorName: string;
  leadPhrase: string;
  trailingPhrase?: string;
  targetName: string;
  targetUserId: string | null;
}

export interface AuditEventUserDetailParts {
  actorName: string;
  actionPhrase: string;
}

function getActorName(event: AccountAuditEvent): string {
  return event.actorName?.trim() || "Beheerder";
}

function getTargetName(event: AccountAuditEvent): string {
  return event.targetName?.trim() || "Gebruiker";
}

function getRoleLabelFromMetadata(
  metadata: Record<string, unknown>,
): string | null {
  const role = metadata.role;

  if (typeof role !== "string") {
    return null;
  }

  if (role in ROLE_LABELS) {
    return ROLE_LABELS[role as RoleName];
  }

  return null;
}

function getOverviewLeadPhrase(
  action: AccountAuditAction,
  roleLabel: string | null,
): string {
  switch (action) {
    case "role_assigned":
      return roleLabel
        ? `heeft de rol ${roleLabel} toegekend aan`
        : "heeft een rol toegekend aan";
    case "role_revoked":
      return roleLabel
        ? `heeft de rol ${roleLabel} verwijderd bij`
        : "heeft een rol verwijderd bij";
    case "profile_updated":
      return "heeft het profiel van";
    case "account_created":
      return "heeft een account aangemaakt voor";
    case "account_deactivated":
      return "heeft het account van";
    case "account_reactivated":
      return "heeft het account van";
    default:
      return "heeft een wijziging doorgevoerd voor";
  }
}

function getOverviewTrailingPhrase(
  action: AccountAuditAction,
): string | undefined {
  switch (action) {
    case "account_deactivated":
      return "gedeactiveerd";
    case "account_reactivated":
      return "opnieuw geactiveerd";
    default:
      return undefined;
  }
}

function getUserDetailActionPhrase(
  action: AccountAuditAction,
  roleLabel: string | null,
): string {
  switch (action) {
    case "role_assigned":
      return roleLabel
        ? `heeft de rol ${roleLabel} toegekend`
        : "heeft een rol toegekend";
    case "role_revoked":
      return roleLabel
        ? `heeft de rol ${roleLabel} verwijderd`
        : "heeft een rol verwijderd";
    case "profile_updated":
      return "heeft het profiel bijgewerkt";
    case "account_created":
      return "heeft dit account aangemaakt";
    case "account_deactivated":
      return "heeft dit account gedeactiveerd";
    case "account_reactivated":
      return "heeft dit account opnieuw geactiveerd";
    default:
      return "heeft een wijziging doorgevoerd";
  }
}

export function formatAuditEventOverviewParts(
  event: AccountAuditEvent,
): AuditEventOverviewParts {
  const roleLabel = getRoleLabelFromMetadata(event.metadata);

  return {
    actorName: getActorName(event),
    leadPhrase: getOverviewLeadPhrase(event.action, roleLabel),
    trailingPhrase: getOverviewTrailingPhrase(event.action),
    targetName: getTargetName(event),
    targetUserId: event.targetUserId,
  };
}

export function formatAuditEventUserDetailParts(
  event: AccountAuditEvent,
): AuditEventUserDetailParts {
  const roleLabel = getRoleLabelFromMetadata(event.metadata);

  return {
    actorName: getActorName(event),
    actionPhrase: getUserDetailActionPhrase(event.action, roleLabel),
  };
}
