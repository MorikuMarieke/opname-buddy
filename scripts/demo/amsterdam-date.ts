/**
 * Amsterdam calendar date helpers for demo seed scripts.
 * Mirrors lib/utils/amsterdam-date.ts without app path aliases.
 */

export function getAmsterdamDateString(date = new Date()): string {
  return date.toLocaleDateString("en-CA", { timeZone: "Europe/Amsterdam" });
}

export function addAmsterdamDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return getAmsterdamDateString(date);
}

/** 0 = Sunday … 6 = Saturday (matches PostgreSQL extract(dow)). */
export function getDayOfWeekFromIsoDate(isoDate: string): number {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).getDay();
}

export function birthDateFromAge(age: number, referenceDate = getAmsterdamDateString()): string {
  const [year] = referenceDate.split("-").map(Number);
  return `${year - age}-06-15`;
}
