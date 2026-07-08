/**
 * Amsterdam wall-clock helpers for planning session timestamps.
 */

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
