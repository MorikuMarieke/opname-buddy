"use client";

import { useState } from "react";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { DutchDateInput } from "@/components/ui/dutch-date-input";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SectionHeader } from "@/components/ui/section-header";
import { VolunteerAvailabilityExceptionCard } from "@/components/dashboard/volunteer-availability-exception-card";
import { VolunteerRecurringAvailabilityCard } from "@/components/dashboard/volunteer-recurring-availability-card";
import {
  useCreateVolunteerAvailabilityException,
  useCreateVolunteerRecurringAvailability,
  useDeleteVolunteerAvailabilityException,
  useDeleteVolunteerRecurringAvailability,
  useUpdateVolunteerRecurringAvailability,
  useVolunteerAvailabilityExceptions,
  useVolunteerRecurringAvailability,
} from "@/hooks/use-volunteer-availability";
import {
  AVAILABILITY_EXCEPTION_KINDS,
  DAY_OF_WEEK_LABELS,
  DAYS_OF_WEEK,
} from "@/lib/constants/planning-enums";
import { VOLUNTEER_COPY } from "@/lib/constants/volunteer-copy";
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
  const updateRecurring = useUpdateVolunteerRecurringAvailability();
  const deleteRecurring = useDeleteVolunteerRecurringAvailability();
  const createException = useCreateVolunteerAvailabilityException();
  const deleteException = useDeleteVolunteerAvailabilityException();

  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [recurringStart, setRecurringStart] = useState("09:00");
  const [recurringEnd, setRecurringEnd] = useState("12:00");
  const [recurringError, setRecurringError] = useState<string | null>(null);
  const [exceptionDate, setExceptionDate] = useState(getAmsterdamDateString());
  const [exceptionStart, setExceptionStart] = useState("09:00");
  const [exceptionEnd, setExceptionEnd] = useState("12:00");
  const [exceptionKind, setExceptionKind] =
    useState<(typeof AVAILABILITY_EXCEPTION_KINDS)[number]>("unavailable");
  const [exceptionNote, setExceptionNote] = useState("");
  const [exceptionError, setExceptionError] = useState<string | null>(null);

  async function handleAddRecurring(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRecurringError(null);

    try {
      await createRecurring.mutateAsync({
        dayOfWeek,
        startTime: recurringStart,
        endTime: recurringEnd,
      });
    } catch (submitError) {
      const errorMessage =
        submitError instanceof Error
          ? submitError.message
          : "Opslaan is mislukt.";
      setRecurringError(errorMessage);
    }
  }

  function clearRecurringError() {
    if (recurringError !== null) {
      setRecurringError(null);
    }
  }

  function handleDayOfWeekChange(value: number) {
    setDayOfWeek(value);
    clearRecurringError();
  }

  function handleRecurringStartChange(value: string) {
    setRecurringStart(value);
    clearRecurringError();
  }

  function handleRecurringEndChange(value: string) {
    setRecurringEnd(value);
    clearRecurringError();
  }

  function clearExceptionError() {
    if (exceptionError !== null) {
      setExceptionError(null);
    }
  }

  async function handleAddException(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setExceptionError(null);

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
      setExceptionError(
        submitError instanceof Error
          ? submitError.message
          : "Opslaan is mislukt.",
      );
    }
  }

  return (
    <div className="min-w-0 max-w-full space-y-4">
      <SectionHeader
        title={copy.pageTitle}
        description={copy.pageDescription}
        size="compact"
      />

      <DashboardCard density="compact" title={copy.recurringTitle} className="min-w-0 max-w-full">
        <p className="mb-4 text-sm text-carbon-black-600">{copy.recurringHint}</p>

        <form onSubmit={handleAddRecurring} className="mb-4 grid min-w-0 gap-3 md:grid-cols-4">
          <label className="min-w-0 space-y-1 text-sm">
            <span className="font-medium">Weekdag</span>
            <select
              className={inputClasses}
              value={dayOfWeek}
              onChange={(event) => handleDayOfWeekChange(Number(event.target.value))}
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
              value={recurringStart}
              onChange={(event) => handleRecurringStartChange(event.target.value)}
            />
          </label>
          <label className="min-w-0 space-y-1 text-sm">
            <span className="font-medium">Tot</span>
            <input
              type="time"
              required
              className={inputClasses}
              value={recurringEnd}
              onChange={(event) => handleRecurringEndChange(event.target.value)}
            />
          </label>
          <div className="min-w-0 flex items-end">
            <PrimaryButton type="submit" disabled={createRecurring.isPending}>
              {copy.addRecurring}
            </PrimaryButton>
          </div>
        </form>

        {recurringError ? (
          <p className="mb-4 text-sm text-red-600" role="alert">
            {recurringError}
          </p>
        ) : null}

        {recurringLoading ? (
          <p className="text-sm text-carbon-black-600">Laden...</p>
        ) : null}

        {!recurringLoading && !recurring?.filter((slot) => slot.isActive).length ? (
          <p className="text-sm text-carbon-black-600">{copy.emptyRecurring}</p>
        ) : null}

        {recurring && recurring.filter((slot) => slot.isActive).length > 0 ? (
          <div className="min-w-0">
            <h3 className="mb-3 text-base font-semibold text-carbon-black-900">
              {copy.recurringListTitle}
            </h3>
            <ul className="min-w-0 space-y-3">
              {recurring
                .filter((slot) => slot.isActive)
                .map((slot) => (
                  <li key={slot.id} className="min-w-0">
                    <VolunteerRecurringAvailabilityCard
                      item={slot}
                      isDeleting={deleteRecurring.isPending}
                      isUpdating={updateRecurring.isPending}
                      onDelete={(id) => deleteRecurring.mutateAsync(id)}
                      onUpdate={async (input) => {
                        await updateRecurring.mutateAsync(input);
                      }}
                    />
                  </li>
                ))}
            </ul>
          </div>
        ) : null}
      </DashboardCard>

      <DashboardCard density="compact" title={copy.exceptionsTitle} className="min-w-0 max-w-full">
        <p className="mb-4 text-sm text-carbon-black-600">{copy.exceptionsHint}</p>

        <form
          onSubmit={handleAddException}
          className="mb-4 grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-3"
        >
          <label className="min-w-0 space-y-1 text-sm">
            <span className="font-medium">Datum</span>
            <DutchDateInput
              required
              className={inputClasses}
              value={exceptionDate}
              onChange={(value) => {
                setExceptionDate(value);
                clearExceptionError();
              }}
              pickerAriaLabel={copy.datePickerAriaLabel}
            />
          </label>
          <label className="min-w-0 space-y-1 text-sm">
            <span className="font-medium">Van</span>
            <input
              type="time"
              required
              className={inputClasses}
              value={exceptionStart}
              onChange={(event) => {
                setExceptionStart(event.target.value);
                clearExceptionError();
              }}
            />
          </label>
          <label className="min-w-0 space-y-1 text-sm">
            <span className="font-medium">Tot</span>
            <input
              type="time"
              required
              className={inputClasses}
              value={exceptionEnd}
              onChange={(event) => {
                setExceptionEnd(event.target.value);
                clearExceptionError();
              }}
            />
          </label>
          <label className="min-w-0 space-y-1 text-sm">
            <span className="font-medium">Type</span>
            <select
              className={inputClasses}
              value={exceptionKind}
              onChange={(event) => {
                setExceptionKind(
                  event.target.value as (typeof AVAILABILITY_EXCEPTION_KINDS)[number],
                );
                clearExceptionError();
              }}
            >
              <option value="extra">{copy.kindExtra}</option>
              <option value="unavailable">{copy.kindUnavailable}</option>
            </select>
          </label>
          <label className="min-w-0 space-y-1 text-sm md:col-span-2">
            <span className="font-medium">Notitie (optioneel)</span>
            <input
              type="text"
              className={inputClasses}
              value={exceptionNote}
              onChange={(event) => {
                setExceptionNote(event.target.value);
                clearExceptionError();
              }}
            />
          </label>
          <div className="min-w-0 flex items-end">
            <PrimaryButton type="submit" disabled={createException.isPending}>
              {copy.addException}
            </PrimaryButton>
          </div>
        </form>

        {exceptionError ? (
          <p className="mb-4 text-sm text-red-600" role="alert">
            {exceptionError}
          </p>
        ) : null}

        {exceptionsLoading ? (
          <p className="text-sm text-carbon-black-600">Laden...</p>
        ) : null}

        {!exceptionsLoading && !exceptions?.length ? (
          <p className="text-sm text-carbon-black-600">{copy.emptyExceptions}</p>
        ) : null}

        {exceptions && exceptions.length > 0 ? (
          <ul className="min-w-0 space-y-3">
            {exceptions.map((item) => (
              <li key={item.id} className="min-w-0">
                <VolunteerAvailabilityExceptionCard
                  item={item}
                  isDeleting={deleteException.isPending}
                  onDelete={(id) => deleteException.mutateAsync(id)}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </DashboardCard>
    </div>
  );
}
