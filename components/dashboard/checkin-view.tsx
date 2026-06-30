"use client";

import { ClipboardList } from "lucide-react";
import { useState } from "react";

import { CheckinForm } from "@/components/dashboard/checkin-form";
import { CheckinHistoryList } from "@/components/dashboard/checkin-history-list";
import { CheckinSummary } from "@/components/dashboard/checkin-summary";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SectionHeader } from "@/components/ui/section-header";
import {
  useRecentCheckIns,
  useTodayCheckIn,
} from "@/hooks/use-patient-checkins";

type CheckinMode = "summary" | "create" | "edit";

export function CheckinView() {
  const [mode, setMode] = useState<CheckinMode>("summary");
  const todayQuery = useTodayCheckIn();
  const recentQuery = useRecentCheckIns();

  const todayCheckIn = todayQuery.data ?? null;
  const isLoading = todayQuery.isLoading || recentQuery.isLoading;

  function handleFormSuccess() {
    setMode("summary");
  }

  function renderContent() {
    if (isLoading) {
      return (
        <p className="text-sm text-carbon-black-600">Check-in laden...</p>
      );
    }

    if (mode === "create" || (mode === "edit" && todayCheckIn)) {
      return (
        <CheckinForm
          existingCheckIn={mode === "edit" ? todayCheckIn : null}
          onSuccess={handleFormSuccess}
          onCancel={todayCheckIn ? () => setMode("summary") : undefined}
        />
      );
    }

    if (todayCheckIn) {
      return (
        <CheckinSummary
          checkIn={todayCheckIn}
          onEdit={() => setMode("edit")}
        />
      );
    }

    return (
      <EmptyState
        icon={ClipboardList}
        title="Check-in nog niet ingevuld"
        description="Neem even de tijd om te delen hoe je je vandaag voelt."
        size="kiosk"
        action={
          <PrimaryButton onClick={() => setMode("create")}>
            Start check-in
          </PrimaryButton>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Dagelijkse check-in"
        description="Vertel hoe je je vandaag voelt."
        size="kiosk"
      />

      <DashboardCard density="comfortable" padding="lg">
        {renderContent()}
      </DashboardCard>

      {!isLoading && recentQuery.data ? (
        <DashboardCard density="comfortable" padding="lg">
          <CheckinHistoryList
            checkIns={recentQuery.data}
            todayCheckInId={todayCheckIn?.id}
          />
        </DashboardCard>
      ) : null}
    </div>
  );
}
