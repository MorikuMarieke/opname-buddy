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
  const [showAdviceCta, setShowAdviceCta] = useState(false);
  const todayQuery = useTodayCheckIn();
  const recentQuery = useRecentCheckIns();

  const todayCheckIn = todayQuery.data ?? null;
  const isLoading = todayQuery.isLoading || recentQuery.isLoading;

  function handleFormSuccess() {
    setMode("summary");
    setShowAdviceCta(true);
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
        <>
          <CheckinSummary
            checkIn={todayCheckIn}
            onEdit={() => setMode("edit")}
          />
          {showAdviceCta ? (
            <DashboardCard density="compact" className="mt-4 space-y-3">
              <p className="text-sm text-carbon-black-800">
                Je check-in is opgeslagen. Ga naar DagBuddy voor je advies van
                vandaag.
              </p>
              <PrimaryButton href="/dashboard/advice">
                Bekijk DagBuddy-advies
              </PrimaryButton>
            </DashboardCard>
          ) : null}
        </>
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

      {renderContent()}

      {recentQuery.data && recentQuery.data.length > 0 ? (
        <CheckinHistoryList
          checkIns={recentQuery.data}
          todayCheckInId={todayCheckIn?.id}
        />
      ) : null}
    </div>
  );
}
