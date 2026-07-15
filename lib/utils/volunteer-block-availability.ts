import {
  PARTICIPATION_BLOCKS,
  type ParticipationBlockId,
} from "@/lib/constants/daily-participation";
import {
  DAY_OF_WEEK_LABELS,
  DAYS_OF_WEEK,
  type DayOfWeek,
} from "@/lib/constants/daily-participation";
import {
  formatDutchDate,
  getDutchWeekdayLabelFromIsoDate,
} from "@/lib/utils/amsterdam-date";
import type { VolunteerWeeklyBlockRow } from "@/types/daily-participation";

/** Display order: Monday through Sunday */
export const WEEKLY_BLOCK_DISPLAY_ORDER: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 0];

export interface MonthAbsenceSlot {
  absenceDate: string;
  block: ParticipationBlockId;
  label: string;
}

export function buildWeeklyBlocksMap(
  rows: VolunteerWeeklyBlockRow[],
): Map<DayOfWeek, VolunteerWeeklyBlockRow> {
  return new Map(
    rows.map((row) => [row.day_of_week as DayOfWeek, row]),
  );
}

export function getDefaultWeeklyBlocks(userId: string): VolunteerWeeklyBlockRow[] {
  return DAYS_OF_WEEK.map((dayOfWeek) => ({
    user_id: userId,
    day_of_week: dayOfWeek,
    morning_available: false,
    afternoon_available: false,
    updated_at: new Date().toISOString(),
  }));
}

export function mergeWeeklyBlocks(
  userId: string,
  rows: VolunteerWeeklyBlockRow[],
): VolunteerWeeklyBlockRow[] {
  const byDay = buildWeeklyBlocksMap(rows);

  return DAYS_OF_WEEK.map((dayOfWeek) => {
    const existing = byDay.get(dayOfWeek);

    if (existing) {
      return existing;
    }

    return {
      user_id: userId,
      day_of_week: dayOfWeek,
      morning_available: false,
      afternoon_available: false,
      updated_at: new Date().toISOString(),
    };
  });
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function formatAbsenceSlotLabel(
  absenceDate: string,
  block: ParticipationBlockId,
): string {
  const weekday = getDutchWeekdayLabelFromIsoDate(absenceDate);
  const datePart = formatDutchDate(absenceDate);
  const blockTitle = PARTICIPATION_BLOCKS[block].dutchTitle;

  return `${weekday} ${datePart} – ${blockTitle}`;
}

export function getMonthAbsenceSlots(
  yearMonth: string,
  weeklyBlocks: VolunteerWeeklyBlockRow[],
): MonthAbsenceSlot[] {
  const [yearPart, monthPart] = yearMonth.split("-").map(Number);

  if (!yearPart || !monthPart) {
    return [];
  }

  const byDay = buildWeeklyBlocksMap(weeklyBlocks);
  const slots: MonthAbsenceSlot[] = [];

  for (let day = 1; day <= daysInMonth(yearPart, monthPart); day += 1) {
    const absenceDate = `${yearPart}-${String(monthPart).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayOfWeek = new Date(yearPart, monthPart - 1, day).getDay() as DayOfWeek;
    const weekly = byDay.get(dayOfWeek);

    if (!weekly) {
      continue;
    }

    if (weekly.morning_available) {
      slots.push({
        absenceDate,
        block: "morning",
        label: formatAbsenceSlotLabel(absenceDate, "morning"),
      });
    }

    if (weekly.afternoon_available) {
      slots.push({
        absenceDate,
        block: "afternoon",
        label: formatAbsenceSlotLabel(absenceDate, "afternoon"),
      });
    }
  }

  return slots;
}

export function getWeeklyDayLabel(dayOfWeek: DayOfWeek): string {
  return DAY_OF_WEEK_LABELS[dayOfWeek];
}
