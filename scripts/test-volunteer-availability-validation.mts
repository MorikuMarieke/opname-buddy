import {
  findOverlappingRecurringSlot,
  hasOverlappingRecurringSlot,
  OVERLAPPING_AVAILABILITY_MESSAGE,
} from "../lib/utils/volunteer-availability-validation";

type Slot = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive?: boolean;
};

const mondaySlot: Slot = {
  id: "existing-1",
  dayOfWeek: 1,
  startTime: "09:00",
  endTime: "12:00",
  isActive: true,
};

const existing = [mondaySlot];

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function testExactDuplicate(): void {
  const overlap = findOverlappingRecurringSlot(existing, {
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "12:00",
  });
  assert(overlap !== undefined, "exact duplicate should overlap");
}

function testPartialOverlap(): void {
  const overlap = findOverlappingRecurringSlot(existing, {
    dayOfWeek: 1,
    startTime: "11:00",
    endTime: "14:00",
  });
  assert(overlap !== undefined, "partial overlap should be invalid");
}

function testFullyContained(): void {
  const widerExisting = [
    {
      id: "existing-wide",
      dayOfWeek: 1,
      startTime: "09:00",
      endTime: "15:00",
      isActive: true,
    },
  ];

  const contained = findOverlappingRecurringSlot(widerExisting, {
    dayOfWeek: 1,
    startTime: "10:00",
    endTime: "12:00",
  });
  assert(contained !== undefined, "fully contained range should overlap");

  const container = findOverlappingRecurringSlot(existing, {
    dayOfWeek: 1,
    startTime: "08:00",
    endTime: "13:00",
  });
  assert(container !== undefined, "range containing existing slot should overlap");
}

function testAdjacentAllowed(): void {
  const adjacentAfter = findOverlappingRecurringSlot(existing, {
    dayOfWeek: 1,
    startTime: "12:00",
    endTime: "14:00",
  });
  assert(adjacentAfter === undefined, "adjacent after range should be allowed");

  const adjacentBefore = findOverlappingRecurringSlot(existing, {
    dayOfWeek: 1,
    startTime: "07:00",
    endTime: "09:00",
  });
  assert(adjacentBefore === undefined, "adjacent before range should be allowed");
}

function testDifferentWeekdayAllowed(): void {
  const overlap = findOverlappingRecurringSlot(existing, {
    dayOfWeek: 2,
    startTime: "09:00",
    endTime: "12:00",
  });
  assert(overlap === undefined, "same times on different weekday should be allowed");
}

function testEditExcludesCurrentRecord(): void {
  const overlap = findOverlappingRecurringSlot(
    existing,
    {
      dayOfWeek: 1,
      startTime: "09:00",
      endTime: "12:00",
    },
    "existing-1",
  );
  assert(overlap === undefined, "edit should exclude current record from comparison");
}

function testInactiveIgnored(): void {
  const inactiveExisting = [
    {
      id: "inactive",
      dayOfWeek: 1,
      startTime: "09:00",
      endTime: "12:00",
      isActive: false,
    },
  ];

  const overlap = hasOverlappingRecurringSlot(inactiveExisting, {
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "12:00",
  });
  assert(!overlap, "inactive slots should not block new availability");
}

function testMessageConstant(): void {
  assert(
    OVERLAPPING_AVAILABILITY_MESSAGE ===
      "Deze beschikbaarheid overlapt met of is gelijk aan een bestaand tijdvak.",
    "overlap message should match Dutch copy",
  );
}

const tests = [
  testExactDuplicate,
  testPartialOverlap,
  testFullyContained,
  testAdjacentAllowed,
  testDifferentWeekdayAllowed,
  testEditExcludesCurrentRecord,
  testInactiveIgnored,
  testMessageConstant,
];

for (const test of tests) {
  test();
}

console.log(`All ${tests.length} volunteer availability validation tests passed.`);
