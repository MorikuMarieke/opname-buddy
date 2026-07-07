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
