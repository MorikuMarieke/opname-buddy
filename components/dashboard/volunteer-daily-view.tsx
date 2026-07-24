"use client";

import { useState } from "react";

import { AfternoonActivityRecordForm } from "@/components/dashboard/afternoon-activity-record-form";
import { AfternoonInterestCount } from "@/components/dashboard/afternoon-interest-count";
import {
  DailyNeedsSummary,
  getSuggestedNeedCategory,
} from "@/components/dashboard/daily-needs-summary";
import { MorningVisitRequestList } from "@/components/dashboard/morning-visit-request-list";
import { VolunteerAvailabilityOverview } from "@/components/dashboard/volunteer-availability-overview";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { SecondaryButton } from "@/components/ui/secondary-button";
import {
  useUpsertDailyParticipationPlan,
  useVolunteerDailyParticipation,
} from "@/hooks/use-daily-participation";
import { formInputClasses } from "@/components/forms/form-styles";
import {
  AFTERNOON_CATEGORY_LABELS,
  AFTERNOON_GROUP_MAX_CAPACITY,
  AFTERNOON_GROUP_ROOM_NAME,
  AFTERNOON_INDEPENDENT_ACCESS_COPY,
  AFTERNOON_REQUIRES_INDEPENDENT_ACCESS,
  PARTICIPATION_BLOCKS,
  type AfternoonCategoryValue,
} from "@/lib/constants/daily-participation";
import {
  formatDutchDate,
  formatDutchDateTime,
  getAmsterdamDateString,
  getDutchWeekdayLabelFromIsoDate,
} from "@/lib/utils/amsterdam-date";

export function VolunteerDailyView() {
  const [planDate, setPlanDate] = useState(getAmsterdamDateString());
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const { data, isLoading, error } = useVolunteerDailyParticipation(planDate);
  const upsertPlan = useUpsertDailyParticipationPlan(planDate);

  const suggestedCategory = data ? getSuggestedNeedCategory(data.needs) : null;
  const savedPlan = data?.plan ?? null;

  const showCreateForm = !isLoading && !savedPlan;
  const showSummary = !isLoading && Boolean(savedPlan) && !isEditingPlan;
  const showEditForm = !isLoading && Boolean(savedPlan) && isEditingPlan;

  return (
    <div className="space-y-6">
      <DashboardCard density="compact">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-carbon-black-600">Vandaag</p>
            <h2 className="text-2xl font-semibold text-carbon-black-900">
              {getDutchWeekdayLabelFromIsoDate(planDate)}{" "}
              {formatDutchDate(planDate)}
            </h2>
          </div>
          <div className="min-w-[12rem]">
            <label
              htmlFor="volunteer_plan_date"
              className="mb-2 block text-sm font-medium text-carbon-black-900"
            >
              Datum
            </label>
            <input
              id="volunteer_plan_date"
              type="date"
              value={planDate}
              onChange={(event) => {
                setPlanDate(event.target.value);
                setIsEditingPlan(false);
              }}
              className={formInputClasses}
            />
          </div>
        </div>
      </DashboardCard>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error instanceof Error
            ? error.message
            : "De dag kon niet worden geladen."}
        </p>
      ) : null}

      <DashboardCard
        title={`Ochtend ${PARTICIPATION_BLOCKS.morning.label}`}
        density="compact"
      >
        <p className="mb-4 text-sm text-carbon-black-700">
          {PARTICIPATION_BLOCKS.morning.dutchDescription}
        </p>
        {isLoading ? (
          <p className="text-sm text-carbon-black-600">Laden...</p>
        ) : (
          <VolunteerAvailabilityOverview
            volunteers={data?.availability ?? []}
            block="morning"
          />
        )}
      </DashboardCard>

      <MorningVisitRequestList requestDate={planDate} />

      <AfternoonInterestCount interestDate={planDate} />

      <DashboardCard
        title={`Middag ${PARTICIPATION_BLOCKS.afternoon.label}`}
        density="compact"
      >
        <div className="mb-4 space-y-1 text-sm text-carbon-black-700">
          <p>{PARTICIPATION_BLOCKS.afternoon.dutchDescription}</p>
          <p>
            <span className="font-medium">Ruimte:</span>{" "}
            {AFTERNOON_GROUP_ROOM_NAME}
          </p>
          <p>
            <span className="font-medium">Capaciteit:</span> max.{" "}
            {AFTERNOON_GROUP_MAX_CAPACITY} patiënten
          </p>
          {AFTERNOON_REQUIRES_INDEPENDENT_ACCESS ? (
            <p>{AFTERNOON_INDEPENDENT_ACCESS_COPY}</p>
          ) : null}
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="mb-3 text-sm font-semibold text-carbon-black-900">
              Patiëntbehoeften
            </h4>
            {isLoading ? (
              <p className="text-sm text-carbon-black-600">Laden...</p>
            ) : (
              <DailyNeedsSummary
                needs={data?.needs ?? []}
                suggestedCategory={suggestedCategory}
              />
            )}
          </div>

          {isLoading ? (
            <p className="text-sm text-carbon-black-600">Laden...</p>
          ) : null}

          {showSummary && savedPlan ? (
            <div className="space-y-3 rounded-xl border border-parchment-200 bg-parchment-50 p-4">
              <h4 className="text-sm font-semibold text-carbon-black-900">
                Vastgelegde middagactiviteit
              </h4>
              {savedPlan.afternoon_title ? (
                <p className="text-lg font-medium text-carbon-black-900">
                  {savedPlan.afternoon_title}
                </p>
              ) : null}
              {savedPlan.afternoon_category ? (
                <p className="text-sm text-carbon-black-700">
                  Categorie:{" "}
                  {
                    AFTERNOON_CATEGORY_LABELS[
                      savedPlan.afternoon_category as AfternoonCategoryValue
                    ]
                  }
                </p>
              ) : null}
              {savedPlan.participant_message ? (
                <p className="text-sm text-carbon-black-700">
                  {savedPlan.participant_message}
                </p>
              ) : null}
              <p className="text-xs text-carbon-black-600">
                Laatst bijgewerkt door{" "}
                {savedPlan.recorded_by_name ?? "onbekend"} op{" "}
                {formatDutchDateTime(savedPlan.updated_at)}
              </p>
              <SecondaryButton
                type="button"
                onClick={() => setIsEditingPlan(true)}
              >
                Middagactiviteit wijzigen
              </SecondaryButton>
            </div>
          ) : null}

          {showCreateForm ? (
            <div>
              <h4 className="mb-3 text-sm font-semibold text-carbon-black-900">
                Middagactiviteit vastleggen
              </h4>
              <p className="mb-4 text-sm text-carbon-black-600">
                Bepaal samen welke groepsactiviteit past bij de behoeften van
                vandaag.
              </p>
              <AfternoonActivityRecordForm
                key={`${planDate}-create-${suggestedCategory ?? "none"}`}
                planDate={planDate}
                existingPlan={null}
                suggestedCategory={suggestedCategory}
                isSubmitting={upsertPlan.isPending}
                submitLabel="Activiteit vastleggen"
                onSubmit={async (values) => {
                  await upsertPlan.mutateAsync(values);
                }}
              />
            </div>
          ) : null}

          {showEditForm && savedPlan ? (
            <div>
              <h4 className="mb-3 text-sm font-semibold text-carbon-black-900">
                Middagactiviteit wijzigen
              </h4>
              <AfternoonActivityRecordForm
                key={`${planDate}-edit-${savedPlan.updated_at}`}
                planDate={planDate}
                existingPlan={savedPlan}
                suggestedCategory={suggestedCategory}
                isSubmitting={upsertPlan.isPending}
                submitLabel="Wijziging opslaan"
                onCancel={() => setIsEditingPlan(false)}
                onSubmit={async (values) => {
                  await upsertPlan.mutateAsync(values);
                  setIsEditingPlan(false);
                }}
              />
            </div>
          ) : null}
        </div>
      </DashboardCard>
    </div>
  );
}
