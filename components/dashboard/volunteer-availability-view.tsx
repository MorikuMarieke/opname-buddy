"use client";

import { useState } from "react";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  useCreateVolunteerAvailabilityException,
  useCreateVolunteerRecurringAvailability,
  useDeleteVolunteerAvailabilityException,
  useSetVolunteerRecurringAvailabilityActive,
  useVolunteerAvailabilityExceptions,
  useVolunteerRecurringAvailability,
} from "@/hooks/use-volunteer-availability";
import {
  AVAILABILITY_EXCEPTION_KINDS,
  DAY_OF_WEEK_LABELS,
  DAYS_OF_WEEK,
} from "@/lib/constants/planning-enums";
import { VOLUNTEER_COPY } from "@/lib/constants/volunteer-copy";
import { formatDutchDate } from "@/lib/utils/amsterdam-date";
import { getAmsterdamDateString } from "@/lib/utils/amsterdam-date";

const inputClasses =
  "h-11 w-full rounded-xl border border-dust-grey-200 bg-parchment-50 px-4 text-sm text-carbon-black-900";

export function VolunteerAvailabilityView() {
  const copy = VOLUNTEER_COPY.availability;
  const { data: recurring, isLoading: recurringLoading } =
    useVolunteerRecurringAvailability();
  const { data: exceptions, isLoading: exceptionsLoading } =
    useVolunteerAvailabilityExceptions();

  const createRecurring = useCreateVolunteerRecurringAvailability();
  const setRecurringActive = useSetVolunteerRecurringAvailabilityActive();
  const createException = useCreateVolunteerAvailabilityException();
  const deleteException = useDeleteVolunteerAvailabilityException();

  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [recurringStart, setRecurringStart] = useState("09:00");
  const [recurringEnd, setRecurringEnd] = useState("12:00");
  const [exceptionDate, setExceptionDate] = useState(getAmsterdamDateString());
  const [exceptionStart, setExceptionStart] = useState("09:00");
  const [exceptionEnd, setExceptionEnd] = useState("12:00");
  const [exceptionKind, setExceptionKind] =
    useState<(typeof AVAILABILITY_EXCEPTION_KINDS)[number]>("unavailable");
  const [exceptionNote, setExceptionNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleAddRecurring(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      await createRecurring.mutateAsync({
        dayOfWeek,
        startTime: recurringStart,
        endTime: recurringEnd,
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Opslaan is mislukt.",
      );
    }
  }

  async function handleAddException(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      await createException.mutateAsync({
        exceptionDate,
        startTime: exceptionStart,
        endTime: exceptionEnd,
        kind: exceptionKind,
        note: exceptionNote || null,
      });
      setExceptionNote("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Opslaan is mislukt.",
      );
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title={copy.pageTitle}
        description={copy.pageDescription}
        size="compact"
      />

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <DashboardCard density="compact" title={copy.recurringTitle}>
        <p className="mb-4 text-sm text-carbon-black-600">{copy.recurringHint}</p>

        <form onSubmit={handleAddRecurring} className="mb-4 grid gap-3 md:grid-cols-4">
          <label className="space-y-1 text-sm">
            <span className="font-medium">Weekdag</span>
            <select
              className={inputClasses}
              value={dayOfWeek}
              onChange={(event) => setDayOfWeek(Number(event.target.value))}
            >
              {DAYS_OF_WEEK.map((day) => (
                <option key={day} value={day}>
                  {DAY_OF_WEEK_LABELS[day]}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Van</span>
            <input
              type="time"
              required
              className={inputClasses}
              value={recurringStart}
              onChange={(event) => setRecurringStart(event.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Tot</span>
            <input
              type="time"
              required
              className={inputClasses}
              value={recurringEnd}
              onChange={(event) => setRecurringEnd(event.target.value)}
            />
          </label>
          <div className="flex items-end">
            <PrimaryButton type="submit" disabled={createRecurring.isPending}>
              {copy.addRecurring}
            </PrimaryButton>
          </div>
        </form>

        {recurringLoading ? (
          <p className="text-sm text-carbon-black-600">Laden...</p>
        ) : null}

        {!recurringLoading && !recurring?.length ? (
          <p className="text-sm text-carbon-black-600">{copy.emptyRecurring}</p>
        ) : null}

        {recurring && recurring.length > 0 ? (
          <ul className="divide-y divide-dust-grey-100">
            {recurring.map((slot) => (
              <li
                key={slot.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3"
              >
                <div>
                  <p className="font-medium text-carbon-black-900">
                    {DAY_OF_WEEK_LABELS[slot.dayOfWeek]} · {slot.startTime} –{" "}
                    {slot.endTime}
                  </p>
                  <StatusBadge variant={slot.isActive ? "positive" : "neutral"}>
                    {slot.isActive ? "Actief" : "Inactief"}
                  </StatusBadge>
                </div>
                {slot.isActive ? (
                  <SecondaryButton
                    type="button"
                    disabled={setRecurringActive.isPending}
                    onClick={() =>
                      setRecurringActive.mutate({ id: slot.id, isActive: false })
                    }
                  >
                    {copy.deactivateRecurring}
                  </SecondaryButton>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </DashboardCard>

      <DashboardCard density="compact" title={copy.exceptionsTitle}>
        <p className="mb-4 text-sm text-carbon-black-600">{copy.exceptionsHint}</p>

        <form
          onSubmit={handleAddException}
          className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3"
        >
          <label className="space-y-1 text-sm">
            <span className="font-medium">Datum</span>
            <input
              type="date"
              required
              className={inputClasses}
              value={exceptionDate}
              onChange={(event) => setExceptionDate(event.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Van</span>
            <input
              type="time"
              required
              className={inputClasses}
              value={exceptionStart}
              onChange={(event) => setExceptionStart(event.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Tot</span>
            <input
              type="time"
              required
              className={inputClasses}
              value={exceptionEnd}
              onChange={(event) => setExceptionEnd(event.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Type</span>
            <select
              className={inputClasses}
              value={exceptionKind}
              onChange={(event) =>
                setExceptionKind(
                  event.target.value as (typeof AVAILABILITY_EXCEPTION_KINDS)[number],
                )
              }
            >
              <option value="extra">{copy.kindExtra}</option>
              <option value="unavailable">{copy.kindUnavailable}</option>
            </select>
          </label>
          <label className="space-y-1 text-sm md:col-span-2">
            <span className="font-medium">Notitie (optioneel)</span>
            <input
              type="text"
              className={inputClasses}
              value={exceptionNote}
              onChange={(event) => setExceptionNote(event.target.value)}
            />
          </label>
          <div className="flex items-end">
            <PrimaryButton type="submit" disabled={createException.isPending}>
              {copy.addException}
            </PrimaryButton>
          </div>
        </form>

        {exceptionsLoading ? (
          <p className="text-sm text-carbon-black-600">Laden...</p>
        ) : null}

        {!exceptionsLoading && !exceptions?.length ? (
          <p className="text-sm text-carbon-black-600">{copy.emptyExceptions}</p>
        ) : null}

        {exceptions && exceptions.length > 0 ? (
          <ul className="divide-y divide-dust-grey-100">
            {exceptions.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3"
              >
                <div>
                  <p className="font-medium text-carbon-black-900">
                    {formatDutchDate(item.exceptionDate)} · {item.startTime} –{" "}
                    {item.endTime}
                  </p>
                  <StatusBadge
                    variant={item.kind === "extra" ? "positive" : "attention"}
                  >
                    {item.kind === "extra" ? copy.kindExtra : copy.kindUnavailable}
                  </StatusBadge>
                  {item.note ? (
                    <p className="mt-1 text-sm text-carbon-black-600">{item.note}</p>
                  ) : null}
                </div>
                <SecondaryButton
                  type="button"
                  disabled={deleteException.isPending}
                  onClick={() => deleteException.mutate(item.id)}
                >
                  {copy.deleteException}
                </SecondaryButton>
              </li>
            ))}
          </ul>
        ) : null}
      </DashboardCard>
    </div>
  );
}
