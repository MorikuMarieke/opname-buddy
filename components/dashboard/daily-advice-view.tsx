"use client";

import { useEffect, useRef, useState } from "react";
import { Heart, Sun } from "lucide-react";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { SectionHeader } from "@/components/ui/section-header";
import {
  useDailyAdvice,
  useGenerateDailyAdvice,
} from "@/hooks/use-daily-advice";
import {
  useExpressAfternoonInterest,
  useOwnAfternoonInterest,
  useWithdrawAfternoonInterest,
} from "@/hooks/use-afternoon-interest";
import {
  useCancelMorningVisitRequest,
  useCreateMorningVisitRequest,
  useOwnMorningVisitRequest,
} from "@/hooks/use-morning-visit-requests";
import { useTodayCheckIn } from "@/hooks/use-patient-checkins";
import { useOwnPatientContext } from "@/hooks/use-patient-context";
import {
  canShowAfternoonInterestCta,
  morningVisitAvailable,
} from "@/lib/ai/participation-advice-policy";
import { DAILYBUDDY_COPY } from "@/lib/constants/dailybuddy-copy";
import { PARTICIPATION_BLOCKS } from "@/lib/constants/daily-participation";
import {
  getInspirationLabels,
  VISIT_INSPIRATION_BY_ID,
} from "@/lib/constants/visit-inspirations";
import { formTextareaClasses } from "@/components/forms/form-styles";
import { isEssentialCareContextComplete } from "@/lib/patient-context/completeness";
import { isDailyBuddyDevToolsEnabled } from "@/lib/config/dailybuddy-dev";
import { ADVICE_PRIMARY_OUTCOME_LABELS } from "@/types/daily-advice";
import type { AdvicePrimaryOutcome } from "@/types/daily-advice";
import type { DailyBuddyPrerequisite } from "@/types/daily-advice-prerequisites";

const SHOW_DEV_ITERATE = isDailyBuddyDevToolsEnabled();

export function DailyAdviceView() {
  const todayCheckIn = useTodayCheckIn();
  const ownContext = useOwnPatientContext();
  const generateAdvice = useGenerateDailyAdvice();
  const {
    mutateAsync: generateAdviceAsync,
    isPending: isGenerating,
    progressMessage,
    clearProgress,
  } = generateAdvice;
  // Pause GET polling while this tab owns the NDJSON generation stream.
  const adviceQuery = useDailyAdvice({ pausePolling: isGenerating });
  const ownRequest = useOwnMorningVisitRequest();
  const createRequest = useCreateMorningVisitRequest();
  const cancelRequest = useCancelMorningVisitRequest();
  const ownInterest = useOwnAfternoonInterest();
  const expressInterest = useExpressAfternoonInterest();
  const withdrawInterest = useWithdrawAfternoonInterest();
  const generationStartedRef = useRef(false);

  const [visitMessage, setVisitMessage] = useState("");
  const [selectedInspirations, setSelectedInspirations] = useState<string[]>(
    [],
  );
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);
  const [interestError, setInterestError] = useState<string | null>(null);
  const [devIterateError, setDevIterateError] = useState<string | null>(null);

  const advice = adviceQuery.data?.advice ?? null;
  const hasCheckIn = Boolean(todayCheckIn.data);
  const careContextComplete = isEssentialCareContextComplete(
    ownContext.data ?? null,
  );
  const adviceMissing = advice == null;
  const adviceStatus = advice?.status;

  const clientPrerequisite: DailyBuddyPrerequisite | null = !hasCheckIn
    ? "checkin_required"
    : !ownContext.isLoading && !careContextComplete
      ? "care_context_incomplete"
      : null;

  const serverPrerequisite = adviceQuery.data?.prerequisite ?? null;
  // checkin_required is client-authoritative once today's check-in is known;
  // never let a stale server/cache prerequisite re-open that gate.
  const prerequisite: DailyBuddyPrerequisite | null = !hasCheckIn
    ? (serverPrerequisite === "care_context_incomplete"
        ? "care_context_incomplete"
        : "checkin_required")
    : serverPrerequisite === "checkin_required"
      ? clientPrerequisite
      : (serverPrerequisite ?? clientPrerequisite);

  useEffect(() => {
    if (adviceStatus === "ready" || adviceStatus === "failed") {
      generationStartedRef.current = false;
      clearProgress();
    }
  }, [adviceStatus, clearProgress]);

  useEffect(() => {
    if (
      !hasCheckIn ||
      ownContext.isLoading ||
      todayCheckIn.isFetching ||
      !careContextComplete ||
      adviceQuery.isLoading ||
      isGenerating ||
      generationStartedRef.current
    ) {
      return;
    }

    if (
      prerequisite === "checkin_required" ||
      prerequisite === "care_context_incomplete"
    ) {
      return;
    }

    if (adviceMissing || adviceStatus === "stale") {
      generationStartedRef.current = true;
      void generateAdviceAsync(false)
        .then((result) => {
          if (result.prerequisite) {
            generationStartedRef.current = false;
          }
        })
        .catch(() => {
          generationStartedRef.current = false;
        });
    }
  }, [
    hasCheckIn,
    careContextComplete,
    ownContext.isLoading,
    todayCheckIn.isFetching,
    adviceMissing,
    adviceStatus,
    adviceQuery.isLoading,
    generateAdviceAsync,
    isGenerating,
    prerequisite,
  ]);

  async function handleRetry() {
    try {
      generationStartedRef.current = true;
      const result = await generateAdviceAsync(true);
      if (result.prerequisite) {
        generationStartedRef.current = false;
      }
    } catch {
      generationStartedRef.current = false;
    }
  }

  async function handleDevIterate() {
    setDevIterateError(null);
    try {
      generationStartedRef.current = true;
      const result = await generateAdviceAsync({ devIterate: true });
      if (result.prerequisite) {
        generationStartedRef.current = false;
      }
    } catch (error) {
      generationStartedRef.current = false;
      setDevIterateError(
        error instanceof Error
          ? error.message
          : "Dev-iteratie mislukt.",
      );
    }
  }

  async function handleCreateRequest() {
    setRequestError(null);
    setRequestSuccess(null);

    try {
      await createRequest.mutateAsync({
        patientMessage: visitMessage,
        inspirationIds:
          selectedInspirations.length > 0
            ? selectedInspirations
            : (advice?.inspiration_ids ?? []),
      });
      setRequestSuccess(DAILYBUDDY_COPY.morningVisit.requestSuccess);
      setVisitMessage("");
      void ownRequest.refetch();
    } catch (error) {
      setRequestError(
        error instanceof Error
          ? error.message
          : DAILYBUDDY_COPY.morningVisit.requestFailed,
      );
    }
  }

  async function handleCancelRequest() {
    if (!ownRequest.data?.id) {
      return;
    }

    setRequestError(null);
    try {
      await cancelRequest.mutateAsync(ownRequest.data.id);
      setRequestSuccess(DAILYBUDDY_COPY.morningVisit.cancelSuccess);
      void ownRequest.refetch();
    } catch (error) {
      setRequestError(
        error instanceof Error
          ? error.message
          : DAILYBUDDY_COPY.morningVisit.cancelFailed,
      );
    }
  }

  async function handleExpressInterest() {
    setInterestError(null);
    try {
      await expressInterest.mutateAsync();
    } catch (error) {
      setInterestError(
        error instanceof Error ? error.message : "Interesse opslaan mislukt.",
      );
    }
  }

  async function handleWithdrawInterest() {
    setInterestError(null);
    try {
      await withdrawInterest.mutateAsync();
    } catch (error) {
      setInterestError(
        error instanceof Error ? error.message : "Intrekken mislukt.",
      );
    }
  }

  function toggleInspiration(id: string) {
    const adviceInspirationIds = advice?.inspiration_ids ?? [];
    setSelectedInspirations((current) => {
      const base =
        current.length > 0 ? current : adviceInspirationIds.slice(0, 4);
      return base.includes(id)
        ? base.filter((item) => item !== id)
        : [...base, id].slice(0, 4);
    });
  }

  if (
    todayCheckIn.isLoading ||
    todayCheckIn.isFetching ||
    ownContext.isLoading ||
    adviceQuery.isLoading
  ) {
    return (
      <p className="text-sm text-carbon-black-600">DagBuddy-advies laden...</p>
    );
  }

  if (prerequisite === "checkin_required") {
    return (
      <EmptyState
        icon={Sun}
        title={DAILYBUDDY_COPY.checkinRequired.title}
        description={DAILYBUDDY_COPY.checkinRequired.description}
        size="kiosk"
        action={
          <PrimaryButton href={DAILYBUDDY_COPY.checkinRequired.href}>
            {DAILYBUDDY_COPY.checkinRequired.actionLabel}
          </PrimaryButton>
        }
      />
    );
  }

  if (prerequisite === "care_context_incomplete") {
    return (
      <EmptyState
        icon={Heart}
        title={DAILYBUDDY_COPY.careContextIncomplete.title}
        description={DAILYBUDDY_COPY.careContextIncomplete.description}
        size="kiosk"
        action={
          <SecondaryButton
            href={DAILYBUDDY_COPY.careContextIncomplete.secondaryHref}
          >
            {DAILYBUDDY_COPY.careContextIncomplete.secondaryActionLabel}
          </SecondaryButton>
        }
      />
    );
  }

  if (
    !advice ||
    advice.status === "generating" ||
    isGenerating
  ) {
    return (
      <DashboardCard density="comfortable" className="space-y-3">
        <p
          className="text-base font-medium text-carbon-black-900"
          aria-live="polite"
          aria-atomic="true"
          role="status"
        >
          {progressMessage ?? "DagBuddy is je advies aan het maken…"}
        </p>
        <p className="text-sm text-carbon-black-600">
          Dit duurt even. Je kunt deze pagina open houden; het advies verschijnt
          automatisch.
        </p>
      </DashboardCard>
    );
  }

  if (advice.status === "failed" || advice.status === "stale") {
    return (
      <DashboardCard density="comfortable" className="space-y-4">
        <p className="text-base font-medium text-carbon-black-900">
          {advice.status === "stale"
            ? "Je check-in is bijgewerkt. Maak nieuw advies."
            : DAILYBUDDY_COPY.generationFailed.title}
        </p>
        <p className="text-sm text-carbon-black-600">
          {advice.status === "stale"
            ? DAILYBUDDY_COPY.generationFailed.retryHint
            : DAILYBUDDY_COPY.generationFailed.description}
        </p>
        <PrimaryButton
          onClick={() => void handleRetry()}
          disabled={isGenerating}
        >
          {isGenerating ? "Bezig..." : "Opnieuw proberen"}
        </PrimaryButton>
      </DashboardCard>
    );
  }

  const primary = advice.primary_outcome as AdvicePrimaryOutcome | null;
  const showMorning =
    primary &&
    morningVisitAvailable({
      primaryOutcome: primary,
      secondaryMorningVisit: advice.secondary_morning_visit,
    });
  const checkin = todayCheckIn.data;
  const showAfternoonInterest = canShowAfternoonInterestCta({
    access: ownContext.data?.can_independently_reach_activity_room,
    visitActivityPossibility: ownContext.data?.visit_activity_possibility,
    roomRestriction: ownContext.data?.room_restriction,
    hasCheckIn: Boolean(checkin),
    careContextComplete,
    energy_level: checkin?.energy_level ?? 0,
    mood: checkin?.mood ?? 0,
    motivation_score: checkin?.motivation_score ?? 0,
  });
  const interestActive = ownInterest.data?.status === "interested";
  const showInterestControls = showAfternoonInterest || interestActive;
  const inspirationIds = advice.inspiration_ids ?? [];
  const activeInspirationSelection =
    selectedInspirations.length > 0
      ? selectedInspirations
      : inspirationIds.slice(0, 4);

  const hasConcreteAfternoonTitle = Boolean(advice.afternoon_title);
  const showAfternoonBlock =
    showAfternoonInterest ||
    interestActive ||
    (hasConcreteAfternoonTitle &&
      (advice.afternoon_status === "recommended" ||
        advice.afternoon_status === "informational" ||
        primary === "afternoon_group_activity"));

  const afternoonIntro = hasConcreteAfternoonTitle
    ? interestActive
      ? DAILYBUDDY_COPY.afternoonActivity.knownActivityWithInterestIntro
      : DAILYBUDDY_COPY.afternoonActivity.knownActivityIntro
    : DAILYBUDDY_COPY.afternoonActivity.complementaryIntro;

  const afternoonIsPrimaryRecommendation =
    primary === "awaiting_afternoon_programme" ||
    primary === "afternoon_group_activity";
  const showVisitAsSecondaryAlternative =
    Boolean(afternoonIsPrimaryRecommendation && showMorning);
  const visitIsPrimaryRecommendation = primary === "morning_volunteer_visit";

  const dayAdviceTitle = showVisitAsSecondaryAlternative
    ? DAILYBUDDY_COPY.dayAdvice.afternoonPrimaryTitle
    : primary === "rest"
      ? ADVICE_PRIMARY_OUTCOME_LABELS.rest
      : primary === "morning_volunteer_visit"
        ? ADVICE_PRIMARY_OUTCOME_LABELS.morning_volunteer_visit
        : DAILYBUDDY_COPY.dayAdvice.fallbackTitle;

  return (
    <div className="space-y-6">
      <DashboardCard density="comfortable" className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-carbon-black-500">
          {DAILYBUDDY_COPY.dayAdvice.eyebrow}
        </p>
        <h2 className="text-2xl font-semibold text-carbon-black-900">
          {dayAdviceTitle}
        </h2>

        {advice.motivation ? (
          <p className="text-base text-carbon-black-800">{advice.motivation}</p>
        ) : null}
        {advice.explanation ? (
          <p className="text-sm leading-relaxed text-carbon-black-700">
            {advice.explanation}
          </p>
        ) : null}
        {advice.choice_reminder ? (
          <p className="rounded-lg bg-parchment-100 px-4 py-3 text-sm text-carbon-black-800">
            {advice.choice_reminder}
          </p>
        ) : null}

        {showMorning ? (
          <div className="space-y-3 border-t border-parchment-200 pt-4">
            <h3
              className={
                showVisitAsSecondaryAlternative
                  ? "text-base font-medium text-carbon-black-800"
                  : "text-lg font-semibold text-carbon-black-900"
              }
            >
              {showVisitAsSecondaryAlternative
                ? DAILYBUDDY_COPY.morningVisit.secondaryTitle
                : DAILYBUDDY_COPY.morningVisit.title}
            </h3>
            <p className="text-sm text-carbon-black-700">
              {showVisitAsSecondaryAlternative
                ? DAILYBUDDY_COPY.morningVisit.secondaryDescription
                : DAILYBUDDY_COPY.morningVisit.description}
            </p>
            {showVisitAsSecondaryAlternative ? (
              <p className="text-sm text-carbon-black-600">
                {DAILYBUDDY_COPY.morningVisit.clarification}
              </p>
            ) : null}

            {inspirationIds.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-carbon-black-900">
                  Inspiratie (kies wat bij je past)
                </p>
                <ul className="flex flex-wrap gap-2">
                  {inspirationIds.map((id) => {
                    const label =
                      VISIT_INSPIRATION_BY_ID[id]?.labelNl ?? id;
                    const selected = activeInspirationSelection.includes(id);
                    return (
                      <li key={id}>
                        <button
                          type="button"
                          onClick={() => toggleInspiration(id)}
                          className={
                            selected
                              ? "rounded-lg bg-copper-600 px-3 py-2 text-sm text-white"
                              : "rounded-lg border border-parchment-300 bg-white px-3 py-2 text-sm text-carbon-black-800"
                          }
                        >
                          {label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}

            {ownRequest.data ? (
              <div className="space-y-3">
                <p className="text-sm text-carbon-black-800">
                  {DAILYBUDDY_COPY.morningVisit.existingRequestPrefix}
                  {ownRequest.data.patient_message
                    ? `: “${ownRequest.data.patient_message}”`
                    : "."}
                </p>
                {ownRequest.data.inspiration_ids?.length ? (
                  <p className="text-sm text-carbon-black-600">
                    Inspiratie:{" "}
                    {getInspirationLabels(ownRequest.data.inspiration_ids).join(
                      ", ",
                    )}
                  </p>
                ) : null}
                <SecondaryButton
                  onClick={() => void handleCancelRequest()}
                  disabled={cancelRequest.isPending}
                >
                  {DAILYBUDDY_COPY.morningVisit.cancelLabel}
                </SecondaryButton>
              </div>
            ) : (
              <div className="space-y-3">
                <label
                  htmlFor="visit_message"
                  className="block text-sm font-medium text-carbon-black-900"
                >
                  {DAILYBUDDY_COPY.morningVisit.messageLabel}
                </label>
                <textarea
                  id="visit_message"
                  value={visitMessage}
                  onChange={(event) => setVisitMessage(event.target.value)}
                  rows={3}
                  maxLength={300}
                  className={formTextareaClasses}
                  placeholder={DAILYBUDDY_COPY.morningVisit.messagePlaceholder}
                />
                {visitIsPrimaryRecommendation ? (
                  <PrimaryButton
                    onClick={() => void handleCreateRequest()}
                    disabled={createRequest.isPending}
                  >
                    {createRequest.isPending
                      ? DAILYBUDDY_COPY.morningVisit.requestPendingLabel
                      : DAILYBUDDY_COPY.morningVisit.requestLabel}
                  </PrimaryButton>
                ) : (
                  <SecondaryButton
                    onClick={() => void handleCreateRequest()}
                    disabled={createRequest.isPending}
                  >
                    {createRequest.isPending
                      ? DAILYBUDDY_COPY.morningVisit.requestPendingLabel
                      : DAILYBUDDY_COPY.morningVisit.requestLabel}
                  </SecondaryButton>
                )}
              </div>
            )}

            {requestError ? (
              <p className="text-sm text-red-600" role="alert">
                {requestError}
              </p>
            ) : null}
            {requestSuccess ? (
              <p className="text-sm text-copper-800">{requestSuccess}</p>
            ) : null}
          </div>
        ) : null}
      </DashboardCard>

      {showAfternoonBlock ? (
        <DashboardCard density="comfortable" className="space-y-3">
          <h2 className="text-xl font-semibold text-carbon-black-900">
            {DAILYBUDDY_COPY.afternoonActivity.title}
          </h2>
          <p className="text-sm text-carbon-black-600">{afternoonIntro}</p>
          <p className="text-sm font-medium text-carbon-black-600">
            {DAILYBUDDY_COPY.afternoonActivity.timeLabel}{" "}
            {PARTICIPATION_BLOCKS.afternoon.label}
          </p>

          {hasConcreteAfternoonTitle ? (
            <>
              <p className="text-base font-medium text-carbon-black-900">
                {advice.afternoon_title}
              </p>
              {advice.afternoon_note ? (
                <p className="text-sm text-carbon-black-700">
                  {advice.afternoon_note}
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-carbon-black-700">
              {DAILYBUDDY_COPY.afternoonActivity.description}
            </p>
          )}

          {showInterestControls ? (
            <div className="space-y-3 border-t border-parchment-200 pt-3">
              {!interestActive ? (
                <p className="text-sm text-carbon-black-600">
                  {DAILYBUDDY_COPY.afternoonActivity.disclaimer}
                </p>
              ) : null}
              {interestActive ? (
                <>
                  <p className="text-sm font-medium text-carbon-black-800">
                    {DAILYBUDDY_COPY.afternoonActivity.expressedLabel}
                  </p>
                  <SecondaryButton
                    onClick={() => void handleWithdrawInterest()}
                    disabled={withdrawInterest.isPending}
                  >
                    {withdrawInterest.isPending
                      ? "Bezig..."
                      : DAILYBUDDY_COPY.afternoonActivity.withdrawLabel}
                  </SecondaryButton>
                </>
              ) : showAfternoonInterest ? (
                <PrimaryButton
                  onClick={() => void handleExpressInterest()}
                  disabled={expressInterest.isPending}
                >
                  {expressInterest.isPending
                    ? "Bezig..."
                    : DAILYBUDDY_COPY.afternoonActivity.expressLabel}
                </PrimaryButton>
              ) : null}
              {interestError ? (
                <p className="text-sm text-red-600" role="alert">
                  {interestError}
                </p>
              ) : null}
            </div>
          ) : null}
        </DashboardCard>
      ) : null}

      {SHOW_DEV_ITERATE ? (
        <DashboardCard density="compact" className="space-y-3 border-dashed">
          <h3 className="text-sm font-semibold text-carbon-black-900">
            Development only
          </h3>
          <p className="text-sm text-carbon-black-600">
            Genereert een nieuwe adviesiteratie voor vandaag zonder eerdere
            records te wissen.
          </p>
          <SecondaryButton
            onClick={() => void handleDevIterate()}
            disabled={isGenerating || advice.status === "generating"}
          >
            {isGenerating || advice.status === "generating"
              ? "Bezig..."
              : "Dev: generate new advice iteration"}
          </SecondaryButton>
          {devIterateError ? (
            <p className="text-sm text-red-600" role="alert">
              {devIterateError}
            </p>
          ) : null}
        </DashboardCard>
      ) : null}
    </div>
  );
}

export function DailyAdvicePageContent() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="DagBuddy"
        description="Jouw persoonlijke advies voor participatie vandaag."
        size="kiosk"
      />
      <DailyAdviceView />
    </div>
  );
}
