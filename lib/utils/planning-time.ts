/**
 * Amsterdam wall-clock helpers for planning session timestamps.
 */

import { getAmsterdamDateString } from "@/lib/utils/amsterdam-date";

function getTimeZoneOffsetMinutes(timeZone: string, date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
  }).formatToParts(date);

  const offset = parts.find((part) => part.type === "timeZoneName")?.value ?? "GMT+0";
  const match = offset.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);

  if (!match) {
    return 0;
  }

  const sign = match[1] === "+" ? 1 : -1;
  const hours = Number(match[2]);
  const minutes = Number(match[3] ?? 0);
  return sign * (hours * 60 + minutes);
}

/** Combine Amsterdam calendar date (YYYY-MM-DD) and local time (HH:mm) to ISO UTC. */
export function combineAmsterdamDateAndTime(date: string, time: string): string {
  const normalizedTime = time.length === 5 ? `${time}:00` : time;
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute, second = 0] = normalizedTime.split(":").map(Number);

  const roughUtc = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const offsetMinutes = getTimeZoneOffsetMinutes("Europe/Amsterdam", roughUtc);
  const utcMs =
    Date.UTC(year, month - 1, day, hour, minute, second) -
    offsetMinutes * 60 * 1000;

  return new Date(utcMs).toISOString();
}

/** Add minutes to an HH:mm time string (wraps at 24h). */
export function addMinutesToTime(time: string, minutes: number): string {
  const [hour, minute] = time.split(":").map(Number);
  const total = hour * 60 + minute + minutes;
  const nextHour = Math.floor(total / 60) % 24;
  const nextMinute = total % 60;
  return `${String(nextHour).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`;
}

export interface ScheduleDurationConfig {
  useCustomDuration: boolean;
  customDurationMinutes: string | number;
  activityDefaultDurationMinutes?: number | null;
}

/** Minutes between same-day HH:mm times; null when invalid or overnight. */
export function durationMinutesBetween(
  startTime: string,
  endTime: string,
): number | null {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  const durationMinutes =
    endHour * 60 + endMinute - (startHour * 60 + startMinute);

  return durationMinutes > 0 ? durationMinutes : null;
}

export function endTimeFromDuration(
  startTime: string,
  durationMinutes: number,
): string {
  return addMinutesToTime(startTime, durationMinutes);
}

export function resolveActiveDurationMinutes(
  config: ScheduleDurationConfig,
): number | null {
  if (config.useCustomDuration || config.activityDefaultDurationMinutes == null) {
    const parsed = Number(config.customDurationMinutes);
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : null;
  }

  return config.activityDefaultDurationMinutes;
}

export function computeEndTimeFromDuration(
  startTime: string,
  config: ScheduleDurationConfig,
): string | null {
  const durationMinutes = resolveActiveDurationMinutes(config);
  if (durationMinutes == null) {
    return null;
  }

  return endTimeFromDuration(startTime, durationMinutes);
}

/** Infer whether a stored schedule uses a custom duration override. */
export function inferScheduleDurationState(
  startTime: string,
  endTime: string,
  activityDefaultDurationMinutes?: number | null,
): Pick<ScheduleDurationConfig, "useCustomDuration" | "customDurationMinutes"> {
  const storedDurationMinutes = durationMinutesBetween(startTime, endTime);
  const defaultDuration = activityDefaultDurationMinutes ?? null;

  if (
    defaultDuration != null &&
    storedDurationMinutes != null &&
    storedDurationMinutes === defaultDuration
  ) {
    return {
      useCustomDuration: false,
      customDurationMinutes: defaultDuration,
    };
  }

  return {
    useCustomDuration: true,
    customDurationMinutes:
      storedDurationMinutes ?? defaultDuration ?? 90,
  };
}

export function applyActivityDefaultDuration<T extends ScheduleDurationConfig & { startTime: string; endTime: string }>(
  current: T,
  activityDefaultDurationMinutes: number | null | undefined,
): T {
  if (activityDefaultDurationMinutes == null) {
    const fallbackDuration =
      durationMinutesBetween(current.startTime, current.endTime) ??
      (Number(current.customDurationMinutes) || 90);

    return {
      ...current,
      useCustomDuration: true,
      customDurationMinutes: fallbackDuration,
      endTime:
        computeEndTimeFromDuration(current.startTime, {
          useCustomDuration: true,
          customDurationMinutes: fallbackDuration,
          activityDefaultDurationMinutes: null,
        }) ?? current.endTime,
    };
  }

  return {
    ...current,
    useCustomDuration: false,
    customDurationMinutes: activityDefaultDurationMinutes,
    endTime: endTimeFromDuration(
      current.startTime,
      activityDefaultDurationMinutes,
    ),
  };
}

/** Returns true when two same-day time ranges overlap (HH:mm strings). */
export function timeRangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  return startA < endB && endA > startB;
}

/** Session window overlaps a volunteer availability window on the same calendar day. */
export function sessionOverlapsTimeWindow(
  sessionStartsAt: string,
  sessionEndsAt: string,
  windowStartTime: string,
  windowEndTime: string,
): boolean {
  const startDate = new Date(sessionStartsAt);
  const endDate = new Date(sessionEndsAt);

  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Amsterdam",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const sessionStart = fmt.format(startDate);
  const sessionEnd = fmt.format(endDate);
  const windowStart = windowStartTime.slice(0, 5);
  const windowEnd = windowEndTime.slice(0, 5);

  return timeRangesOverlap(sessionStart, sessionEnd, windowStart, windowEnd);
}

/** Shift an Amsterdam calendar date by a number of days. */
export function addDaysToAmsterdamDateString(
  dateString: string,
  days: number,
): string {
  const iso = combineAmsterdamDateAndTime(dateString, "12:00");
  const next = new Date(new Date(iso).getTime() + days * 86_400_000);
  return next.toLocaleDateString("en-CA", { timeZone: "Europe/Amsterdam" });
}

/** Day of week in Amsterdam (0 = Sunday, matches PostgreSQL dow). */
export function getAmsterdamDayOfWeek(dateString: string): number {
  const iso = combineAmsterdamDateAndTime(dateString, "12:00");
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Amsterdam",
    weekday: "short",
  }).format(new Date(iso));

  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return map[weekday] ?? 0;
}

/** Monday-first week of Amsterdam calendar dates containing the reference date. */
export function getAmsterdamWeekDateStrings(
  dateString = getAmsterdamDateString(),
): string[] {
  const dayOfWeek = getAmsterdamDayOfWeek(dateString);
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  const monday = addDaysToAmsterdamDateString(dateString, -daysSinceMonday);

  return Array.from({ length: 7 }, (_, index) =>
    addDaysToAmsterdamDateString(monday, index),
  );
}

export function getAmsterdamDayBoundsIso(
  dateString = getAmsterdamDateString(),
): { from: string; to: string } {
  return {
    from: combineAmsterdamDateAndTime(dateString, "00:00:00"),
    to: combineAmsterdamDateAndTime(dateString, "23:59:59"),
  };
}

export function getAmsterdamWeekBoundsIso(
  dateString = getAmsterdamDateString(),
): { from: string; to: string } {
  const week = getAmsterdamWeekDateStrings(dateString);

  return {
    from: combineAmsterdamDateAndTime(week[0], "00:00:00"),
    to: combineAmsterdamDateAndTime(week[6], "23:59:59"),
  };
}
