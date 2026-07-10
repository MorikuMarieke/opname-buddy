"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import {
  DAY_OF_WEEK_LABELS,
  DAYS_OF_WEEK,
  type DayOfWeek,
} from "@/lib/constants/planning-enums";
import { VOLUNTEER_COPY } from "@/lib/constants/volunteer-copy";
import { formatAmsterdamTime } from "@/lib/utils/amsterdam-date";
import type { VolunteerRecurringAvailability } from "@/types/activity";

const inputClasses =
  "h-11 w-full rounded-xl border border-dust-grey-200 bg-parchment-50 px-4 text-sm text-carbon-black-900";

interface VolunteerRecurringAvailabilityCardProps {
  item: VolunteerRecurringAvailability;
  isDeleting?: boolean;
  isUpdating?: boolean;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (input: {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }) => Promise<void>;
}

export function VolunteerRecurringAvailabilityCard({
  item,
  isDeleting = false,
  isUpdating = false,
  onDelete,
  onUpdate,
}: VolunteerRecurringAvailabilityCardProps) {
  const copy = VOLUNTEER_COPY.availability;
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(item.dayOfWeek);
  const [startTime, setStartTime] = useState(item.startTime);
  const [endTime, setEndTime] = useState(item.endTime);
  const [editError, setEditError] = useState<string | null>(null);

  function clearEditError() {
    if (editError !== null) {
      setEditError(null);
    }
  }

  function handleCancelEdit() {
    setIsEditing(false);
    setDayOfWeek(item.dayOfWeek);
    setStartTime(item.startTime);
    setEndTime(item.endTime);
    setEditError(null);
  }

  async function handleSaveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEditError(null);

    try {
      await onUpdate({
        id: item.id,
        dayOfWeek,
        startTime,
        endTime,
      });
      setIsEditing(false);
    } catch (submitError) {
      setEditError(
        submitError instanceof Error
          ? submitError.message
          : "Opslaan is mislukt.",
      );
    }
  }

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

  if (isEditing) {
    return (
      <article className="min-w-0 max-w-full overflow-hidden rounded-xl border border-parchment-200 bg-white p-3 shadow-card">
        <form onSubmit={handleSaveEdit} className="grid min-w-0 gap-3 md:grid-cols-4">
          <label className="min-w-0 space-y-1 text-sm">
            <span className="font-medium">Weekdag</span>
            <select
              className={inputClasses}
              value={dayOfWeek}
              onChange={(event) => {
                setDayOfWeek(Number(event.target.value) as DayOfWeek);
                clearEditError();
              }}
            >
              {DAYS_OF_WEEK.map((day) => (
                <option key={day} value={day}>
                  {DAY_OF_WEEK_LABELS[day]}
                </option>
              ))}
            </select>
          </label>
          <label className="min-w-0 space-y-1 text-sm">
            <span className="font-medium">Van</span>
            <input
              type="time"
              required
              className={inputClasses}
              value={startTime}
              onChange={(event) => {
                setStartTime(event.target.value);
                clearEditError();
              }}
            />
          </label>
          <label className="min-w-0 space-y-1 text-sm">
            <span className="font-medium">Tot</span>
            <input
              type="time"
              required
              className={inputClasses}
              value={endTime}
              onChange={(event) => {
                setEndTime(event.target.value);
                clearEditError();
              }}
            />
          </label>
          <div className="min-w-0 flex flex-wrap items-end gap-2">
            <PrimaryButton type="submit" size="sm" disabled={isUpdating}>
              {copy.saveRecurringEdit}
            </PrimaryButton>
            <SecondaryButton
              type="button"
              size="sm"
              disabled={isUpdating}
              onClick={handleCancelEdit}
            >
              {copy.cancelRecurringEdit}
            </SecondaryButton>
          </div>
        </form>

        {editError ? (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {editError}
          </p>
        ) : null}
      </article>
    );
  }

  return (
    <article className="min-w-0 max-w-full overflow-hidden rounded-xl border border-parchment-200 bg-white p-3 shadow-card">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <p className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-sm font-medium text-carbon-black-900 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {DAY_OF_WEEK_LABELS[item.dayOfWeek]} · {formatAmsterdamTime(item.startTime)}{" "}
          – {formatAmsterdamTime(item.endTime)}
        </p>
        <div className="flex shrink-0 items-center gap-1">
          {!confirmingDelete ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                disabled={isDeleting || isUpdating}
                aria-label={copy.editRecurringAriaLabel}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-dust-grey-200 bg-white text-carbon-black-600 transition-colors hover:border-pearl-aqua-200 hover:bg-pearl-aqua-50 hover:text-pearl-aqua-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pearl-aqua-600 disabled:opacity-50"
              >
                <Pencil className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                disabled={isDeleting || isUpdating}
                aria-label={copy.deleteRecurringAriaLabel}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-dust-grey-200 bg-white text-carbon-black-600 transition-colors hover:border-cherry-rose-200 hover:bg-cherry-rose-50 hover:text-cherry-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pearl-aqua-600 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </>
          ) : null}
        </div>
      </div>

      {confirmingDelete ? (
        <div className="mt-3 border-t border-dust-grey-100 pt-3">
          <p className="text-sm text-carbon-black-900">
            {copy.deleteRecurringConfirmPrompt}
          </p>
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
