"use client";

import { CalendarHeart } from "lucide-react";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { usePatientDailyParticipation } from "@/hooks/use-patient-daily-participation";
import { useTodayCheckIn } from "@/hooks/use-patient-checkins";
import {
  AFTERNOON_CATEGORY_LABELS,
  AFTERNOON_GROUP_MAX_CAPACITY,
  AFTERNOON_GROUP_ROOM_NAME,
  AFTERNOON_INDEPENDENT_ACCESS_COPY,
  AFTERNOON_REQUIRES_INDEPENDENT_ACCESS,
  PARTICIPATION_BLOCKS,
  PARTICIPATION_NEED_LABELS,
  type ParticipationNeedValue,
} from "@/lib/constants/daily-participation";
import { PATIENT_DAILY_PARTICIPATION_COPY } from "@/lib/constants/patient-daily-participation-copy";
import {
  formatDutchDate,
  getAmsterdamDateString,
  getDutchWeekdayLabelFromIsoDate,
} from "@/lib/utils/amsterdam-date";

export function PatientDailyParticipationView() {
  const copy = PATIENT_DAILY_PARTICIPATION_COPY;
  const planDate = getAmsterdamDateString();
  const {
    data: participation,
    isLoading: participationLoading,
    isError: participationError,
  } = usePatientDailyParticipation(planDate);
  const {
    data: todayCheckIn,
    isLoading: checkInLoading,
  } = useTodayCheckIn();

  const isLoading = participationLoading || checkInLoading;
  const hasAfternoonActivity =
    participation?.afternoon_title || participation?.participant_message;

  return (
    <div className="space-y-6">
      <SectionHeader
        title={copy.title}
        description={copy.description}
        size="kiosk"
      />

      <DashboardCard density="comfortable" padding="lg">
        <p className="text-sm text-carbon-black-600">Vandaag</p>
        <h2 className="text-2xl font-semibold text-carbon-black-900">
          {getDutchWeekdayLabelFromIsoDate(planDate)} {formatDutchDate(planDate)}
        </h2>
      </DashboardCard>

      {isLoading ? (
        <p className="text-sm text-carbon-black-600">Laden...</p>
      ) : null}

      {participationError ? (
        <p className="text-sm text-red-600" role="alert">
          {copy.loadError}
        </p>
      ) : null}

      {!isLoading && !participationError ? (
        <>
          <DashboardCard density="comfortable" padding="lg">
            <h3 className="text-lg font-semibold text-carbon-black-900">
              {copy.morningTitle} {PARTICIPATION_BLOCKS.morning.label}
            </h3>
            <p className="mt-2 text-base text-carbon-black-700">
              {copy.morningIntro}
            </p>
            <p className="mt-3 text-sm text-carbon-black-600">
              {PARTICIPATION_BLOCKS.morning.dutchDescription}
            </p>
          </DashboardCard>

          <DashboardCard density="comfortable" padding="lg">
            <h3 className="text-lg font-semibold text-carbon-black-900">
              {copy.afternoonTitle} {PARTICIPATION_BLOCKS.afternoon.label}
            </h3>
            <p className="mt-2 text-base text-carbon-black-700">
              {copy.afternoonIntro}
            </p>

            <dl className="mt-4 space-y-2 text-sm text-carbon-black-700">
              <div>
                <dt className="font-medium text-carbon-black-900">
                  {copy.roomLabel}
                </dt>
                <dd>{AFTERNOON_GROUP_ROOM_NAME}</dd>
              </div>
              <div>
                <dt className="font-medium text-carbon-black-900">
                  {copy.capacityLabel}
                </dt>
                <dd>{AFTERNOON_GROUP_MAX_CAPACITY}</dd>
              </div>
              {AFTERNOON_REQUIRES_INDEPENDENT_ACCESS ? (
                <div>
                  <dt className="font-medium text-carbon-black-900">
                    {copy.accessLabel}
                  </dt>
                  <dd>{AFTERNOON_INDEPENDENT_ACCESS_COPY}</dd>
                </div>
              ) : null}
            </dl>

            <div className="mt-6 border-t border-parchment-200 pt-6">
              {hasAfternoonActivity ? (
                <div className="space-y-3">
                  <h4 className="text-base font-semibold text-carbon-black-900">
                    {copy.afternoonActivityTitle}
                  </h4>
                  {participation?.afternoon_category ? (
                    <StatusBadge variant="neutral">
                      {
                        AFTERNOON_CATEGORY_LABELS[
                          participation.afternoon_category
                        ]
                      }
                    </StatusBadge>
                  ) : null}
                  {participation?.afternoon_title ? (
                    <p className="text-lg font-medium text-carbon-black-900">
                      {participation.afternoon_title}
                    </p>
                  ) : null}
                  {participation?.participant_message ? (
                    <p className="text-base text-carbon-black-700">
                      {participation.participant_message}
                    </p>
                  ) : null}
                </div>
              ) : (
                <EmptyState
                  icon={CalendarHeart}
                  title={copy.afternoonNotRecordedTitle}
                  description={copy.afternoonNotRecordedDescription}
                  size="kiosk"
                />
              )}
            </div>
          </DashboardCard>

          <DashboardCard density="comfortable" padding="lg">
            <h3 className="text-lg font-semibold text-carbon-black-900">
              {copy.yourNeedsTitle}
            </h3>
            {todayCheckIn?.participation_needs.length ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {todayCheckIn.participation_needs.map((need) => (
                  <li key={need}>
                    <StatusBadge variant="neutral">
                      {PARTICIPATION_NEED_LABELS[need as ParticipationNeedValue] ??
                        need}
                    </StatusBadge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-base text-carbon-black-600">
                {copy.yourNeedsEmpty}
              </p>
            )}
          </DashboardCard>

          <p className="text-sm text-carbon-black-600">{copy.participationOptional}</p>
        </>
      ) : null}
    </div>
  );
}
