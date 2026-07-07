/**
 * Returns today's calendar date in Europe/Amsterdam as YYYY-MM-DD.
 */
export function getAmsterdamDateString(date = new Date()): string {
  return date.toLocaleDateString("en-CA", { timeZone: "Europe/Amsterdam" });
}

/**
 * Formats an ISO date string for Dutch display.
 */
export function formatDutchDate(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);

  if (!year || !month || !day) {
    return dateString;
  }

  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/**
 * Formats an ISO timestamp for Dutch display in Europe/Amsterdam.
 */
export function formatDutchDateTime(isoString: string): string {
  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) {
    return isoString;
  }

  return date.toLocaleString("nl-NL", {
    timeZone: "Europe/Amsterdam",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

  const nowYear = new Date().getFullYear();
  const eventYear = Number(
    date.toLocaleDateString("en-CA", {
      timeZone: "Europe/Amsterdam",
      year: "numeric",
    }),
  );

  const datePart = date.toLocaleDateString("nl-NL", {
    timeZone: "Europe/Amsterdam",
    day: "numeric",
    month: "long",
    ...(eventYear !== nowYear ? { year: "numeric" } : {}),
  });

  return `${datePart} om ${time}`;
}
