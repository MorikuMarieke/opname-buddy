"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { VOLUNTEER_COPY } from "@/lib/constants/volunteer-copy";
import { formatVolunteerAvailabilityExceptionLine } from "@/lib/utils/amsterdam-date";
import type { VolunteerAvailabilityException } from "@/types/activity";

interface VolunteerAvailabilityExceptionCardProps {
  item: VolunteerAvailabilityException;
  isDeleting?: boolean;
  onDelete: (id: string) => Promise<void>;
}

export function VolunteerAvailabilityExceptionCard({
  item,
  isDeleting = false,
  onDelete,
}: VolunteerAvailabilityExceptionCardProps) {
  const copy = VOLUNTEER_COPY.availability;
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function handleCancelDelete() {
    setConfirmingDelete(false);
  }

  async function handleConfirmDelete() {
    try {
      await onDelete(item.id);
      setConfirmingDelete(false);
    } catch {
      // Keep confirmation open so the user can retry or cancel.
    }
  }

  return (
    <article className="min-w-0 max-w-full rounded-xl border border-parchment-200 bg-white p-3 shadow-card">
      <div className="flex min-w-0 flex-col gap-2 min-[380px]:flex-row min-[380px]:items-start min-[380px]:justify-between min-[380px]:gap-3">
        <p className="min-w-0 text-sm font-medium leading-snug text-carbon-black-900 min-[380px]:flex-1">
          {formatVolunteerAvailabilityExceptionLine(
            item.exceptionDate,
            item.startTime,
            item.endTime,
          )}
        </p>
        {!confirmingDelete ? (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            disabled={isDeleting}
            aria-label={copy.deleteExceptionAriaLabel}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center self-end rounded-full border border-dust-grey-200 bg-white text-carbon-black-600 transition-colors hover:border-cherry-rose-200 hover:bg-cherry-rose-50 hover:text-cherry-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pearl-aqua-600 disabled:opacity-50 min-[380px]:self-start"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </div>

      <div className="mt-2 space-y-1">
        <StatusBadge variant={item.kind === "extra" ? "positive" : "attention"}>
          {item.kind === "extra" ? copy.kindExtra : copy.kindUnavailable}
        </StatusBadge>
        {item.note ? (
          <p className="text-sm text-carbon-black-600">{item.note}</p>
        ) : null}
      </div>

      {confirmingDelete ? (
        <div className="mt-3 border-t border-dust-grey-100 pt-3">
          <p className="text-sm text-carbon-black-900">{copy.deleteConfirmPrompt}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <PrimaryButton
              type="button"
              size="sm"
              disabled={isDeleting}
              className="bg-cherry-rose-600 hover:bg-cherry-rose-700"
              onClick={handleConfirmDelete}
            >
              {isDeleting ? copy.deleteConfirmBusy : copy.deleteConfirmYes}
            </PrimaryButton>
            <SecondaryButton
              type="button"
              size="sm"
              disabled={isDeleting}
              onClick={handleCancelDelete}
            >
              {copy.deleteConfirmCancel}
            </SecondaryButton>
          </div>
        </div>
      ) : null}
    </article>
  );
}
