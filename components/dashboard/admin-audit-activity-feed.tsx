import Link from "next/link";

import {
  formatAuditEventOverviewParts,
  formatAuditEventUserDetailParts,
} from "@/lib/admin/format-audit-event";
import { formatAdminAuditTimestamp } from "@/lib/utils/amsterdam-date";
import type { AccountAuditEvent } from "@/types/admin-account";

interface AuditActivityItemProps {
  event: AccountAuditEvent;
  variant: "overview" | "user-detail";
}

function AuditTargetLink({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) {
  return (
    <Link
      href={`/admin/users/${userId}`}
      className="font-medium text-blue-slate-700 hover:underline"
    >
      {name}
    </Link>
  );
}

export function AuditActivityItem({ event, variant }: AuditActivityItemProps) {
  if (variant === "user-detail") {
    const { actorName, actionPhrase } = formatAuditEventUserDetailParts(event);

    return (
      <li className="border-b border-dust-grey-100 py-2.5 last:border-0">
        <p className="text-sm text-carbon-black-700">
          <span>{actorName}</span>{" "}
          <span className="font-medium text-carbon-black-900">{actionPhrase}</span>
          <span>.</span>
        </p>
        <p className="mt-0.5 text-xs text-carbon-black-500">
          {formatAdminAuditTimestamp(event.createdAt)}
        </p>
      </li>
    );
  }

  const { actorName, leadPhrase, trailingPhrase, targetName, targetUserId } =
    formatAuditEventOverviewParts(event);

  return (
    <li className="border-b border-dust-grey-100 py-2.5 last:border-0">
      <p className="text-sm text-carbon-black-700">
        <span>{actorName}</span>{" "}
        <span className="font-medium text-carbon-black-900">{leadPhrase}</span>{" "}
        {targetUserId ? (
          <AuditTargetLink userId={targetUserId} name={targetName} />
        ) : (
          <span className="font-medium text-carbon-black-900">{targetName}</span>
        )}
        {trailingPhrase ? (
          <>
            {" "}
            <span className="font-medium text-carbon-black-900">
              {trailingPhrase}
            </span>
          </>
        ) : null}
        <span>.</span>
      </p>
      <p className="mt-0.5 text-xs text-carbon-black-500">
        {formatAdminAuditTimestamp(event.createdAt)}
      </p>
    </li>
  );
}

interface AuditActivityFeedProps {
  events: AccountAuditEvent[];
  variant: "overview" | "user-detail";
  emptyMessage?: string;
}

export function AuditActivityFeed({
  events,
  variant,
  emptyMessage,
}: AuditActivityFeedProps) {
  if (events.length === 0) {
    if (!emptyMessage) {
      return null;
    }

    return (
      <p className="text-sm text-carbon-black-600">{emptyMessage}</p>
    );
  }

  return (
    <ul className="divide-y divide-dust-grey-100">
      {events.map((event) => (
        <AuditActivityItem key={event.id} event={event} variant={variant} />
      ))}
    </ul>
  );
}
