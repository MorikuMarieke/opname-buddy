/**
 * Date utilities for OpnameBuddy (Europe/Amsterdam).
 *
 * Storage and form values use ISO calendar dates (YYYY-MM-DD).
 * User-facing display uses Dutch numeric format (dd-MM-yyyy).
 *
 * Native `<input type="date">` picker appearance may follow browser/OS locale;
 * only displayed values and stored ISO strings are guaranteed Dutch/ISO respectively.
 */

/**
 * Returns today's calendar date in Europe/Amsterdam as YYYY-MM-DD.
 */
export function getAmsterdamDateString(date = new Date()): string {
  return date.toLocaleDateString("en-CA", { timeZone: "Europe/Amsterdam" });
}

/**
 * Formats an ISO date string (YYYY-MM-DD) for Dutch display as dd-MM-yyyy.
 */
export function formatDutchDate(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);

  if (!year || !month || !day) {
    return dateString;
  }

  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Formats today's date for planning headers (Europe/Amsterdam), e.g. "dinsdag 9 juli 2026".
 */
export function formatDutchLongDate(date = new Date()): string {
  return date.toLocaleDateString("nl-NL", {
    timeZone: "Europe/Amsterdam",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Returns true when an ISO timestamp falls on the given Amsterdam calendar date.
 */
export function isAmsterdamSameDay(
  isoString: string,
  dateString: string,
): boolean {
  return getAmsterdamDateString(new Date(isoString)) === dateString;
}

/**
 * Formats a time range from ISO timestamps (Europe/Amsterdam, HH:mm).
 */
export function formatAmsterdamTimeRange(
  startsAt: string,
  endsAt: string,
): string {
  const timeFormatter = new Intl.DateTimeFormat("nl-NL", {
    timeZone: "Europe/Amsterdam",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${timeFormatter.format(new Date(startsAt))} – ${timeFormatter.format(new Date(endsAt))}`;
}

/**
 * Formats an ISO timestamp as HH:mm in Europe/Amsterdam.
 */
export function formatAmsterdamTime(isoOrTime: string): string {
  if (/^\d{2}:\d{2}/.test(isoOrTime)) {
    return isoOrTime.slice(0, 5);
  }

  const date = new Date(isoOrTime);

  if (Number.isNaN(date.getTime())) {
    return isoOrTime;
  }

  return date.toLocaleTimeString("nl-NL", {
    timeZone: "Europe/Amsterdam",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formats an ISO timestamp for Dutch display in Europe/Amsterdam (dd-MM-yyyy, HH:mm).
 */
export function formatDutchDateTime(isoString: string): string {
  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) {
    return isoString;
  }

  const datePart = date.toLocaleDateString("nl-NL", {
    timeZone: "Europe/Amsterdam",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const timePart = date.toLocaleTimeString("nl-NL", {
    timeZone: "Europe/Amsterdam",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${datePart}, ${timePart}`;
}

/**
 * Compact Dutch timestamp for admin audit lines (Europe/Amsterdam).
 */
export function formatAdminAuditTimestamp(isoString: string): string {
  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) {
    return isoString;
  }

  const time = date.toLocaleTimeString("nl-NL", {
    timeZone: "Europe/Amsterdam",
    hour: "2-digit",
    minute: "2-digit",
  });

  const today = getAmsterdamDateString();
  const eventDay = getAmsterdamDateString(date);

  if (eventDay === today) {
    return `Vandaag om ${time}`;
  }

  const datePart = date.toLocaleDateString("nl-NL", {
    timeZone: "Europe/Amsterdam",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return `${datePart} om ${time}`;
}
