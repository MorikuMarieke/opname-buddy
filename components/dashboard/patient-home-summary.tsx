"use client";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { useOpenQuestionCount } from "@/hooks/use-patient-questions";
import { useTodayCheckIn } from "@/hooks/use-patient-checkins";
import { formatDutchDate, getAmsterdamDateString } from "@/lib/utils/amsterdam-date";

export function PatientHomeSummary() {
  const today = getAmsterdamDateString();
  const todayCheckInQuery = useTodayCheckIn();
  const openQuestionsQuery = useOpenQuestionCount();

  const isLoading = todayCheckInQuery.isLoading || openQuestionsQuery.isLoading;
  const hasCheckIn = Boolean(todayCheckInQuery.data);
  const openCount = openQuestionsQuery.openCount;

  let headline = "Vergeet niet je check-in in te vullen.";

  if (isLoading) {
    headline = "Je overzicht laden...";
  } else if (hasCheckIn && openCount > 0) {
    headline = `Check-in voltooid. Je hebt ${openCount} open ${openCount === 1 ? "vraag" : "vragen"}.`;
  } else if (hasCheckIn) {
    headline = "Je check-in van vandaag is voltooid.";
  } else if (openCount > 0) {
    headline = `Je hebt ${openCount} open ${openCount === 1 ? "vraag" : "vragen"} voor je zorgteam.`;
  }

  return (
    <DashboardCard
      density="comfortable"
      padding="lg"
      className="flex min-h-[180px] flex-col justify-center border-l-4 border-l-copper-400"
    >
      <div className="rounded-xl bg-pearl-aqua-100 px-4 py-3">
        <p className="text-base font-medium text-carbon-black-600">
          {formatDutchDate(today)}
        </p>
        <p className="mt-2 text-xl font-semibold text-carbon-black-900">
          {headline}
        </p>
      </div>
    </DashboardCard>
  );
}
