import type {
  AfternoonCategoryValue,
  ParticipationBlockId,
  ParticipationNeedValue,
} from "@/lib/constants/daily-participation";

export type DailyParticipationPlanRow = {
  id: string;
  plan_date: string;
  afternoon_category: AfternoonCategoryValue | null;
  afternoon_title: string | null;
  participant_message: string | null;
  recorded_by_user_id: string;
  created_at: string;
  updated_at: string;
};

export type VolunteerWeeklyBlockRow = {
  user_id: string;
  day_of_week: number;
  morning_available: boolean;
  afternoon_available: boolean;
  updated_at: string;
};

export type VolunteerDayAbsenceRow = {
  id: string;
  user_id: string;
  absence_date: string;
  block: ParticipationBlockId;
  created_at: string;
};

export type DailyNeedsSummaryRow = {
  need: ParticipationNeedValue;
  need_count: number;
};

export type VolunteerBlockAvailabilityOverviewRow = {
  user_id: string;
  full_name: string;
  morning_effective: boolean;
  afternoon_effective: boolean;
};

export interface UpsertDailyParticipationPlanInput {
  plan_date: string;
  afternoon_category: AfternoonCategoryValue | null;
  afternoon_title: string | null;
  participant_message: string | null;
}

export interface VolunteerWeeklyBlockInput {
  day_of_week: number;
  morning_available: boolean;
  afternoon_available: boolean;
}
