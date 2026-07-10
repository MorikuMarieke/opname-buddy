import { timeRangesOverlap } from "@/lib/utils/planning-time";

export const OVERLAPPING_AVAILABILITY_MESSAGE =
  "Deze beschikbaarheid overlapt met of is gelijk aan een bestaand tijdvak.";

export interface RecurringSlotForOverlapCheck {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive?: boolean;
}

function normalizeTime(value: string): string {
  return value.slice(0, 5);
}

export function findOverlappingRecurringSlot(
  existingSlots: RecurringSlotForOverlapCheck[],
  candidate: { dayOfWeek: number; startTime: string; endTime: string },
  excludeId?: string,
): RecurringSlotForOverlapCheck | undefined {
  const candidateStart = normalizeTime(candidate.startTime);
  const candidateEnd = normalizeTime(candidate.endTime);

  return existingSlots.find((slot) => {
    if (excludeId && slot.id === excludeId) {
      return false;
    }

    if (slot.isActive === false) {
      return false;
    }

    if (slot.dayOfWeek !== candidate.dayOfWeek) {
      return false;
    }

    return timeRangesOverlap(
      candidateStart,
      candidateEnd,
      normalizeTime(slot.startTime),
      normalizeTime(slot.endTime),
    );
  });
}

export function hasOverlappingRecurringSlot(
  existingSlots: RecurringSlotForOverlapCheck[],
  candidate: { dayOfWeek: number; startTime: string; endTime: string },
  excludeId?: string,
): boolean {
  return findOverlappingRecurringSlot(existingSlots, candidate, excludeId) !== undefined;
}
